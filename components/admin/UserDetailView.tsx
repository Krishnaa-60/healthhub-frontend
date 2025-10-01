import React from 'react';
import { User, UserRole } from '../../types';
import CloseIcon from '../icons/CloseIcon';
import UserPlaceholderIcon from '../icons/UserPlaceholderIcon';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon';

interface UserDetailViewProps {
    user: User;
    onClose: () => void;
    onSendMessage?: (user: User) => void;
}

const DetailItem: React.FC<{ label: string; value?: string | React.ReactNode }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div>
            <p className="text-xs font-bold text-gray-500 dark:text-dark-subtext uppercase tracking-wider">{label}</p>
            <p className="text-sm text-gray-800 dark:text-dark-text font-semibold">{value}</p>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div>
        <h3 className="text-lg font-bold text-primary-green dark:text-dark-accent mb-3 pb-2 border-b-2 border-primary-green/20 dark:border-dark-subtext/20">{title}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {children}
        </div>
    </div>
);

const UserDetailView: React.FC<UserDetailViewProps> = ({ user, onClose, onSendMessage }) => {
    const fullAddress = user.address ? [user.address.address1, user.address.address2, user.address.district, user.address.state, user.address.pincode].filter(Boolean).join(', ') : 'Not provided';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-3xl h-[90vh] flex flex-col overflow-hidden border border-gray-200 dark:border-dark-subtext/20" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <header className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-subtext/20 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-light-green dark:bg-dark-bg flex items-center justify-center">
                             {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <UserPlaceholderIcon className="w-10 h-10 text-gray-400 dark:text-dark-subtext" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{user.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-dark-subtext">{user.healthId}</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-2">
                        {onSendMessage && user.role === UserRole.PATIENT && (
                             <button 
                                onClick={() => onSendMessage(user)}
                                className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white font-semibold rounded-lg shadow-sm hover:bg-opacity-80 transition-colors"
                            >
                                <PaperAirplaneIcon className="w-5 h-5" />
                                Send Message/Rx
                            </button>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg"><CloseIcon className="w-6 h-6" /></button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-grow p-6 overflow-y-auto space-y-6">
                    <Section title="Personal Information">
                        <DetailItem label="Role" value={
                             <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                user.role === UserRole.PATIENT ? 'bg-blue-100 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300' : 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-300'
                            }`}>{user.role}</span>
                        }/>
                        <DetailItem label="Email Address" value={user.email} />
                        <DetailItem label="Mobile Number" value={user.mobileNo} />
                        <DetailItem label="Date of Birth" value={user.birthdate} />
                        <DetailItem label="Aadhar Number" value={user.aadharNo} />
                        <DetailItem label="Blood Group" value={user.bloodGroup} />
                    </Section>

                    {user.role === UserRole.DOCTOR && (
                         <Section title="Professional Details">
                            <DetailItem label="Specialization" value={user.specialization} />
                            <DetailItem label="Experience" value={user.experience} />
                            <DetailItem label="Education" value={user.education} />
                            <DetailItem label="Current Hospital" value={user.currentHospital} />
                        </Section>
                    )}

                    <Section title="Address">
                        <div className="md:col-span-2">
                            <DetailItem label="Full Address" value={fullAddress} />
                        </div>
                    </Section>
                    
                     {user.emergencyContact && (
                        <Section title="Emergency Contact">
                            <DetailItem label="Name" value={user.emergencyContact.name} />
                            <DetailItem label="Relation" value={user.emergencyContact.relation} />
                            <DetailItem label="Mobile" value={user.emergencyContact.mobile} />
                            <DetailItem label="Email" value={user.emergencyContact.email} />
                        </Section>
                    )}

                    {user.permanentDiseases && user.permanentDiseases.length > 0 && (
                        <Section title="Permanent Diseases">
                            <div className="md:col-span-2 space-y-2">
                                {user.permanentDiseases.map((disease, index) => (
                                    <p key={index} className="text-sm bg-light-green dark:bg-dark-bg p-2 rounded-md">
                                        <strong>{disease.name}</strong> - for {disease.years} years
                                    </p>
                                ))}
                            </div>
                        </Section>
                    )}
                </main>
            </div>
        </div>
    );
};

export default UserDetailView;
