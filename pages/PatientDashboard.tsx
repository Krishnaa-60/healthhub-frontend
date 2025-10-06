import React, { useState, useEffect, useMemo } from 'react';
import { User, DashboardView, MedicalRecord } from '../types';
import { MEDICAL_RECORD_CATEGORIES } from '../constants';
import LogoIcon from '../components/icons/LogoIcon';
import PatientIcon from '../components/icons/PatientIcon';
import HomeIcon from '../components/icons/HomeIcon';
import PersonIcon from '../components/icons/PersonIcon';
import CalendarIcon from '../components/icons/CalendarIcon';
import DocumentIcon from '../components/icons/DocumentIcon';
import PrescriptionIcon from '../components/icons/PrescriptionIcon';
import DietIcon from '../components/icons/DietIcon';
import DoctorIcon from '../components/icons/DoctorIcon';
import AiDietPlanner from '../components/AiDietPlanner';
import { getMedicalRecords, deleteMedicalRecord } from '../services/db';
import PlusIcon from '../components/icons/PlusIcon';
import UploadRecordForm from '../components/UploadRecordForm';
import FilePreviewModal from '../components/FilePreviewModal';
import ProfileView from '../components/ProfileView';
import AppointmentsView from '../components/AppointmentsView';
import PrescriptionsView from '../components/PrescriptionsView';
import DoctorsView from '../components/DoctorsView';
import LockIcon from '../components/icons/LockIcon';
import OtpVerificationModal from '../components/OtpVerificationModal';
import DashboardHomeView from '../components/DashboardHomeView';
import DownloadCircleIcon from '../components/icons/DownloadCircleIcon';
import DocumentTextIcon from '../components/icons/DocumentTextIcon';
import HeartbeatIcon from '../components/icons/HeartbeatIcon';
import TrophyIcon from '../components/icons/TrophyIcon';
import CheckCircleIcon from '../components/icons/CheckCircleIcon';
import SearchResultsView from '../components/patient/SearchResultsView';
import SearchIcon from '../components/icons/SearchIcon';
import Toast from '../components/Toast';
import TrashIcon from '../components/icons/TrashIcon';
import WelcomeIllustration from '../components/icons/WelcomeIllustration';

// --- Animated Counter Hook ---
const useAnimatedCounter = (endValue: number, duration = 1500) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number;
        const animationFrame = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            setCount(Math.floor(endValue * percentage));
            if (progress < duration) {
                requestAnimationFrame(animationFrame);
            }
        };
        requestAnimationFrame(animationFrame);
    }, [endValue, duration]);

    return count;
};


// --- Reusable UI Components specific to this dashboard ---
const StatCard: React.FC<{ icon: React.FC<{ className?: string }>, title: string, value: number, colorClass: string }> = ({ icon: Icon, title, value, colorClass }) => {
    const count = useAnimatedCounter(value);
    return (
        <div className={`p-4 sm:p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105 ${colorClass}`}>
            <div className="flex items-center justify-between text-white">
                <div className="flex flex-col">
                    <span className="text-2xl sm:text-3xl md:text-4xl font-bold">{count}</span>
                    <span className="text-xs sm:text-sm font-semibold opacity-80">{title}</span>
                </div>
                <Icon className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 opacity-30" />
            </div>
        </div>
    );
};


const DashboardBackground: React.FC = () => (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary-green/10 rounded-full filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent-blue/10 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-accent-lime/10 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        <style>{`
        @keyframes blob {
	        0% { transform: translate(0px, 0px) scale(1); }
	        33% { transform: translate(30px, -50px) scale(1.1); }
	        66% { transform: translate(-20px, 20px) scale(0.9); }
	        100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
        `}</style>
    </div>
);

