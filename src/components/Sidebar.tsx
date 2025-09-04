import React from 'react';
import { BookOpen, FileText, User, Users, Building2, MessageSquareQuote, Bell, Newspaper, ClipboardList, FileSignature, Phone, Mail, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export type PageId = 'dashboard' | 'institutions' | 'testimonials' | 'course' | 'test' | 'material' | 'users' | 'notifications' | 'current_affairs' | 'enrollments' | 'terms' | 'contact' | 'messages' | 'profile' | 'logout';

type SidebarProps = {
  currentPage: PageId;
  setCurrentPage: (page: PageId) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
};

const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage, isMobileOpen, setIsMobileOpen }) => {
  const { logout, user } = useAuth();

  const menuItems: Array<{ id: PageId; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'institutions', label: 'Institutions', icon: Building2 },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'course', label: 'Course', icon: BookOpen },
    { id: 'test', label: 'Test', icon: FileText },
    { id: 'material', label: 'Material', icon: FileText },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'current_affairs', label: 'Current Affairs', icon: Newspaper },
    { id: 'enrollments', label: 'Enrollments', icon: ClipboardList },
    // { id: 'terms', label: 'Terms', icon: FileSignature },
    { id: 'contact', label: 'Contact', icon: Phone },
    // { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const handleItemClick = (itemId: PageId): void => {
    if (itemId === 'logout') { logout(); return; }
    setCurrentPage(itemId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 shadow-2xl overflow-y-auto
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-20 px-6 bg-blue-900 border-b border-blue-700">
          <h1 className="text-2xl font-bold text-yellow-400">Admin Panel</h1>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-white hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-blue-800"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="flex items-center space-x-4 mb-8 p-4 bg-blue-800 bg-opacity-50 rounded-xl">
            <div className="h-12 w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <User className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-lg">{user?.username}</p>
              <p className="text-yellow-300 text-sm">{user?.role}</p>
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isLogout = item.id === 'logout';
              const hoverBg = isLogout ? 'hover:bg-red-600' : 'hover:bg-yellow-500';
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`
                    w-full flex items-center space-x-4 px-4 py-4 rounded-xl text-left transition-all duration-200 ${hoverBg} group
                    ${currentPage === item.id ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg transform scale-[1.02]' : 'text-blue-100 hover:text-white'}
                  `}
                >
                  <Icon className={`h-6 w-6 ${currentPage === item.id ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                  <span className="font-medium text-lg">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* <div className="absolute bottom-0 left-0 right-0 p-6">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-4 px-4 py-4 text-blue-100 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 group"
          >
            <LogOut className="h-6 w-6 text-blue-300 group-hover:text-white" />
            <span className="font-medium text-lg">Logout</span>
          </button>
        </div> */}
      </div>
    </>
  );
};

export default Sidebar;


