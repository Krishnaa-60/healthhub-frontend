import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { updateUser } from '../../services/db';
import UserPlaceholderIcon from '../icons/UserPlaceholderIcon';
import UploadIcon from '../icons/UploadIcon';
import MailIcon from '../icons/MailIcon';
import PhoneIcon from '../icons/PhoneIcon';
import LocationMarkerIcon from '../icons/LocationMarkerIcon';
import PersonIcon from '../icons/PersonIcon';
import EditIcon from '../icons/EditIcon';
import BriefcaseIcon from '../icons/BriefcaseIcon';
import EditDoctorProfileModal from './EditDoctorProfileModal';

interface DoctorProfileViewProps {
  doctor: User;
  onDoctorUpdate: (doctor: User) => void;
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
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-50 dark:bg-dark-bg flex items-center justify-center text-brand-blue dark:text-dark-accent">{icon}</div>
            <div className="ml-4 flex-grow">
                <p className="text-xs font-bold text-gray-500 dark:text-dark-subtext">{label}</p>
                <p className="text-sm text-gray-800 dark:text-dark-text font-semibold">{value}</p>
            </div>
            {isEditable && <button className="opacity-0 group-hover:opacity-100 text-brand-blue dark:text-dark-accent transition-opacity"><EditIcon className="w-4 h-4" /></button>}
        </div>
    );
};

const DoctorProfileView: React.FC<DoctorProfileViewProps> = ({ doctor, onDoctorUpdate, setToastMessage }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
            const updatedDoctor = await updateUser(doctor.healthId, { avatar: base64 });
            onDoctorUpdate(updatedDoctor);
            setToastMessage('Profile picture updated successfully!');
        } catch (err) {
            setError('Failed to upload image. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async (updatedData: Partial<User>) => {
        try {
            const updatedDoctor = await updateUser(doctor.healthId, updatedData);
            onDoctorUpdate(updatedDoctor);
            setIsEditModalOpen(false);
            setToastMessage('Profile updated successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to update profile. Please try again.');
        }
    };

    const fullAddress = doctor.address ? [doctor.address.address1, doctor.address.address2, doctor.address.landmark, doctor.address.district, doctor.address.state, doctor.address.pincode].filter(Boolean).join(', ') : 'Not provided';

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Profile Summary */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl shadow-lg text-center">
                        <div 
                            className="relative w-40 h-40 mx-auto rounded-full group cursor-pointer ring-8 ring-blue-50 dark:ring-dark-bg shadow-md"
                            onClick={handleAvatarClick}
                            title="Click to upload a new photo"
                        >
                            {doctor.avatar ? (
                                <img src={doctor.avatar} alt="Profile" className="w-full h-full rounded-full object-cover" />
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

                        <h2 className="mt-4 text-2xl font-bold text-gray-800 dark:text-dark-text">{doctor.name}</h2>
                        <p className="text-sm text-brand-blue dark:text-dark-accent font-semibold mt-1">{doctor.specialization || 'Doctor'}</p>
                        <p className="text-xs text-gray-500 dark:text-dark-subtext mt-1">ID: <strong className="text-brand-blue dark:text-dark-accent tracking-wider">{doctor.healthId}</strong></p>
                        
                        <div className="mt-6 text-left space-y-4">
                        <DetailItem icon={<MailIcon className="w-5 h-5" />} label="Email" value={doctor.email} />
                        <DetailItem icon={<PhoneIcon className="w-5 h-5" />} label="Mobile" value={doctor.mobileNo} />
                        <DetailItem icon={<BriefcaseIcon className="w-5 h-5" />} label="Specialization" value={doctor.specialization} />
                        <DetailItem icon={<LocationMarkerIcon className="w-5 h-5" />} label="Address" value={fullAddress} />
                        </div>
                        
                        <button 
                            onClick={() => setIsEditModalOpen(true)}
                            className="mt-6 w-full py-2.5 px-4 bg-brand-blue text-white font-bold rounded-lg shadow-md hover:bg-blue-600 transition-colors transform hover:scale-105"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                {/* Right Column: Detailed Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
                        <div className="p-4 bg-gradient-to-r from-brand-blue to-accent-blue rounded-t-xl">
                            <h3 className="text-lg font-bold text-white flex justify-between items-center">
                                <span>Professional Information</span>
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                            <DetailItem icon={<BriefcaseIcon className="w-5 h-5"/>} label="Specialization" value={doctor.specialization || 'Not specified'} />
                            <DetailItem icon={<PersonIcon className="w-5 h-5"/>} label="Experience" value={doctor.experience ? `${doctor.experience} years` : 'Not specified'} />
                            <DetailItem icon={<PersonIcon className="w-5 h-5"/>} label="Qualification" value={doctor.qualification || 'Not specified'} />
                            <DetailItem icon={<PersonIcon className="w-5 h-5"/>} label="License Number" value={doctor.licenseNumber || 'Not specified'} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
                        <div className="p-4 bg-gradient-to-r from-grad-purple-from to-grad-purple-to rounded-t-xl">
                            <h3 className="text-lg font-bold text-white flex justify-between items-center">
                                <span>Contact Details</span>
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <DetailItem icon={<MailIcon className="w-5 h-5"/>} label="Email" value={doctor.email} />
                        <DetailItem icon={<PhoneIcon className="w-5 h-5"/>} label="Mobile No." value={doctor.mobileNo} />
                        <DetailItem icon={<LocationMarkerIcon className="w-5 h-5"/>} label="Address" value={fullAddress} />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-dark-card rounded-xl shadow-lg">
                        <div className="p-4 bg-gradient-to-r from-primary-green to-teal-400 rounded-t-xl">
                            <h3 className="text-lg font-bold text-white flex justify-between items-center">
                                <span>Statistics</span>
                            </h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-brand-blue dark:text-dark-accent">{doctor.patients?.length || 0}</p>
                                <p className="text-sm text-gray-500 dark:text-dark-subtext mt-1">Total Patients</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-brand-blue dark:text-dark-accent">{doctor.appointments?.length || 0}</p>
                                <p className="text-sm text-gray-500 dark:text-dark-subtext mt-1">Appointments</p>
                            </div>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-brand-blue dark:text-dark-accent">{doctor.communications?.length || 0}</p>
                                <p className="text-sm text-gray-500 dark:text-dark-subtext mt-1">Messages</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <EditDoctorProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                doctor={doctor}
                onSave={handleSaveProfile}
            />
        </>
    );
};

export default DoctorProfileView;
