import React from 'react';
import HomeIcon from '../icons/HomeIcon';
import UsersIcon from '../icons/UsersIcon';
import MailIcon from '../icons/MailIcon';
import CalendarIcon from '../icons/CalendarIcon';
import { DoctorView } from '../../pages/DoctorDashboard';

interface DoctorSidebarProps {
  activeView: DoctorView;
  setActiveView: (view: DoctorView) => void;
}

const DoctorSidebar: React.FC<DoctorSidebarProps> = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
    { id: 'patients', label: 'My Patients', icon: UsersIcon },
    { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
    { id: 'communications', label: 'Inbox', icon: MailIcon },
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
            onClick={() => setActiveView(item.id as DoctorView)}
            className={`flex items-center space-x-3 px-3 xl:px-4 py-2.5 xl:py-3 rounded-lg text-xs xl:text-sm font-semibold transition-all duration-200 transform hover:translate-x-1 ${
              activeView === item.id
                ? 'bg-brand-blue text-white shadow-lg'
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

export default DoctorSidebar;