const MedicalRecordCard: React.FC<{ record: MedicalRecord, color: 'lime' | 'blue', onPreview: (record: MedicalRecord) => void, onDownload: (record: MedicalRecord) => void, onDelete: (recordId: string) => void }> = ({ record, color, onPreview, onDownload, onDelete }) => {
    const gradientClass = color === 'lime' 
        ? 'from-grad-lime-from to-grad-lime-to'
        : 'from-grad-blue-from to-grad-blue-to';
    
    const formattedDate = record.dateAdded ? new Date(record.dateAdded).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC'
    }) : 'N/A';

    return (
        <div className={`bg-gradient-to-br ${gradientClass} text-white rounded-lg shadow-lg p-3 sm:p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-800 truncate pr-2 text-sm sm:text-base">{record.name}</h4>
                     <div className="flex items-center gap-1 sm:gap-2 mt-1 flex-wrap">
                        <span className={`px-2 py-0.5 bg-white/30 text-slate-800 text-xs font-semibold rounded-full`}>{record.category}</span>
                        <p className="text-xs sm:text-sm text-slate-700 truncate" title={record.disease}>for {record.disease}</p>
                    </div>
                </div>
                 <DocumentTextIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white/50 flex-shrink-0" />
            </div>
             <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="text-left text-slate-700">
                    <p className="text-xs font-medium">{record.files.length} file(s)</p>
                    <div className="flex items-center gap-1.5 mt-1" title={`Uploaded on ${formattedDate}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-semibold">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                    <button 
                        onClick={() => onDelete(record.recordId)} 
                        className="p-1.5 sm:p-2 text-gray-500 dark:text-slate-800 hover:text-red-500 dark:hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full transition-colors" 
                        title={`Delete record: ${record.name}`}
                    >
                        <TrashIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                    <button onClick={() => onDownload(record)} className="text-slate-800 hover:text-white transition-colors" title="Download first file">
                        <DownloadCircleIcon className="w-6 h-6 sm:w-8 sm:h-8" />
                    </button>
                    <button
                        onClick={() => onPreview(record)}
                        className="px-3 sm:px-4 py-1 sm:py-1.5 bg-white/90 text-primary-green font-bold rounded-lg hover:bg-white transition text-xs sm:text-sm shadow-md"
                    >
                        Preview
                    </button>
                </div>
            </div>
        </div>
    );
};

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

