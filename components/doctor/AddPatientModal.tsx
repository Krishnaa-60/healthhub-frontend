import React, { useState } from 'react';
import { linkPatientToDoctor } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';

interface AddPatientModalProps {
    doctorId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ doctorId, onClose, onSuccess }) => {
    const [patientHealthId, setPatientHealthId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleAddPatient = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        if (!patientHealthId.trim()) {
            setError('Please enter a valid Patient Health ID.');
            return;
        }
        setIsLoading(true);

        try {
            await linkPatientToDoctor(doctorId, patientHealthId.trim());
            onSuccess();
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = "block w-full px-3 py-2 bg-light-green dark:bg-dark-bg border border-gray-200 dark:border-dark-subtext/20 rounded-md placeholder-gray-400 dark:placeholder-dark-subtext/50 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-800 dark:text-dark-text";
    const labelStyle = "block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold">Add Patient to Your List</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddPatient}>
                    <div className="p-6 space-y-4">
                        <p className="text-sm text-gray-500 dark:text-dark-subtext">Enter the Health ID of an existing patient to link them to your dashboard.</p>
                        <fieldset disabled={isLoading}>
                            <div>
                                <label htmlFor="patientHealthId" className={labelStyle}>Patient's Health ID</label>
                                <input 
                                    type="text" 
                                    id="patientHealthId"
                                    name="patientHealthId"
                                    value={patientHealthId}
                                    onChange={(e) => setPatientHealthId(e.target.value)}
                                    className={inputStyle} 
                                    placeholder="e.g., HID1234567"
                                    required 
                                />
                            </div>
                        </fieldset>
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-bg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent rounded-md shadow-sm hover:bg-opacity-80 disabled:bg-gray-500 dark:disabled:bg-dark-subtext">
                            {isLoading ? 'Linking...' : 'Link Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;
