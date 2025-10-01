import React, { useState, useEffect } from 'react';
import { Medication } from '../types';
import CloseIcon from './icons/CloseIcon';
import PlusIcon from './icons/PlusIcon';
import TrashIcon from './icons/TrashIcon';

interface MedicationFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: { name: string, dosage: string, times: string[], courseDurationDays?: number }) => void;
    medicationToEdit?: Medication | null;
    isLoading: boolean;
}

const MedicationForm: React.FC<MedicationFormProps> = ({ isOpen, onClose, onSave, medicationToEdit, isLoading }) => {
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [times, setTimes] = useState<string[]>(['']);
    const [courseDurationDays, setCourseDurationDays] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(medicationToEdit?.name || '');
            setDosage(medicationToEdit?.dosage || '');
            setTimes(medicationToEdit?.times.map(t => t.time) || ['08:00']);
            setCourseDurationDays(medicationToEdit?.courseDurationDays?.toString() || '');
            setError('');
        }
    }, [medicationToEdit, isOpen]);

    if (!isOpen) return null;

    const handleTimeChange = (index: number, value: string) => {
        const newTimes = [...times];
        newTimes[index] = value;
        setTimes(newTimes);
    };

    const addTime = () => setTimes([...times, '']);
    const removeTime = (index: number) => {
        if (times.length > 1) {
            setTimes(times.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!name.trim() || !dosage.trim() || times.some(t => !t)) {
            setError('Name, dosage, and all time fields are required.');
            return;
        }
        onSave({ 
            name: name.trim(), 
            dosage: dosage.trim(), 
            times,
            courseDurationDays: courseDurationDays ? parseInt(courseDurationDays, 10) : undefined
        });
    };

    const inputStyle = "block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text";
    const labelStyle = "block text-sm font-bold text-gray-800 dark:text-dark-text mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{medicationToEdit ? 'Edit Medication' : 'Add Medication'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg"><CloseIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <fieldset disabled={isLoading} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label htmlFor="medName" className={labelStyle}>Medication Name</label>
                                    <input id="medName" type="text" value={name} onChange={e => setName(e.target.value)} className={inputStyle} required />
                                </div>
                                <div>
                                    <label htmlFor="dosage" className={labelStyle}>Dosage</label>
                                    <input id="dosage" type="text" value={dosage} onChange={e => setDosage(e.target.value)} placeholder="e.g., 1 tablet, 5ml" className={inputStyle} required />
                                </div>
                            </div>
                             <div>
                                <label htmlFor="courseDurationDays" className={labelStyle}>Course Duration (Optional)</label>
                                <input id="courseDurationDays" type="number" value={courseDurationDays} onChange={e => setCourseDurationDays(e.target.value)} placeholder="e.g., 7 (for 7 days)" className={inputStyle} />
                            </div>
                            <div>
                                <label className={labelStyle}>Times</label>
                                <div className="space-y-2">
                                    {times.map((time, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <input type="time" value={time} onChange={e => handleTimeChange(index, e.target.value)} className={inputStyle} required />
                                            <button type="button" onClick={() => removeTime(index)} disabled={times.length <= 1} className="p-2 rounded-full text-red-600 bg-red-50 hover:bg-red-100 disabled:text-gray-400 disabled:bg-gray-100"><TrashIcon className="w-5 h-5" /></button>
                                        </div>
                                    ))}
                                    <button type="button" onClick={addTime} className="w-full flex items-center justify-center gap-2 mt-2 py-2 text-sm text-green-700 dark:text-dark-accent font-semibold rounded-lg hover:bg-green-50 dark:hover:bg-dark-accent/10 border-2 border-dashed border-gray-300 dark:border-dark-subtext/30 transition-colors">
                                        <PlusIcon className="w-5 h-5" /> Add Time
                                    </button>
                                </div>
                            </div>
                        </fieldset>
                        {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-subtext/30 rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent border border-transparent rounded-md shadow-sm hover:bg-primary-green-dark dark:hover:bg-opacity-80 disabled:bg-gray-400">
                            {isLoading ? 'Saving...' : 'Save Medication'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default MedicationForm;