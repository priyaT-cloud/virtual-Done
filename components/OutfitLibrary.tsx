import React from 'react';
import { Outfit } from '../types';
import ImageUploader from './ImageUploader';
import GarmentIcon from './icons/GarmentIcon';

interface OutfitLibraryProps {
  outfits: Outfit[];
  onSelect: (outfit: Outfit) => void;
  onUpload: (file: File) => void;
  selectedImageUrl?: string | null;
}

const OutfitLibrary: React.FC<OutfitLibraryProps> = ({ outfits, onSelect, onUpload, selectedImageUrl }) => {
  const tops = outfits.filter(o => o.category === 'Top');
  const bottoms = outfits.filter(o => o.category === 'Bottom');

  return (
    <div className="flex flex-col h-full">
      {/* Uploader section */}
      <div className="mb-4">
        <ImageUploader
          id="clothing-uploader"
          onImageUpload={onUpload}
          previewUrl={selectedImageUrl && !outfits.some(o => o.url === selectedImageUrl) ? selectedImageUrl : null}
          title="Upload Your Own"
          icon={<GarmentIcon />}
        />
      </div>
      
      {/* Library section */}
      <div className="flex-grow overflow-y-auto pr-2">
        <h3 className="font-bold text-lg mb-2 text-medium-text">Or Choose From Library</h3>
        
        {/* Tops */}
        <div>
          <h4 className="font-semibold text-primary mb-2">Tops</h4>
          <div className="grid grid-cols-3 gap-2">
            {tops.map(outfit => (
              <button
                key={outfit.url}
                onClick={() => onSelect(outfit)}
                className={`aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel-bg focus:ring-primary transition-transform duration-200 hover:scale-105 ${selectedImageUrl === outfit.url ? 'ring-2 ring-primary' : ''}`}
                aria-label={`Select ${outfit.description}`}
              >
                <img src={outfit.url} alt={outfit.description} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Bottoms */}
        <div className="mt-4">
          <h4 className="font-semibold text-primary mb-2">Bottoms</h4>
          <div className="grid grid-cols-3 gap-2">
            {bottoms.map(outfit => (
              <button
                key={outfit.url}
                onClick={() => onSelect(outfit)}
                className={`aspect-square rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-panel-bg focus:ring-primary transition-transform duration-200 hover:scale-105 ${selectedImageUrl === outfit.url ? 'ring-2 ring-primary' : ''}`}
                aria-label={`Select ${outfit.description}`}
              >
                <img src={outfit.url} alt={outfit.description} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OutfitLibrary;
