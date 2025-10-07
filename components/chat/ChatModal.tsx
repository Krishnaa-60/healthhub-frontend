import React, { useEffect, useRef, useState } from 'react';
import { Communication, User } from '../../types';
import { getConversation, sendChatMessage, deleteChatMessage, markChatRead } from '../../services/db';
import CloseIcon from '../icons/CloseIcon';
import PaperAirplaneIcon from '../icons/PaperAirplaneIcon';
import CameraIcon from '../icons/CameraIcon';
import UploadIcon from '../icons/UploadIcon';
import TrashIcon from '../icons/TrashIcon';

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const loadConversation = async () => {
    try {
      const convo = await getConversation(currentUser.healthId, peerUser.healthId);
      setMessages(convo.messages);
      // Mark as read for current user for messages from the peer
      try {
        await markChatRead(currentUser.healthId, peerUser.healthId);
        // Optimistically reflect read state locally
        setMessages(prev => prev.map(m => (m.from.id === peerUser.healthId && m.toId === currentUser.healthId) ? { ...m, read: true } : m));
      } catch {}
      // scroll to bottom
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load conversation');
    }
  };

  const handleStartCapture = () => {
    setError('');
    setIsCapturing(true);
  };

  const handleTakePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/png');
        setImageBase64(dataUrl);
      }
      setIsCapturing(false);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(currentUser.healthId, peerUser.healthId, messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to delete message');
    }
  };

  const handleDownloadImage = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    if (!isOpen) return;
    loadConversation();
    // simple polling for now (every 5s) since no websockets
    const iv = setInterval(loadConversation, 5000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentUser.healthId, peerUser.healthId]);

  // camera lifecycle
  useEffect(() => {
    const startStream = async () => {
      if (isCapturing && videoRef.current && !videoRef.current.srcObject) {
        try {
          if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (e) {
          setError('Could not access camera. Check permissions.');
          setIsCapturing(false);
        }
      }
    };
    startStream();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [isCapturing]);

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
      <div className="bg-white dark:bg-[#111418] rounded-xl shadow-2xl w-full max-w-3xl h-[85vh] sm:h-[80vh] flex flex-col text-gray-900 dark:text-gray-100" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-dark-subtext/20">
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold truncate">Chat with {peerUser.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{peerUser.healthId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#1a1f24]" aria-label="Close">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-light-green/40 dark:bg-[#0b0e11]">
          {messages.map((m) => {
            const mine = m.from.id === currentUser.healthId;
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`${mine ? 'bg-primary-green text-white' : 'bg-white dark:bg-[#151a1f] text-gray-800 dark:text-gray-100'} relative max-w-[85%] sm:max-w-[70%] rounded-2xl px-3 py-2 shadow border border-gray-200/60 dark:border-[#232a33]`}>
                  <div className="absolute -top-2 right-1">
                    <button title="Delete" onClick={() => handleDeleteMessage(m.id)} className={`${mine ? 'text-white/90 hover:bg-white/20' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1a1f24]'} p-1 rounded-full`}>
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                  {m.message && <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.message}</div>}
                  {m.imageUrl && (
                    <div className="mt-2">
                      <img onClick={() => setPreviewImage(m.imageUrl!)} src={m.imageUrl} alt="attachment" className="rounded-md max-h-64 object-contain cursor-pointer" />
                      <div className="flex gap-2 mt-1 text-[11px]">
                        <button type="button" className={`${mine ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'} underline`} onClick={() => setPreviewImage(m.imageUrl!)}>Preview</button>
                        <button type="button" className={`${mine ? 'text-white/90' : 'text-gray-600 dark:text-gray-300'} underline`} onClick={() => handleDownloadImage(m.imageUrl!, `attachment-${m.id}.png`)}>Download</button>
                      </div>
                    </div>
                  )}
                  <div className={`text-[10px] mt-1 ${mine ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'}`}>
                    {new Date(m.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-gray-200 dark:border-[#232a33] space-y-2">
          {imageBase64 && (
            <div className="flex items-center gap-2">
              <img src={imageBase64} alt="preview" className="h-16 w-auto rounded border border-gray-200 dark:border-[#232a33]" />
              <button type="button" onClick={() => setImageBase64(null)} className="text-xs text-red-500">Remove</button>
            </div>
          )}
          {isCapturing && (
            <div className="space-y-2">
              <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md bg-black max-h-64" />
              <div className="flex gap-2">
                <button type="button" onClick={handleTakePhoto} className="flex items-center gap-2 px-4 py-2 bg-primary-green text-white rounded-lg"><CameraIcon className="w-5 h-5"/> Take Photo</button>
                <button type="button" onClick={() => setIsCapturing(false)} className="px-4 py-2 bg-gray-500 text-white rounded-lg">Cancel</button>
              </div>
            </div>
          )}
          <div className="flex items-end gap-2">
            <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg bg-gray-100 dark:bg-[#151a1f] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1a1f24]" title="Upload image">
              <UploadIcon className="w-5 h-5" />
            </button>
            <button type="button" onClick={handleStartCapture} className="p-2 rounded-lg bg-gray-100 dark:bg-[#151a1f] text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#1a1f24]" title="Use camera">
              <CameraIcon className="w-5 h-5" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={2}
              placeholder="Type a message..."
              className="flex-1 resize-none rounded-lg px-3 py-2 bg-white dark:bg-[#151a1f] border border-gray-200 dark:border-[#232a33] text-sm text-gray-900 dark:text-gray-100"
            />
            <button type="submit" disabled={isSending || (!input.trim() && !imageBase64)} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary-green text-white disabled:bg-gray-400">
              <PaperAirplaneIcon className="w-5 h-5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
          {error && <div className="text-xs text-red-500">{error}</div>}
        </form>

        {previewImage && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setPreviewImage(null)}>
            <div className="relative max-w-4xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <img src={previewImage} alt="preview" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
              <div className="absolute top-2 right-2 flex gap-2">
                <button className="px-3 py-1.5 rounded bg-white/90 text-gray-800" onClick={() => handleDownloadImage(previewImage, 'image.png')}>Download</button>
                <button className="p-2 rounded-full bg-white/90 text-gray-800" onClick={() => setPreviewImage(null)}><CloseIcon className="w-5 h-5"/></button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatModal;
