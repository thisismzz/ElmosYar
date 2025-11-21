import { api } from "./authService";

export interface UserProfile {
  username: string | null;
  email: string | null;
  avatar: string | null;
  bio: string | null;
  info: string | null;
  mobile: string | null;
}

//! profiles/me will be changed to use id
export async function fetchUserProfile(id: string): Promise<UserProfile> {
  const { data } = await api.get<UserProfile>("/profiles/me");
  
  localStorage.setItem("profile_data", JSON.stringify(data));
  
  return data;
}

//! profiles/me will be changed to use id
export async function updateUserProfile(id: string, updates: Partial<UserProfile>): Promise<UserProfile> {
  const { data } = await api.put<UserProfile>("/profiles/me", updates);

  localStorage.setItem("profile_data", JSON.stringify(data));

  return data;
}
