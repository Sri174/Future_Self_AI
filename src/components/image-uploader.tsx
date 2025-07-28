"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Camera, CameraOff, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { useToast } from "@/hooks/use-toast";
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string | null) => void;
  autoStartCamera?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, autoStartCamera = false }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const dataUri = e.target?.result as string;
        setImagePreview(dataUri);
        onImageUpload(dataUri);
      };
      reader.readAsDataURL(file);
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] },
    multiple: false,
  });

  // Camera functions
  const startCamera = async () => {
    try {
      setCameraError(null);

      // Check if camera is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this device');
      }

      // Show loading state
      toast({
        title: "Starting Camera",
        description: "Requesting camera permission...",
      });

      let constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 }
        }
      };

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        console.warn('Failed with high resolution, trying basic constraints:', error);
        // Fallback to basic constraints
        constraints = {
          video: {
            facingMode: facingMode
          }
        };
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        // Wait for video to be ready
        await new Promise((resolve, reject) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => {
              console.log('Video metadata loaded');
              resolve(true);
            };
            videoRef.current.onerror = (error) => {
              console.error('Video error:', error);
              reject(error);
            };
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Video loading timeout')), 10000);
          }
        });

        try {
          await videoRef.current.play();
          console.log('Video playing successfully');
        } catch (playError) {
          console.error('Error playing video:', playError);
          throw playError;
        }
      }

      setIsCameraActive(true);
      toast({
        title: "Camera Ready! 📸",
        description: "Smile and click the capture button when ready!",
      });
    } catch (error) {
      console.error('Error accessing camera:', error);
      let errorMessage = 'Failed to access camera';
      let actionMessage = '';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Camera permission denied';
          actionMessage = 'Please click "Allow" when your browser asks for camera permission, then try again.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No camera found';
          actionMessage = 'Please make sure your device has a camera connected.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Camera is busy';
          actionMessage = 'Please close other apps using the camera and try again.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not supported';
          actionMessage = 'Your camera may not support the required settings.';
        } else if (error.name === 'NotSupportedError') {
          errorMessage = 'Camera not supported on this device';
          actionMessage = 'Please try using a different device or browser.';
        } else {
          errorMessage = error.message;
          actionMessage = 'Please try refreshing the page and try again.';
        }
      }

      setCameraError(`${errorMessage}. ${actionMessage}`);
      toast({
        title: "Camera Error",
        description: `${errorMessage}. ${actionMessage}`,
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      // Check if video is ready and has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        toast({
          title: "Camera Not Ready",
          description: "Please wait for the camera to fully load before capturing.",
          variant: "destructive"
        });
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas first
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the video frame
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to data URI with high quality
        const dataUri = canvas.toDataURL('image/jpeg', 0.9);

        // Verify the image was captured properly
        if (dataUri && dataUri.length > 1000) {
          setImagePreview(dataUri);
          onImageUpload(dataUri);
          stopCamera();

          toast({
            title: "Photo Captured! 📸",
            description: "Your photo has been captured successfully.",
          });
        } else {
          toast({
            title: "Capture Failed",
            description: "Failed to capture photo. Please try again.",
            variant: "destructive"
          });
        }
      }
    } else {
      toast({
        title: "Camera Error",
        description: "Camera is not ready. Please try again.",
        variant: "destructive"
      });
    }
  };

  const switchCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    if (isCameraActive) {
      stopCamera();
      // Restart camera with new facing mode
      setTimeout(() => startCamera(), 100);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    onImageUpload(null);
  };

  // Auto-start camera if requested
  useEffect(() => {
    if (autoStartCamera && !isCameraActive && !imagePreview) {
      // Add a small delay to ensure component is fully mounted
      const timer = setTimeout(() => {
        startCamera();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [autoStartCamera, isCameraActive, imagePreview]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Camera view
  if (isCameraActive) {
    return (
      <div className="w-full max-w-md space-y-4">
        <div className="relative bg-black rounded-xl overflow-hidden shadow-2xl">
          <video
            ref={videoRef}
            className="w-full h-80 object-cover"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Camera controls overlay */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={switchCamera}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button
              size="lg"
              onClick={capturePhoto}
              className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16 p-0"
            >
              <div className="w-12 h-12 bg-white border-4 border-gray-300 rounded-full" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={stopCamera}
              className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30"
            >
              <CameraOff className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Position yourself in the frame and click the capture button
          </p>
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
