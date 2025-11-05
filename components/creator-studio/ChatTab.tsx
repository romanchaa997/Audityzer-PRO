import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from '../../App';
import { LoaderIcon, SendIcon, SparklesIcon } from '../ui/Icons';

const ChatTab: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const chatInstance = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: 'You are Audityzer, a friendly and expert AI assistant for Web3 security and development. Provide concise, helpful, and accurate information.',
            },
        });
        setChat(chatInstance);
        setMessages([{ role: 'model', text: 'Hello! How can I help you with your Web3 project today?' }]);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, userMessage, { role: 'model', text: '' }]);
        setInput('');
        setIsLoading(true);

        try {
            const stream = await chat.sendMessageStream({ message: input });

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                if (chunkText) {
                    setMessages(prev => {
                        const newMessages = [...prev];
                        newMessages[newMessages.length - 1].text += chunkText;
                        return newMessages;
                    });
                }
            }
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = "Sorry, I encountered an error. Please try again.";
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full max-h-[70vh]">
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-lg p-3 rounded-lg ${msg.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-700 text-gray-200'}`}>
                            <p className="whitespace-pre-wrap">{msg.text || <span className="inline-block w-3 h-5 bg-gray-400 animate-pulse"></span>}</p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="mt-4 flex items-center space-x-2 border-t border-gray-700 pt-4">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask anything about Web3 security..."
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading}
                    aria-label="Chat input"
                />
                <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="p-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
                    aria-label="Send message"
                >
                    {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                </button>
            </form>
        </div>
    );
};

export default ChatTab;
