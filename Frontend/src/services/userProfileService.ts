// userProfileService.ts
import api from "./authService";

// Type for user profile returned from Django serializer
export interface UserProfile {
  username: string;
  email: string;
  studentId: string;
  phoneNo: string;
  bio: string;
  info: string;
  avatar: string;
}

// Fetch the user profile
export const getUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await api.get<UserProfile>("/profiles/me/");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  profileData: Partial<UserProfile>
): Promise<UserProfile> => {
  try {
    const response = await api.put<UserProfile>("/profiles/me/", profileData);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

export default {
  getUserProfile,
  updateUserProfile,
};
