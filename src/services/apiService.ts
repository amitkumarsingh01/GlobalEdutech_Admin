// API Service for Admin Panel
import * as Types from '../types';

const API_BASE_URL = 'https://server.globaledutechlearn.com';

// API Service Class
class ApiService {
  private static getAuthHeaders(token?: string) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'accept': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return response.json();
  }

  // Authentication
  static async login(username: string, password: string): Promise<Types.AuthResponse> {
    // Simple admin check for now - you can create a proper admin endpoint later
    if (username === 'admin' && password === 'admin123#') {
      return {
        message: 'Login successful',
        user_id: 'admin',
        token: 'admin-token-' + Date.now(),
        user: {
          _id: 'admin',
          name: 'Admin User',
          email: 'admin@vidyarthimitraa.com',
          contact_no: '',
          gender: 'other',
          education: 'Admin',
          course: 'Administration',
          provider: 'admin',
          is_active: true,
          created_at: new Date().toISOString(),
          last_login: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      };
    } else {
      throw new Error('Invalid credentials');
    }
  }

  // Users Management
  static async getAllUsers(): Promise<Types.UsersResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<Types.UsersResponse>(response);
    } catch (error) {
      console.error('Error fetching users:', error);
      throw new Error('Failed to fetch users');
    }
  }

  static async getUserById(userId: string): Promise<{ user: Types.User }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<{ user: Types.User }>(response);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  static async updateUser(userId: string, userData: Partial<Types.User>, token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(token),
        body: JSON.stringify(userData),
      });
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  static async deleteUser(userId: string, token: string): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(token),
      });
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Failed to delete user');
    }
  }

  // Dashboard Statistics
  static async getDashboardStats(): Promise<Types.DashboardStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<Types.DashboardStats>(response);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Return default stats if API fails
      return {
        total_users: 0,
        total_courses: 0,
        total_tests: 0,
        total_materials: 0,
        total_enrollments: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  static async getRecentActivities(): Promise<Types.RecentActivity> {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/recent-activities`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<Types.RecentActivity>(response);
    } catch (error) {
      console.error('Error fetching recent activities:', error);
      // Return empty activities if API fails
      return {
        recent_users: [],
        recent_enrollments: [],
        recent_test_attempts: [],
      };
    }
  }

  // Courses Management
  static async getAllCourses(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/courses`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw new Error('Failed to fetch courses');
    }
  }

  // Tests Management
  static async getAllTests(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/tests`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching tests:', error);
      throw new Error('Failed to fetch tests');
    }
  }

  // Materials Management
  static async getAllMaterials(): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/materials`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse(response);
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw new Error('Failed to fetch materials');
    }
  }

  // Health Check
  static async healthCheck(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<{ message: string }>(response);
    } catch (error) {
      console.error('Error checking API health:', error);
      throw new Error('API is not responding');
    }
  }
}

// Re-export types for convenience
export * from '../types';

export default ApiService;