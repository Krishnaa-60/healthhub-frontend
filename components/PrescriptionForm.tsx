import React, { useState, useEffect } from 'react';
import { Prescription } from '../types';
import CloseIcon from './icons/CloseIcon';

interface PrescriptionFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, doctorName: string) => void;
    prescriptionToEdit?: Prescription | null;
    isLoading: boolean;
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({ isOpen, onClose, onSave, prescriptionToEdit, isLoading }) => {
    const [name, setName] = useState('');
    const [doctorName, setDoctorName] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(prescriptionToEdit?.name || '');
            setDoctorName(prescriptionToEdit?.doctorName || '');
            setError('');
        }
    }, [prescriptionToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('Prescription name is required.');
            return;
        }
        onSave(name.trim(), doctorName.trim());
    };
    
    const inputStyle = "block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text";
    const labelStyle = "block text-sm font-bold text-gray-800 dark:text-dark-text mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">
                        {prescriptionToEdit ? 'Edit Prescription' : 'Add New Prescription'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg">
                        <CloseIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <fieldset disabled={isLoading}>
                             <div>
                                <label htmlFor="prescriptionName" className={labelStyle}>Prescription Name</label>
                                <input
                                    id="prescriptionName"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className={inputStyle}
                                    placeholder="e.g., Post-Fever Recovery"
                                    required
                                />
                            </div>
                             <div>
                                <label htmlFor="doctorName" className={labelStyle}>Doctor's Name (Optional)</label>
                                <input
                                    id="doctorName"
                                    type="text"
                                    value={doctorName}
                                    onChange={(e) => setDoctorName(e.target.value)}
                                    className={inputStyle}
                                    placeholder="e.g., Dr. Smith"
                                />
                            </div>
                        </fieldset>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-card border border-gray-300 dark:border-dark-subtext/30 rounded-md hover:bg-gray-50 dark:hover:bg-dark-bg">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent border border-transparent rounded-md shadow-sm hover:bg-primary-green-dark dark:hover:bg-opacity-80 disabled:bg-gray-400">
                            {isLoading ? 'Saving...' : 'Save Prescription'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PrescriptionForm;