import React from 'react';
import { TryOnResult } from '../types';
import DownloadIcon from './icons/DownloadIcon';

interface ResultDisplayProps {
  result: TryOnResult;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result }) => {
  const handleDownload = () => {
    if (!result.image) return;
    const link = document.createElement('a');
    link.href = result.image;
    link.download = 'virtual-try-on-result.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center animate-fade-in p-2">
      {result.image ? (
        <div className="w-full h-full relative group">
          <img src={result.image} alt="Generated virtual try-on" className="w-full h-full object-contain rounded-lg" />
          <button
            onClick={handleDownload}
            className="absolute bottom-4 right-4 bg-primary text-white p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-primary/70"
            aria-label="Download Image"
          >
            <DownloadIcon />
          </button>
        </div>
      ) : (
        <div className="w-full text-center p-4">
          <p className="text-lg text-medium-text">Sorry, we couldn't generate an image this time. Please try again.</p>
        </div>
      )}
      {result.text && (
         <p className="mt-2 text-center text-xs text-medium-text bg-dark-bg/50 p-2 rounded-lg">{result.text}</p>
      )}
    </div>
  );
};

export default ResultDisplay;
