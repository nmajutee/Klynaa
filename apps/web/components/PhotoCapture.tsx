import React, { useState, useRef } from 'react';

interface PhotoCaptureProps {
    onCapture: (file: File, location?: { lat: number; lng: number }) => void;
    type: 'before' | 'after';
    disabled?: boolean;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onCapture, type, disabled = false }) => {
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [capturing, setCapturing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setCapturing(true);

        // Get GPS location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setLocation(coords);
                    onCapture(file, coords);
                    setCapturing(false);
                },
                (error) => {
                    console.warn('Geolocation failed:', error);
                    onCapture(file);
                    setCapturing(false);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
            );
        } else {
            onCapture(file);
            setCapturing(false);
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
            <h3 className="text-lg font-medium mb-4 text-gray-900">
                📷 Capture {type === 'before' ? 'Before' : 'After'} Photo
            </h3>

            <p className="text-sm text-gray-600 mb-4">
                Take a clear photo showing the {type === 'before' ? 'full bin ready for pickup' : 'empty bin after pickup'}
            </p>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
                disabled={disabled || capturing}
            />

            <button
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || capturing}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${disabled || capturing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
            >
                {capturing ? (
                    <>
                        <span className="inline-block animate-spin mr-2">⏳</span>
                        Getting Location...
                    </>
                ) : (
                    <>
                        📷 Take {type === 'before' ? 'Before' : 'After'} Photo
                    </>
                )}
            </button>

            {location && (
                <div className="mt-3 p-2 bg-green-50 rounded text-sm text-green-700">
                    📍 GPS Location: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
                📱 Camera will open automatically
            </div>
        </div>
    );
};

export default PhotoCapture;