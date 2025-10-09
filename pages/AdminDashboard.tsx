import React, { useState, useEffect, useRef } from 'react';
import { AppNavigation } from '../utils/navigation';
import { User } from '../types';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminDashboardHome from '../components/admin/AdminDashboardHome';
import UserManagementView from '../components/admin/UserManagementView';
import PatientManagementView from '../components/admin/PatientManagementView';
import DoctorManagementView from '../components/admin/DoctorManagementView';
import UserDetailView from '../components/admin/UserDetailView';
import LogoIcon from '../components/icons/LogoIcon';
import MessagesView from '../components/admin/MessagesView';
import AdminManagementView from '../components/admin/AdminManagementView';
import { updateUser } from '../services/db';
import Toast from '../components/Toast';
import UploadIcon from '../components/icons/UploadIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import UserPlaceholderIcon from '../components/icons/UserPlaceholderIcon';


interface AdminDashboardProps {
  admin: User;
  onLogout: () => void;
}

export type AdminView = 'dashboard' | 'users' | 'patients' | 'doctors' | 'admins' | 'messages';

const AdminDashboard: React.FC<AdminDashboardProps> = ({ admin: initialAdmin, onLogout }) => {
  const [admin, setAdmin] = useState<User>(initialAdmin);
  const [activeView, setActiveView] = useState<AdminView>('dashboard');

  // Setup back button navigation
  useEffect(() => {
    const cleanup = AppNavigation.setupBackButtonHandler((path) => {
      if (path === '/') {
        setActiveView('dashboard');
      }
    });
    return cleanup;
  }, []);

  // Track navigation when view changes
  useEffect(() => {
    AppNavigation.pushState(`/admin/${activeView}`, `Admin - ${activeView}`);
  }, [activeView]);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });

  const handleAvatarClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
        setToastMessage('Error: Please select an image file.');
        return;
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
        setToastMessage('Error: Image size must be less than 2MB.');
        return;
    }

    setIsUploading(true);
    try {
        const base64 = await toBase64(file);
        const updatedUser = await updateUser(admin.healthId, { avatar: base64 });
        setAdmin(updatedUser);
        setToastMessage('Profile picture updated!');
    } catch (err) {
        setToastMessage(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
        setIsUploading(false);
    }
  };


  const renderContent = () => {
    switch (activeView) {
      case 'users':
        return <UserManagementView onViewUser={setViewingUser} />;
      case 'patients':
        return <PatientManagementView onViewUser={setViewingUser} />;
      case 'doctors':
        return <DoctorManagementView onViewUser={setViewingUser} />;
      case 'admins':
        return <AdminManagementView onViewUser={setViewingUser} />;
      case 'messages':
        return <MessagesView />;
      case 'dashboard':
      default:
        return <AdminDashboardHome setActiveView={setActiveView} />;
    }
  };

  return (
    <div className="w-full h-screen bg-light-gray-bg dark:bg-dark-bg text-gray-800 dark:text-dark-text flex flex-col">
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-lg p-2 sm:p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-gray-200/80 dark:border-dark-subtext/20">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <LogoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-base sm:text-xl font-bold tracking-wider">Healthhub Admin</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
           <button 
              onClick={handleAvatarClick}
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full group bg-gray-200 dark:bg-dark-bg flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-offset-dark-card dark:ring-offset-dark-card ring-primary-green"
              title="Change profile picture"
          >
              {isUploading ? (
                  <SpinnerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
              ) : admin.avatar ? (
                  <img src={admin.avatar} alt="Admin Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                  <UserPlaceholderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-dark-subtext" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity">
                  {!isUploading && <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-0 group-hover:opacity-100" />}
              </div>
          </button>
          <div className="text-right hidden md:block">
            <div className="font-semibold text-sm">{admin.name}</div>
            <div className="text-xs text-gray-500 dark:text-dark-subtext">{admin.role}</div>
          </div>
          <button
            onClick={onLogout}
            className="text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold py-1.5 sm:py-2 px-2 sm:px-3 rounded-md transition-colors"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <AdminSidebar activeView={activeView} setActiveView={setActiveView} />
        
        {/* Mobile Bottom Navigation - Enhanced UI */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white/98 via-green-50/98 to-white/98 dark:from-dark-card/98 dark:via-dark-bg/98 dark:to-dark-card/98 backdrop-blur-md border-t-2 border-primary-green/20 dark:border-dark-accent/30 z-30 safe-area-inset-bottom shadow-2xl">
          <div className="grid grid-cols-3 gap-2 px-3 py-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'dashboard' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}>
              <svg className={`w-6 h-6 mb-1 ${
                activeView === 'dashboard' ? 'drop-shadow-md' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              <span className={`text-[10px] font-semibold ${
                activeView === 'dashboard' ? 'tracking-wide' : ''
              }`}>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveView('users')}
              className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'users' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}>
              <svg className={`w-6 h-6 mb-1 ${
                activeView === 'users' ? 'drop-shadow-md' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              <span className={`text-[10px] font-semibold ${
                activeView === 'users' ? 'tracking-wide' : ''
              }`}>Users</span>
            </button>
            <button
              onClick={() => setActiveView('patients')}
              className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'patients' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}>
              <svg className={`w-6 h-6 mb-1 ${
                activeView === 'patients' ? 'drop-shadow-md' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <span className={`text-[10px] font-semibold ${
                activeView === 'patients' ? 'tracking-wide' : ''
              }`}>Patients</span>
            </button>
            <button
              onClick={() => setActiveView('doctors')}
              className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'doctors' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}>
              <svg className={`w-6 h-6 mb-1 ${
                activeView === 'doctors' ? 'drop-shadow-md' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span className={`text-[10px] font-semibold ${
                activeView === 'doctors' ? 'tracking-wide' : ''
              }`}>Doctors</span>
            </button>
            <button
              onClick={() => setActiveView('admins')}
              className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'admins' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}>
              <svg className={`w-6 h-6 mb-1 ${
                activeView === 'admins' ? 'drop-shadow-md' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span className={`text-[10px] font-semibold ${
                activeView === 'admins' ? 'tracking-wide' : ''
              }`}>Admins</span>
            </button>
            <button
              onClick={() => setActiveView('messages')}
              className={`flex flex-col items-center justify-center px-2 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'messages' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}>
              <svg className={`w-6 h-6 mb-1 ${
                activeView === 'messages' ? 'drop-shadow-md' : ''
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span className={`text-[10px] font-semibold ${
                activeView === 'messages' ? 'tracking-wide' : ''
              }`}>Inbox</span>
            </button>
          </div>
        </nav>

        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 pb-32 lg:pb-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      {viewingUser && (
        <UserDetailView user={viewingUser} onClose={() => setViewingUser(null)} />
      )}

      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default AdminDashboard;