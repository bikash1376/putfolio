"use client";

import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormActions,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Header } from "@/components/header";
import { useAuth } from "@/components/auth/auth-context";
import { AuthModal } from "@/components/auth/auth-modal";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type UserDetail = {
  id: string;
  username: string;
  name: string;
  description: string;
  user_id: string;
};

export default function Home() {
  const { user, loading } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetail[]>([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [currentProfile, setCurrentProfile] = useState<UserDetail | null>(null);

  // Load public profiles from supabase
  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error(error);
      } else {
        setUserDetails(data || []);
      }
    }
    loadProfiles();
  }, []);

  // Load current user's profile if they have one
  useEffect(() => {
    if (user && user.id) {
      async function loadCurrentProfile() {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();
          
          if (!error && data) {
            setCurrentProfile(data);
          } else if (error && error.code !== "PGRST116") { // PGRST116 = no rows returned
            console.error("Error loading current profile:", error);
          }
        } catch (err) {
          console.error("Unexpected error loading current profile:", err);
        }
      }
      loadCurrentProfile();
    }
  }, [user]);

  // Submit to supabase
  async function handleForm(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .insert({
        username,
        name,
        description,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") { // Postgres unique_violation
        alert("Username already taken");
      } else {
        console.error(error);
        alert("Something went wrong");
      }
      return;
    }

    setUserDetails((prev) => [data, ...prev]); // Add to beginning
    setCurrentProfile(data);

    setUsername("");
    setName("");
    setDescription("");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-nocta-200 dark:bg-nocta-800 rounded-full animate-pulse mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      
      <main className="max-w-6xl mx-auto p-6">
        {/* Welcome Section */}
        {user ? (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">Welcome back!</h2>
            {currentProfile ? (
              <div className="bg-nocta-50 dark:bg-nocta-900/50 p-4 rounded-lg border">
                <p className="text-nocta-600 dark:text-nocta-400 mb-2">
                  You have a profile: <strong>@{currentProfile.username}</strong>
                </p>
                <Link 
                  href={`/profile/${currentProfile.username}`}
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  View your profile →
                </Link>
              </div>
            ) : (
              <p className="text-nocta-600 dark:text-nocta-400">
                Create your profile to get started
              </p>
            )}
          </div>
        ) : (
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold mb-2">Welcome to Putfolio</h2>
            <p className="text-nocta-600 dark:text-nocta-400 mb-4">
              Create your digital portfolio and showcase your work to the world
            </p>
            <AuthModal 
              defaultMode="signup" 
              trigger={<Button size="lg">Get Started</Button>}
            />
          </div>
        )}

        {/* Profile Creation - Only show if user is authenticated and doesn't have a profile */}
        {user && !currentProfile && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4">Create Your Profile</h3>
            <Sheet>
              <SheetTrigger asChild>
                <Button>Create Profile</Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="flex flex-col">
                <SheetHeader>
                  <SheetTitle>Create Your Profile</SheetTitle>
                </SheetHeader>

                <Form onSubmit={handleForm} className="flex-1 overflow-y-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
                    <FormField name="username">
                      <FormLabel required>Username</FormLabel>
                      <FormControl>
                        <Input
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          placeholder="username"
                        />
                      </FormControl>
                    </FormField>

                    <FormField name="name">
                      <FormLabel required>Name</FormLabel>
                      <FormControl>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full name"
                        />
                      </FormControl>
                    </FormField>

                    <FormField name="description">
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Write something about yourself..."
                        />
                      </FormControl>
                      <FormDescription>
                        Max 500 characters about yourself.
                      </FormDescription>
                    </FormField>
                  </div>

                  <FormActions className="sticky bottom-0 border-nocta-200 dark:border-nocta-800/50 p-4 flex justify-end gap-2">
                    <SheetClose asChild>
                      <Button variant="ghost">Cancel</Button>
                    </SheetClose>
                    <Button type="submit">Create Profile</Button>
                  </FormActions>
                </Form>
              </SheetContent>
            </Sheet>
          </div>
        )}

        {/* Public Profiles Grid */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Discover Profiles</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {userDetails.map((userDetail) => (
              <Link href={`/profile/${userDetail.username}`} key={userDetail.id}>
                <div className="border p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow">
                  <Avatar 
                    fallback={userDetail.name.charAt(0).toUpperCase()} 
                    className="mx-auto mb-2"
                  />
                  <div className="text-center">
                    <p className="font-medium text-sm truncate">{userDetail.name}</p>
                    <p className="text-xs text-nocta-500">@{userDetail.username}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
