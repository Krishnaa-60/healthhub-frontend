import React, { useState, useEffect } from 'react';
import { MedicalRecord, MedicalRecordFile, User } from '../types';
import CloseIcon from './icons/CloseIcon';
import DocumentIcon from './icons/DocumentIcon';
import DownloadIcon from './icons/DownloadIcon';
import SpinnerIcon from './icons/SpinnerIcon';
import ShareRecordModal from './ShareRecordModal';

interface FilePreviewModalProps {
    user: User;
    record: MedicalRecord;
    onClose: () => void;
    onShareSuccess?: () => void;
}

const FileViewer: React.FC<{ file: MedicalRecordFile }> = ({ file }) => {
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [displayUrl, setDisplayUrl] = useState<string>('');
    const fileUrl = file.content;
    const fileName = file.name.toLowerCase();

    // Resolve the actual URL to use for viewing (handles protected links via blob URLs)
    useEffect(() => {
        let revokedUrl: string | null = null;
        let cancelled = false;
        setError(false);
        setLoading(true);

        const setup = async () => {
            try {
                // Data URL can be used directly
                if (fileUrl.startsWith('data:')) {
                    if (!cancelled) setDisplayUrl(fileUrl);
                    return;
                }
                // For http/https urls: fetch the blob and convert to object URL to avoid CORS/link issues
                const resp = await fetch(fileUrl, { credentials: 'include' });
                if (!resp.ok) throw new Error('Failed to load file');
                const blob = await resp.blob();
                const url = URL.createObjectURL(blob);
                revokedUrl = url;
                if (!cancelled) setDisplayUrl(url);
            } catch (e) {
                // Fallback: try to display original URL (may work if browser session allows it)
                if (!cancelled) {
                    setDisplayUrl(fileUrl);
                    setError(false);
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        setup();

        return () => {
            cancelled = true;
            if (revokedUrl) URL.revokeObjectURL(revokedUrl);
        };
    }, [fileUrl]);

    if (error) {
        return (
            <div className="text-center p-8 bg-red-50 dark:bg-red-500/10 rounded-lg flex flex-col items-center justify-center">
                <DocumentIcon className="w-24 h-24 mx-auto text-red-300 dark:text-red-400/50" />
                <h3 className="mt-4 text-lg font-semibold text-red-700 dark:text-red-300">Could not load image</h3>
                <p className="text-red-500 dark:text-red-400 mt-2">The image file might be corrupt or the link is broken.</p>
            </div>
        );
    }

    if (fileName.match(/\.(jpeg|jpg|gif|png|webp|svg)$/)) {
        return (
            <>
                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading image...</span>
                    </div>
                )}
                <img
                    src={displayUrl}
                    alt={`Preview of ${file.name}`}
                    className={`max-w-full max-h-full object-contain transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setLoading(false)}
                    onError={() => {
                        setError(true);
                        setLoading(false);
                    }}
                />
            </>
        );
    }

    if (fileName.endsWith('.pdf')) {
        return (
            <>
                {loading && (
                    <div className="flex items-center justify-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-green"></div>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading PDF...</span>
                    </div>
                )}
                <iframe
                    src={displayUrl}
                    title={`Preview of ${file.name}`}
                    className="w-full h-full"
                    frameBorder="0"
                />
            </>
        );
    }

    return (
        <div className="text-center p-8 bg-gray-50 dark:bg-dark-bg rounded-lg flex flex-col items-center justify-center">
            <DocumentIcon className="w-24 h-24 mx-auto text-gray-300 dark:text-dark-subtext/30" />
            <h3 className="mt-4 text-xl font-semibold text-gray-700 dark:text-dark-text">Preview Not Available</h3>
            <p className="text-gray-500 dark:text-dark-subtext mt-2 max-w-md">
                We can't display a preview for this file type (<strong className="text-gray-600 dark:text-dark-text/80">.{fileName.split('.').pop()}</strong>). 
                Please use the download button to view the file on your device.
            </p>
        </div>
    );
};


const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ user, record, onClose, onShareSuccess }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const activeFile = record.files[activeIndex];
    
    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            const content = activeFile.content;
            // If it's a data URL (base64), construct a Blob directly
            if (content.startsWith('data:')) {
                const byteString = atob(content.split(',')[1]);
                const mimeString = content.split(',')[0].split(':')[1].split(';')[0];
                const ab = new ArrayBuffer(byteString.length);
                const ia = new Uint8Array(ab);
                for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                }
                const blob = new Blob([ab], { type: mimeString });
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', activeFile.name);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
            } else {
                // Otherwise fetch from URL then download
                const response = await fetch(content);
                if (!response.ok) throw new Error('Network response was not ok.');
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', activeFile.name);
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Could not download the file. Please try again.');
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
            aria-modal="true"
            role="dialog"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-dark-card rounded-lg shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-subtext/20 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text truncate">{record.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-dark-subtext">{activeFile.name} ({activeIndex + 1} of {record.files.length})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsSharing(true)}
                            className="min-w-[100px] px-4 py-2 bg-white text-primary-green font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition-colors"
                            aria-label="Share record"
                        >
                            Share
                        </button>
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="flex items-center justify-center gap-2 min-w-[150px] px-4 py-2 bg-primary-green text-white font-semibold rounded-lg shadow-sm hover:bg-primary-green-dark transition-colors disabled:bg-gray-400 disabled:cursor-wait"
                            aria-label={`Download ${activeFile.name}`}
                        >
                            {isDownloading ? (
                                <>
                                    <SpinnerIcon className="w-5 h-5" />
                                    <span>Downloading...</span>
                                </>
                            ) : (
                                <>
                                    <DownloadIcon className="w-5 h-5" />
                                    <span>Download</span>
                                </>
                            )}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-gray-500 dark:text-dark-subtext hover:bg-gray-200 dark:hover:bg-dark-bg hover:text-gray-800 transition-colors"
                            aria-label="Close preview"
                        >
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow flex overflow-hidden">
                    {/* Sidebar for file list */}
                    {record.files.length > 1 && (
                        <aside className="w-1/4 xl:w-1/5 bg-gray-50 dark:bg-dark-bg p-2 border-r border-gray-200 dark:border-dark-subtext/20 overflow-y-auto">
                            <nav className="flex flex-col gap-1">
                                {record.files.map((file, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveIndex(index)}
                                        className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                                            activeIndex === index 
                                            ? 'bg-primary-green dark:bg-dark-accent text-white dark:text-dark-bg font-semibold' 
                                            : 'text-gray-700 dark:text-dark-subtext hover:bg-gray-200 dark:hover:bg-dark-card'
                                        }`}
                                    >
                                        <span className="truncate block">{file.name}</span>
                                    </button>
                                ))}
                            </nav>
                        </aside>
                    )}

                    {/* Main preview area */}
                    <main className="flex-grow p-4 overflow-auto flex items-center justify-center bg-gray-100 dark:bg-black/20">
                        <FileViewer file={activeFile} />
                    </main>
                </div>
            </div>
            {isSharing && (
                <ShareRecordModal
                    user={user}
                    record={record}
                    onClose={() => setIsSharing(false)}
                    onShared={() => {
                        setIsSharing(false);
                        onShareSuccess?.();
                    }}
                />
            )}
        </div>
    );
};

export default FilePreviewModal;