import React, { useState } from 'react';
import { User } from '../../types';
import { sendCommunicationFromPatient } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';
import Toast from '../Toast';

interface SendMessageToDoctorModalProps {
    patient: User;
    doctor: User;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const SendMessageToDoctorModal: React.FC<SendMessageToDoctorModalProps> = ({ patient, doctor, isOpen, onClose, onSuccess }) => {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Please enter a message.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await sendCommunicationFromPatient(doctor.healthId, patient, { message });
            setToastMessage('Message sent successfully!');
            setTimeout(() => {
                onSuccess();
                onClose();
                setMessage('');
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message.');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">Send Message to {doctor.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg"><CloseIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <fieldset disabled={isLoading}>
                             <div>
                                <label className="block text-sm font-bold text-gray-800 dark:text-dark-text mb-1">Your Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={5}
                                    className="block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-subtext/60 focus:outline-none focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent sm:text-sm text-gray-900 dark:text-dark-text"
                                    placeholder="Type your question or message here..."
                                />
                            </div>
                        </fieldset>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end">
                        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent rounded-md shadow-sm hover:bg-primary-green-dark dark:hover:bg-opacity-80 disabled:bg-gray-400">
                            {isLoading ? 'Sending...' : 'Send Message'}
                        </button>
                    </div>
                </form>
                <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            </div>
        </div>
    );
};

export default SendMessageToDoctorModal;