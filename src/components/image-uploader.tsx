"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Camera, CameraOff, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  // Auto-start camera when component mounts
  useEffect(() => {
    startCamera();

    // Cleanup on unmount
    return () => {
      stopCamera();
    };
  }, []);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUri = e.target?.result as string;
        setImagePreview(dataUri);
        onImageUpload(dataUri);
        toast({
          title: "Photo Uploaded!",
          description: "Your photo has been uploaded successfully.",
        });
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  // Camera functions
  const startCamera = async () => {
    console.log('🚀 Starting camera...');
    try {
      setCameraError(null);
      setVideoReady(false);

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Set camera active first to show loading state
      setIsCameraActive(true);

      // Get camera stream - try simple approach first
      let stream: MediaStream;
      try {
        console.log('📹 Requesting camera with facingMode:', facingMode);
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: facingMode,
            width: { ideal: 640 },
            height: { ideal: 480 }
          }
        });
      } catch (error) {
        // Fallback to any camera
        console.log('🔄 Fallback to any camera');
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      console.log('✅ Camera stream obtained');
      streamRef.current = stream;

      if (videoRef.current) {
        const video = videoRef.current;

        // Clear any existing source first
        video.srcObject = null;

        // Set the new stream
        video.srcObject = stream;
        video.playsInline = true;
        video.muted = true;
        video.autoplay = true;

        // Wait for video to load metadata
        const handleLoadedMetadata = () => {
          console.log('📺 Video metadata loaded, setting ready');
          setVideoReady(true);
        };

        video.addEventListener('loadedmetadata', handleLoadedMetadata, { once: true });

        // Also try to play the video
        try {
          await video.play();
          console.log('▶️ Video playing');
        } catch (playError) {
          console.warn('Video play failed (but continuing):', playError);
          // Set ready anyway in case autoplay is blocked
          setVideoReady(true);
        }

        // Fallback timeout in case loadedmetadata never fires
        setTimeout(() => {
          if (!videoReady) {
            console.log('⏰ Timeout fallback - setting video ready');
            setVideoReady(true);
          }
        }, 3000);
      }

    } catch (error) {
      console.error('❌ Camera error:', error);
      let errorMessage = 'Failed to access camera';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied. Please allow camera access and try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found. Please make sure your device has a camera.';
        } else {
          errorMessage = error.message;
        }
      }

      setCameraError(errorMessage);
      toast({
        title: "Camera Error",
        description: errorMessage,
        variant: "destructive",
      });

      setIsCameraActive(false);
      setVideoReady(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setVideoReady(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      toast({
        title: "Capture Failed",
        description: "Camera not ready. Please try again.",
        variant: "destructive",
      });
      return;
    }

    const canvas = canvasRef.current;
    const video = videoRef.current;

    // Check if video has valid dimensions
    if (!video.videoWidth || !video.videoHeight) {
      toast({
        title: "Capture Failed",
        description: "Camera feed not ready. Please wait a moment and try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Draw the video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to data URL
      const dataUri = canvas.toDataURL('image/jpeg', 0.8);

      setImagePreview(dataUri);
      onImageUpload(dataUri);
      stopCamera();

      toast({
        title: "Photo Captured! 📸",
        description: "Your photo has been captured successfully.",
      });
    } catch (error) {
      console.error('Error capturing photo:', error);
      toast({
        title: "Capture Failed",
        description: "Failed to capture photo. Please try again.",
        variant: "destructive",
      });
    }
  };

  const switchCamera = async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);

    if (isCameraActive) {
      stopCamera();
      // Wait a bit before restarting with new facing mode
      setTimeout(() => {
        startCamera();
      }, 500);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onImageUpload(null);
  };

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera view
  if (isCameraActive) {
    console.log('🎥 Rendering camera view - isCameraActive:', isCameraActive, 'videoReady:', videoReady);
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover bg-gray-800"
            autoPlay
            playsInline
            muted
            onLoadedMetadata={() => {
              console.log('🎬 Video metadata loaded in render');
              if (videoRef.current) {
                console.log('📐 Final video dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
                console.log('📺 Video element state:', {
                  srcObject: !!videoRef.current.srcObject,
                  readyState: videoRef.current.readyState,
                  paused: videoRef.current.paused,
                  currentTime: videoRef.current.currentTime
                });
                // Ensure video ready is set when metadata loads
                if (!videoReady) {
                  console.log('🚀 Setting video ready from metadata event');
                  setVideoReady(true);
                }
              }
            }}
            onPlay={() => {
              console.log('▶️ Video play event in render');
              if (!videoReady) {
                console.log('🚀 Setting video ready from play event');
                setVideoReady(true);
              }
            }}
            onError={(e) => {
              console.error('❌ Video error in render:', e);
              setCameraError('Video playback failed. Please try again.');
            }}
            onCanPlay={() => {
              console.log('✅ Video can play');
              if (!videoReady) {
                console.log('🚀 Setting video ready from canPlay event');
                setVideoReady(true);
              }
            }}
            onLoadStart={() => console.log('🔄 Video load start')}
            style={{
              minHeight: '320px',
              backgroundColor: '#1f2937',
              display: 'block',
              width: '100%'
            }}
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Loading overlay - show only when camera is starting */}
          {isCameraActive && !videoReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Loading camera...</p>
              </div>
            </div>
          )}

          {/* Camera controls overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={switchCamera}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              title="Switch Camera"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              onClick={capturePhoto}
              className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16 p-0 shadow-lg"
              title="Capture Photo"
            >
              <div className="w-12 h-12 bg-white border-4 border-gray-300 rounded-full" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={stopCamera}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
              title="Stop Camera"
            >
              <CameraOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Position yourself in the frame and click the capture button
          </p>
          <p className="text-xs text-muted-foreground">
            If the camera appears black, try switching cameras or refreshing the page
          </p>

          {/* Debug info */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Camera: {facingMode === 'user' ? 'Front' : 'Back'}</div>
            {videoRef.current && (
              <div>
                Status: {videoRef.current.videoWidth ?
                  `${videoRef.current.videoWidth}x${videoRef.current.videoHeight}` :
                  'Loading...'
                }
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Image preview
  if (imagePreview) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <Image
            src={imagePreview}
            alt="Preview"
            width={400}
            height={400}
            className="rounded-xl shadow-2xl w-full h-80 object-cover"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute -top-3 -right-3 rounded-full h-10 w-10 shadow-lg"
            onClick={removeImage}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Looking good! You can upload a different photo if you'd like.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Camera Error Display */}
      {cameraError && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-red-700 dark:text-red-300 text-sm text-center mb-3">
            {cameraError}
          </p>
          <div className="flex justify-center">
            <Button
              onClick={startCamera}
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Camera className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      )}

      {/* Upload Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* File Upload */}
        <div
          {...getRootProps()}
          className={`p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 hover:scale-105
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <UploadCloud className={`h-10 w-10 transition-colors ${isDragActive ? 'text-blue-500' : 'text-gray-500'}`} />
            <div>
              <p className="font-medium text-sm">
                {isDragActive ? "Drop here!" : "Upload Photo"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG up to 10MB
              </p>
            </div>
          </div>
        </div>

        {/* Camera Option */}
        <div
          onClick={startCamera}
          className="p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer transition-all duration-300 hover:scale-105 hover:border-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <Camera className="h-10 w-10 text-gray-500 hover:text-green-500 transition-colors" />
            <div>
              <p className="font-medium text-sm">Take Photo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Use your camera
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Choose how you'd like to add your photo
        </p>
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <span>Upload from device</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Take with camera</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageUploader;
