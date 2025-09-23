import React from 'react';
import { ImageDetails } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';

interface ResultDisplayProps {
  image: ImageDetails | null;
  text: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ image, text }) => {
  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image.dataUrl;
    link.download = 'virtual-try-on-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-bold mb-4 text-center">Your Creation</h2>
      <div className="flex-grow flex flex-col items-center justify-center bg-light-bg rounded-lg min-h-[400px]">
        {image ? (
          <div className="w-full h-full relative group">
            <img
              src={image.dataUrl}
              alt="Generated virtual try-on"
              className="w-full h-full object-contain rounded-lg"
            />
            <button
              onClick={handleDownload}
              className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-primary/70"
              aria-label="Download Image"
            >
              <DownloadIcon />
            </button>
          </div>
        ) : (
          <div className="text-center p-4">
            <p className="text-lg text-medium-text">{text || "Your generated image will appear here."}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultDisplay;