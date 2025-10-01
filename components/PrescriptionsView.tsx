import React, { useState, useMemo } from 'react';
import { User, Prescription, Medication } from '../types';
import { updateUser } from '../services/db';
import PlusIcon from '../components/icons/PlusIcon';
import PrescriptionIcon from './icons/PrescriptionIcon';
import PrescriptionForm from './PrescriptionForm';
import MedicationForm from './MedicationForm';
import Toast from './Toast';
import PrescriptionCard from './PrescriptionCard';
import ClockIcon from './icons/ClockIcon';

interface PrescriptionsViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
}

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

const TodaysSchedule: React.FC<{ prescriptions: Prescription[] }> = ({ prescriptions }) => {
    const todaysMedications = useMemo(() => {
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];
        
        const meds = prescriptions.flatMap(p => 
            p.medications.map(m => ({
                ...m,
                prescriptionName: p.name,
                isPast: (timeStr: string) => {
                     const [hours, minutes] = timeStr.split(':').map(Number);
                     const medTime = new Date();
                     medTime.setHours(hours, minutes, 0, 0);
                     return now > medTime;
                }
            }))
        );

        // Get all time entries for today
        const allTimes = meds.flatMap(m => 
            m.times.map(t => ({
                medicationName: m.name,
                dosage: m.dosage,
                time: t.time,
                isPast: m.isPast(t.time)
            }))
        );

        // Sort by time
        return allTimes.sort((a, b) => a.time.localeCompare(b.time));
    }, [prescriptions]);

    if (todaysMedications.length === 0) {
        return null; // Don't render the component if there's nothing for today
    }

    return (
        <div className="mb-8 bg-white dark:bg-dark-card p-5 rounded-xl shadow-lg border border-primary-green/20 dark:border-dark-accent/20">
             <div className="p-4 bg-gradient-to-r from-grad-lime-from to-grad-lime-to rounded-t-xl -m-5 mb-4">
                <h2 className="text-xl font-bold text-green-900">Today's Medication Schedule</h2>
            </div>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {todaysMedications.map((med, index) => (
                    <div key={index} className={`flex items-center gap-4 p-3 rounded-lg ${med.isPast ? 'bg-gray-100 dark:bg-dark-bg text-gray-500 dark:text-dark-subtext opacity-70' : 'bg-green-50 dark:bg-dark-accent/10'}`}>
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-green/10 dark:bg-dark-accent/20 text-primary-green dark:text-dark-accent flex-shrink-0">
                            <ClockIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-grow">
                            <p className="font-bold text-gray-800 dark:text-dark-text">{med.medicationName}</p>
                            <p className="text-sm text-gray-600 dark:text-dark-subtext">{med.dosage}</p>
                        </div>
                        <div className="text-right">
                           <p className={`font-bold text-lg ${med.isPast ? 'text-gray-400' : 'text-primary-green dark:text-dark-accent'}`}>{formatTime(med.time)}</p>
                           {med.isPast && <p className="text-xs font-semibold text-gray-400 dark:text-dark-subtext/70">Completed</p>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const PrescriptionsView: React.FC<PrescriptionsViewProps> = ({ user, onUserUpdate }) => {
    const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
    const [isMedicationModalOpen, setIsMedicationModalOpen] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    const [editingMedication, setEditingMedication] = useState<{ prescriptionId: string; medication: Medication | null }>({ prescriptionId: '', medication: null });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const prescriptions = user.prescriptions || [];

    const handleUpdateUserPrescriptions = async (updatedPrescriptions: Prescription[]) => {
        setIsLoading(true);
        setError('');
        try {
            const updatedUser = await updateUser(user.healthId, { prescriptions: updatedPrescriptions });
            onUserUpdate(updatedUser);
            return true;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            return false;
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- Prescription CRUD ---
    const handleAddNewPrescription = () => {
        setEditingPrescription(null);
        setIsPrescriptionModalOpen(true);
    };

    const handleEditPrescription = (prescription: Prescription) => {
        setEditingPrescription(prescription);
        setIsPrescriptionModalOpen(true);
    };
    
    const handleSavePrescription = async (name: string, doctorName: string) => {
        let updatedPrescriptions: Prescription[];
        if (editingPrescription) {
            updatedPrescriptions = prescriptions.map(p => p.id === editingPrescription.id ? { ...p, name, doctorName } : p);
        } else {
            const newPrescription: Prescription = {
                id: `PRES_${Date.now()}`,
                name,
                doctorName,
                dateAdded: new Date().toISOString().split('T')[0],
                medications: [],
            };
            updatedPrescriptions = [...prescriptions, newPrescription];
        }
        if (await handleUpdateUserPrescriptions(updatedPrescriptions)) {
            setIsPrescriptionModalOpen(false);
        }
    };

    const handleDeletePrescription = async (prescriptionId: string) => {
        if (!window.confirm('Are you sure you want to delete this entire prescription and all its medications?')) return;
        const updatedPrescriptions = prescriptions.filter(p => p.id !== prescriptionId);
        await handleUpdateUserPrescriptions(updatedPrescriptions);
    };

    // --- Medication CRUD ---
    const handleAddNewMedication = (prescriptionId: string) => {
        setEditingMedication({ prescriptionId, medication: null });
        setIsMedicationModalOpen(true);
    };

    const handleEditMedication = (prescriptionId: string, medication: Medication) => {
        setEditingMedication({ prescriptionId, medication });
        setIsMedicationModalOpen(true);
    };

    const handleSaveMedication = async (formData: { name: string; dosage: string; times: string[], courseDurationDays?: number }) => {
        const { prescriptionId, medication } = editingMedication;
        const targetPrescription = prescriptions.find(p => p.id === prescriptionId);
        if (!targetPrescription) return;

        let updatedMedications: Medication[];
        if (medication) { // Editing existing medication
             updatedMedications = targetPrescription.medications.map(m => m.id === medication.id ? { ...m, name: formData.name, dosage: formData.dosage, courseDurationDays: formData.courseDurationDays, times: formData.times.map((t, i) => ({ ...m.times[i], id: m.times[i]?.id || `T_${Date.now()}_${i}`, time: t, reminderEnabled: m.times[i]?.reminderEnabled ?? false})) } : m);
        } else { // Adding new medication
            const newMedication: Medication = {
                id: `MED_${Date.now()}`,
                name: formData.name,
                dosage: formData.dosage,
                courseDurationDays: formData.courseDurationDays,
                times: formData.times.map((t, i) => ({ id: `T_${Date.now()}_${i}`, time: t, reminderEnabled: false })),
            };
            updatedMedications = [...targetPrescription.medications, newMedication];
        }

        const updatedPrescriptions = prescriptions.map(p => p.id === prescriptionId ? { ...p, medications: updatedMedications } : p);
        if (await handleUpdateUserPrescriptions(updatedPrescriptions)) {
            setIsMedicationModalOpen(false);
        }
    };

    const handleDeleteMedication = async (prescriptionId: string, medicationId: string) => {
        if (!window.confirm('Are you sure you want to delete this medication?')) return;
        const updatedPrescriptions = prescriptions.map(p => {
            if (p.id === prescriptionId) {
                return { ...p, medications: p.medications.filter(m => m.id !== medicationId) };
            }
            return p;
        });
        await handleUpdateUserPrescriptions(updatedPrescriptions);
    };

    const handleToggleReminder = async (prescriptionId: string, medicationId: string, timeId: string) => {
        let reminderEnabled = false;
        let medName = '', time = '';
        
        const updatedPrescriptions = prescriptions.map(p => {
            if (p.id === prescriptionId) {
                return {
                    ...p,
                    medications: p.medications.map(m => {
                        if (m.id === medicationId) {
                             medName = m.name;
                            return {
                                ...m,
                                times: m.times.map(t => {
                                    if (t.id === timeId) {
                                        reminderEnabled = !t.reminderEnabled;
                                        time = t.time;
                                        return { ...t, reminderEnabled };
                                    }
                                    return t;
                                })
                            };
                        }
                        return m;
                    })
                };
            }
            return p;
        });

        if (await handleUpdateUserPrescriptions(updatedPrescriptions)) {
             setToastMessage(reminderEnabled
                ? `Reminder set for ${medName} at ${formatTime(time)}. An email has been sent to ${user.email}.`
                : `Reminder for ${medName} at ${formatTime(time)} cancelled.`
            );
        }
    };
    
    const handleDownloadPdf = () => {
        const prescriptionsToPrint = user.prescriptions || [];
        if (prescriptionsToPrint.length === 0) {
            alert("No prescriptions to download.");
            return;
        }

        let printContent = `
            <html>
                <head>
                    <title>Prescriptions for ${user.name}</title>
                    <style>
                        body { font-family: sans-serif; margin: 2em; color: #333; }
                        h1, h2, h3 { color: #111; }
                        h1 { font-size: 24px; }
                        h2 { font-size: 20px; border-bottom: 2px solid #27C690; padding-bottom: 5px; margin-top: 2em;}
                        h3 { font-size: 16px; margin-bottom: 0.5em;}
                        p { margin: 0.5em 0; }
                        .prescription { border: 1px solid #ccc; border-radius: 8px; padding: 1em; margin-bottom: 1.5em; page-break-inside: avoid; }
                        .medication { margin-left: 1em; margin-top: 1em; border-left: 3px solid #eee; padding-left: 1em;}
                        .med-header { font-weight: bold; }
                        ul { list-style: none; padding-left: 0; }
                        li { background: #f9f9f9; padding: 0.5em; border-radius: 4px; margin-bottom: 0.25em; }
                    </style>
                </head>
                <body>
                    <h1>Prescriptions for ${user.name}</h1>
                    <p><strong>Health ID:</strong> ${user.healthId}</p>
                    <hr />
        `;

        prescriptionsToPrint.forEach(p => {
            const date = new Date(p.dateAdded).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
            printContent += `
                <div class="prescription">
                    <h2>${p.name}</h2>
                    <p><strong>Prescribed by:</strong> ${p.doctorName || 'N/A'}<br/>
                       <strong>Date:</strong> ${date}</p>
                    <h3>Medications:</h3>
            `;
            if (p.medications.length > 0) {
                p.medications.forEach(m => {
                    printContent += `
                        <div class="medication">
                            <p class="med-header">${m.name} - ${m.dosage}</p>
                            <ul>
                                ${m.times.map(t => `<li>Take at: ${formatTime(t.time)}</li>`).join('')}
                            </ul>
                        </div>
                    `;
                });
            } else {
                printContent += `<p>No medications listed for this prescription.</p>`;
            }
            printContent += `</div>`;
        });

        printContent += `
                </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(printContent);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
            }, 500);
        } else {
            alert('Could not open print window. Please check your browser settings for pop-up blockers.');
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-dark-text">Prescriptions</h1>
                <button
                    onClick={handleAddNewPrescription}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    Add New Record
                </button>
            </div>

            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            
            <TodaysSchedule prescriptions={prescriptions} />

            <div className="space-y-6">
                {prescriptions.length > 0 ? (
                    prescriptions.map(prescription => (
                        <PrescriptionCard
                            key={prescription.id}
                            prescription={prescription}
                            onEditPrescription={() => handleEditPrescription(prescription)}
                            onDeletePrescription={() => handleDeletePrescription(prescription.id)}
                            onAddMedication={() => handleAddNewMedication(prescription.id)}
                            onEditMedication={(med) => handleEditMedication(prescription.id, med)}
                            onDeleteMedication={(medId) => handleDeleteMedication(prescription.id, medId)}
                            onToggleReminder={(medId, timeId) => handleToggleReminder(prescription.id, medId, timeId)}
                        />
                    ))
                ) : (
                    <div className="text-center text-gray-500 dark:text-dark-subtext py-16 bg-white dark:bg-dark-card rounded-xl shadow-md">
                        <PrescriptionIcon className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/30" />
                        <h3 className="text-lg font-semibold">No Prescriptions Found</h3>
                        <p className="text-sm">Click "Add New Record" to get started.</p>
                    </div>
                )}
            </div>
            
            {prescriptions.length > 0 && (
                <div className="mt-8 flex justify-center">
                    <button 
                        onClick={handleDownloadPdf}
                        className="w-full max-w-md flex items-center justify-center gap-3 py-3 px-6 bg-gradient-to-r from-primary-green to-teal-400 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                        Download All Prescriptions (PDF)
                    </button>
                </div>
            )}


            <PrescriptionForm
                isOpen={isPrescriptionModalOpen}
                onClose={() => setIsPrescriptionModalOpen(false)}
                onSave={handleSavePrescription}
                prescriptionToEdit={editingPrescription}
                isLoading={isLoading}
            />

            <MedicationForm
                isOpen={isMedicationModalOpen}
                onClose={() => setIsMedicationModalOpen(false)}
                onSave={handleSaveMedication}
                medicationToEdit={editingMedication.medication}
                isLoading={isLoading}
            />

            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        </div>
    );
};

export default PrescriptionsView;