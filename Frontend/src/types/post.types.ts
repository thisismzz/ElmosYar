// src/types/post.types.ts
export interface FormErrors {
  content?: string;
  tags?: string;
  general?: string;
}

export interface ChatPostData {
  content: string;
  tags: string[];
  category: 'discussion' | 'food-exchange' | 'teacher-review';
}

export interface ChatPostFormProps {
  onClose: () => void;
  onSubmit?: (postData: ChatPostData) => void;
  initialData?: {
    content?: string;
    tags?: string[];
  };
  category?: 'discussion' | 'food-exchange' | 'teacher-review';
  isSubmitting?: boolean;
  availableTags?: string[];
}