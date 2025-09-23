import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { SendIcon } from './icons/SendIcon';

interface AIChatbotProps {
    messages: ChatMessage[];
    onSendMessage: (prompt: string) => void;
    isLoading: boolean;
}

// A simple component to render text with basic formatting
const FormattedTextMessage: React.FC<{ text: string }> = ({ text }) => {
    // Formatter to handle bolding (**text**)
    const formatText = (inputText: string): string => {
        return inputText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    };

    return (
        <p
            className="text-sm whitespace-pre-wrap" // Handles newlines
            dangerouslySetInnerHTML={{ __html: formatText(text) }}
        />
    );
};


const AIChatbot: React.FC<AIChatbotProps> = ({ messages, onSendMessage, isLoading }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messages, isLoading]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (input.trim() && !isLoading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="mt-4 animate-fade-in">
            <h2 className="text-xl font-bold mb-4 text-center">3. AI Stylist</h2>
            <div className="flex flex-col h-full bg-light-bg rounded-lg p-3 max-h-[400px]">
                <div className="flex-grow overflow-y-auto mb-3 pr-2 space-y-3">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs lg:max-w-sm px-3 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-panel-bg text-light-text'}`}>
                                 <FormattedTextMessage text={msg.text} />
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex justify-start">
                             <div className="max-w-xs lg:max-w-sm px-3 py-2 rounded-xl bg-panel-bg text-light-text">
                                <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></div>
                                    <div className="w-2 h-2 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSubmit} className="flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        className="flex-grow p-2 bg-dark-bg border border-gray-600 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                        placeholder="e.g., change my outfit to a red dress"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="bg-primary text-white p-2.5 rounded-r-lg flex items-center justify-center disabled:bg-gray-500"
                    >
                       <SendIcon />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AIChatbot;
