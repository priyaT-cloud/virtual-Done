import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { fileToImageDetails } from '../utils/fileUtils';
import type { ImageDetails } from '../types';

interface ImageUploaderProps {
  title: string;
  onImageUpload: (details: ImageDetails | null) => void;
  uploadedImage: ImageDetails | null;
  Icon: React.ElementType;
  promptText: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ title, onImageUpload, uploadedImage, Icon, promptText }) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const details = await fileToImageDetails(file);
        onImageUpload(details);
      } catch (error) {
        console.error("Error processing file:", error);
        onImageUpload(null);
      }
    }
  }, [onImageUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.webp'] },
    multiple: false,
  });

  const borderStyle = isDragActive
    ? 'border-primary'
    : uploadedImage
    ? 'border-primary/50'
    : 'border-gray-500';
  
  const isPersonUploader = promptText.includes("Photo");
  const isGarmentUploader = promptText.includes("Clothing");

  return (
    <div className="bg-panel-bg p-4 rounded-xl flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-center">{title}</h2>
      <div
        {...getRootProps()}
        className={`bg-light-bg rounded-lg flex flex-col items-center justify-center aspect-[9/16] w-full h-full min-h-[300px] md:min-h-full border-2 border-dashed ${borderStyle} cursor-pointer transition-colors duration-300 ${uploadedImage ? 'p-0 border-solid' : 'p-4'}`}
      >
        <input {...getInputProps()} />
        {uploadedImage ? (
          <img
            src={uploadedImage.dataUrl}
            alt="Uploaded content"
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-center text-medium-text">
            <Icon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-light-text">{promptText}</h3>
            <p className="mt-1 text-xs">
              {isDragActive ? 'Drop the file here' : 'Drag & drop or click to upload'}
            </p>
            <p className="mt-4 text-xs text-gray-500 max-w-[80%] mx-auto">
              {isPersonUploader 
                ? "Best results with a clear, full-body photo against a simple background."
                : "Best results with a 'flat lay' photo of the garment against a clean background."
              }
            </p>
          </div>
        )}
      </div>
       {isGarmentUploader && !uploadedImage && (
          <p className="text-center text-xs text-medium-text mt-3">
              Or skip this and describe an outfit in the AI Stylist panel.
          </p>
      )}
    </div>
  );
};

export default ImageUploader;
