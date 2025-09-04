import { useState, useEffect } from 'react';
import UsersTable from './UsersTable';
import Sidebar from './Sidebar';
import ApiService, { DashboardStats, RecentActivity } from '../services/apiService';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity | null>(null);
  const [loading, setLoading] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    onLogout();
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [stats, activities] = await Promise.all([
          ApiService.getDashboardStats(),
          ApiService.getRecentActivities()
        ]);
        setDashboardStats(stats);
        setRecentActivities(activities);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = dashboardStats ? [
    { title: 'Total Users', value: dashboardStats.total_users.toLocaleString(), change: '+12%', icon: '👥', color: 'blue' },
    { title: 'Active Courses', value: dashboardStats.total_courses.toLocaleString(), change: '+8%', icon: '📚', color: 'green' },
    { title: 'Tests Taken', value: dashboardStats.total_tests.toLocaleString(), change: '+23%', icon: '📝', color: 'purple' },
    { title: 'Materials Downloaded', value: dashboardStats.total_materials.toLocaleString(), change: '+15%', icon: '📄', color: 'orange' },
  ] : [
    { title: 'Total Users', value: '0', change: '+0%', icon: '👥', color: 'blue' },
    { title: 'Active Courses', value: '0', change: '+0%', icon: '📚', color: 'green' },
    { title: 'Tests Taken', value: '0', change: '+0%', icon: '📝', color: 'purple' },
    { title: 'Materials Downloaded', value: '0', change: '+0%', icon: '📄', color: 'orange' },
  ];

  const activities = recentActivities ? [
    ...recentActivities.recent_users.slice(0, 3).map((user, index) => ({
      id: index + 1,
      user: user.name,
      action: 'signed up',
      time: new Date(user.created_at).toLocaleString(),
      type: 'signup'
    })),
    ...recentActivities.recent_enrollments.slice(0, 2).map((enrollment, index) => ({
      id: index + 4,
      user: 'User',
      action: 'enrolled in course',
      time: new Date(enrollment.created_at).toLocaleString(),
      type: 'enrollment'
    }))
  ] : [
    { id: 1, user: 'No recent activity', action: '', time: '', type: 'empty' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'test': return '📝';
      case 'download': return '📄';
      case 'enrollment': return '📚';
      case 'profile': return '👤';
      case 'signup': return '✨';
      default: return '📋';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'test': return 'text-blue-600 bg-blue-100';
      case 'download': return 'text-green-600 bg-green-100';
      case 'enrollment': return 'text-purple-600 bg-purple-100';
      case 'profile': return 'text-orange-600 bg-orange-100';
      case 'signup': return 'text-pink-600 bg-pink-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UsersTable />;
      case 'dashboard':
      default:
        if (loading) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold"></div>
            </div>
          );
        }
        return (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-dark-blue to-dark-blue-light rounded-lg p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">Welcome back, Admin!</h1>
              <p className="text-blue-100">Here's what's happening with your platform today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-sm text-green-600">{stat.change} from last month</p>
                    </div>
                    <div className="text-3xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart Placeholder */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
                <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📈</div>
                    <p className="text-gray-500">Chart will be implemented here</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="mt-4 text-gold hover:text-gold-dark text-sm font-medium">
                  View all activities →
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold hover:bg-opacity-10 transition-colors">
                  <div className="text-2xl mb-2">👥</div>
                  <p className="font-medium">Add New User</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold hover:bg-opacity-10 transition-colors">
                  <div className="text-2xl mb-2">📚</div>
                  <p className="font-medium">Create Course</p>
                </button>
                <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-gold hover:bg-gold hover:bg-opacity-10 transition-colors">
                  <div className="text-2xl mb-2">📝</div>
                  <p className="font-medium">Add Test</p>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onToggle={toggleSidebar} 
        onLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleSidebar}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {activeView === 'dashboard' ? 'Dashboard' : 
                 activeView === 'users' ? 'Users Management' : 
                 'Admin Panel'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 19h6v-6H4v6z" />
                </svg>
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-dark-blue font-semibold text-sm">A</span>
                </div>
                <span className="text-sm font-medium text-gray-700">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="w-full max-w-none">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
