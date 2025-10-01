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
import Toast from '../components/Toast';
import UploadIcon from '../components/icons/UploadIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import UserPlaceholderIcon from '../components/icons/UserPlaceholderIcon';

interface DoctorDashboardProps {
  doctor: User;
  onLogout: () => void;
}

export type DoctorView = 'dashboard' | 'patients' | 'communications' | 'appointments';

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
      <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-lg p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-gray-200/80 dark:border-dark-subtext/20">
        <div className="flex items-center space-x-2">
          <LogoIcon className="w-10 h-10" />
          <span className="text-xl font-bold tracking-wider">Healthhub Doctor</span>
        </div>
        <div className="flex items-center space-x-4">
           <button 
              onClick={handleAvatarClick}
              className="relative w-10 h-10 rounded-full group bg-gray-200 dark:bg-dark-bg flex items-center justify-center cursor-pointer ring-2 ring-offset-2 ring-offset-white dark:ring-offset-dark-card ring-brand-blue"
              title="Change profile picture"
          >
              {isUploading ? (
                  <SpinnerIcon className="w-6 h-6 text-white"/>
              ) : doctor.avatar ? (
                  <img src={doctor.avatar} alt="Doctor Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                  <UserPlaceholderIcon className="w-6 h-6 text-gray-500 dark:text-dark-subtext" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity">
                  {!isUploading && <UploadIcon className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />}
              </div>
          </button>
          <div className="text-right">
            <div className="font-semibold text-sm">{doctor.name}</div>
            <div className="text-xs text-gray-500 dark:text-dark-subtext">{doctor.specialization || 'Doctor'}</div>
          </div>
          <button
            onClick={onLogout}
            className="text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 font-semibold py-2 px-3 rounded-md transition-colors"
            aria-label="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-grow overflow-hidden">
        <DoctorSidebar activeView={activeView} setActiveView={setActiveView} />
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
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