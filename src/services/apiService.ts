// API Service for Admin Panel
import * as Types from '../types';

const API_BASE_URL = 'https://server.globaledutechlearn.com';

// API Service Class
class ApiService {
  static fileUrl(path?: string | null): string | null {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `${API_BASE_URL}/${path}`;
  }
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

  // ========== Institutions CRUD ==========
  static async createInstitution(data: Omit<Types.Institution, '_id' | 'created_at' | 'updated_at'>, token: string): Promise<{ message: string; id: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({
        name: data.name,
        description: data.description,
        vision: data.vision,
        mission: data.mission,
      }),
    });
    return this.handleResponse(response);
  }

  static async getInstitutions(): Promise<{ institutions: Types.Institution[] }> {
    const response = await fetch(`${API_BASE_URL}/institutions`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getInstitutionById(id: string): Promise<{ institution: Types.Institution }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateInstitution(id: string, data: Partial<Types.Institution>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteInstitution(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/institutions/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== Testimonials CRUD (multipart for media) ==========
  static async createTestimonial(data: {
    payload: {
      title: string;
      description: string;
      student_name: string;
      course: string;
      rating?: number;
      media_type: string;
    };
    media_file: File;
    student_image?: File | null;
  }, token: string): Promise<{ message: string; id: string }> {
    const formData = new FormData();
    formData.append('media_file', data.media_file);
    if (data.student_image) formData.append('student_image', data.student_image);
    Object.entries(data.payload).forEach(([k, v]) => formData.append(k, String(v)));

    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getTestimonials(): Promise<{ testimonials: Types.Testimonial[] }> {
    const response = await fetch(`${API_BASE_URL}/testimonials`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getTestimonialById(id: string): Promise<{ testimonial: Types.Testimonial }> {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateTestimonial(id: string, data: Partial<Types.Testimonial>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteTestimonial(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/testimonials/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== Courses CRUD (thumbnail multipart on create) ==========
  static async createCourse(data: {
    payload: {
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
    };
    thumbnail: File;
  }, token: string): Promise<{ message: string; id: string }> {
    const formData = new FormData();
    formData.append('thumbnail', data.thumbnail);
    Object.entries(data.payload).forEach(([k, v]) => formData.append(k, String(v)));

    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getCourses(): Promise<{ courses: Types.Course[] }> {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getCourseById(id: string): Promise<{ course: Types.Course }> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateCourse(id: string, data: Partial<Types.Course>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteCourse(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
  }

  // ========== Materials CRUD (pdf multipart on create) ==========
  static async createMaterial(data: {
    payload: {
      class_name: string;
      course: string;
      subject: string;
      module: string;
      title: string;
      description: string;
      academic_year: string;
      time_period: number;
      price: number;
    };
    pdf_file: File;
  }, token: string): Promise<{ message: string; id: string }> {
    const formData = new FormData();
    formData.append('pdf_file', data.pdf_file);
    Object.entries(data.payload).forEach(([k, v]) => formData.append(k, String(v)));

    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
    });
    return this.handleResponse(response);
  }

  static async getMaterials(): Promise<{ materials: Types.Material[] }> {
    const response = await fetch(`${API_BASE_URL}/materials`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async getMaterialById(id: string): Promise<{ material: Types.Material }> {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse(response);
  }

  static async updateMaterial(id: string, data: Partial<Types.Material>, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(data),
    });
    return this.handleResponse(response);
  }

  static async deleteMaterial(id: string, token: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/materials/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
    return this.handleResponse(response);
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