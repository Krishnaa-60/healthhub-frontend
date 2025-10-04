import React, { useState, useRef } from 'react';
import { User } from '../types';
import LogoIcon from '../components/icons/LogoIcon';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import DoctorDashboardHome from '../components/doctor/DoctorDashboardHome';
import PatientManagementView from '../components/doctor/PatientManagementView';
import CommunicationsView from '../components/doctor/CommunicationsView';
import UserDetailView from '../components/admin/UserDetailView'; // Reusing admin's detail view
import SendMessageModal from '../components/doctor/SendMessageModal';
import { getUserById, updateUser } from '../services/db';
import DoctorAppointmentsView from '../components/doctor/DoctorAppointmentsView';
import DoctorProfileView from '../components/doctor/DoctorProfileView';
import Toast from '../components/Toast';
import UploadIcon from '../components/icons/UploadIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import UserPlaceholderIcon from '../components/icons/UserPlaceholderIcon';
import HomeIcon from '../components/icons/HomeIcon';
import PersonIcon from '../components/icons/PersonIcon';
import UsersIcon from '../components/icons/UsersIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import MailIcon from '../components/icons/MailIcon';

interface DoctorDashboardProps {
  doctor: User;
  onLogout: () => void;
}

export type DoctorView = 'dashboard' | 'patients' | 'communications' | 'appointments' | 'profile';

