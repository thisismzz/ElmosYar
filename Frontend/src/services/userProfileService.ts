// userProfileService.ts
import api from './authService';

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePicture: string | null;
  bio: string;
  studentId: string | null;
  isEmailVerified: boolean;
  followersCount: number;
  followingCount: number;
  postsCount: number;
  isFollowing: boolean;
  isMe: boolean;
  createdAt: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  bio?: string;
  studentId?: string;
}

export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  const response = await api.get('/profile/');
  
  const user = response.data.user;
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profilePicture: user.profile_picture,
    bio: user.bio,
    studentId: user.student_id,
    isEmailVerified: user.is_email_verified,
    followersCount: user.followers_count,
    followingCount: user.following_count,
    postsCount: user.posts_count,
    isFollowing: user.is_following,
    isMe: user.is_me,
    createdAt: user.created_at,
  };
};

export const updateUserProfile = async (
  data: UpdateProfilePayload
): Promise<UserProfile> => {
  const payload = {
    first_name: data.firstName,
    last_name: data.lastName,
    bio: data.bio,
    student_id: data.studentId,
  };

  const response = await api.put('/profile/update/', payload);
  const user = response.data.user;

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    profilePicture: user.profile_picture,
    bio: user.bio,
    studentId: user.student_id,
    isEmailVerified: user.is_email_verified,
    followersCount: user.followers_count,
    followingCount: user.following_count,
    postsCount: user.posts_count,
    isFollowing: user.is_following,
    isMe: user.is_me,
    createdAt: user.created_at,
  };
};

export const updateProfilePicture = async (
  profilePicture: File
): Promise<{ profilePicture: string }> => {
  const formData = new FormData();
  formData.append('profile_picture', profilePicture);

  const response = await api.post('/profile/update-picture/', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return {
    profilePicture: response.data.profile_picture,
  };
};

export const deleteProfilePicture = async (): Promise<void> => {
  await api.delete('/profile/delete-picture/');
};

export default {
  getCurrentUserProfile,
  updateUserProfile,
  updateProfilePicture,
  deleteProfilePicture,
};