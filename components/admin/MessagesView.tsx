import React, { useState, useEffect } from 'react';
import { getContactMessages, deleteContactMessage } from '../../services/db';
import { ContactMessage } from '../../types';
import MailIcon from '../icons/MailIcon';
import PersonIcon from '../icons/PersonIcon';
import TrashIcon from '../icons/TrashIcon';
import Toast from '../Toast';

const MessageCard: React.FC<{ message: ContactMessage; onDelete: (id: string) => void; }> = ({ message, onDelete }) => {
    const formattedDate = new Date(message.createdAt).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
    });

    return (
        <div className="bg-dark-bg p-4 rounded-lg border border-dark-subtext/20 transition-shadow hover:shadow-lg">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-dark-accent/10 rounded-full flex-shrink-0">
                         <PersonIcon className="w-5 h-5 text-dark-accent" />
                    </div>
                    <div>
                        <h3 className="font-bold text-dark-text">{message.name}</h3>
                        <a href={`mailto:${message.email}`} className="text-xs text-dark-subtext hover:underline">{message.email}</a>
                    </div>
                </div>
                 <div className="flex items-center gap-2">
                    <span className="text-xs text-dark-subtext flex-shrink-0 ml-4">{formattedDate}</span>
                    <button 
                        onClick={() => onDelete(message._id)}
                        className="p-2 text-dark-subtext hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors"
                        title="Delete message"
                    >
                        <TrashIcon className="w-4 h-4" />
                    </button>
                 </div>
            </div>
            <p className="mt-3 text-sm text-dark-text/90 whitespace-pre-wrap">{message.message}</p>
        </div>
    );
};

const MessagesView: React.FC = () => {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [toastMessage, setToastMessage] = useState('');

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const fetchedMessages = await getContactMessages();
                setMessages(fetchedMessages);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch messages.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchMessages();
    }, []);

    const handleDeleteMessage = async (id: string) => {
        if (window.confirm('Are you sure you want to permanently delete this message?')) {
            try {
                await deleteContactMessage(id);
                setMessages(prev => prev.filter(msg => msg._id !== id));
                setToastMessage('Message deleted successfully.');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to delete message.');
            }
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Contact Form Inbox</h1>
                <p className="text-md text-dark-subtext mt-1">Messages submitted through the public contact page.</p>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-accent"></div>
                </div>
            ) : error ? (
                <p className="text-red-400 text-center">{error}</p>
            ) : messages.length > 0 ? (
                <div className="space-y-4">
                    {messages.map(msg => (
                        <MessageCard key={msg._id} message={msg} onDelete={handleDeleteMessage} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-dark-subtext bg-dark-card rounded-lg">
                    <MailIcon className="w-20 h-20 mx-auto mb-4 text-dark-subtext/30" />
                    <h3 className="text-lg font-semibold">The Inbox is Empty</h3>
                    <p className="text-sm">No messages have been submitted yet.</p>
                </div>
            )}
            <Toast message={toastMessage} onClose={() => setToastMessage('')} />
        </div>
    );
};

export default MessagesView;