import React, { useState, useCallback } from 'react';
import { ImageDetails, TryOnResult } from './types';
import { fileToImageDetails } from './utils/fileUtils';
import { virtualTryOn } from './services/geminiService';

import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import PersonIcon from './components/icons/PersonIcon';
import GarmentIcon from './components/icons/GarmentIcon';

const App: React.FC = () => {
  const [personImage, setPersonImage] = useState<ImageDetails | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageDetails | null>(null);
  const [result, setResult] = useState<TryOnResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handlePersonImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      const details = await fileToImageDetails(file);
      setPersonImage(details);
    } catch (err) {
      setError('Failed to load person image.');
      console.error(err);
    }
  }, []);

  const handleClothingImageUpload = useCallback(async (file: File) => {
    try {
      setError(null);
      setResult(null);
      const details = await fileToImageDetails(file);
      setClothingImage(details);
    } catch (err) {
      setError('Failed to load clothing image.');
      console.error(err);
    }
  }, []);

  const handleTryOn = useCallback(async () => {
    if (!personImage || !clothingImage) {
      setError('Please provide an image of a person and a clothing item.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const tryOnResult = await virtualTryOn(personImage, clothingImage);
      setResult(tryOnResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      setError(`Failed to generate image. ${errorMessage}`);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [personImage, clothingImage]);

  const handleReset = useCallback(() => {
    setPersonImage(null);
    setClothingImage(null);
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);
  
  const isTryOnDisabled = !personImage || !clothingImage || isLoading;

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans flex flex-col items-center p-4">
      <Header onReset={handleReset} />

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg my-4 w-full max-w-6xl text-center animate-fade-in">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      <main className="w-full max-w-7xl flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        {/* Panel 1: Person Uploader */}
        <div className="bg-panel-bg p-4 rounded-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center">1. The Person</h2>
          <ImageUploader
            id="person-uploader"
            onImageUpload={handlePersonImageUpload}
            previewUrl={personImage?.dataUrl ?? null}
            title="Upload a Photo"
            icon={<PersonIcon />}
          />
        </div>

        {/* Panel 2: Clothing Uploader */}
        <div className="bg-panel-bg p-4 rounded-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center">2. The Outfit</h2>
          <ImageUploader
            id="clothing-uploader"
            onImageUpload={handleClothingImageUpload}
            previewUrl={clothingImage?.dataUrl ?? null}
            title="Upload an Outfit"
            icon={<GarmentIcon />}
          />
        </div>

        {/* Panel 3: Result */}
        <div className="bg-panel-bg p-4 rounded-xl flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-center">3. The Result</h2>
          <div className="flex-grow flex flex-col items-center justify-center bg-light-bg rounded-lg min-h-[300px] md:min-h-full">
            {isLoading ? (
               <div className="text-center">
                <Spinner />
                <p className="mt-4 text-lg text-medium-text animate-pulse">
                  Creating your look...
                </p>
              </div>
            ) : result ? (
              <ResultDisplay result={result} />
            ) : (
              <div className="text-center text-medium-text p-4">
                <p>Your creation will appear here!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="mt-6">
        <button
          onClick={handleTryOn}
          disabled={isTryOnDisabled}
          className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-primary/50 transform hover:scale-105"
          aria-label="Generate Virtual Try-On"
        >
          Virtual Try-On
        </button>
      </div>
    </div>
  );
};

export default App;
