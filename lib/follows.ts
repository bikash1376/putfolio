import { supabase } from './supabase';

export interface FollowData {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface ProfileStats {
  id: string;
  profile_id: string;
  views_count: number;
  followers_count: number;
  following_count: number;
  last_viewed: string;
}

// Follow a user
export async function followUser(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .insert({
      follower_id: followerId,
      following_id: followingId,
    })
    .select()
    .single();

  return { data, error };
}

// Unfollow a user
export async function unfollowUser(followerId: string, followingId: string) {
  const { error } = await supabase
    .from('follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  return { error };
}

// Check if current user is following another user
export async function isFollowing(followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking follow status:', error);
    return false;
  }

  return !!data;
}

// Get profile stats
export async function getProfileStats(profileId: string) {
  const { data, error } = await supabase
    .from('profile_stats')
    .select('*')
    .eq('profile_id', profileId)
    .single();

  return { data, error };
}

// Increment profile view count
export async function incrementProfileView(profileId: string) {
  const { error } = await supabase
    .from('profile_stats')
    .update({ 
      views_count: supabase.rpc('increment', { row_id: profileId, increment_amount: 1 }),
      last_viewed: new Date().toISOString()
    })
    .eq('profile_id', profileId);

  return { error };
}

// Get followers list
export async function getFollowers(profileId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      follower_id,
      created_at,
      profiles!follows_follower_id_fkey (
        id,
        username,
        name,
        profile_picture
      )
    `)
    .eq('following_id', profileId)
    .order('created_at', { ascending: false });

  return { data, error };
}

// Get following list
export async function getFollowing(profileId: string) {
  const { data, error } = await supabase
    .from('follows')
    .select(`
      following_id,
      created_at,
      profiles!follows_following_id_fkey (
        id,
        username,
        name,
        profile_picture
      )
    `)
    .eq('follower_id', profileId)
    .order('created_at', { ascending: false });

  return { data, error };
}
