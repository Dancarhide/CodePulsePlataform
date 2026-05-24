// API Responses Standard
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
}

// User Interfaces
export interface UserDto {
  id: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ADMIN' | 'INSTRUCTOR';
  xp: number;
  level: number;
  avatarUrl?: string | null;
  createdAt: string;
}

// Course Interfaces
export interface CourseDto {
  id: string;
  title: string;
  description: string;
  isPublished: boolean;
  imageUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ModuleDto {
  id: string;
  title: string;
  description: string;
  order: number;
  courseId: string;
}

export interface LessonDto {
  id: string;
  title: string;
  description: string;
  content: string;
  order: number;
  type: 'TEXT' | 'VIDEO' | 'LAB';
  moduleId: string;
  labId?: string | null;
}

// Forums
export interface ForumPostDto {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  upvotes: number;
  category: string;
  commentsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumCommentDto {
  id: string;
  content: string;
  postId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

// Labs
export interface LabDto {
  id: string;
  title: string;
  description: string;
  instructions: string;
  defaultCode: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
}

export interface CodeAttemptDto {
  id: string;
  userId: string;
  labId: string;
  code: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'ERROR';
  feedback?: string | null;
  runTimeMs: number;
  createdAt: string;
}

// Tournaments
export interface TournamentDto {
  id: string;
  title: string;
  description: string;
  type: 'THEMATIC' | 'NON_THEMATIC';
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED';
  startTime: string;
  endTime: string;
}

// Achievements
export interface AchievementDto {
  id: string;
  title: string;
  description: string;
  badgeUrl: string;
  xpReward: number;
  metric: string;
  threshold: number;
}
