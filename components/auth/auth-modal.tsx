"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AuthForm } from "./auth-form";

interface AuthModalProps {
  trigger?: React.ReactNode;
  defaultMode?: "signin" | "signup";
}

export function AuthModal({ trigger, defaultMode = "signin" }: AuthModalProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">(defaultMode);

  const handleSuccess = () => {
    setOpen(false);
  };

  const switchMode = () => {
    setMode(mode === "signin" ? "signup" : "signin");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Sign In</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" ? "Sign In" : "Create Account"}
          </DialogTitle>
          <DialogDescription>
            {mode === "signin" 
              ? "Sign in to your account to manage your profile"
              : "Create a new account to get started"
            }
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <AuthForm mode={mode} onSuccess={handleSuccess} />
          
          <div className="text-center text-sm">
            {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={switchMode}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              {mode === "signin" ? "Sign up" : "Sign in"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
