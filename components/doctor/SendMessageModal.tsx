import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { sendCommunicationToPatient } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';
import CameraIcon from '../icons/CameraIcon';
import UploadIcon from '../icons/UploadIcon';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon';
import Toast from '../Toast';

interface SendMessageModalProps {
    doctor: User;
    patient: User;
    onClose: () => void;
    onSendSuccess: () => void;
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const SendMessageModal: React.FC<SendMessageModalProps> = ({ doctor, patient, onClose, onSendSuccess }) => {
    const [message, setMessage] = useState('');
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

    // Effect to handle camera stream activation
    useEffect(() => {
        const startPreferredStream = async () => {
            if (!(isCapturing && videoRef.current)) return;
            try {
                // Stop existing stream
                if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());

                // Try facingMode exact
                try {
                    const s1 = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { exact: facingMode } } });
                    streamRef.current = s1;
                } catch {
                    // Try facingMode ideal
                    try {
                        const s2 = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
                        streamRef.current = s2;
                    } catch {
                        // Enumerate and pick deviceId
                        const devices = await navigator.mediaDevices.enumerateDevices();
                        const inputs = devices.filter(d => d.kind === 'videoinput');
                        let deviceId: string | undefined;
                        if (inputs.length > 1) {
                            const back = inputs.find(d => /back|rear|environment/i.test(d.label));
                            const front = inputs.find(d => /front|user/i.test(d.label));
                            deviceId = (facingMode === 'environment' ? back?.deviceId : front?.deviceId) || inputs[0]?.deviceId;
                        } else if (inputs[0]) {
                            deviceId = inputs[0].deviceId;
                        }
                        const s3 = await navigator.mediaDevices.getUserMedia({ video: deviceId ? {deviceId: { exact: deviceId } } : true });
                        streamRef.current = s3;
                    }
                }
                if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current;
            } catch (err) {
                setError('Could not access camera. Please check permissions.');
                setIsCapturing(false);
            }
        };
        startPreferredStream();
        
        // Cleanup stream on component unmount or when capture is stopped
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [isCapturing, facingMode]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

{{ ... }}
            setError('Please select an image file.');
            return;
        }
        try {
            const base64 = await toBase64(file);
            setImageBase64(base64);
            setError('');
        } catch (err) {
            setError('Failed to read file.');
        }
    };

    const handleStartCapture = () => {
        setError('');
        setIsCapturing(true); // Let the useEffect handle the stream
    };
    
    const handleTakePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if(context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/png');
                setImageBase64(dataUrl);
            }
            handleStopCapture();
        }
    };

    const handleStopCapture = () => {
         if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() && !imageBase64) {
            setError('Please enter a message or attach an image.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await sendCommunicationToPatient(patient.healthId, doctor, {
                message: message.trim() || undefined,
                imageUrl: imageBase64 || undefined,
            });
            setToastMessage('Message sent successfully!');
            setTimeout(() => {
                 onSendSuccess();
                 onClose();
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send message.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg text-gray-800 dark:text-dark-text" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold">Send Message to {patient.name}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg"><CloseIcon className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <fieldset disabled={isLoading}>
                             <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-1">Message</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    rows={4}
                                    className="block w-full px-3 py-2 bg-light-green dark:bg-dark-bg border border-gray-200 dark:border-dark-subtext/20 rounded-md placeholder-gray-400 dark:placeholder-dark-placeholder sm:text-sm"
                                    placeholder="Type your message or advice here..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-dark-subtext mb-2">Attach Prescription/Image</label>
                                {isCapturing ? (
                                    <div className="space-y-2">
                                        <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-black" />
                                        <div className="flex gap-2">
                                            <button type="button" onClick={handleTakePhoto} className="flex-grow justify-center flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-opacity-80">
                                                <CameraIcon className="w-5 h-5" /> Take Photo
                                            </button>
                                            <button type="button" onClick={() => setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-opacity-80">Flip</button>
                                            <button type="button" onClick={handleStopCapture} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-opacity-80">Cancel</button>
                                        </div>
                                    </div>
                                ) : imageBase64 ? (
                                    <div className="relative">
                                        <img src={imageBase64} alt="Preview" className="max-h-48 w-auto rounded-md border-2 border-gray-200 dark:border-dark-subtext/30" />
                                        <button 
                                            type="button" 
                                            onClick={() => setImageBase64(null)} 
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 leading-none"
                                        >
                                            <CloseIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex gap-2">
                                         <button type="button" onClick={() => fileInputRef.current?.click()} className="flex-grow justify-center flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-dashed border-gray-300 dark:border-dark-subtext/40 font-semibold rounded-lg hover:border-primary-green dark:hover:border-dark-accent hover:text-primary-green dark:hover:text-dark-accent">
                                            <UploadIcon className="w-5 h-5" /> Upload File
                                        </button>
                                        <button type="button" onClick={handleStartCapture} className="flex-grow justify-center flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-bg border border-dashed border-gray-300 dark:border-dark-subtext/40 font-semibold rounded-lg hover:border-primary-green dark:hover:border-dark-accent hover:text-primary-green dark:hover:text-dark-accent">
                                            <CameraIcon className="w-5 h-5" /> Use Camera
                                        </button>
                                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                                    </div>
                                )}
                            </div>
                        </fieldset>
                        {error && <p className="text-red-400 text-sm">{error}</p>}
                    </div>
                    <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end">
                        <button type="submit" disabled={isLoading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white dark:text-dark-bg bg-primary-green dark:bg-dark-accent rounded-md shadow-sm hover:bg-opacity-80 disabled:bg-gray-500 dark:disabled:bg-dark-subtext">
                            <PaperAirplaneIcon className="w-5 h-5" />
                            {isLoading ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                </form>
                <Toast message={toastMessage} onClose={() => setToastMessage('')} />
            </div>
        </div>
    );
};

export default SendMessageModal;