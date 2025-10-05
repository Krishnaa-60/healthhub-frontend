import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import CloseIcon from './icons/CloseIcon';

interface QRScannerProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
    title?: string;
}

const QRScanner: React.FC<QRScannerProps> = ({ 
    isOpen, 
    onClose, 
    onScanSuccess,
    title = "Scan QR Code"
}) => {
    const [scannerMode, setScannerMode] = useState<'camera' | 'file'>('camera');
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const qrRegionId = 'qr-reader-region';

    useEffect(() => {
        if (isOpen && scannerMode === 'camera') {
            startCameraScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen, scannerMode]);

    const startCameraScanner = async () => {
        try {
            setError('');
            setIsScanning(true);
            
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrRegionId);
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0
            };

            await scannerRef.current.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore scan errors (they happen continuously while scanning)
                }
            );
        } catch (err) {
            console.error('Error starting camera scanner:', err);
            setError('Unable to access camera. Please check permissions or try uploading an image.');
            setIsScanning(false);
        }
    };

    const stopScanner = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
                scannerRef.current.clear();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
            setIsScanning(false);
        }
    };

    const handleScanSuccess = (decodedText: string) => {
        stopScanner();
        onScanSuccess(decodedText);
        onClose();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setError('');
            
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrRegionId);
            }

            const result = await scannerRef.current.scanFile(file, true);
            handleScanSuccess(result);
        } catch (err) {
            console.error('Error scanning file:', err);
            setError('Unable to read QR code from this image. Please try another image.');
        }
    };

    const handleGalleryClick = () => {
        fileInputRef.current?.click();
    };

    const handleClose = () => {
        stopScanner();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div 
                className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">{title}</h2>
                    <button 
                        onClick={handleClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    {/* Mode Selector */}
                    <div className="flex gap-2 mb-4">
                        <button
                            onClick={() => {
                                stopScanner();
                                setScannerMode('camera');
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                scannerMode === 'camera'
                                    ? 'bg-primary-green text-white dark:bg-dark-accent'
                                    : 'bg-gray-200 text-gray-700 dark:bg-dark-bg dark:text-dark-text'
                            }`}
                        >
                            📷 Camera
                        </button>
                        <button
                            onClick={() => {
                                stopScanner();
                                setScannerMode('file');
                            }}
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                                scannerMode === 'file'
                                    ? 'bg-primary-green text-white dark:bg-dark-accent'
                                    : 'bg-gray-200 text-gray-700 dark:bg-dark-bg dark:text-dark-text'
                            }`}
                        >
                            🖼️ Gallery
                        </button>
                    </div>

                    {/* Scanner/Upload Area */}
                    <div className="bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden">
                        {scannerMode === 'camera' ? (
                            <div>
                                <div id={qrRegionId} className="w-full min-h-[300px] flex items-center justify-center">
                                    {!isScanning && !error && (
                                        <p className="text-gray-500 dark:text-dark-subtext">
                                            Initializing camera...
                                        </p>
                                    )}
                                </div>
                                {isScanning && (
                                    <p className="text-center text-sm text-gray-600 dark:text-dark-subtext p-4">
                                        Position the QR code within the frame
                                    </p>
                                )}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <div id={qrRegionId} className="hidden"></div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    className="hidden"
                                />
                                <button
                                    onClick={handleGalleryClick}
                                    className="w-full px-6 py-12 border-2 border-dashed border-gray-300 dark:border-dark-subtext/30 rounded-lg hover:border-primary-green dark:hover:border-dark-accent transition-colors"
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        <svg 
                                            className="w-16 h-16 text-gray-400 dark:text-dark-subtext" 
                                            fill="none" 
                                            stroke="currentColor" 
                                            viewBox="0 0 24 24"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-lg font-semibold text-gray-700 dark:text-dark-text">
                                                Upload QR Code Image
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-dark-subtext mt-1">
                                                Click to select from gallery
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-lg p-3">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                    )}

                    <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-lg p-3">
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                            💡 <strong>Tip:</strong> Make sure the QR code is well-lit and clearly visible for best results.
                        </p>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-bg rounded-md transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
