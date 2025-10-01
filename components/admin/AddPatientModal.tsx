import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { adminAddUser } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';

interface AddPatientModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddPatientModal: React.FC<AddPatientModalProps> = ({ onClose, onSuccess }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const mobileNo = formData.get('mobileNo') as string;
        const password = formData.get('password') as string;

        if (!name || !email || !mobileNo || !password) {
            setError('Please fill all required fields.');
            return;
        }
        setIsLoading(true);

        const randomSuffix = String(Math.floor(Math.random() * 900) + 100);
        const healthId = `HID${mobileNo.slice(-4)}${randomSuffix}`;

        const newUser: User = {
            healthId,
            name,
            email,
            mobileNo,
            password,
            role: UserRole.PATIENT,
        };

        try {
            await adminAddUser(newUser);
            onSuccess();
        } catch(err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputStyle = "block w-full px-3 py-2 bg-dark-bg border border-dark-subtext/20 rounded-md placeholder-dark-subtext/50 focus:outline-none focus:ring-2 focus:ring-dark-accent sm:text-sm text-dark-text";
    const labelStyle = "block text-sm font-bold text-dark-subtext mb-1";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-dark-card rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-dark-subtext/20">
                    <h2 className="text-xl font-bold">Add New Patient</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-dark-bg"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleRegister}>
                    <div className="p-6 space-y-4">
                        <fieldset disabled={isLoading} className="space-y-4">
                            <div>
                                <label className={labelStyle}>Full Name</label>
                                <input type="text" name="name" className={inputStyle} required />
                            </div>
                            <div>
                                <label className={labelStyle}>Email</label>
                                <input type="email" name="email" className={inputStyle} required />
                            </div>
                            <div>
                                <label className={labelStyle}>Mobile No.</label>
                                <input type="tel" name="mobileNo" className={inputStyle} required />
                            </div>
                            <div>
                                <label className={labelStyle}>Set Password</label>
                                <input type="password" name="password" className={inputStyle} required />
                            </div>
                        </fieldset>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 text-sm font-medium rounded-md hover:bg-dark-bg">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-4 py-2 text-sm font-medium text-dark-bg bg-dark-accent rounded-md shadow-sm hover:bg-opacity-80 disabled:bg-dark-subtext">
                            {isLoading ? 'Saving...' : 'Create Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPatientModal;