import React, { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';
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
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        if (isOpen) {
            startCamera();
        }

        return () => {
            stopCamera();
        };
    }, [isOpen]);

    const startCamera = async () => {
        try {
            setError('');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
                streamRef.current = stream;
                setIsScanning(true);
                scanQRCode();
            }
        } catch (err: any) {
            console.error('Error accessing camera:', err);
            setError('Unable to access camera. Please check permissions or try uploading an image.');
        }
    };

    const scanQRCode = () => {
        if (!videoRef.current || !canvasRef.current || !isOpen) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) return;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, imageData.width, imageData.height);

            if (code) {
                handleScanSuccess(code.data);
                return;
            }
        }

        animationRef.current = requestAnimationFrame(scanQRCode);
    };

    const stopCamera = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }

        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setIsScanning(false);
    };

    const handleScanSuccess = (decodedText: string) => {
        stopCamera();
        onScanSuccess(decodedText);
        onClose();
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            setError('');
            
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.onload = () => {
                    if (!canvasRef.current) return;
                    
                    const canvas = canvasRef.current;
                    const context = canvas.getContext('2d');
                    if (!context) return;

                    canvas.width = img.width;
                    canvas.height = img.height;
                    context.drawImage(img, 0, 0);

                    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                    const code = jsQR(imageData.data, imageData.width, imageData.height);

                    if (code) {
                        handleScanSuccess(code.data);
                    } else {
                        setError('Unable to read QR code from this image. Please try another image.');
                    }
                };
                img.src = e.target?.result as string;
            };

            reader.readAsDataURL(file);
        } catch (err: any) {
            console.error('Error scanning file:', err);
            setError('Unable to read QR code from this image. Please try another image.');
        }
    };

    const handleGalleryClick = () => {
        fileInputRef.current?.click();
    };

    const handleClose = () => {
        stopCamera();
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
                <div className="flex-1 relative overflow-hidden bg-black">
                    {/* Video element for camera feed */}
                    <video
                        ref={videoRef}
                        className="absolute inset-0 w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                    
                    {/* Hidden canvas for QR code processing */}
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {!isScanning && !error && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                            <p className="text-white text-lg drop-shadow-lg">
                                Initializing camera...
                            </p>
                        </div>
                    )}
                    
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
                    <div className="absolute top-20 left-4 right-4 z-30 bg-red-500/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                        <p className="text-sm text-white text-center">{error}</p>
                    </div>
                )}

                {/* Bottom Controls */}
                <div className="absolute bottom-0 left-0 right-0 z-30 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent">
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
