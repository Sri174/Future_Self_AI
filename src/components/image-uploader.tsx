{"use client";

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X } from 'lucide-react';
import { Button } from './ui/button';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (dataUri: string | null) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

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

  const removeImage = () => {
    setImagePreview(null);
    onImageUpload(null);
  };

  if (imagePreview) {
    return (
      <div className="relative w-full max-w-sm">
        <Image src={imagePreview} alt="Preview" width={400} height={400} className="rounded-lg shadow-md" />
        <Button
          variant="destructive"
          size="icon"
          className="absolute -top-3 -right-3 rounded-full h-8 w-8"
          onClick={removeImage}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full max-w-md p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors duration-300
      ${isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center space-y-4">
        <UploadCloud className={`h-12 w-12 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
        <p className="text-lg font-medium">
          {isDragActive ? "Drop the image here..." : "Drag & drop an image, or click to select"}
        </p>
        <p className="text-sm text-muted-foreground">PNG, JPG up to 10MB</p>
      </div>
    </div>
  );
};

export default ImageUploader;
