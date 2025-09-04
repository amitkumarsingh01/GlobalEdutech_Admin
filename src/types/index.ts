// Types for Admin Panel
export interface User {
  _id: string;
  name: string;
  email: string;
  contact_no: string;
  gender: string;
  education: string;
  course: string;
  provider: string;
  firebase_uid?: string;
  photo_url?: string;
  is_active: boolean;
  created_at: string;
  last_login: string;
  updated_at: string;
}

export interface UsersResponse {
  users: User[];
}

export interface AuthResponse {
  message: string;
  user_id: string;
  token: string;
  user: User;
}

export interface DashboardStats {
  total_users: number;
  total_courses: number;
  total_tests: number;
  total_materials: number;
  total_enrollments: number;
  timestamp: string;
}

export interface RecentActivity {
  recent_users: User[];
  recent_enrollments: any[];
  recent_test_attempts: any[];
}

// Domain Models
export interface Institution {
  _id: string;
  name: string;
  description: string;
  vision?: string;
  mission?: string;
  created_at: string;
  updated_at: string;
}

export interface Testimonial {
  _id: string;
  title: string;
  description: string;
  student_name: string;
  course: string;
  rating: number;
  media_type: string;
  media_url: string;
  student_image?: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Course {
  _id: string;
  name: string;
  title: string;
  description: string;
  category: string;
  sub_category: string;
  start_date: string;
  end_date: string;
  duration: string;
  instructor: string;
  price: number;
  thumbnail_image: string;
  enrolled_students: number;
  status: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Material {
  _id: string;
  class_name: string;
  course: string;
  subject: string;
  module: string;
  title: string;
  description: string;
  academic_year: string;
  time_period: number;
  price: number;
  file_url: string;
  file_size?: number;
  download_count: number;
  tags: string[];
  feedback: any[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}