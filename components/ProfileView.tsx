import React, { useState, useRef } from 'react';
import { User } from '../types';
import { updateUser } from '../services/db';
import UserPlaceholderIcon from './icons/UserPlaceholderIcon';
import UploadIcon from './icons/UploadIcon';
import MailIcon from './icons/MailIcon';
import PhoneIcon from './icons/PhoneIcon';
import LocationMarkerIcon from './icons/LocationMarkerIcon';
import PersonIcon from './icons/PersonIcon';
import EditIcon from './icons/EditIcon';
import CalendarIcon from './icons/CalendarIcon';
import EditProfileModal from './patient/EditProfileModal';
import QRCodeDisplay from './QRCodeDisplay';

interface ProfileViewProps {
  user: User;
  onUserUpdate: (user: User) => void;
  setToastMessage: (message: string) => void;
}

// Helper to convert file to base64
const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const DetailItem: React.FC<{ icon: React.ReactNode, label: string, value?: string | React.ReactNode, isEditable?: boolean }> = ({ icon, label, value, isEditable }) => {
    if (!value) return null;
    return (
        <div className="flex items-start group">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-light-green dark:bg-dark-bg flex items-center justify-center text-primary-green dark:text-dark-accent">{icon}</div>
            <div className="ml-4 flex-grow">
                <p className="text-xs font-bold text-gray-500 dark:text-dark-subtext">{label}</p>
                <p className="text-sm text-gray-800 dark:text-dark-text font-semibold">{value}</p>
            </div>
            {isEditable && <button className="opacity-0 group-hover:opacity-100 text-primary-green dark:text-dark-accent transition-opacity"><EditIcon className="w-4 h-4" /></button>}
        </div>
    );
};

const ProfileView: React.FC<ProfileViewProps> = ({ user, onUserUpdate, setToastMessage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [showQRCode, setShowQRCode] = useState(false);

    const handleAvatarClick = () => {
        if (isUploading) return;
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file.');
            return;
        }
        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            setError('Image size must be less than 2MB.');
            return;
        }

        setIsUploading(true);
        setError('');
        try {
            const base64 = await toBase64(file);
            const updatedUser = await updateUser(user.healthId, { avatar: base64 });
            onUserUpdate(updatedUser);
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async (updatedData: Partial<User>) => {
        try {
            const updatedUser = await updateUser(user.healthId, updatedData);
            onUserUpdate(updatedUser);
            setIsEditModalOpen(false);
            setToastMessage('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile. Please try again.');
        }
    };


    const fullAddress = user.address ? [user.address.address1, user.address.address2, user.address.landmark, user.address.district, user.address.state, user.address.pincode].filter(Boolean).join(', ') : 'Not provided';
    const emergencyAddress = user.emergencyContact?.address ? [user.emergencyContact.address.address1, user.emergencyContact.address.address2, user.emergencyContact.address.district, user.emergencyContact.address.state].filter(Boolean).join(', ') : 'Not provided';

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg text-center">
                        <div 
                            className="relative w-40 h-40 mx-auto rounded-full group cursor-pointer ring-8 ring-gray-100 dark:ring-dark-bg shadow-md"
                            onClick={handleAvatarClick}
                            title="Click to upload a new photo"
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gray-200 dark:bg-dark-bg flex items-center justify-center">
                                    <UserPlaceholderIcon className="w-24 h-24" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full flex items-center justify-center transition-opacity duration-300">
                            {isUploading ? (
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <UploadIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            )}
                            </div>
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        {error && <p className="text-red-500 text-xs mt-2">{error}</p>}

                        <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-dark-text">{user.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-dark-subtext mt-1">Health ID: <strong className="text-primary-green dark:text-dark-accent tracking-wider">{user.healthId}</strong></p>
                        
                        <div className="mt-6 text-left space-y-4">
                        <DetailItem icon={<div className="font-bold text-center text-lg">🩸</div>} label="Blood Group" value={user.bloodGroup} />
                        <DetailItem icon={<MailIcon className="w-5 h-5" />} label="Email" value={user.email} />
                        <DetailItem icon={<PhoneIcon className="w-5 h-5" />} label="Address" value={fullAddress} />
                        <DetailItem icon={<PersonIcon className="w-5 h-5" />} label="Emergency Contact" value={user.emergencyContact?.name} />
                        </div>
                        
                        <div className="mt-6 space-y-3">
                            <button 
                                onClick={() => setIsEditModalOpen(true)}
                                className="w-full py-2.5 px-4 bg-primary-green text-white font-bold rounded-lg shadow-md hover:bg-primary-green-dark transition-colors transform hover:scale-105"
                            >
                                Edit Profile
                            </button>
                            <button 
                                onClick={() => setShowQRCode(true)}
                                className="w-full py-2.5 px-4 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-bold rounded-lg shadow-md hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/30 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                </svg>
                                Show My QR Code
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Detailed Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
                        <div className="p-4 bg-gradient-to-r from-grad-blue-from to-grad-blue-to rounded-t-xl">
                            <h3 className="text-lg font-bold text-white flex justify-between items-center">
                                <span>Personal Information</span>
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <DetailItem icon={<CalendarIcon className="w-5 h-5"/>} label="Date of Birth" value={user.birthdate} />
                            <DetailItem icon={<PersonIcon className="w-5 h-5"/>} label="Aadhar No." value={user.aadharNo} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
                        <div className="p-4 bg-gradient-to-r from-grad-purple-from to-grad-purple-to rounded-t-xl">
                            <h3 className="text-lg font-bold text-white flex justify-between items-center">
                                <span>Contact Details</span>
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem icon={<MailIcon className="w-5 h-5"/>} label="Email" value={user.email} />
                        <DetailItem icon={<PhoneIcon className="w-5 h-5"/>} label="Mobile No." value={user.mobileNo} />
                        <DetailItem icon={<LocationMarkerIcon className="w-5 h-5"/>} label="Address" value={fullAddress} />
                        </div>
                    </div>

                    {user.emergencyContact?.name && (
                        <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
                            <div className="p-4 bg-gradient-to-r from-grad-red-from to-grad-red-to rounded-t-xl">
                                <h3 className="text-lg font-bold text-white flex justify-between items-center">
                                    <span>Emergency Contact</span>
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <DetailItem icon={<PersonIcon className="w-5 h-5"/>} label="Name & Relation" value={`${user.emergencyContact.name} (${user.emergencyContact.relation})`} />
                                <DetailItem icon={<PhoneIcon className="w-5 h-5"/>} label="Mobile No." value={user.emergencyContact.mobile} />
                                {emergencyAddress !== 'Not provided' && <DetailItem icon={<LocationMarkerIcon className="w-5 h-5"/>} label="Address" value={emergencyAddress} />}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSave={handleSaveProfile}
            />
            <QRCodeDisplay
                healthId={user.healthId}
                userName={user.name}
                isOpen={showQRCode}
                onClose={() => setShowQRCode(false)}
            />
        </>
    );
};

export default ProfileView;