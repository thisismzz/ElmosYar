// userProfileService.ts
import api from './authService';

export interface UserProfile {
  username: string;
  email?: string;            // only present for own profile
  bio: string | null;
  profilePicture: string | null;
  studentId: string | null;
  phoneNumber: string | null;
}

export const getUserProfile = async (
  username: string
): Promise<UserProfile> => {
  const response = await api.get(`/users/${username}/profile/`);

  const user = response.data.user;

  return {
    username: user.username,
    email: user.email ?? null, // backend removes for other users
    bio: user.bio ?? null,
    profilePicture: user.profile_picture ?? null,
    studentId: user.student_id ?? null,
    phoneNumber: user.mobile ?? null, // adjust if backend uses another field name
  };
};

export interface UpdateProfilePayload {
  username?: string;
  email?: string;
  bio?: string;
  studentId?: string;
  phoneNumber?: string;
}

export const updateUserProfile = async (
  data: UpdateProfilePayload
): Promise<UserProfile> => {
  const payload = {
    username: data.username,
    email: data.email,
    bio: data.bio,
    student_id: data.studentId,
    mobile: data.phoneNumber,
  };

  const response = await api.put("/profile/update/", payload);
  const u = response.data.user;

  return {
    username: u.username,
    email: u.email ?? null,
    bio: u.bio ?? null,
    profilePicture: u.profile_picture ?? null,
    studentId: u.student_id ?? null,
    phoneNumber: u.mobile ?? null,
  };
};

export default {
  getUserProfile,
  updateUserProfile,
};