const PatientDashboard: React.FC<PatientDashboardProps> = ({ user, onLogout, onUserUpdate }) => {
    const [activeView, setActiveView] = useState<DashboardView>('home');
    const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
    const [isLoadingRecords, setIsLoadingRecords] = useState(false);
    const [recordsError, setRecordsError] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [previewingRecord, setPreviewingRecord] = useState<MedicalRecord | null>(null);
    const [verifyingRecord, setVerifyingRecord] = useState<MedicalRecord | null>(null);
    const [showFullDashboard, setShowFullDashboard] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');


    const fetchMedicalRecords = async () => {
        if (user) {
            setIsLoadingRecords(true);
            setRecordsError('');
            try {
                const records = await getMedicalRecords(user.healthId);
                setMedicalRecords(records);
            } catch (error) {
                setRecordsError('Failed to load medical records.');
                console.error(error);
            } finally {
                setIsLoadingRecords(false);
            }
        }
    };

    useEffect(() => {
        if (activeView === 'records' && showFullDashboard) {
            fetchMedicalRecords();
        }
    }, [user, activeView, showFullDashboard]);
    
    // History management for preview modal
    useEffect(() => {
        const handlePopState = () => {
            // When history changes (e.g., browser back button), if the new state
            // doesn't have our modal flag, we ensure the modal is closed.
            if (!window.history.state?.modal) {
                setPreviewingRecord(null);
                setVerifyingRecord(null);
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []); // This effect runs only once on mount

    const handleUploadSuccess = () => {
        setShowUploadModal(false);
        fetchMedicalRecords(); // Refresh the list of records
    };
    
    const handlePreviewClick = (record: MedicalRecord) => {
        if (record.isLocked) {
            setVerifyingRecord(record);
        } else {
            // Push a state to history when opening the modal
            window.history.pushState({ modal: 'recordPreview' }, '');
            setPreviewingRecord(record);
        }
    };
    
    const handleOtpSuccess = () => {
        if (verifyingRecord) {
            // Also push history state after successful OTP verification
            window.history.pushState({ modal: 'recordPreview' }, '');
            setPreviewingRecord(verifyingRecord);
            setVerifyingRecord(null);
        }
    };

    const handleDownloadRecord = async (record: MedicalRecord) => {
        if (!record.files || record.files.length === 0) {
            alert("This record has no files to download.");
            return;
        }
        // For simplicity, download the first file.
        const fileToDownload = record.files[0];
        
        try {
            const response = await fetch(fileToDownload.content);
            if (!response.ok) throw new Error('Network response was not ok.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileToDownload.name);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Could not download the file. Please try again.');
        }
    };

    const handleDeleteRecord = async (recordId: string) => {
        if (!window.confirm('Are you sure you want to permanently delete this medical record?')) {
            return;
        }

        const originalRecords = [...medicalRecords];
        // Optimistic UI update for immediate feedback
        setMedicalRecords(prev => prev.filter(r => r.recordId !== recordId));

        try {
            await deleteMedicalRecord(user.healthId, recordId);
            setToastMessage('Medical record deleted successfully.');
            // Update the main user object to reflect the change on the welcome screen
            const updatedUserRecords = user.medicalRecords?.filter(r => r.recordId !== recordId);
            onUserUpdate({ ...user, medicalRecords: updatedUserRecords });

        } catch (err) {
            console.error('Failed to delete record:', err);
            setToastMessage('Error: Could not delete record.');
            // Revert on error
            setMedicalRecords(originalRecords);
        }
    };


    const navItems = [
        { id: 'home', label: 'Dashboard', icon: HomeIcon },
        { id: 'profile', label: 'My Profile', icon: PersonIcon },
        { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
        { id: 'records', label: 'Medical Records', icon: DocumentIcon },
        { id: 'prescriptions', label: 'Prescriptions', icon: PrescriptionIcon },
        { id: 'doctors', label: 'My Doctors', icon: DoctorIcon },
        { id: 'diet', label: 'AI Diet Planner', icon: DietIcon },
    ];
    
    const renderContent = () => {
        switch (activeView) {
            case 'home':
                return <DashboardHomeView user={user} setActiveView={setActiveView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
            case 'profile':
                return <ProfileView user={user} onUserUpdate={onUserUpdate} setToastMessage={setToastMessage} />;
            case 'appointments':
                return <AppointmentsView user={user} onUserUpdate={onUserUpdate} />;
            case 'records':
                 return (
                    <div>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 dark:text-dark-text">Medical Records</h1>
                            <button 
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary-green text-white text-sm sm:text-base font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors w-full sm:w-auto justify-center"
                            >
                                <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                Add New Record
                            </button>
                        </div>
                        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-md min-h-[200px]">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-700 dark:text-dark-text mb-3 sm:mb-4">Your Records</h2>
                            {isLoadingRecords ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
                                </div>
                            ) : recordsError ? (
                                <div className="text-center text-red-500 py-8">
                                    <h3 className="text-base sm:text-lg font-semibold">Error</h3>
                                    <p className="text-sm">{recordsError}</p>
                                </div>
                            ) : medicalRecords.length > 0 ? (
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                    {medicalRecords.map((record, index) => (
                                        <MedicalRecordCard 
                                            key={record.recordId} 
                                            record={record} 
                                            color={index % 2 === 0 ? 'lime' : 'blue'}
                                            onPreview={handlePreviewClick}
                                            onDownload={handleDownloadRecord}
                                            onDelete={handleDeleteRecord}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center text-gray-500 dark:text-dark-subtext py-8">
                                    <DocumentIcon className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/30" />
                                    <h3 className="text-base sm:text-lg font-semibold">No Medical Records Found</h3>
                                    <p className="text-sm">You have not uploaded any medical records yet.</p>
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'prescriptions':
                return <PrescriptionsView user={user} onUserUpdate={onUserUpdate} />;
            case 'doctors':
                return <DoctorsView user={user} onUserUpdate={onUserUpdate} />;
            case 'diet':
                return <AiDietPlanner />;
            case 'search':
                return <SearchResultsView user={user} query={searchQuery} setActiveView={setActiveView} />;
            default:
                 return <DashboardHomeView user={user} setActiveView={setActiveView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />;
        }
    };

    return (
        <div className="w-full h-screen bg-light-gray-bg dark:bg-dark-bg flex flex-col">
            {/* Dashboard Header */}
            <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-sm p-2 sm:p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-gray-200/80 dark:border-dark-subtext/20">
                <button 
                    onClick={() => {
                        setShowFullDashboard(false);
                        setActiveView('home');
                    }}
                    className="flex items-center space-x-1 sm:space-x-2"
                    aria-label="Go to welcome screen"
                >
                    <LogoIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                    <span className="text-base sm:text-xl font-bold text-gray-800 dark:text-dark-text tracking-wide">Health Hub</span>
                </button>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <div className="flex items-center space-x-2 sm:space-x-3 rounded-full p-1 pr-2 sm:pr-3 bg-gray-100/0">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary-green rounded-full p-0.5 flex-shrink-0 ring-2 ring-white shadow-md">
                            {user.avatar ? 
                                <img src={user.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" /> 
                                : <PatientIcon className="text-white" />}
                        </div>
                        <div className="text-left hidden md:block">
                            <div className="font-semibold text-sm text-gray-800 dark:text-dark-text">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-dark-subtext">{user.healthId}</div>
                        </div>
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
            
            {showFullDashboard ? (
                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar */}
                    <aside className="hidden lg:flex w-56 xl:w-64 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm p-3 xl:p-4 border-r border-gray-200/80 dark:border-dark-subtext/20 flex-col flex-shrink-0">
                        <div className="text-gray-500 dark:text-dark-subtext text-xs font-semibold uppercase tracking-wider mb-3 px-2">Menu</div>
                        <nav className="flex flex-col space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id as DashboardView)}
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

                    {/* Mobile Bottom Navigation - Enhanced UI */}
                    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-white/98 via-green-50/98 to-white/98 dark:from-dark-card/98 dark:via-dark-bg/98 dark:to-dark-card/98 backdrop-blur-md border-t-2 border-primary-green/20 dark:border-dark-accent/30 z-30 safe-area-inset-bottom overflow-x-auto shadow-2xl">
                        <div className="flex justify-start min-w-max px-3 py-3 gap-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id as DashboardView)}
                                    className={`flex flex-col items-center justify-center px-3 py-2.5 rounded-xl transition-all duration-300 min-w-[75px] transform hover:scale-105 ${
                                        activeView === item.id 
                                        ? 'text-white dark:text-dark-bg bg-gradient-to-br from-primary-green to-teal-500 dark:from-dark-accent dark:to-teal-400 shadow-lg scale-105' 
                                        : 'text-gray-700 dark:text-dark-subtext bg-white/60 dark:bg-dark-bg/60 hover:bg-green-100/80 dark:hover:bg-dark-accent/20 shadow-md'
                                    }`}
                                    aria-current={activeView === item.id}
                                >
                                    <item.icon className={`w-6 h-6 mb-1 ${
                                        activeView === item.id ? 'drop-shadow-md' : ''
                                    }`} />
                                    <span className={`text-[10px] font-semibold text-center whitespace-nowrap ${
                                        activeView === item.id ? 'tracking-wide' : ''
                                    }`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="flex-grow p-3 sm:p-4 md:p-6 lg:p-8 pb-24 lg:pb-8 overflow-y-auto relative bg-gradient-to-br from-light-green via-teal-50 to-blue-50 dark:bg-gradient-to-br dark:from-dark-bg dark:via-slate-900 dark:to-dark-card">
                        {/* <DashboardBackground /> */}
                        <div className="relative z-10">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            ) : (
                 <main className="flex-grow flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 text-center relative overflow-hidden bg-gradient-to-br from-light-green via-teal-50 to-blue-50 dark:bg-gradient-to-br dark:from-dark-bg dark:via-slate-900 dark:to-dark-card">
                     {/* Soft decorative gradient blobs */}
                     <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary-green/20 rounded-full blur-3xl"></div>
                     <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent-blue/20 rounded-full blur-3xl"></div>
                     
                     <div className="z-10 relative max-w-6xl mx-auto w-full px-2">
                        {/* Hero */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-10">
                          <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
                              <span className="bg-gradient-to-r from-primary-green via-emerald-500 to-accent-blue bg-clip-text text-transparent">Welcome Back</span>
                              <span className="text-gray-800 dark:text-dark-text">, {user.name.split(' ')[0]}!</span>
                            </h1>
                            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-dark-subtext mt-3 sm:mt-4 max-w-xl mx-auto lg:mx-0">
                              Here's a colourful snapshot of your health at a glance.
                            </p>
                            {/* Quick chips */}
                            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Secure</span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-700">Smart</span>
                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-fuchsia-100 text-fuchsia-700">Personal</span>
                            </div>
                          </div>
                          <div className="hidden lg:block">
                            <WelcomeIllustration className="w-full h-auto" />
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mt-8 md:mt-10 text-left">
                           <StatCard icon={HeartbeatIcon} title="Upcoming Appointments" value={(() => {
                               const now = new Date();
                               return (user.appointments || []).filter(appt => {
                                   const apptDateTime = new Date(`${appt.date}T${appt.time}`);
                                   return apptDateTime >= now;
                               }).length;
                           })()} colorClass="bg-gradient-to-br from-brand-blue to-accent-blue" />
                           <StatCard icon={TrophyIcon} title="Medical Records" value={user.medicalRecords?.length || 0} colorClass="bg-gradient-to-br from-brand-purple to-purple-400" />
                           <StatCard icon={CheckCircleIcon} title="Active Prescriptions" value={user.prescriptions?.length || 0} colorClass="bg-gradient-to-br from-primary-green to-teal-400" />
                        </div>

                        {/* CTA */}
                        <button 
                            onClick={() => setShowFullDashboard(true)}
                            className="mt-8 sm:mt-10 md:mt-12 px-6 sm:px-8 py-3 bg-gradient-to-r from-primary-green via-teal-500 to-emerald-500 text-white text-sm sm:text-base font-extrabold rounded-xl shadow-2xl hover:shadow-[0_20px_50px_rgba(39,198,144,0.35)] transition-all duration-300 transform hover:scale-105"
                        >
                            Explore Full Dashboard
                        </button>
                    </div>
                </main>
            )}

            {/* Modals */}
             {showUploadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={() => setShowUploadModal(false)}>
                    <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                        <UploadRecordForm user={user} onUploadSuccess={handleUploadSuccess} />
                    </div>
                </div>
            )}
            {verifyingRecord && (
                <OtpVerificationModal 
                    user={user}
                    record={verifyingRecord} 
                    onClose={() => setVerifyingRecord(null)}
                    onSuccess={handleOtpSuccess}
                />
            )}
            {previewingRecord && (
                <FilePreviewModal 
                    record={previewingRecord} 
                    onClose={() => window.history.back()}
                />
            )}
            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        </div>
    );
};

export default PatientDashboard;