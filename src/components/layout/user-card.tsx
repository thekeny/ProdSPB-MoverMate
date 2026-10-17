"use client";

import { LogOut, Settings, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Account } from "@/configs/types/account.type";

export function UserCard({
  account,
  onLogout,
  onOpenAccountSettings,
}: {
  account: Account;
  onLogout: () => void;
  onOpenAccountSettings: () => void;
}) {
  return (
    <div className="mt-auto flex items-center justify-between rounded-lg bg-[#EDF1E8] p-3">
      <span className="flex items-center gap-2 text-xs font-bold">
        <UserRound className="size-4 text-[#42664D]" />
        {account.username}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onOpenAccountSettings}
          aria-label="Настройки аккаунта"
        >
          <Settings />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onLogout}
          aria-label="Выйти"
        >
          <LogOut />
        </Button>
      </div>
    </div>
  );
}
