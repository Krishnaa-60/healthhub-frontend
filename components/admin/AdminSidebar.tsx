import React from 'react';
import HomeIcon from '../icons/HomeIcon';
import UsersIcon from '../icons/UsersIcon';
import DoctorIcon from '../icons/DoctorIcon';
import PersonIcon from '../icons/PersonIcon';
import MailIcon from '../icons/MailIcon';
import ShieldCheckIcon from '../icons/ShieldCheckIcon';

type AdminView = 'dashboard' | 'users' | 'patients' | 'doctors' | 'admins' | 'messages';

interface AdminSidebarProps {
  activeView: AdminView;
  setActiveView: (view: AdminView) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'users', label: 'All Users', icon: UsersIcon },
    { id: 'patients', label: 'Patient Management', icon: PersonIcon },
    { id: 'doctors', label: 'Doctor Management', icon: DoctorIcon },
    { id: 'admins', label: 'Admin Management', icon: ShieldCheckIcon },
    { id: 'messages', label: 'Inbox', icon: MailIcon },
  ];

  return (
    <aside className="hidden lg:flex w-56 xl:w-64 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm p-3 xl:p-4 border-r border-gray-200/80 dark:border-dark-subtext/20 flex-col flex-shrink-0">
      <div className="text-gray-500 dark:text-dark-subtext text-xs font-semibold uppercase tracking-wider mb-3 px-2">
        Menu
      </div>
      <nav className="flex flex-col space-y-2">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id as AdminView)}
            className={`flex items-center space-x-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-200 transform hover:translate-x-1 ${
              activeView === item.id
                ? 'bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg shadow-lg'
                : 'text-gray-600 dark:text-dark-subtext hover:bg-light-green dark:hover:bg-dark-bg'
            }`}
            aria-current={activeView === item.id}
          >
            <item.icon className="w-4 h-4 xl:w-5 xl:h-5" />
            <span className="truncate">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;
