import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import ResultDisplay from './components/ResultDisplay';
import Spinner from './components/Spinner';
import AIChatbot from './components/AIChatbot';
import { PersonIcon } from './components/icons/PersonIcon';
import { GarmentIcon } from './components/icons/GarmentIcon';
import { virtualTryOn, editImage, getFashionAdvice } from './services/geminiService';
import type { ImageDetails, ChatMessage } from './types';

function App() {
  const [personImage, setPersonImage] = useState<ImageDetails | null>(null);
  const [clothingImage, setClothingImage] = useState<ImageDetails | null>(null);
  const [resultImage, setResultImage] = useState<ImageDetails | null>(null);
  const [resultText, setResultText] = useState<string>('');
  const [isTryOnLoading, setIsTryOnLoading] = useState<boolean>(false);
  const [isAiChatLoading, setIsAiChatLoading] = useState<boolean>(false);
  const [isAdviceLoading, setIsAdviceLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleReset = useCallback(() => {
    setPersonImage(null);
    setClothingImage(null);
    setResultImage(null);
    setResultText('');
    setIsTryOnLoading(false);
    setIsAiChatLoading(false);
    setIsAdviceLoading(false);
    setError(null);
    setChatMessages([]);
  }, []);

  const fetchAndSetFashionAdvice = async (image: ImageDetails, context: string) => {
    setIsAdviceLoading(true);
    try {
      const advice = await getFashionAdvice(image, context);
      const adviceMessage: ChatMessage = { sender: 'ai', text: advice };
      setChatMessages(prev => [...prev, adviceMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        sender: 'ai',
        text: `Sorry, I couldn't get fashion advice right now. ${err.message}`
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAdviceLoading(false);
    }
  };

  const handleTryOn = async () => {
    if (!personImage || !clothingImage) {
      setError('Please upload both a person and a clothing item.');
      return;
    }
    setError(null);
    setIsTryOnLoading(true);
    setResultImage(null);
    setResultText('');
    setChatMessages([]);

    try {
      const { image, text } = await virtualTryOn(personImage, clothingImage);
      if (image) {
        setResultImage(image);
        const successMessage: ChatMessage = {
          sender: 'ai',
          text: text || "Voilà! Here is your new look. Let me give you some style tips...",
        };
        setChatMessages([successMessage]);
        await fetchAndSetFashionAdvice(image, 'A new outfit from an uploaded garment.');
      }
      if (text && !image) {
        setResultText(text);
      }
    } catch (err: any) {
      setError(`An error occurred during virtual try-on: ${err.message}`);
    } finally {
      setIsTryOnLoading(false);
    }
  };
  
  const handleAiInteraction = async (prompt: string) => {
    const baseImage = resultImage || personImage;

    if (!baseImage) {
        setError('Please upload your photo first.');
        return;
    }

    setError(null);
    setIsAiChatLoading(true);
    
    const newUserMessage: ChatMessage = { sender: 'user', text: prompt };
    setChatMessages(prev => [...prev, newUserMessage]);

    const fullPrompt = resultImage 
      ? prompt
      : `**ROLE: Expert CGI Digital Stylist**\n**TASK: Change the clothing of the person in the image based on the following description: "${prompt}".**\n**INSTRUCTIONS:**\n1. Completely replace the original clothing.\n2. Reconstruct the person's body shape to realistically fit the new attire.\n3. Render the new clothing with photorealistic lighting, shadows, and textures.\n4. Do NOT change the person's face, hair, body position, or the background.`;

    try {
        const { image, text } = await editImage(baseImage, fullPrompt);

        if (image) {
            setResultImage(image);
        }
        
        const aiResponseMessage: ChatMessage = { 
            sender: 'ai', 
            text: text || "Here's the updated image! One moment while I gather some style tips for you..."
        };
        setChatMessages(prev => [...prev, aiResponseMessage]);
        setIsAiChatLoading(false); // Stop main loading before fetching advice

        if (image) {
            await fetchAndSetFashionAdvice(image, prompt);
        }

    } catch (err: any) {
        const errorMessage: ChatMessage = { 
            sender: 'ai', 
            text: `Sorry, I couldn't process that. ${err.message}`
        };
        setChatMessages(prev => [...prev, errorMessage]);
        setIsAiChatLoading(false);
    }
  };

  const isTryOnDisabled = !personImage || !clothingImage || isTryOnLoading || isAiChatLoading || isAdviceLoading;

  return (
    <div className="min-h-screen bg-dark-bg text-light-text font-sans flex flex-col items-center p-4">
      <Header onReset={handleReset} />

      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-lg my-4 w-full max-w-7xl text-center animate-fade-in">
          <p><strong>Error:</strong> {error}</p>
        </div>
      )}

      <main className="w-full max-w-7xl flex-grow flex flex-col gap-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <ImageUploader
            title="1. Upload Your Photo"
            onImageUpload={setPersonImage}
            uploadedImage={personImage}
            Icon={PersonIcon}
            promptText="Upload a Full-Body Photo"
          />

          <ImageUploader
            title="2. Upload Garment"
            onImageUpload={setClothingImage}
            uploadedImage={clothingImage}
            Icon={GarmentIcon}
            promptText="Upload a Clothing Item"
          />
          
          <div className="bg-panel-bg p-4 rounded-xl flex flex-col lg:col-span-1">
             {isTryOnLoading ? (
                <Spinner />
              ) : (
                <>
                  {(resultImage || resultText) ? (
                     <ResultDisplay image={resultImage} text={resultText} />
                  ) : (
                     <div className="flex flex-col h-full">
                        <h2 className="text-xl font-bold mb-4 text-center">Your Creation</h2>
                        <div className="flex-grow flex flex-col items-center justify-center bg-light-bg rounded-lg min-h-[400px]">
                            <div className="text-center p-4">
                                <p className="text-lg text-medium-text">
                                { personImage 
                                    ? "Your generated image will appear here." 
                                    : "Upload a photo to begin."
                                }
                                </p>
                            </div>
                        </div>
                    </div>
                  )}

                  {personImage && (
                    <AIChatbot 
                        messages={chatMessages} 
                        onSendMessage={handleAiInteraction} 
                        isLoading={isAiChatLoading || isAdviceLoading} 
                    />
                  )}
                </>
              )}
          </div>

        </div>

        <div className="my-4 text-center">
            <button
              onClick={handleTryOn}
              disabled={isTryOnDisabled}
              className="px-10 py-4 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xl rounded-full shadow-lg hover:shadow-xl transition-all duration-300 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-primary/50 transform hover:scale-105"
            >
              Virtual Try-On
            </button>
        </div>
      </main>
    </div>
  );
}

export default App;
