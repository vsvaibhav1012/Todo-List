"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useLogoutMutation } from "@/store/api/authApi";
import { broadcastLogout } from "@/hooks/useBroadcastLogout";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { LogOut, CheckSquare, Loader2 } from "lucide-react";

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
        <Link href="/todos" className="flex items-center gap-2 font-semibold">
          <CheckSquare className="h-5 w-5" />
          <span>Todos</span>
        </Link>

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
