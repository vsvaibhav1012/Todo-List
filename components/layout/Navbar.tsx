"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/store/api/authApi";
import { broadcastLogout } from "@/hooks/useBroadcastLogout";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LogOut, Loader2 } from "lucide-react";

function TaskaLogo() {
  return (
    <Link href="/todos" className="flex items-center gap-2.5 select-none">
      <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-sm">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </div>
      <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
        Taska
      </span>
    </Link>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [logout, { isLoading }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      broadcastLogout();
      router.push("/login");
    } catch {
      toast.error("Logout failed.");
    }
  };

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-3xl mx-auto px-4 flex h-14 items-center justify-between">
        <TaskaLogo />

        <div className="flex items-center gap-3">
          {user?.displayName && (
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user.displayName}
            </span>
          )}
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            aria-label="Log out"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            <span className="sr-only sm:not-sr-only sm:ml-1">Log out</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
