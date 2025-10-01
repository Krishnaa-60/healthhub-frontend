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
        <div className={`p-6 rounded-2xl shadow-lg transform transition-transform hover:scale-105 ${colorClass}`}>
            <div className="flex items-center justify-between text-white">
                <div className="flex flex-col">
                    <span className="text-4xl font-bold">{count}</span>
                    <span className="text-sm font-semibold opacity-80">{title}</span>
                </div>
                <Icon className="w-16 h-16 opacity-30" />
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
        <div className={`bg-gradient-to-br ${gradientClass} text-white rounded-lg shadow-lg p-4 flex flex-col justify-between transition-transform transform hover:-translate-y-1`}>
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-bold text-gray-800 truncate pr-2">{record.name}</h4>
                     <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 bg-white/30 text-slate-800 text-xs font-semibold rounded-full`}>{record.category}</span>
                        <p className="text-sm text-slate-700 truncate" title={record.disease}>for {record.disease}</p>
                    </div>
                </div>
                 <DocumentTextIcon className="w-8 h-8 text-white/50 flex-shrink-0" />
            </div>
             <div className="mt-4 flex justify-between items-center">
                <div className="text-left text-slate-700">
                    <p className="text-xs font-medium">{record.files.length} file(s)</p>
                    <div className="flex items-center gap-1.5 mt-1" title={`Uploaded on ${formattedDate}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                        <p className="text-xs font-semibold">{formattedDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onDelete(record.recordId)} 
                        className="p-2 text-gray-500 dark:text-slate-800 hover:text-red-500 dark:hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-full transition-colors" 
                        title={`Delete record: ${record.name}`}
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                    <button onClick={() => onDownload(record)} className="text-slate-800 hover:text-white transition-colors" title="Download first file">
                        <DownloadCircleIcon className="w-8 h-8" />
                    </button>
                    <button
                        onClick={() => onPreview(record)}
                        className="px-4 py-1.5 bg-white/90 text-primary-green font-bold rounded-lg hover:bg-white transition text-sm shadow-md"
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
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Medical Records</h1>
                            <button 
                                onClick={() => setShowUploadModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add New Record
                            </button>
                        </div>
                        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm p-6 rounded-xl shadow-md min-h-[200px]">
                            <h2 className="text-xl font-bold text-gray-700 dark:text-dark-text mb-4">Your Records</h2>
                            {isLoadingRecords ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green"></div>
                                </div>
                            ) : recordsError ? (
                                <div className="text-center text-red-500 py-8">
                                    <h3 className="text-lg font-semibold">Error</h3>
                                    <p className="text-sm">{recordsError}</p>
                                </div>
                            ) : medicalRecords.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                    <DocumentIcon className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/30" />
                                    <h3 className="text-lg font-semibold">No Medical Records Found</h3>
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
            <header className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm shadow-sm p-3 flex justify-between items-center flex-shrink-0 z-20 border-b border-gray-200/80 dark:border-dark-subtext/20">
                <button 
                    onClick={() => {
                        setShowFullDashboard(false);
                        setActiveView('home');
                    }}
                    className="flex items-center space-x-2"
                    aria-label="Go to welcome screen"
                >
                    <LogoIcon className="w-10 h-10" />
                    <span className="text-xl font-bold text-gray-800 dark:text-dark-text tracking-wide">Health Hub</span>
                </button>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-3 rounded-full p-1 pr-3 bg-gray-100/0">
                        <div className="w-10 h-10 bg-primary-green rounded-full p-0.5 flex-shrink-0 ring-2 ring-white shadow-md">
                            {user.avatar ? 
                                <img src={user.avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" /> 
                                : <PatientIcon className="text-white" />}
                        </div>
                        <div className="text-left hidden sm:block">
                            <div className="font-semibold text-sm text-gray-800 dark:text-dark-text">{user.name}</div>
                            <div className="text-xs text-gray-500 dark:text-dark-subtext">{user.healthId}</div>
                        </div>
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
            
            {showFullDashboard ? (
                <div className="flex flex-grow overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-64 bg-white/90 dark:bg-dark-card/90 backdrop-blur-sm p-4 border-r border-gray-200/80 dark:border-dark-subtext/20 flex flex-col flex-shrink-0">
                        <div className="text-gray-500 dark:text-dark-subtext text-xs font-semibold uppercase tracking-wider mb-3 px-2">Menu</div>
                        <nav className="flex flex-col space-y-2">
                            {navItems.map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveView(item.id as DashboardView)}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 transform hover:translate-x-1 ${
                                        activeView === item.id 
                                        ? 'bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg shadow-lg' 
                                        : 'text-gray-600 dark:text-dark-subtext hover:bg-light-green dark:hover:bg-dark-bg'
                                    }`}
                                    aria-current={activeView === item.id}
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-grow p-6 md:p-8 overflow-y-auto relative bg-gradient-to-br from-light-green via-teal-50 to-blue-50 dark:bg-gradient-to-br dark:from-dark-bg dark:via-slate-900 dark:to-dark-card">
                        {/* <DashboardBackground /> */}
                        <div className="relative z-10">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            ) : (
                 <main className="flex-grow flex flex-col items-center justify-center p-8 text-center relative overflow-hidden bg-gradient-to-br from-light-green via-teal-50 to-blue-50 dark:bg-gradient-to-br dark:from-dark-bg dark:via-slate-900 dark:to-dark-card">
                     <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%2327C690\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}></div>
                    <div className="z-10 relative max-w-4xl mx-auto">
                        <h1 className="text-5xl font-black text-gray-800 dark:text-dark-text">Welcome Back, {user.name.split(' ')[0]}!</h1>
                        <p className="text-lg text-gray-600 dark:text-dark-subtext mt-4 max-w-xl mx-auto">Here's a quick summary of your health dashboard.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-left">
                           <StatCard icon={HeartbeatIcon} title="Upcoming Appointments" value={user.appointments?.length || 0} colorClass="bg-gradient-to-br from-brand-blue to-accent-blue" />
                           <StatCard icon={TrophyIcon} title="Medical Records" value={user.medicalRecords?.length || 0} colorClass="bg-gradient-to-br from-brand-purple to-purple-400" />
                           <StatCard icon={CheckCircleIcon} title="Active Prescriptions" value={user.prescriptions?.length || 0} colorClass="bg-gradient-to-br from-primary-green to-teal-400" />
                        </div>

                        <button 
                            onClick={() => setShowFullDashboard(true)}
                            className="mt-12 px-8 py-3 bg-primary-green text-white font-bold rounded-lg shadow-xl hover:bg-primary-green-dark transition-all duration-300 transform hover:scale-105"
                        >
                            Go To Full Dashboard
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