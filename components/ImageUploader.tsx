import React, { useCallback, useRef } from 'react';

interface ImageUploaderProps {
  id: string;
  onImageUpload: (file: File) => void;
  previewUrl: string | null;
  title: string;
  icon: React.ReactNode;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ id, onImageUpload, previewUrl, title, icon }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
    // Reset the input value to allow re-uploading the same file
    event.target.value = '';
  }, [onImageUpload]);

  const handleDrop = useCallback((event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      onImageUpload(file);
    }
  }, [onImageUpload]);

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  
  return (
    <div className="bg-light-bg rounded-lg flex flex-col items-center justify-center aspect-[9/16] w-full h-full min-h-[300px] md:min-h-full">
      <input
        type="file"
        id={id}
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/webp"
        className="hidden"
      />
      <label
        htmlFor={id}
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-500 rounded-lg cursor-pointer transition-colors duration-300 hover:border-primary ${previewUrl ? 'p-0 border-solid border-primary/50' : 'p-4'}`}
        aria-label={title}
      >
        {previewUrl ? (
          <img src={previewUrl} alt={title} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-center text-medium-text">
            <div className="mx-auto h-12 w-12 text-gray-400">{icon}</div>
            <h3 className="mt-4 text-lg font-semibold text-light-text">{title}</h3>
            <p className="mt-1 text-xs">Drag & drop or click to upload</p>
          </div>
        )}
      </label>
    </div>
  );
};

export default ImageUploader;
