import React from 'react';
import { User, Communication } from '../../types';
import MailIcon from '../icons/MailIcon';
import UserPlaceholderIcon from '../icons/UserPlaceholderIcon';

interface CommunicationsViewProps {
    doctor: User;
    onReplyToPatient: (patientId: string) => void;
}

const CommunicationsView: React.FC<CommunicationsViewProps> = ({ doctor, onReplyToPatient }) => {
    const communications = doctor.communications || [];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Patient Inbox</h1>
                <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Messages from your linked patients.</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-lg space-y-4">
                {communications.length > 0 ? (
                    communications.map(comm => (
                        <div key={comm.id} className="bg-light-green dark:bg-dark-bg p-4 rounded-lg flex gap-4 border border-gray-200 dark:border-dark-subtext/20">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-dark-card rounded-full flex-shrink-0 flex items-center justify-center">
                                <UserPlaceholderIcon className="w-6 h-6 text-gray-500 dark:text-dark-subtext" />
                            </div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{comm.from.name}</h4>
                                        <p className="text-xs text-gray-500 dark:text-dark-subtext">{new Date(comm.timestamp).toLocaleString()}</p>
                                    </div>
                                    <button
                                        onClick={() => onReplyToPatient(comm.from.id)}
                                        className="text-sm font-semibold text-primary-green dark:text-dark-accent hover:underline"
                                    >
                                        Reply
                                    </button>
                                </div>
                                <p className="text-sm mt-2">{comm.message}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-16 text-gray-500 dark:text-dark-subtext">
                        <MailIcon className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-dark-subtext/30" />
                        <h3 className="text-lg font-semibold">Your Inbox is Empty</h3>
                        <p className="text-sm">Messages from patients will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommunicationsView;
