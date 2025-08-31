"use client";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { AuthModal } from "@/components/auth/auth-modal";
import { useAuth } from "@/components/auth/auth-context";
import { signOut } from "@/lib/auth";

export function Header() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  if (loading) {
    return (
      <header className="border-b border-nocta-200 dark:border-nocta-800/50 p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Putfolio</h1>
          <div className="w-8 h-8 bg-nocta-200 dark:bg-nocta-800 rounded-full animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-nocta-200 dark:border-nocta-800/50 p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold">Putfolio</h1>
        
        {user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Avatar fallback={user.email?.charAt(0).toUpperCase() || "U"} />
              <span className="text-sm text-nocta-600 dark:text-nocta-400">
                {user.email}
              </span>
            </div>
            <Button variant="ghost" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <AuthModal defaultMode="signin" />
            <AuthModal 
              defaultMode="signup" 
              trigger={<Button>Sign Up</Button>}
            />
          </div>
        )}
      </div>
    </header>
  );
}
