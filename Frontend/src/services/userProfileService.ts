// userProfileService.ts

import axios from "axios";
import { getAccessToken } from "./authService";

export interface UserProfile {
  username?: string;
  email?: string;
  avatar?: string;
  bio?: string;
  info?: string;
  mobile?: string;
}

const profileApi = axios.create({
  baseURL: "http://127.0.0.1:4000/profile", 
});


profileApi.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await profileApi.get<UserProfile>("/profiles/me/");
  return response.data;
}


export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<UserProfile> {
  const response = await profileApi.put<UserProfile>("/profiles/me/", updates);
  return response.data;
}
