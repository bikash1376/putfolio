"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormLabel, FormControl, FormActions } from "@/components/ui/form";
import { Avatar } from "@/components/ui/avatar";
import { uploadImage} from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";

interface SocialLink {
  platform: string;
  url: string;
  displayText: string;
  icon: string;
}

interface ProfileFormData {
  username: string;
  name: string;
  description: string;
  bio: string;
  location: string;
  website: string;
  profilePicture: string;
  socialLinks: SocialLink[];
}

interface ProfileFormProps {
  userId: string;
  onSuccess: (profile: unknown) => void;
  onCancel: () => void;
}

const SOCIAL_PLATFORMS = [
  { platform: "twitter", icon: "🐦", displayText: "Twitter" },
  { platform: "instagram", icon: "📸", displayText: "Instagram" },
  { platform: "linkedin", icon: "💼", displayText: "LinkedIn" },
  { platform: "github", icon: "💻", displayText: "GitHub" },
  { platform: "youtube", icon: "📺", displayText: "YouTube" },
  { platform: "tiktok", icon: "🎵", displayText: "TikTok" },
  { platform: "discord", icon: "🎮", displayText: "Discord" },
  { platform: "website", icon: "🌐", displayText: "Website" },
];

export function ProfileForm({ userId, onSuccess, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState<ProfileFormData>({
    username: "",
    name: "",
    description: "",
    bio: "",
    location: "",
    website: "",
    profilePicture: "",
    socialLinks: [],
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const result = await uploadImage(file);
      setFormData(prev => ({
        ...prev,
        profilePicture: result.secure_url
      }));
    } catch (err) {
      console.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
    }
  };

  const addSocialLink = () => {
    setFormData(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, {
        platform: "",
        url: "",
        displayText: "",
        icon: ""
      }]
    }));
  };

  const updateSocialLink = (index: number, field: keyof SocialLink, value: string) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map((link, i) => 
        i === index ? { ...link, [field]: value } : link
      )
    }));
  };

  const removeSocialLink = (index: number) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Create profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .insert({
          username: formData.username,
          name: formData.name,
          description: formData.description,
          bio: formData.bio,
          location: formData.location,
          website: formData.website,
          profile_picture: formData.profilePicture,
          user_id: userId,
        })
        .select()
        .single();

      if (profileError) {
        if (profileError.code === "23505") {
          setError("Username already taken");
        } else {
          setError("Failed to create profile");
        }
        return;
      }

      // Create social links if any
      if (formData.socialLinks.length > 0) {
        const socialLinksData = formData.socialLinks
          .filter(link => link.platform && link.url)
          .map((link, index) => ({
            profile_id: profile.id,
            platform: link.platform,
            url: link.url,
            display_text: link.displayText || link.platform,
            icon: link.icon,
            order_index: index,
          }));

        if (socialLinksData.length > 0) {
          const { error: socialError } = await supabase
            .from("social_links")
            .insert(socialLinksData);

          if (socialError) {
            console.error("Failed to create social links:", socialError);
          }
        }
      }

      onSuccess(profile);
    } catch (err) {
      console.error("An unexpected error occurred", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-6">
      {/* Profile Picture */}
      <div className="text-center">
        <div className="relative inline-block">
          <Avatar 
            src={formData.profilePicture} 
            fallback={formData.name.charAt(0).toUpperCase() || "U"}
            className="w-24 h-24 text-2xl"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
          >
            {uploadingImage ? "..." : "📷"}
          </Button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
          className="hidden"
        />
        <p className="text-sm text-nocta-500 mt-2">
          Click the camera icon to upload a profile picture
        </p>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="username">
          <FormLabel required>Username</FormLabel>
          <FormControl>
            <Input
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="username"
              required
            />
          </FormControl>
        </FormField>

        <FormField name="name">
          <FormLabel required>Full Name</FormLabel>
          <FormControl>
            <Input
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your full name"
              required
            />
          </FormControl>
        </FormField>
      </div>

      <FormField name="description">
        <FormLabel>Tagline</FormLabel>
        <FormControl>
          <Input
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="A short tagline about yourself"
          />
        </FormControl>
      </FormField>

      <FormField name="bio">
        <FormLabel>Bio</FormLabel>
        <FormControl>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            placeholder="Tell people more about yourself..."
            rows={3}
          />
        </FormControl>
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField name="location">
          <FormLabel>Location</FormLabel>
          <FormControl>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="City, Country"
            />
          </FormControl>
        </FormField>

        <FormField name="website">
          <FormLabel>Website</FormLabel>
          <FormControl>
            <Input
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourwebsite.com"
              type="url"
            />
          </FormControl>
        </FormField>
      </div>

      {/* Social Links */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <FormLabel>Social Links</FormLabel>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addSocialLink}
          >
            + Add Link
          </Button>
        </div>
        
        <div className="space-y-3">
          {formData.socialLinks.map((link, index) => (
            <div key={index} className="flex gap-2 items-center">
              <select
                value={link.platform}
                onChange={(e) => {
                  const platform = e.target.value;
                  const platformData = SOCIAL_PLATFORMS.find(p => p.platform === platform);
                  updateSocialLink(index, "platform", platform);
                  if (platformData) {
                    updateSocialLink(index, "icon", platformData.icon);
                    updateSocialLink(index, "displayText", platformData.displayText);
                  }
                }}
                className="flex-1 p-2 border rounded-md"
              >
                <option value="">Select platform</option>
                {SOCIAL_PLATFORMS.map(p => (
                  <option key={p.platform} value={p.platform}>
                    {p.icon} {p.displayText}
                  </option>
                ))}
              </select>
              
              <Input
                value={link.url}
                onChange={(e) => updateSocialLink(index, "url", e.target.value)}
                placeholder="URL"
                className="flex-2"
              />
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeSocialLink(index)}
                className="text-red-500 hover:text-red-700"
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <FormActions>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Creating Profile..." : "Create Profile"}
        </Button>
      </FormActions>
    </Form>
  );
}
