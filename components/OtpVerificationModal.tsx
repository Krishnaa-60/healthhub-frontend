import React, { useState, useEffect } from 'react';
import { MedicalRecord, User } from '../types';
import CloseIcon from './icons/CloseIcon';
import LockIcon from './icons/LockIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import { requestOtpForRecord, verifyOtpForRecord } from '../services/db';

interface OtpVerificationModalProps {
    user: User;
    record: MedicalRecord;
    onClose: () => void;
    onSuccess: () => void;
}

type OtpStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'error';

const OtpVerificationModal: React.FC<OtpVerificationModalProps> = ({ user, record, onClose, onSuccess }) => {
    const [otp, setOtp] = useState('');
    const [status, setStatus] = useState<OtpStatus>('idle');
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(0);

    useEffect(() => {
        const requestOtp = async () => {
            setStatus('sending');
            setError('');
            try {
                await requestOtpForRecord(user.healthId);
                setStatus('sent');
                setCountdown(60); // Start 60s countdown for resend
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to send OTP.');
                setStatus('error');
            }
        };
        requestOtp();
    }, [user.healthId]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleResendOtp = async () => {
        if (countdown > 0) return;
        setStatus('sending');
        setError('');
        try {
            await requestOtpForRecord(user.healthId);
            setStatus('sent');
            setCountdown(60);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to resend OTP.');
            setStatus('error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (otp.length !== 6) {
            setError('Please enter a 6-digit OTP.');
            return;
        }
        setStatus('verifying');
        try {
            await verifyOtpForRecord(user.healthId, otp);
            onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Invalid OTP or it has expired.');
            setStatus('error');
        }
    };

    const getStatusMessage = () => {
        switch (status) {
            case 'sending': return 'Sending OTP...';
            case 'sent': return `An OTP has been sent to your email: ${user.email}`;
            case 'verifying': return 'Verifying...';
            case 'error': return 'An error occurred.';
            default: return `To view this protected record, please enter the OTP sent to your email.`;
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" 
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-sm" 
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text flex items-center gap-2">
                        <LockIcon className="w-5 h-5" />
                        Secure Access
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-dark-bg">
                        <CloseIcon className="w-5 h-5 text-gray-600 dark:text-dark-subtext" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 text-center">
                        <p className="text-sm text-gray-600 dark:text-dark-subtext mb-4">{getStatusMessage()}</p>

                        <div className="my-6">
                            <label htmlFor="otp" className="sr-only">Enter OTP</label>
                            <input
                                id="otp"
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                maxLength={6}
                                className="w-full text-center text-2xl tracking-[.5em] font-mono bg-input-bg dark:bg-dark-bg text-gray-800 dark:text-dark-text rounded-md p-3 focus:ring-2 focus:ring-primary-green dark:focus:ring-dark-accent focus:outline-none"
                                required
                                disabled={status === 'sending' || status === 'verifying'}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        
                        <div className="text-xs text-gray-500 dark:text-dark-subtext">
                            Didn't receive the code?{' '}
                            <button 
                                type="button"
                                onClick={handleResendOtp}
                                disabled={countdown > 0 || status === 'sending'}
                                className="font-semibold text-primary-green dark:text-dark-accent hover:underline disabled:text-gray-400 dark:disabled:text-dark-subtext/50 disabled:cursor-not-allowed"
                            >
                                Resend {countdown > 0 ? `(${countdown}s)` : ''}
                            </button>
                        </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg">
                        <button 
                            type="submit" 
                            disabled={status === 'sending' || status === 'verifying'}
                            className="w-full px-4 py-2.5 text-sm font-medium text-white bg-primary-green border border-transparent rounded-md shadow-sm hover:bg-primary-green-dark disabled:bg-gray-400 flex items-center justify-center"
                        >
                            {(status === 'sending' || status === 'verifying') && <SpinnerIcon className="w-5 h-5 mr-2" />}
                            {status === 'verifying' ? 'Verifying...' : 'Verify & View'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OtpVerificationModal;