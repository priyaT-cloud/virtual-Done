import React from 'react';

interface HeaderProps {
  onReset: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset }) => {
  return (
    <header className="w-full max-w-7xl mb-4 text-center relative">
      <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          AI Virtual Dress-Up
        </span>
      </h1>
      <p className="mt-2 text-md text-medium-text max-w-2xl mx-auto">
        Upload a photo and a garment to create your new look.
      </p>
      <button 
        onClick={onReset}
        className="absolute top-0 right-0 mt-2 mr-2 px-4 py-2 bg-secondary/80 text-white font-semibold text-sm rounded-full shadow-md hover:bg-secondary transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-secondary/50 transform hover:scale-105"
        aria-label="Start Over"
      >
        Start Over
      </button>
    </header>
  );
};

export default Header;
