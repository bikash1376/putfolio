"use client";

import { use, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Profile = {
  id: string;
  username: string;
  name: string;
  description: string;
  user_id: string;
  created_at: string;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .single();

      if (error) {
        console.error(error);
        setUser(null);
      } else {
        setUser(data);
      }
      setLoading(false);
    }

    loadUser();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 bg-nocta-200 dark:bg-nocta-800 rounded-full animate-pulse mx-auto mb-4" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
          <p className="text-nocta-600 dark:text-nocta-400 mb-4">
            The profile @{username} doesn't exist
          </p>
          <Link href="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-nocta-50 to-nocta-100 dark:from-nocta-900 dark:to-nocta-800">
      <div className="max-w-md mx-auto pt-16 pb-8 px-6">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar 
            fallback={user.name.charAt(0).toUpperCase()} 
            className="w-24 h-24 mx-auto mb-4 text-2xl"
          />
          <h1 className="text-2xl font-bold mb-2">{user.name}</h1>
          <p className="text-nocta-600 dark:text-nocta-400 mb-3">@{user.username}</p>
          {user.description && (
            <p className="text-nocta-700 dark:text-nocta-300 text-sm leading-relaxed">
              {user.description}
            </p>
          )}
        </div>

        {/* Profile Stats */}
        <div className="bg-white dark:bg-nocta-800 rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">1</div>
              <div className="text-xs text-nocta-500">Profile</div>
            </div>
            <div>
              <div className="text-lg font-semibold">0</div>
              <div className="text-xs text-nocta-500">Links</div>
            </div>
            <div>
              <div className="text-lg font-semibold">0</div>
              <div className="text-xs text-nocta-500">Views</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 mb-8">
          <Button className="w-full" variant="ghost">
            Follow
          </Button>
          <Button className="w-full" variant="ghost">
            Share Profile
          </Button>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link href="/">
            <Button variant="ghost" size="sm">
              ← Back to Putfolio
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-xs text-nocta-500">
          <p>Powered by Putfolio</p>
          <p className="mt-1">
            Created {new Date(user.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}
