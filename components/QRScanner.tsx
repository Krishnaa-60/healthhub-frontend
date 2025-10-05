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
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState('');
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const qrRegionId = 'qr-reader-region';

    useEffect(() => {
        if (isOpen) {
            startCameraScanner();
        }

        return () => {
            stopScanner();
        };
    }, [isOpen]);

    const startCameraScanner = async () => {
        try {
            setError('');
            
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(qrRegionId);
            }

            const config = {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.777778, // 16:9 aspect ratio
                disableFlip: false,
                videoConstraints: {
                    facingMode: "environment",
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
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
            
            setIsScanning(true);
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
            className="fixed inset-0 bg-black flex items-center justify-center z-50"
            onClick={handleClose}
        >
            <div 
                className="relative w-full h-full flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header with close button */}
                <div className="absolute top-0 left-0 right-0 z-30 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
                    <h2 className="text-lg font-bold text-white drop-shadow-lg">{title}</h2>
                    <button 
                        onClick={handleClose}
                        className="p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                    >
                        <CloseIcon className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Camera Scanner Area - Full Screen */}
                <div className="flex-1 relative overflow-hidden">
                    <style>{`
                        #${qrRegionId} {
                            width: 100% !important;
                            height: 100% !important;
                            border: none !important;
                        }
                        #${qrRegionId} video {
                            width: 100% !important;
                            height: 100% !important;
                            object-fit: cover !important;
                            border: none !important;
                        }
                        #${qrRegionId} canvas {
                            display: none !important;
                        }
                        #${qrRegionId} > div {
                            width: 100% !important;
                            height: 100% !important;
                        }
                    `}</style>
                    <div id={qrRegionId} className="w-full h-full">
                        {!isScanning && !error && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                                <p className="text-white text-lg drop-shadow-lg">
                                    Initializing camera...
                                </p>
                            </div>
                        )}
                    </div>
                    
                    {/* Scanning Frame Overlay */}
                    {isScanning && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                            <div className="relative w-64 h-64">
                                {/* Corner brackets */}
                                <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-lg"></div>
                                <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-lg"></div>
                                <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-lg"></div>
                                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-lg"></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="absolute top-20 left-4 right-4 bg-red-500/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <p className="text-sm text-white text-center">{error}</p>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="flex items-center justify-center gap-8">
                        {/* Gallery Button */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <button
                            onClick={handleGalleryClick}
                            className="flex flex-col items-center gap-1 p-3 rounded-full bg-black/50 hover:bg-black/70 transition-colors"
                            title="Import from Gallery"
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-white">Gallery</span>
                        </button>
                    </div>
                    
                    {/* Instruction Text */}
                    <p className="text-center text-white text-sm mt-4 px-4 drop-shadow-lg">
                        Position QR code within the frame or import from gallery
                    </p>
                </div>
            </div>
        </div>
    );
};

export default QRScanner;
