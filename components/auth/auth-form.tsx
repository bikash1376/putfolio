"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormLabel, FormControl, FormDescription, FormActions } from "@/components/ui/form";
import { signIn, signUp } from "@/lib/auth";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSuccess?: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        const { data, error } = await signUp(email, password);
        
        if (error) {
          setError(error.message);
        } else {
          setShowConfirmation(true);
          // Don't close modal immediately for signup
        }
      } else {
        const { error } = await signIn(email, password);
        
        if (error) {
          setError(error.message);
        } else {
          onSuccess?.();
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (showConfirmation) {
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2">Check your email!</h3>
          <p className="text-nocta-600 dark:text-nocta-400 mb-4">
            We've sent a confirmation link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-nocta-500">
            Click the link in your email to verify your account and start creating your profile.
          </p>
        </div>
        <Button 
          variant="ghost" 
          onClick={() => setShowConfirmation(false)}
          className="w-full"
        >
          Back to Sign Up
        </Button>
      </div>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className="space-y-4">
      <FormField name="email">
        <FormLabel required>Email</FormLabel>
        <FormControl>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </FormControl>
      </FormField>

      <FormField name="password">
        <FormLabel required>Password</FormLabel>
        <FormControl>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </FormControl>
        <FormDescription>
          {mode === "signup" ? "Password must be at least 6 characters" : ""}
        </FormDescription>
      </FormField>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <FormActions>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"}
        </Button>
      </FormActions>
    </Form>
  );
}
