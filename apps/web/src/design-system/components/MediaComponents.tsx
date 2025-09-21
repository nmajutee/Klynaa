import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';
import { Icons } from './Icons';

// Types
export interface MediaFile {
  id: string;
  file: File;
  url: string;
  type: 'image' | 'video';
  size: number;
  name: string;
  uploadProgress?: number;
  uploaded?: boolean;
  error?: string;
}

export interface CameraSettings {
  resolution: 'low' | 'medium' | 'high';
  facingMode: 'user' | 'environment';
  flashMode: 'off' | 'on' | 'auto';
}

// Camera Component
export interface CameraProps {
  onCapture?: (file: File, url: string) => void;
  onError?: (error: string) => void;
  settings?: Partial<CameraSettings>;
  disabled?: boolean;
  className?: string;
}

export const Camera: React.FC<CameraProps> = ({
  onCapture,
  onError,
  settings = {},
  disabled = false,
  className,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [currentSettings, setCurrentSettings] = useState<CameraSettings>({
    resolution: 'medium',
    facingMode: 'environment',
    flashMode: 'off',
    ...settings,
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const getConstraints = (): MediaStreamConstraints => {
    const resolutionMap = {
      low: { width: 640, height: 480 },
      medium: { width: 1280, height: 720 },
      high: { width: 1920, height: 1080 },
    };

    return {
      video: {
        ...resolutionMap[currentSettings.resolution],
        facingMode: currentSettings.facingMode,
      },
      audio: false,
    };
  };

  const startCamera = async () => {
    if (disabled) return;

    try {
      const constraints = getConstraints();
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      setStream(mediaStream);
      setIsActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Camera error:', error);
      onError?.('Failed to access camera. Please check permissions.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current || isCapturing) return;

    setIsCapturing(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas context not available');

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob
      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create image blob');

        const timestamp = Date.now();
        const file = new File([blob], `photo_${timestamp}.jpg`, {
          type: 'image/jpeg',
          lastModified: timestamp,
        });

        const url = URL.createObjectURL(file);
        onCapture?.(file, url);
        setIsCapturing(false);
      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Capture error:', error);
      onError?.('Failed to capture photo');
      setIsCapturing(false);
    }
  };

  const toggleCamera = () => {
    setCurrentSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
    }));

    if (isActive) {
      stopCamera();
      setTimeout(startCamera, 100);
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={cn('relative bg-neutral-900 rounded-lg overflow-hidden', className)}>
      {/* Video Preview */}
      <div className="relative aspect-[4/3]">
        {isActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-neutral-800 text-white">
            <div className="text-center">
              <Icons.MapPin className="h-12 w-12 mx-auto mb-2" />
              <p className="text-sm">Camera not active</p>
            </div>
          </div>
        )}

        {/* Camera overlay */}
        {isActive && (
          <>
            {/* Viewfinder */}
            <div className="absolute inset-4 border-2 border-white/30 rounded-lg pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-l-2 border-t-2 border-white"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-r-2 border-t-2 border-white"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-l-2 border-b-2 border-white"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-r-2 border-b-2 border-white"></div>
            </div>

            {/* Settings overlay */}
            <div className="absolute top-4 right-4 flex space-x-2">
              <button
                onClick={toggleCamera}
                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                disabled={disabled}
              >
                <Icons.User className="h-4 w-4" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-neutral-900 flex items-center justify-center space-x-6">
        {!isActive ? (
          <button
            onClick={startCamera}
            disabled={disabled}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Start Camera
          </button>
        ) : (
          <>
            <button
              onClick={stopCamera}
              className="p-3 bg-neutral-700 text-white rounded-full hover:bg-neutral-600 transition-colors"
            >
              <Icons.X className="h-6 w-6" />
            </button>

            <button
              onClick={capturePhoto}
              disabled={isCapturing}
              className="relative p-4 bg-white text-neutral-900 rounded-full hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isCapturing ? (
                <div className="animate-spin h-8 w-8">
                  <Icons.Settings className="h-full w-full" />
                </div>
              ) : (
                <div className="h-8 w-8 rounded-full bg-current"></div>
              )}
            </button>

            <div className="w-12 h-12"></div> {/* Spacer for alignment */}
          </>
        )}
      </div>

      {/* Hidden canvas for photo capture */}
      <canvas
        ref={canvasRef}
        className="hidden"
      />
    </div>
  );
};

// Image Preview Component
export interface ImagePreviewProps {
  src: string;
  alt?: string;
  onRemove?: () => void;
  onView?: () => void;
  loading?: boolean;
  error?: string;
  className?: string;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt = 'Image preview',
  onRemove,
  onView,
  loading = false,
  error,
  className,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={cn('relative group', className)}>
      <div className="relative aspect-square bg-neutral-100 rounded-lg overflow-hidden">
        {/* Loading State */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
            <div className="animate-spin h-6 w-6 text-neutral-400">
              <Icons.Settings className="h-full w-full" />
            </div>
          </div>
        )}

        {/* Error State */}
        {(error || imageError) && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-100 text-neutral-500">
            <div className="text-center">
              <Icons.AlertTriangle className="h-6 w-6 mx-auto mb-1" />
              <p className="text-xs">{error || 'Failed to load'}</p>
            </div>
          </div>
        )}

        {/* Image */}
        {!loading && !error && (
          <img
            src={src}
            alt={alt}
            className={cn(
              'w-full h-full object-cover transition-opacity duration-200',
              imageLoaded ? 'opacity-100' : 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            onClick={onView}
          />
        )}

        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-2">
          {onView && (
            <button
              onClick={onView}
              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              <Icons.Search className="h-4 w-4" />
            </button>
          )}

          {onRemove && (
            <button
              onClick={onRemove}
              className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
            >
              <Icons.Delete className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// File Upload Component
export interface FileUploadProps {
  onFilesSelect?: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // bytes
  maxFiles?: number;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFilesSelect,
  accept = 'image/*',
  multiple = true,
  maxSize = 5 * 1024 * 1024, // 5MB
  maxFiles = 5,
  disabled = false,
  className,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFiles = (files: FileList): File[] => {
    const validFiles: File[] = [];

    Array.from(files).forEach(file => {
      if (file.size > maxSize) {
        console.warn(`File ${file.name} exceeds size limit`);
        return;
      }

      if (validFiles.length >= maxFiles) {
        console.warn('Maximum file limit reached');
        return;
      }

      validFiles.push(file);
    });

    return validFiles;
  };

  const handleFileSelect = (files: FileList) => {
    if (disabled) return;

    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      onFilesSelect?.(validFiles);
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);

    if (event.dataTransfer.files) {
      handleFileSelect(event.dataTransfer.files);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
          dragOver
            ? 'border-primary-400 bg-primary-50'
            : 'border-neutral-300 hover:border-neutral-400',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <div className="flex flex-col items-center space-y-3">
          <div className={cn(
            'p-3 rounded-full',
            dragOver ? 'bg-primary-100 text-primary-600' : 'bg-neutral-100 text-neutral-500'
          )}>
            <Icons.Plus className="h-6 w-6" />
          </div>

          <div>
            <p className="text-sm font-medium text-neutral-900">
              {dragOver ? 'Drop files here' : 'Click to upload or drag and drop'}
            </p>
            <p className="text-xs text-neutral-500 mt-1">
              {accept} up to {formatFileSize(maxSize)}
              {multiple && `, max ${maxFiles} files`}
            </p>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
};

// Media Gallery Component
export interface MediaGalleryProps {
  files: MediaFile[];
  onRemove?: (id: string) => void;
  onPreview?: (file: MediaFile) => void;
  onReorder?: (files: MediaFile[]) => void;
  maxDisplay?: number;
  className?: string;
}

export const MediaGallery: React.FC<MediaGalleryProps> = ({
  files,
  onRemove,
  onPreview,
  onReorder,
  maxDisplay = 6,
  className,
}) => {
  const displayFiles = files.slice(0, maxDisplay);
  const remainingCount = Math.max(0, files.length - maxDisplay);

  return (
    <div className={cn('space-y-4', className)}>
      {files.length === 0 ? (
        <div className="text-center py-8 text-neutral-500">
          <Icons.Search className="h-8 w-8 mx-auto mb-2" />
          <p className="text-sm">No media files</p>
        </div>
      ) : (
        <>
          {/* Image Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {displayFiles.map((file) => (
              <div key={file.id} className="relative">
                <ImagePreview
                  src={file.url}
                  alt={file.name}
                  loading={!file.uploaded && file.uploadProgress !== undefined}
                  error={file.error}
                  onView={() => onPreview?.(file)}
                  onRemove={() => onRemove?.(file.id)}
                />

                {/* Upload Progress */}
                {!file.uploaded && file.uploadProgress !== undefined && (
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="bg-black/50 rounded-full p-1">
                      <div
                        className="bg-primary-600 rounded-full h-1 transition-all duration-300"
                        style={{ width: `${file.uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* File Info */}
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs rounded px-1">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                </div>
              </div>
            ))}

            {/* Show More Button */}
            {remainingCount > 0 && (
              <div className="relative aspect-square bg-neutral-100 rounded-lg flex items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-300">
                <div className="text-center">
                  <Icons.Plus className="h-6 w-6 mx-auto mb-1" />
                  <p className="text-xs font-medium">+{remainingCount} more</p>
                </div>
              </div>
            )}
          </div>

          {/* Summary */}
          <div className="flex items-center justify-between text-sm text-neutral-600">
            <span>{files.length} files</span>
            <span>
              {(files.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(1)}MB total
            </span>
          </div>
        </>
      )}
    </div>
  );
};

// Media Uploader Component (combines camera and file upload)
export interface MediaUploaderProps {
  onFilesAdded?: (files: MediaFile[]) => void;
  onError?: (error: string) => void;
  maxFiles?: number;
  maxSize?: number;
  accept?: string;
  showCamera?: boolean;
  className?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  onFilesAdded,
  onError,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024,
  accept = 'image/*',
  showCamera = true,
  className,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');

  const createMediaFile = (file: File): MediaFile => {
    return {
      id: Math.random().toString(36).substr(2, 9),
      file,
      url: URL.createObjectURL(file),
      type: file.type.startsWith('image/') ? 'image' : 'video',
      size: file.size,
      name: file.name,
      uploaded: false,
      uploadProgress: 0,
    };
  };

  const handleFilesSelect = (files: File[]) => {
    const mediaFiles = files.map(createMediaFile);
    onFilesAdded?.(mediaFiles);
  };

  const handleCameraCapture = (file: File, url: string) => {
    const mediaFile: MediaFile = {
      id: Math.random().toString(36).substr(2, 9),
      file,
      url,
      type: 'image',
      size: file.size,
      name: file.name,
      uploaded: false,
      uploadProgress: 0,
    };
    onFilesAdded?.([mediaFile]);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab Navigation */}
      {showCamera && (
        <div className="flex items-center bg-neutral-100 rounded-md p-1">
          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded transition-colors',
              activeTab === 'upload'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Icons.Plus className="h-4 w-4 inline mr-2" />
            Upload Files
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium rounded transition-colors',
              activeTab === 'camera'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-600 hover:text-neutral-900'
            )}
          >
            <Icons.MapPin className="h-4 w-4 inline mr-2" />
            Camera
          </button>
        </div>
      )}

      {/* Content */}
      <div>
        {activeTab === 'upload' ? (
          <FileUpload
            onFilesSelect={handleFilesSelect}
            accept={accept}
            maxSize={maxSize}
            maxFiles={maxFiles}
          />
        ) : (
          <Camera
            onCapture={handleCameraCapture}
            onError={onError}
          />
        )}
      </div>
    </div>
  );
};

export default Camera;