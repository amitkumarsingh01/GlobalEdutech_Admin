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
