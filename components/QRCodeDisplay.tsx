import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import DownloadIcon from './icons/DownloadIcon';
import CloseIcon from './icons/CloseIcon';

interface QRCodeDisplayProps {
    healthId: string;
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ healthId, userName, isOpen, onClose }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [qrGenerated, setQrGenerated] = useState(false);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            generateQRCode();
        }
    }, [isOpen, healthId]);

    const generateQRCode = async () => {
        if (!canvasRef.current) return;
        
        try {
            await QRCode.toCanvas(canvasRef.current, healthId, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrGenerated(true);
        } catch (error) {
            console.error('Error generating QR code:', error);
        }
    };

    const handleDownload = () => {
        if (!canvasRef.current) return;
        
        const url = canvasRef.current.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${healthId}-qrcode.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white dark:bg-dark-card rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-dark-subtext/20">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-dark-text">Your QR Code</h2>
                    <button 
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-bg transition-colors"
                    >
                        <CloseIcon className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="p-6 space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-600 dark:text-dark-subtext mb-4">
                            Share this QR code to allow others to quickly add you by scanning
                        </p>
                        
                        <div className="flex justify-center mb-4">
                            <div className="bg-white p-4 rounded-lg shadow-md">
                                <canvas ref={canvasRef} />
                            </div>
                        </div>
                        
                        <div className="bg-light-green dark:bg-dark-bg p-3 rounded-lg">
                            <p className="text-xs text-gray-500 dark:text-dark-subtext">Health ID</p>
                            <p className="text-lg font-bold text-gray-800 dark:text-dark-text">{healthId}</p>
                            <p className="text-sm text-gray-600 dark:text-dark-subtext">{userName}</p>
                        </div>
                    </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 dark:bg-dark-bg/50 rounded-b-lg flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text hover:bg-gray-200 dark:hover:bg-dark-bg rounded-md transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={handleDownload}
                        disabled={!qrGenerated}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-green dark:bg-dark-accent rounded-md shadow-sm hover:bg-opacity-80 disabled:bg-gray-400 flex items-center gap-2 transition-colors"
                    >
                        <DownloadIcon className="w-4 h-4" />
                        Download QR Code
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QRCodeDisplay;
