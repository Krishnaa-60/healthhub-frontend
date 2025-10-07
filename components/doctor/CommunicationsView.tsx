import React, { useEffect, useMemo, useState } from 'react';
import { User, Communication } from '../../types';
import MailIcon from '../icons/MailIcon';
import UserPlaceholderIcon from '../icons/UserPlaceholderIcon';
import TrashIcon from '../icons/TrashIcon';
import { deleteChatMessage } from '../../services/db';

interface CommunicationsViewProps {
    doctor: User;
    onReplyToPatient: (patientId: string) => void;
}

const CommunicationsView: React.FC<CommunicationsViewProps> = ({ doctor, onReplyToPatient }) => {
    const [comms, setComms] = useState<Communication[]>(doctor.communications || []);

    useEffect(() => {
        setComms(doctor.communications || []);
    }, [doctor.communications]);

    const grouped = useMemo(() => {
        const byPatient = new Map<string, { patientId: string; patientName: string; unread: number; latest: Communication }>();
        (comms || []).forEach(c => {
            // Only consider messages sent to the doctor from patients
            if (c.toId === doctor.healthId && c.from?.id) {
                const key = c.from.id;
                const existing = byPatient.get(key);
                const unreadAdd = c.read !== true ? 1 : 0;
                if (!existing) {
                    byPatient.set(key, { patientId: key, patientName: c.from.name, unread: unreadAdd, latest: c });
                } else {
                    // update unread
                    existing.unread += unreadAdd;
                    // update latest by timestamp desc
                    const existingTime = new Date(existing.latest.timestamp).getTime();
                    const thisTime = new Date(c.timestamp).getTime();
                    if (thisTime > existingTime) existing.latest = c;
                }
            }
        });
        // sort by latest timestamp desc
        return Array.from(byPatient.values()).sort((a,b) => new Date(b.latest.timestamp).getTime() - new Date(a.latest.timestamp).getTime());
    }, [comms, doctor.healthId]);

    const handleDeleteLatest = async (patientId: string, messageId: string) => {
        // Optimistic update
        setComms(prev => prev.filter(c => c.id !== messageId));
        try {
            await deleteChatMessage(doctor.healthId, patientId, messageId);
        } catch (e) {
            // Revert on failure: simplest is to refetch from prop; for now show alert
            alert('Failed to delete message. Please refresh and try again.');
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Patient Inbox</h1>
                <p className="text-md text-gray-500 dark:text-dark-subtext mt-1">Messages from your linked patients.</p>
            </div>
            <div className="bg-white dark:bg-dark-card p-4 rounded-lg shadow-lg space-y-3">
                {grouped.length > 0 ? (
                    grouped.map(item => (
                        <div key={item.patientId} className="p-4 rounded-lg flex gap-4 border border-gray-200 dark:border-dark-subtext/20 bg-light-green dark:bg-dark-bg">
                            <div className="relative w-10 h-10 bg-gray-200 dark:bg-dark-card rounded-full flex-shrink-0 flex items-center justify-center">
                                <UserPlaceholderIcon className="w-6 h-6 text-gray-500 dark:text-dark-subtext" />
                                {item.unread > 0 && (
                                    <>
                                        <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-red-500 animate-ping"></span>
                                        <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                                    </>
                                )}
                            </div>
                            <div className="flex-grow min-w-0">
                                <div className="flex justify-between items-start">
                                    <div className="min-w-0">
                                        <h4 className="font-bold truncate">{item.patientName}</h4>
                                        <p className="text-xs text-gray-500 dark:text-dark-subtext">{new Date(item.latest.timestamp).toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">{item.unread}</span>
                                        <button
                                            onClick={() => onReplyToPatient(item.patientId)}
                                            className="text-sm font-semibold text-primary-green dark:text-dark-accent hover:underline"
                                        >
                                            Reply
                                        </button>
                                        <button
                                            onClick={() => handleDeleteLatest(item.patientId, item.latest.id)}
                                            className="p-2 rounded-full text-gray-500 dark:text-dark-subtext hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
                                            title="Delete latest message"
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                {item.latest.message && (
                                    <p className="text-sm mt-2 line-clamp-2 break-words">{item.latest.message}</p>
                                )}
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
