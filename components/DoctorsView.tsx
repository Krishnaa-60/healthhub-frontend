import React, { useState, useEffect, useCallback } from 'react';
import { User, Communication } from '../types';
import { getPatientDoctors, linkDoctorToPatient, unlinkDoctorFromPatient, updateUser, getUserById } from '../services/db';
import DoctorIcon from './icons/DoctorIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';
import Toast from './Toast';
import UserPlaceholderIcon from './icons/UserPlaceholderIcon';
import SendMessageToDoctorModal from './patient/SendMessageToDoctorModal';
import DownloadIcon from './icons/DownloadIcon';
import CloseIcon from './icons/CloseIcon';
import QRScanner from './QRScanner';

interface DoctorsViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

const CommunicationCard: React.FC<{ 
    comm: Communication; 
    isDoctorAdded: boolean; 
    onAddDoctor: (doctorId: string) => void;
    onDelete: (commId: string) => void;
    onPreview: (imageUrl: string) => void;
    isLoading: boolean;
}> = ({ comm, isDoctorAdded, onAddDoctor, onDelete, onPreview, isLoading }) => {
    const formattedDate = new Date(comm.timestamp).toLocaleString();
    
    const handleDownload = (e: React.MouseEvent, imageUrl: string, imageName: string) => {
        e.stopPropagation(); // Prevent modal from opening when downloading
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = imageName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-white dark:bg-dark-card/60 rounded-lg shadow-md p-4 flex flex-col gap-3">
            <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-brand-blue/20 rounded-full flex-shrink-0 flex items-center justify-center">
                    <DoctorIcon className="w-6 h-6 text-brand-blue" />
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h4 className="font-bold text-gray-800 dark:text-dark-text">{comm.from.name}</h4>
                            <p className="text-xs text-gray-500 dark:text-dark-subtext">{formattedDate}</p>
                        </div>
                        <div className="flex items-center gap-1">
                            {!isDoctorAdded && (
                                <button 
                                    onClick={() => onAddDoctor(comm.from.id)}
                                    disabled={isLoading}
                                    className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-md hover:bg-green-200 disabled:bg-gray-200 disabled:cursor-not-allowed"
                                >
                                    Add Doctor
                                </button>
                            )}
                            <button 
                                onClick={() => onDelete(comm.id)}
                                disabled={isLoading}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-500/10 rounded-full transition-colors"
                                title="Delete message"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    {comm.message && <p className="text-sm text-gray-700 dark:text-dark-subtext/90 mt-1">{comm.message}</p>}
                </div>
            </div>
            {comm.imageUrl && (
                <div className="mt-1 pl-14">
                    <p className="text-xs font-semibold text-gray-500 dark:text-dark-subtext mb-1">Attachment:</p>
                    <div className="relative group w-fit cursor-pointer" onClick={() => onPreview(comm.imageUrl!)}>
                        <img src={comm.imageUrl} alt="Prescription" className="max-w-xs h-auto rounded-md border" />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-md flex items-center justify-center gap-4">
                            <button onClick={(e) => { e.stopPropagation(); onPreview(comm.imageUrl!)} } className="opacity-0 group-hover:opacity-100 p-2 bg-white/80 rounded-full text-gray-800 hover:scale-110 transition-transform" title="View Full Image">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                            </button>
                            <button onClick={(e) => handleDownload(e, comm.imageUrl!, `prescription-${comm.id}.png`)} className="opacity-0 group-hover:opacity-100 p-2 bg-white/80 rounded-full text-gray-800 hover:scale-110 transition-transform" title="Download Image">
                                <DownloadIcon className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const DoctorsView: React.FC<DoctorsViewProps> = ({ user, onUserUpdate }) => {
    const [doctors, setDoctors] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [newDoctorEmail, setNewDoctorEmail] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [messagingDoctor, setMessagingDoctor] = useState<User | null>(null);
    const [previewingImage, setPreviewingImage] = useState<string | null>(null);
    const [showScanner, setShowScanner] = useState(false);

    const communications = user.communications || [];

    const fetchAndRefreshData = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            // Fetch the list of doctors linked to the patient
            const linkedDoctors = await getPatientDoctors(user.healthId);
            setDoctors(linkedDoctors);

            // Fetch the latest user data to get any new communications
            const freshUser = await getUserById(user.healthId);
            if (freshUser) {
                // To avoid re-render loops, only update if the communications have actually changed
                if (JSON.stringify(freshUser.communications) !== JSON.stringify(user.communications)) {
                    onUserUpdate(freshUser);
                }
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch doctors and messages.');
        } finally {
            setIsLoading(false);
        }
    }, [user.healthId, user.communications, onUserUpdate]);


    useEffect(() => {
        fetchAndRefreshData();
    }, [fetchAndRefreshData]);

    const handleAddDoctor = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!newDoctorEmail.trim()) {
            setError('Please enter a doctor\'s email.');
            return;
        }
        setIsSubmitting(true);
        try {
            await linkDoctorToPatient(user.healthId, newDoctorEmail.trim());
            await fetchAndRefreshData();
            setNewDoctorEmail('');
            setToastMessage('Doctor added successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add doctor.');
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleRemoveDoctor = async (doctorId: string) => {
        if (window.confirm('Are you sure you want to remove this doctor?')) {
            setIsSubmitting(true);
            try {
                await unlinkDoctorFromPatient(user.healthId, doctorId);
                const updatedUser = { ...user, doctors: user.doctors?.filter(id => id !== doctorId) };
                onUserUpdate(updatedUser);
                setDoctors(prev => prev.filter(d => d.healthId !== doctorId));
                setToastMessage('Doctor removed successfully.');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to remove doctor.');
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    const handleAddDoctorFromComm = async (doctorId: string) => {
        setIsSubmitting(true);
        try {
            await linkDoctorToPatient(user.healthId, doctorId);
            await fetchAndRefreshData();
            setToastMessage('Doctor added successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add doctor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteCommunication = async (commId: string) => {
        if (!window.confirm("Are you sure you want to delete this message? This cannot be undone.")) return;
        
        const originalCommunications = user.communications || [];
        const updatedComms = originalCommunications.filter(c => c.id !== commId);
        
        // Optimistic UI update
        onUserUpdate({ ...user, communications: updatedComms });
        setToastMessage("Message deleted.");

        try {
            await updateUser(user.healthId, { communications: updatedComms });
        } catch (err) {
            // Revert on error
            onUserUpdate({ ...user, communications: originalCommunications });
            setError(err instanceof Error ? err.message : 'Failed to delete message.');
            setToastMessage("Error: Could not delete message.");
        }
    };

    const handleQRScan = async (scannedHealthId: string) => {
        setError('');
        setIsSubmitting(true);
        try {
            await linkDoctorToPatient(user.healthId, scannedHealthId.trim());
            await fetchAndRefreshData();
            setToastMessage('Doctor added successfully!');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add doctor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Doctor Management */}
            <div className="lg:col-span-1 space-y-6">
                 <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl shadow-md">
                    <div className="p-4 bg-gradient-to-r from-grad-blue-from to-grad-blue-to rounded-t-xl">
                        <h2 className="text-xl font-bold text-white">Add a Doctor</h2>
                    </div>
                     <form onSubmit={handleAddDoctor} className="p-6 space-y-3">
                        <input
                            type="email"
                            value={newDoctorEmail}
                            onChange={(e) => setNewDoctorEmail(e.target.value)}
                            placeholder="Doctor's email address"
                            className="block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text"
                            disabled={isSubmitting}
                        />
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors disabled:bg-gray-400"
                        >
                            <PlusIcon className="w-5 h-5" />
                            {isSubmitting ? 'Adding...' : 'Add Doctor'}
                        </button>
                        
                        {/* QR Scanner Button */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-dark-subtext/20"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white/80 dark:bg-dark-card/80 text-gray-500 dark:text-dark-subtext">OR</span>
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 dark:border-blue-500/30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Scan Doctor QR Code
                        </button>
                        
                        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                    </form>
                </div>
                 <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl shadow-md">
                    <div className="p-4 bg-gradient-to-r from-grad-purple-from to-grad-purple-to rounded-t-xl">
                        <h2 className="text-xl font-bold text-white">Your Doctors</h2>
                    </div>
                    <div className="p-6 space-y-3">
                        {isLoading && doctors.length === 0 ? <p className="text-sm text-gray-500 dark:text-dark-subtext">Loading doctors...</p> : null}
                        {doctors.length > 0 ? doctors.map(doc => (
                            <div key={doc.healthId} className="flex items-center justify-between p-2 bg-light-green dark:bg-dark-bg rounded-md">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-dark-card flex items-center justify-center">
                                         {doc.avatar ? <img src={doc.avatar} alt={doc.name} className="w-full h-full object-cover rounded-full" /> : <UserPlaceholderIcon className="w-5 h-5 text-gray-400 dark:text-dark-subtext" />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800 dark:text-dark-text">{doc.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-dark-subtext">{doc.specialization}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setMessagingDoctor(doc)} disabled={isSubmitting} className="p-1.5 rounded-full hover:bg-blue-100 dark:hover:bg-dark-card text-gray-500 dark:text-dark-subtext hover:text-blue-600" title="Send Message">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.08-3.239A8.93 8.93 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM4.735 14.617A6.983 6.983 0 0010 15c3.866 0 7-2.686 7-6s-3.134-6-7-6-7 2.686-7 6c0 1.31.372 2.524 1.017 3.584L4.735 14.617z" clipRule="evenodd" /></svg>
                                    </button>
                                    <button onClick={() => handleRemoveDoctor(doc.healthId)} disabled={isSubmitting} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-dark-card text-gray-500 dark:text-dark-subtext hover:text-red-600" title="Remove Doctor">
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )) : !isLoading && <p className="text-sm text-gray-500 dark:text-dark-subtext">You haven't added any doctors yet.</p>}
                    </div>
                </div>
            </div>

            {/* Right Column: Communications */}
            <div className="lg:col-span-2 bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl shadow-md">
                <div className="p-4 bg-gradient-to-r from-grad-red-from to-grad-red-to rounded-t-xl">
                    <h1 className="text-xl font-bold text-white">Doctor Communications</h1>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                     {communications.length > 0 ? (
                        [...communications].sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(comm => {
                            const isDoctorAdded = doctors.some(d => d.healthId === comm.from.id);
                            return <CommunicationCard 
                                key={comm.id} 
                                comm={comm} 
                                isDoctorAdded={isDoctorAdded} 
                                onAddDoctor={handleAddDoctorFromComm} 
                                onDelete={handleDeleteCommunication}
                                onPreview={setPreviewingImage}
                                isLoading={isSubmitting} 
                            />
                        })
                    ) : (
                        <div className="text-center text-gray-500 dark:text-dark-subtext py-16">
                            <DoctorIcon className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/30" />
                            <h3 className="text-lg font-semibold">No Communications Yet</h3>
                            <p className="text-sm">Messages and prescriptions from your doctors will appear here.</p>
                        </div>
                    )}
                </div>
            </div>

            {previewingImage && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={() => setPreviewingImage(null)}>
                    <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
                        <img src={previewingImage} alt="Attachment Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
                        <button onClick={() => setPreviewingImage(null)} className="absolute -top-2 -right-2 bg-white text-gray-800 rounded-full p-1 shadow-lg">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            
            {messagingDoctor && (
                <SendMessageToDoctorModal
                    isOpen={!!messagingDoctor}
                    onClose={() => setMessagingDoctor(null)}
                    patient={user}
                    doctor={messagingDoctor}
                    onSuccess={() => setToastMessage(`Message sent to ${messagingDoctor.name}`)}
                />
            )}
            
            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScanSuccess={handleQRScan}
                title="Scan Doctor QR Code"
            />
        </div>
    );
};

export default DoctorsView;