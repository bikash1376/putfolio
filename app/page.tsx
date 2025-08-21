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
import Link from "next/link";
import { supabase } from "@/lib/supabase"; // your client

type UserDetail = {
  id: string;
  username: string;
  name: string;
  description: string;
};

export default function Home() {
  const [userDetails, setUserDetails] = useState<UserDetail[]>([]);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // load from supabase
  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error(error);
      } else {
        setUserDetails(data);
      }
    }
    loadProfiles();
  }, []);

// submit to supabase
async function handleForm(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      username,
      name,
      description,
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

  setUserDetails((prev) => [...prev, data]); // update local state

  setUsername("");
  setName("");
  setDescription("");
}


  return (
    <>
      {/* Avatars */}
      <div className="flex gap-4 flex-wrap">
        {userDetails.map((user) => (
          <Link href={`/profile/${user.username}`} key={user.id}>
            <div className="border p-4 rounded-lg shadow cursor-pointer">
              <Avatar fallback={user.name.charAt(0).toUpperCase()} />
            </div>
          </Link>
        ))}
      </div>

      {/* Sheet for Add Profile */}
      <Sheet>
        <SheetTrigger asChild>
          <Button className="m-4">Add Profile</Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="flex flex-col">
          <SheetHeader>
            <SheetTitle>Add Profile</SheetTitle>
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
                    placeholder="Write something..."
                  />
                </FormControl>
                <FormDescription>
                  Max 500 characters about yourself.
                </FormDescription>
              </FormField>
            </div>

            <FormActions className="sticky bottom-0 border-nocta-200 dark:border-nocta-800/50  p-4 flex justify-end gap-2">
              <SheetClose asChild>
                <Button variant="ghost">Cancel</Button>
              </SheetClose>
              <Button type="submit">Save Profile</Button>
            </FormActions>
          </Form>
        </SheetContent>
      </Sheet>
    </>
  );
}
