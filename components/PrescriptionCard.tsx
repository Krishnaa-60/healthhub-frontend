import React, { useState, useMemo } from 'react';
import { Prescription, Medication } from '../types';
import EditIcon from './icons/EditIcon';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import BellIcon from './icons/BellIcon';
import PillIcon from './icons/PillIcon';
import ClockIcon from './icons/ClockIcon';
import RefillIcon from './icons/RefillIcon';
import DocumentTextIcon from './icons/DocumentTextIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';

const formatTime = (time24: string): string => {
    if (!time24) return 'N/A';
    try {
        const [hours, minutes] = time24.split(':');
        const h = parseInt(hours, 10);
        const m = parseInt(minutes, 10);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12; // Convert 0 to 12
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    } catch (e) {
        return time24; // Fallback to original string if format is unexpected
    }
};

// --- MedicationCard (Internal Component) ---
const MedicationCard: React.FC<{ 
    medication: Medication;
    onEdit: () => void;
    onDelete: () => void;
    onToggleReminder: (timeId: string) => void;
    isCompleted?: boolean;
}> = ({ medication, onEdit, onDelete, onToggleReminder, isCompleted = false }) => (
    <div className={`bg-white dark:bg-dark-bg/70 rounded-lg p-3 border-2 flex items-start gap-4 transition-shadow hover:shadow-md ${isCompleted ? 'border-gray-200 dark:border-dark-subtext/20 opacity-70' : 'border-gray-200/80 dark:border-dark-subtext/30'}`}>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 ${isCompleted ? 'bg-gray-100 dark:bg-dark-bg text-gray-400 dark:text-dark-subtext' : 'bg-primary-green/10 dark:bg-dark-accent/10 text-primary-green dark:text-dark-accent'}`}>
            {isCompleted ? <CheckCircleIcon className="w-6 h-6" /> : <DocumentTextIcon className="w-6 h-6" />}
        </div>
        <div className="flex-grow">
            <div className="flex justify-between items-start">
                <div>
                    <h5 className={`font-bold ${isCompleted ? 'text-gray-500 dark:text-dark-subtext' : 'text-gray-800 dark:text-dark-text'}`}>{medication.name}</h5>
                    <p className="text-sm text-gray-500 dark:text-dark-subtext">{medication.dosage}</p>
                    {medication.courseDurationDays && (
                         <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-1">{medication.courseDurationDays}-day course</p>
                    )}
                </div>
                {!isCompleted && (
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={onEdit} className="p-1.5 rounded-full hover:bg-blue-50 dark:hover:bg-dark-bg text-gray-500 dark:text-dark-subtext hover:text-blue-600" title="Edit Medication"><EditIcon className="w-4 h-4" /></button>
                        <button onClick={onDelete} className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-dark-bg text-gray-500 dark:text-dark-subtext hover:text-red-600" title="Delete Medication"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
            {!isCompleted && (
                 <div className="mt-2 space-y-1">
                    {medication.times.map(time => (
                        <div key={time.id} className="flex items-center justify-between text-sm bg-gray-100 dark:bg-dark-bg p-1.5 rounded">
                            <div className="flex items-center gap-2">
                                <ClockIcon className="w-4 h-4 text-gray-500 dark:text-dark-subtext" />
                                <span className="font-semibold text-gray-700 dark:text-dark-text">{formatTime(time.time)}</span>
                            </div>
                            <button
                                onClick={() => onToggleReminder(time.id)}
                                className={`p-1 rounded-full ${time.reminderEnabled ? 'text-green-600 bg-green-100 dark:bg-dark-accent/20 dark:text-dark-accent hover:bg-green-200' : 'text-gray-400 dark:text-dark-subtext hover:bg-gray-200 dark:hover:bg-dark-card'}`}
                                title={time.reminderEnabled ? 'Cancel Reminder' : 'Set Reminder'}
                            >
                                <BellIcon className={`w-4 h-4 ${time.reminderEnabled ? 'fill-current' : ''}`} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
);

// --- PrescriptionCard (Main Component) ---
interface PrescriptionCardProps {
    prescription: Prescription;
    onEditPrescription: () => void;
    onDeletePrescription: () => void;
    onAddMedication: () => void;
    onEditMedication: (medication: Medication) => void;
    onDeleteMedication: (medicationId: string) => void;
    onToggleReminder: (medicationId: string, timeId: string) => void;
}

const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
    prescription,
    onEditPrescription,
    onDeletePrescription,
    onAddMedication,
    onEditMedication,
    onDeleteMedication,
    onToggleReminder
}) => {
    const [isOpen, setIsOpen] = useState(true);

    const formattedDate = new Date(prescription.dateAdded).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
    });

    const { activeMedications, completedMedications } = useMemo(() => {
        const active: Medication[] = [];
        const completed: Medication[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        prescription.medications.forEach(med => {
            if (med.courseDurationDays && med.courseDurationDays > 0) {
                const startDate = new Date(prescription.dateAdded + 'T00:00:00');
                const endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + med.courseDurationDays);
                
                if (today >= endDate) {
                    completed.push(med);
                } else {
                    active.push(med);
                }
            } else {
                active.push(med);
            }
        });

        return { activeMedications: active, completedMedications: completed };
    }, [prescription.medications, prescription.dateAdded]);


    return (
        <div className="bg-white/80 dark:bg-dark-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/80 dark:border-dark-subtext/20">
            {/* Header */}
            <div className="flex justify-between items-center p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-dark-bg dark:to-dark-card/50 rounded-t-xl">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">{prescription.name}</h3>
                    <div className="text-sm text-gray-500 dark:text-dark-subtext mt-1">
                        <span>by <span className="font-semibold">{prescription.doctorName || 'Dr. Self'}</span></span>
                        <span className="mx-2">|</span>
                        <span>Added on: {formattedDate}</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={onEditPrescription} className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-dark-bg text-gray-500 dark:text-dark-subtext hover:text-blue-600" title="Edit Prescription Name"><EditIcon className="w-5 h-5" /></button>
                    <button onClick={onDeletePrescription} className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-dark-bg text-gray-500 dark:text-dark-subtext hover:text-red-600" title="Delete Prescription"><TrashIcon className="w-5 h-5" /></button>
                    <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg text-gray-500 dark:text-dark-subtext">
                        <svg className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            </div>

            {/* Content (Medications) */}
            {isOpen && (
                <div className="border-t border-gray-200 dark:border-dark-subtext/20 bg-light-green/50 dark:bg-dark-bg/50 p-4 space-y-6">
                    {/* Active Medications */}
                    <section>
                        <h4 className="font-bold text-gray-700 dark:text-dark-text mb-2">Active Medications</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {activeMedications.length > 0 ? (
                                activeMedications.map(med => (
                                    <MedicationCard
                                        key={med.id}
                                        medication={med}
                                        onEdit={() => onEditMedication(med)}
                                        onDelete={() => onDeleteMedication(med.id)}
                                        onToggleReminder={(timeId) => onToggleReminder(med.id, timeId)}
                                    />
                                ))
                            ) : (
                                <p className="text-sm text-gray-500 dark:text-dark-subtext text-center py-4 md:col-span-2">No active medications for this prescription.</p>
                            )}
                        </div>
                         <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 mt-4 border-t border-gray-200 dark:border-dark-subtext/20">
                            <button
                                onClick={onAddMedication}
                                className="w-full sm:w-auto flex-grow flex items-center justify-center gap-2 px-4 py-2 bg-green-50 dark:bg-dark-accent/10 text-green-700 dark:text-dark-accent font-semibold rounded-lg hover:bg-green-100 dark:hover:bg-dark-accent/20 border-2 border-dashed border-green-200 dark:border-dark-accent/30 transition-colors"
                            >
                                <PlusIcon className="w-5 h-5" />
                                Add Medication
                            </button>
                            <button 
                                onClick={() => alert('Refill request sent for all medications in this prescription.')}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 py-2 px-5 bg-primary-green text-white font-bold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors"
                            >
                                <RefillIcon className="w-5 h-5" />
                                Refill All
                            </button>
                        </div>
                    </section>

                    {/* Completed Medications */}
                    {completedMedications.length > 0 && (
                        <section>
                            <h4 className="font-bold text-gray-500 dark:text-dark-subtext mb-2">Completed Course</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {completedMedications.map(med => (
                                     <MedicationCard
                                        key={med.id}
                                        medication={med}
                                        onEdit={() => {}}
                                        onDelete={() => {}}
                                        onToggleReminder={() => {}}
                                        isCompleted={true}
                                    />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default PrescriptionCard;