"use client";

import { use, useEffect, useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  username: string;
  name: string;
  description: string;
};

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params); // unwrap promise
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

  if (loading) return <div className="p-6">Loading...</div>;
  if (!user) return <div className="p-6">User not found</div>;

  return (
    <div className="p-6">
      <Avatar fallback={user.name.charAt(0).toUpperCase()} />
      <h1 className="text-2xl font-bold">{user.name}</h1>
      <p className="text-gray-600">@{user.username}</p>
      <p>{user.description}</p>
    </div>
  );
}
