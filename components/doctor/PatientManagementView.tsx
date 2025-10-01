import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { User } from '../../types';
import { getDoctorPatients, unlinkPatientFromDoctor } from '../../services/db';
import SearchIcon from '../icons/SearchIcon';
import TrashIcon from '../icons/TrashIcon';
import PlusIcon from '../icons/PlusIcon';
import Toast from '../Toast';
import AddPatientModal from './AddPatientModal';
// FIX: Import MailIcon for the new send message button.
import MailIcon from '../icons/MailIcon';

interface PatientManagementViewProps {
    doctor: User;
    onViewPatient: (patient: User) => void;
    // FIX: Add the missing onSendMessage prop to fix the TypeScript error.
    onSendMessage: (patient: User) => void;
}

const PatientManagementView: React.FC<PatientManagementViewProps> = ({ doctor, onViewPatient, onSendMessage }) => {
    const [patients, setPatients] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchPatients = useCallback(async () => {
        setIsLoading(true);
        try {
            const linkedPatients = await getDoctorPatients(doctor.healthId);
            setPatients(linkedPatients);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch patients.');
        } finally {
            setIsLoading(false);
        }
    }, [doctor.healthId]);

    useEffect(() => {
        fetchPatients();
    }, [fetchPatients]);

    const handleRemovePatient = async (patient: User) => {
        if (window.confirm(`Are you sure you want to remove "${patient.name}" from your patient list? This will not delete their account.`)) {
            try {
                await unlinkPatientFromDoctor(doctor.healthId, patient.healthId);
                setPatients(prev => prev.filter(p => p.healthId !== patient.healthId));
                setToastMessage(`Patient ${patient.name} has been removed from your list.`);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to remove patient.');
            }
        }
    };

    const filteredPatients = useMemo(() => {
        if (!searchQuery) return patients;
        return patients.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.healthId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()))
        );
    }, [patients, searchQuery]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">My Patients</h1>
                    <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Manage patients linked to your account.</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg font-semibold rounded-lg shadow-sm hover:bg-opacity-80 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add Patient
                </button>
            </div>
            
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-lg">
                 <div className="relative mb-4">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-dark-subtext pointer-events-none" />
                    <input
                        type="search"
                        placeholder="Search by name, Health ID, or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 bg-light-green dark:bg-dark-bg border border-gray-200 dark:border-dark-subtext/20 rounded-lg focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent focus:outline-none transition-all"
                    />
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-green dark:border-dark-accent"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-400 text-center">{error}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left table-auto">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-dark-subtext/20 text-xs text-gray-500 dark:text-dark-subtext uppercase">
                                    <th className="p-3">Name</th>
                                    <th className="p-3">Health ID / Email</th>
                                    <th className="p-3 hidden md:table-cell">Mobile No.</th>
                                    <th className="p-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPatients.map(patient => (
                                    <tr 
                                        key={patient.healthId} 
                                        className="border-b border-gray-100 dark:border-dark-subtext/10 text-sm hover:bg-light-green dark:hover:bg-dark-bg cursor-pointer"
                                        onClick={() => onViewPatient(patient)}
                                    >
                                        <td className="p-3 font-medium text-gray-800 dark:text-dark-text">{patient.name}</td>
                                        <td className="p-3 text-gray-500 dark:text-dark-subtext">
                                            <div>{patient.healthId}</div>
                                            <div className="text-xs truncate max-w-[150px]">{patient.email || 'N/A'}</div>
                                        </td>
                                        <td className="p-3 hidden md:table-cell text-gray-500 dark:text-dark-subtext">{patient.mobileNo || 'N/A'}</td>
                                        <td className="p-3 text-right">
                                            {/* FIX: Add send message button to utilize the new prop. */}
                                            <button
                                                onClick={(e) => { e.stopPropagation(); onSendMessage(patient); }}
                                                className="p-2 text-gray-500 dark:text-dark-subtext hover:text-blue-500 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-colors"
                                                title={`Send message to ${patient.name}`}
                                            >
                                                <MailIcon className="w-5 h-5" />
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleRemovePatient(patient); }}
                                                className="p-2 text-gray-500 dark:text-dark-subtext hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-colors"
                                                title={`Remove ${patient.name}`}
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                         {filteredPatients.length === 0 && (
                            <div className="text-center py-10 text-gray-500 dark:text-dark-subtext">
                                <p>No patients found.</p>
                                {searchQuery && <p className="text-xs mt-1">Try adjusting your search query.</p>}
                            </div>
                         )}
                    </div>
                )}
            </div>
             <Toast message={toastMessage} onClose={() => setToastMessage('')} />
             {isAddModalOpen && (
                <AddPatientModal
                    doctorId={doctor.healthId}
                    onClose={() => setIsAddModalOpen(false)}
                    onSuccess={() => {
                        setIsAddModalOpen(false);
                        fetchPatients();
                        setToastMessage('New patient has been successfully linked.');
                    }}
                />
             )}
        </div>
    );
};

export default PatientManagementView;