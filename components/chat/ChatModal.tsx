import React, { useEffect, useRef, useState } from 'react';
import { Communication, User } from '../../types';
import { getConversation, sendChatMessage } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon';
import CameraIcon from '../icons/CameraIcon';
import UploadIcon from '../icons/UploadIcon';

interface ChatModalProps {
  currentUser: User;
  peerUser: User;
  isOpen: boolean;
  onClose: () => void;
}

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = error => reject(error);
});

const ChatModal: React.FC<ChatModalProps> = ({ currentUser, peerUser, isOpen, onClose }) => {
  const [messages, setMessages] = useState<Communication[]>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadConversation = async () => {
    try {
      const convo = await getConversation(currentUser.healthId, peerUser.healthId);
      setMessages(convo.messages);
      // scroll to bottom
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversation');
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadConversation();
    // simple polling for now (every 5s) since no websockets
    const iv = setInterval(loadConversation, 5000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser.healthId, peerUser.healthId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() && !imageBase64) return;
    setIsSending(true);
    setError('');
    try {
      const newMsg = await sendChatMessage(currentUser.healthId, peerUser.healthId, {
        message: input.trim() || undefined,
        imageUrl: imageBase64 || undefined,
      });
      setMessages(prev => [...prev, newMsg]);
      setInput('');
      setImageBase64(null);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }
    try {
      const base64 = await toBase64(file);
      setImageBase64(base64);
      setError('');
    } catch {
      setError('Failed to read file.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4" onClick={onClose}>
      <div className="bg-white dark:bg-dark-card rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-subtext/20">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold truncate">Chat with {peerUser.name}</h2>
            <p className="text-xs text-gray-500 dark:text-dark-subtext truncate">{peerUser.healthId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg" aria-label="Close">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-light-green/40 dark:bg-dark-bg">
          {messages.map((m) => {
            const mine = m.from.id === currentUser.healthId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`${mine ? 'bg-primary-green text-white' : 'bg-white dark:bg-dark-card text-gray-800 dark:text-dark-text'} max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow border border-gray-200/60 dark:border-dark-subtext/10`}>
                  {m.message && <div className="whitespace-pre-wrap text-sm">{m.message}</div>}
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="attachment" className="rounded-md mt-2 max-h-64 object-contain" />
                  )}
                  <div className={`text-[10px] mt-1 ${mine ? 'text-white/80' : 'text-gray-500 dark:text-dark-subtext'}`}>
                    {new Date(m.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-gray-200 dark:border-dark-subtext/20 space-y-2">
          {imageBase64 && (
            <div className="flex items-center gap-2">
              <img src={imageBase64} alt="preview" className="h-16 w-auto rounded border" />
              <button type="button" onClick={() => setImageBase64(null)} className="text-xs text-red-600">Remove</button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-dark-subtext hover:bg-gray-200 dark:hover:bg-dark-card">
              <UploadIcon className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Type a message..."
              className="flex-1 resize-none rounded-lg px-3 py-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-subtext/20 text-sm"
            />
            <button type="submit" disabled={isSending || (!input.trim() && !imageBase64)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-green text-white disabled:bg-gray-400">
              <PaperAirplaneIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
