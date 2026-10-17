export type AuthMode = "login" | "register";

export type Session = {
  accessToken: string;
  accessExpiresAt: number;
  refreshToken: string;
};