const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ doctor: initialDoctor, onLogout }) => {
  const [doctor, setDoctor] = useState<User>(initialDoctor);
  const [activeView, setActiveView] = useState<DoctorView>('dashboard');
  const [viewingPatient, setViewingPatient] = useState<User | null>(null);
  const [messagingPatient, setMessagingPatient] = useState<User | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleUserUpdate = (updatedDoctor: User) => {
    setDoctor(updatedDoctor);
  };

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
        const updatedUser = await updateUser(doctor.healthId, { avatar: base64 });
        setDoctor(updatedUser);
        setToastMessage('Profile picture updated!');
    } catch (err) {
        setToastMessage(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
        setIsUploading(false);
    }
  };

  const handleReplyToPatient = async (patientId: string) => {
    try {
        const patient = await getUserById(patientId);
        if (patient) {
            setMessagingPatient(patient);
        } else {
            console.error("Could not find patient to reply to.");
        }
    } catch(error) {
        console.error("Error fetching patient for reply:", error);
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'patients':
        return <PatientManagementView doctor={doctor} onViewPatient={setViewingPatient} onSendMessage={setMessagingPatient} />;
      case 'communications':
        return <CommunicationsView doctor={doctor} onReplyToPatient={handleReplyToPatient} />;
      case 'appointments':
        return <DoctorAppointmentsView doctor={doctor} onUserUpdate={handleUserUpdate} />;
      case 'profile':
        return <DoctorProfileView doctor={doctor} onDoctorUpdate={handleUserUpdate} setToastMessage={setToastMessage} />;
      case 'dashboard':
      default:
        return <DoctorDashboardHome doctor={doctor} setActiveView={setActiveView} />;
    }
  };
  
  const handleOpenSendMessage = (patient: User) => {
    setViewingPatient(null); // Close detail view first
    setMessagingPatient(patient);
  };

  const handleSendSuccess = () => {
    setMessagingPatient(null);
    setToastMessage('Message sent successfully!');
  };

  return (
    <div className="w-full h-screen bg-light-gray-bg dark:bg-dark-bg text-gray-800 dark:text-dark-text flex flex-col">
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-lg p-2 sm:p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-gray-200/80 dark:border-dark-subtext/20">
        <div className="flex items-center space-x-1 sm:space-x-2">
          <LogoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
          <span className="text-base sm:text-xl font-bold tracking-wider">Healthhub Doctor</span>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
           <button 
              onClick={handleAvatarClick}
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full group bg-gray-200 dark:bg-dark-bg flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-card ring-brand-blue"
              title="Change profile picture"
          >
              {isUploading ? (
                  <SpinnerIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white"/>
              ) : doctor.avatar ? (
                  <img src={doctor.avatar} alt="Doctor Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                  <UserPlaceholderIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-dark-subtext" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity">
                  {!isUploading && <UploadIcon className="w-4 h-4 sm:w-5 sm:h-5 text-white opacity-0 group-hover:opacity-100" />}
              </div>
          </button>
          <div className="text-right hidden md:block">
            <div className="font-semibold text-sm">{doctor.name}</div>
            <div className="text-xs text-gray-500 dark:text-dark-subtext">{doctor.specialization || 'Doctor'}</div>
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
        <DoctorSidebar activeView={activeView} setActiveView={setActiveView} />
        
        {/* Mobile Bottom Navigation - Enhanced UI */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white/98 via-blue-50/98 to-white/98 dark:from-dark-card/98 dark:via-dark-bg/98 dark:to-dark-card/98 backdrop-blur-md border-t-2 border-brand-blue/20 dark:border-dark-accent/30 z-30 safe-area-inset-bottom shadow-2xl">
          <div className="grid grid-cols-5 gap-1.5 px-2 py-3">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`flex flex-col items-center justify-center px-1.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'dashboard' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-brand-blue to-blue-500 dark:from-dark-accent dark:to-blue-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-blue-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}
              aria-current={activeView === 'dashboard'}
            >
              <HomeIcon className={`w-6 h-6 mb-1 ${
                activeView === 'dashboard' ? 'drop-shadow-md' : ''
              }`} />
              <span className={`text-[10px] font-semibold ${
                activeView === 'dashboard' ? 'tracking-wide' : ''
              }`}>Home</span>
            </button>
            <button
              onClick={() => setActiveView('profile')}
              className={`flex flex-col items-center justify-center px-1.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'profile' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-brand-blue to-blue-500 dark:from-dark-accent dark:to-blue-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-blue-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}
              aria-current={activeView === 'profile'}
            >
              <PersonIcon className={`w-6 h-6 mb-1 ${
                activeView === 'profile' ? 'drop-shadow-md' : ''
              }`} />
              <span className={`text-[10px] font-semibold ${
                activeView === 'profile' ? 'tracking-wide' : ''
              }`}>Profile</span>
            </button>
            <button
              onClick={() => setActiveView('patients')}
              className={`flex flex-col items-center justify-center px-1.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'patients' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-brand-blue to-blue-500 dark:from-dark-accent dark:to-blue-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-blue-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}
              aria-current={activeView === 'patients'}
            >
              <UsersIcon className={`w-6 h-6 mb-1 ${
                activeView === 'patients' ? 'drop-shadow-md' : ''
              }`} />
              <span className={`text-[10px] font-semibold ${
                activeView === 'patients' ? 'tracking-wide' : ''
              }`}>Patients</span>
            </button>
            <button
              onClick={() => setActiveView('appointments')}
              className={`flex flex-col items-center justify-center px-1.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'appointments' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-brand-blue to-blue-500 dark:from-dark-accent dark:to-blue-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-blue-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}
              aria-current={activeView === 'appointments'}
            >
              <CalendarIcon className={`w-6 h-6 mb-1 ${
                activeView === 'appointments' ? 'drop-shadow-md' : ''
              }`} />
              <span className={`text-[10px] font-semibold ${
                activeView === 'appointments' ? 'tracking-wide' : ''
              }`}>Appts</span>
            </button>
            <button
              onClick={() => setActiveView('communications')}
              className={`flex flex-col items-center justify-center px-1.5 py-2.5 rounded-xl transition-all duration-300 transform hover:scale-105 ${
                activeView === 'communications' 
                ? 'text-white dark:text-dark-bg bg-gradient-to-br from-brand-blue to-blue-500 dark:from-dark-accent dark:to-blue-400 shadow-lg scale-105' 
                : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-blue-100/80 dark:hover:bg-dark-accent/20 shadow-md'
              }`}
              aria-current={activeView === 'communications'}
            >
              <MailIcon className={`w-6 h-6 mb-1 ${
                activeView === 'communications' ? 'drop-shadow-md' : ''
              }`} />
              <span className={`text-[10px] font-semibold ${
                activeView === 'communications' ? 'tracking-wide' : ''
              }`}>Inbox</span>
            </button>
          </div>
        </nav>

        <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      
      {viewingPatient && (
        <UserDetailView 
          user={viewingPatient} 
          onClose={() => setViewingPatient(null)} 
          onSendMessage={handleOpenSendMessage}
        />
      )}

      {messagingPatient && (
        <SendMessageModal
            doctor={doctor}
            patient={messagingPatient}
            onClose={() => setMessagingPatient(null)}
            onSendSuccess={handleSendSuccess}
        />
      )}
       <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default DoctorDashboard;