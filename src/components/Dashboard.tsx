import { useState, useEffect } from 'react';
import UsersTable from './UsersTable';
import Sidebar from './Sidebar';
import ApiService from '../services/apiService';
import type { DashboardStats, RecentActivity } from '../types';

interface DashboardProps {
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeView] = useState('dashboard');
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

  const stats = [
    { title: 'Total Users', value: dashboardStats?.total_users?.toLocaleString() || '0', icon: '👥' },
    { title: 'Active Courses', value: dashboardStats?.total_courses?.toLocaleString() || '0', icon: '📚' },
    { title: 'Tests Available', value: dashboardStats?.total_tests?.toLocaleString() || '0', icon: '📝' },
    { title: 'Materials Available', value: dashboardStats?.total_materials?.toLocaleString() || '0', icon: '📄' },
  ];

  const activities = recentActivities?.recent_users?.slice(0, 5).map((user, index) => ({
    id: index + 1,
    user: user.name,
    action: 'signed up',
    time: new Date(user.created_at).toLocaleString(),
    type: 'signup'
  })) || [];


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
          <div className="w-full">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-dark-blue to-dark-blue-light text-white p-2">
              <h1 className="text-2xl font-bold">Welcome back, Admin!</h1>
              <p className="text-blue-100 text-sm">Here's what's happening with your platform today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white shadow p-2 border-r border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className="text-3xl">{stat.icon}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity - Full Width */}
            <div className="bg-white shadow">
              <div className="p-2">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h3>
                <div className="space-y-2">
                  {activities.length > 0 ? activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-3">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 text-sm">👤</span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">
                          <span className="font-medium">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  )) : (
                    <p className="text-gray-500">No recent users</p>
                  )}
                </div>
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
          <div className="flex items-center justify-between p-4">
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
        <main className="flex-1 overflow-y-auto">
          <div className="w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
