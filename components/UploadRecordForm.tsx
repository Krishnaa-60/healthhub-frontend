import React, { useState, useRef, useEffect } from 'react';
import { addMedicalRecord } from '../services/db';
import { MedicalRecord, User, MedicalRecordFile } from '../types';
import TrashIcon from './icons/TrashIcon';
import PlusIcon from './icons/PlusIcon';
import { MEDICAL_RECORD_CATEGORIES } from '../constants';
import CameraIcon from './icons/CameraIcon';

interface UploadRecordFormProps {
    user: User;
    onUploadSuccess: () => void;
}

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    // FIX: Changed the onerror handler to reject with reader.error, which is a DOMException (an Error object),
    // instead of the ProgressEvent object, which doesn't have a 'name' or 'message' property and caused a type error.
    reader.onerror = () => reject(reader.error);
});

// Helper to convert base64 data URL to a File object
async function dataURLtoFile(dataUrl: string, filename: string): Promise<File> {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: blob.type || 'image/png' });
}

const UploadRecordForm: React.FC<UploadRecordFormProps> = ({ user, onUploadSuccess }) => {
    const [recordName, setRecordName] = useState('');
    const [category, setCategory] = useState(MEDICAL_RECORD_CATEGORIES[0]);
    const [disease, setDisease] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [isProtected, setIsProtected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isCapturing, setIsCapturing] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Effect to handle camera stream activation
    useEffect(() => {
        const startStream = async () => {
            if (isCapturing && videoRef.current && !videoRef.current.srcObject) {
                try {
                    // Stop any existing stream before starting a new one
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(track => track.stop());
                    }
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = stream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (err) {
                    // FIX: Safely access the error's name property after a type check to provide a more descriptive error message and resolve the TypeScript error.
                    if (err instanceof Error) {
                        setError(`Could not access camera (${err.name}). Please check permissions.`);
                    } else {
                        setError('Could not access camera. Please check permissions.');
                    }
                    setIsCapturing(false); // Revert state on error
                }
            }
        };
        startStream();

        // Cleanup stream on component unmount or when capture is stopped
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCapturing]);


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prevFiles => {
                const existingFileNames = new Set(prevFiles.map(f => f.name));
                const uniqueNewFiles = newFiles.filter(f => !existingFileNames.has(f.name));
                return [...prevFiles, ...uniqueNewFiles];
            });
            e.target.value = '';
        }
    };

    const handleRemoveFile = (fileNameToRemove: string) => {
        setSelectedFiles(prevFiles => prevFiles.filter(file => file.name !== fileNameToRemove));
    };

    const handleStartCapture = () => {
        setError('');
        setIsCapturing(true); // Let the useEffect handle the stream
    };

    const handleStopCapture = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCapturing(false);
    };

    const handleTakePhoto = async () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/png');
            const file = await dataURLtoFile(dataUrl, `capture-${Date.now()}.png`);
            setSelectedFiles(prev => [...prev, file]);
            handleStopCapture();
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!recordName || !category || !disease || selectedFiles.length === 0) {
            setError('Please fill in all fields and select at least one file.');
            return;
        }

        setIsLoading(true);

        try {
            const filePromises = selectedFiles.map(file => 
                toBase64(file).then(content => ({ name: file.name, content }))
            );
            const files: MedicalRecordFile[] = await Promise.all(filePromises);

            const newMedicalRecord: Omit<MedicalRecord, 'recordId'> = {
                name: recordName,
                category,
                disease,
                files,
                isLocked: isProtected,
                phoneForOTP: isProtected ? user.mobileNo : undefined,
                dateAdded: new Date().toISOString().split('T')[0],
            };

            await addMedicalRecord(user.healthId, newMedicalRecord);
            
            setSuccess('Record uploaded successfully!');
            setRecordName('');
            setCategory(MEDICAL_RECORD_CATEGORIES[0]);
            setDisease('');
            setSelectedFiles([]);
            setIsProtected(false);
            setTimeout(() => onUploadSuccess(), 1000);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred during upload.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const inputStyle = "block w-full px-3 py-2 bg-input-bg dark:bg-dark-bg border-transparent dark:border dark:border-dark-subtext/20 rounded-md placeholder-gray-500 dark:placeholder-dark-placeholder sm:text-sm text-gray-900 dark:text-dark-text";
    const labelStyle = "block text-sm font-bold text-gray-800 dark:text-dark-text mb-1";
    const buttonStyle = "w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-dark-card text-gray-600 dark:text-dark-subtext font-semibold rounded-lg border-2 border-dashed border-gray-300 dark:border-dark-subtext/40 hover:border-primary-green dark:hover:border-dark-accent hover:text-primary-green dark:hover:text-dark-accent transition-colors";

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-6 border-b border-gray-200 dark:border-dark-subtext/20">
                <h3 className="text-xl font-bold text-gray-800 dark:text-dark-text">Upload a New Medical Record</h3>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                <fieldset disabled={isLoading} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="recordName" className={labelStyle}>Record Name</label>
                            <input id="recordName" type="text" value={recordName} onChange={(e) => setRecordName(e.target.value)} className={inputStyle} placeholder="e.g., Blood Test Results" required />
                        </div>
                        <div>
                            <label htmlFor="category" className={labelStyle}>Category</label>
                            <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputStyle} required>
                                {MEDICAL_RECORD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>
                    <div>
                        <label htmlFor="disease" className={labelStyle}>Related Condition/Disease</label>
                        <input id="disease" type="text" value={disease} onChange={(e) => setDisease(e.target.value)} className={inputStyle} placeholder="e.g., Annual Checkup, Fever" required />
                    </div>
                    <div>
                        <label className={labelStyle}>Select File(s)</label>
                        <input id="fileUpload" type="file" multiple onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                        
                        {isCapturing ? (
                             <div className="mt-1 space-y-2">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-black" />
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleTakePhoto} className="flex-grow justify-center flex items-center gap-2 px-4 py-2 bg-green-500 text-white font-semibold rounded-lg hover:bg-opacity-80">
                                        <CameraIcon className="w-5 h-5" /> Take Photo
                                    </button>
                                    <button type="button" onClick={handleStopCapture} className="px-4 py-2 bg-gray-500 text-white font-semibold rounded-lg hover:bg-opacity-80">Cancel</button>
                                </div>
                            </div>
                        ) : selectedFiles.length > 0 ? (
                            <div className="mt-1 space-y-2">
                                <ul className="divide-y divide-gray-200 dark:divide-dark-subtext/20 rounded-md border border-gray-200 dark:border-dark-subtext/20 bg-white/50 dark:bg-dark-bg/50 max-h-32 overflow-y-auto">
                                    {selectedFiles.map((file) => (
                                        <li key={file.name} className="flex items-center justify-between py-2 px-3 text-sm">
                                            <span className="text-gray-800 dark:text-dark-text font-medium truncate" title={file.name}>{file.name}</span>
                                            <button type="button" onClick={() => handleRemoveFile(file.name)} className="p-1 text-gray-400 dark:text-dark-subtext rounded-full hover:bg-red-100 dark:hover:bg-red-500/20 hover:text-red-600" aria-label={`Remove ${file.name}`}>
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                                 <div className="flex gap-2">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className={`${buttonStyle} border-green-200 dark:border-dark-accent/30 text-green-700 dark:text-dark-accent`} aria-label="Add more files">
                                        <PlusIcon className="w-5 h-5" /> Add More Files
                                    </button>
                                    <button type="button" onClick={handleStartCapture} className={`${buttonStyle}`}>
                                        <CameraIcon className="w-5 h-5" /> Use Camera
                                    </button>
                                 </div>
                            </div>
                        ) : (
                             <div className="flex gap-2 mt-1">
                                <button type="button" onClick={() => fileInputRef.current?.click()} className={buttonStyle}>Choose Files</button>
                                <button type="button" onClick={handleStartCapture} className={buttonStyle}>
                                    <CameraIcon className="w-5 h-5" /> Use Camera
                                </button>
                             </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                        <input id="isProtected" type="checkbox" checked={isProtected} onChange={(e) => setIsProtected(e.target.checked)} className="h-4 w-4 text-primary-green focus:ring-primary-green border-gray-300 rounded" />
                        <label htmlFor="isProtected" className="text-sm font-medium text-gray-700 dark:text-dark-text">Protect this record with OTP</label>
                    </div>
                </fieldset>
            </div>

            {error && <p className="text-red-500 dark:text-red-400 text-sm text-center font-semibold px-6">{error}</p>}
            {success && <p className="text-green-600 dark:text-green-400 text-sm text-center font-semibold px-6">{success}</p>}

            <div className="p-4 bg-gray-50 dark:bg-dark-bg/50 flex justify-end">
                <button type="submit" disabled={isLoading} className="w-full md:w-auto flex justify-center items-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-primary-green hover:bg-primary-green-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-green disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {isLoading ? 'Uploading...' : 'Upload Record'}
                </button>
            </div>
        </form>
    );
};

export default UploadRecordForm;