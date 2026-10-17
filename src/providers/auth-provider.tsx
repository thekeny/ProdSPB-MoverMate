"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { createContext, useContext, useSyncExternalStore } from "react";
import {
  changePasswordApiV1UsersMePasswordPut,
  changeUsernameApiV1UsersMeUsernamePut,
  deleteMeApiV1UsersMeDelete,
  getMeApiV1UsersMeGet,
  loginApiV1AuthLoginPost,
  logoutApiV1AuthLogoutPost,
  registerApiV1AuthRegisterPost,
} from "@/api/generated";
import { ApiError, unwrap } from "@/api/request";
import {
  clearSession,
  getRefreshToken,
  hasSession,
  saveSession,
  subscribeSession,
} from "@/api/session";
import { QUERY_KEYS } from "@/configs/consts/api.const";
import type { Account } from "@/configs/types/account.type";
import type { AuthMode } from "@/configs/types/auth.type";

type AuthContextValue = {
  ready: boolean;
  account: Account | null;
  authenticate: (
    credentials: { username: string; password: string },
    mode: AuthMode,
  ) => Promise<void>;
  logout: () => Promise<void>;
  changeUsername: (username: string) => Promise<void>;
  changePassword: (values: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const noopSubscribe = () => () => {};

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const signedIn = useSyncExternalStore(
    subscribeSession,
    hasSession,
    () => false,
  );

  const me = useQuery({
    queryKey: QUERY_KEYS.ME,
    enabled: hydrated && signedIn,
    queryFn: async (): Promise<Account | null> => {
      try {
        const user = await unwrap(getMeApiV1UsersMeGet());
        return { id: user.id, username: user.username };
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          clearSession();
          return null;
        }
        throw error;
      }
    },
  });

  const account = signedIn ? (me.data ?? null) : null;
  const ready = hydrated && (!signedIn || !me.isPending);

  const authenticate: AuthContextValue["authenticate"] = async (
    credentials,
    mode,
  ) => {
    const normalized = {
      ...credentials,
      username: credentials.username.trim().toLowerCase(),
    };
    if (mode === "register")
      await unwrap(registerApiV1AuthRegisterPost({ body: normalized }));
    const tokens = await unwrap(loginApiV1AuthLoginPost({ body: normalized }));
    saveSession(tokens);
    queryClient.removeQueries({ queryKey: QUERY_KEYS.ME });
    await queryClient.fetchQuery({
      queryKey: QUERY_KEYS.ME,
      staleTime: 0,
      queryFn: async (): Promise<Account> => {
        const data = await unwrap(getMeApiV1UsersMeGet());
        return { id: data.id, username: data.username };
      },
    });
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    clearSession();
    queryClient.clear();
    if (refreshToken)
      await logoutApiV1AuthLogoutPost({
        body: { refresh_token: refreshToken },
      }).catch(() => undefined);
  };

  const changeUsername = async (username: string) => {
    const updated = await unwrap(
      changeUsernameApiV1UsersMeUsernamePut({
        body: { new_username: username.trim().toLowerCase() },
      }),
    );
    queryClient.setQueryData(QUERY_KEYS.ME, {
      id: updated.id,
      username: updated.username,
    });
    await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PROJECTS });
  };

  const changePassword = async (values: {
    currentPassword: string;
    newPassword: string;
  }) => {
    await unwrap(
      changePasswordApiV1UsersMePasswordPut({
        body: {
          current_password: values.currentPassword,
          new_password: values.newPassword,
        },
      }),
    );
    clearSession();
    queryClient.clear();
  };

  const deleteAccount = async () => {
    await unwrap(deleteMeApiV1UsersMeDelete());
    clearSession();
    queryClient.clear();
  };

  return (
    <AuthContext.Provider
      value={{
        ready,
        account,
        authenticate,
        logout,
        changeUsername,
        changePassword,
        deleteAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used within AuthProvider");
  return value;
}
