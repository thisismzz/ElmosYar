
export interface Review {
  id: number;
  professorName: string;
  faculty: string;
  courseName: string;
  semester: string;
  overallRating: number;
  ratings?: {
    teaching?: number;
    grading?: number;
    clarity?: number;
    helpfulness?: number;
    satisfaction?: number;
  };
  comment?: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
}

export type ReviewPostSearchProps = {
	professorName?: string;
	faculty?: string;
	courseName?: string;
	semester?: string;
}