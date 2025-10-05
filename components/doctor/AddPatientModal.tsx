import React, { useState } from 'react';
import { linkPatientToDoctor } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';
import QRScanner from '../QRScanner';

interface AddPatientModalProps {
    doctorId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ doctorId, onClose, onSuccess }) => {
    const [patientHealthId, setPatientHealthId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showScanner, setShowScanner] = useState(false);

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

    const handleQRScan = async (scannedHealthId: string) => {
        setPatientHealthId(scannedHealthId);
        setError('');
        setIsLoading(true);

        try {
            await linkPatientToDoctor(doctorId, scannedHealthId.trim());
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
                        <p className="text-sm text-gray-500 dark:text-dark-subtext">Enter the Health ID of an existing patient or scan their QR code.</p>
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
                        
                        {/* QR Scanner Button */}
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300 dark:border-dark-subtext/20"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white dark:bg-dark-card text-gray-500 dark:text-dark-subtext">OR</span>
                            </div>
                        </div>
                        
                        <button
                            type="button"
                            onClick={() => setShowScanner(true)}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 dark:border-blue-500/30"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                            </svg>
                            Scan Patient QR Code
                        </button>
                        
                        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex flex-col sm:flex-row justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-gray-200 dark:hover:bg-dark-bg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent rounded-md shadow-sm hover:bg-opacity-80 disabled:bg-gray-500 dark:disabled:bg-dark-subtext">
                            {isLoading ? 'Linking...' : 'Link Patient'}
                        </button>
                    </div>
                </form>
            </div>
            
            {/* QR Scanner Modal */}
            <QRScanner
                isOpen={showScanner}
                onClose={() => setShowScanner(false)}
                onScanSuccess={handleQRScan}
                title="Scan Patient QR Code"
            />
        </div>
    );
};

export default AddPatientModal;
