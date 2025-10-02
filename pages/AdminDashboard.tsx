import React, { useState, useRef } from 'react';
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
        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 overflow-y-auto">
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