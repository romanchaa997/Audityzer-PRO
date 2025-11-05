import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LoaderIcon, VideoIcon, AlertTriangleIcon } from '../ui/Icons';

declare global {
    // FIX: Replaced inline type with a named interface `AIStudio` and made the `aistudio` property optional.
    // This resolves errors related to type mismatches and modifier differences with other global declarations.
    interface AIStudio {
        hasSelectedApiKey: () => Promise<boolean>;
        openSelectKey: () => Promise<void>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-10 rounded-lg">
        <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="mt-4 text-gray-300 text-center">{message}</p>
    </div>
);

const VideoGenTab: React.FC = () => {
    const [prompt, setPrompt] = useState('A cinematic shot of a robot meditating in a serene, futuristic zen garden');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [apiKeySelected, setApiKeySelected] = useState(false);

    useEffect(() => {
        const checkApiKey = async () => {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setApiKeySelected(hasKey);
            }
        };
        checkApiKey();
    }, []);

    const handleSelectKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume selection is successful to avoid race conditions
            setApiKeySelected(true);
        }
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setLoadingMessage('Initializing video generation...');
        setError('');
        setVideoUrl(null);

        try {
            // Must create a new instance right before the call to get the latest key
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            let operation = await ai.models.generateVideos({
                model: 'veo-3.1-fast-generate-preview',
                prompt: prompt,
                config: {
                    numberOfVideos: 1,
                    resolution: '720p',
                    aspectRatio: '16:9',
                }
            });

            setLoadingMessage('Video generation in progress... This can take several minutes. Please wait.');

            while (!operation.done) {
                await new Promise(resolve => setTimeout(resolve, 10000));
                operation = await ai.operations.getVideosOperation({ operation: operation });
            }

            setLoadingMessage('Finalizing video...');

            const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
            if (downloadLink) {
                const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setVideoUrl(url);
            } else {
                throw new Error("Video generation completed, but no download link was provided.");
            }

        } catch (e: any) {
            console.error("Error generating video:", e);
             const errorMessage = e.message || 'An unknown error occurred.';
            setError(`Failed to generate video: ${errorMessage}`);
            if (errorMessage.includes("Requested entity was not found.")) {
                setError("Failed to generate video: The API key is invalid. Please select a valid key.");
                setApiKeySelected(false);
            }
        } finally {
            setIsLoading(false);
            setLoadingMessage('');
        }
    };

    if (!apiKeySelected) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center">
                 <AlertTriangleIcon className="w-12 h-12 text-yellow-400 mb-4" />
                <h2 className="text-xl font-bold mb-2">API Key Required</h2>
                <p className="text-gray-400 mb-4 max-w-md">Video generation with Veo requires a user-selected API key. Please select a key to continue. Billing is managed by Google AI Studio.</p>
                <button
                    onClick={handleSelectKey}
                    className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition"
                >
                    Select API Key
                </button>
                 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 mt-4 hover:underline">
                    Learn more about billing
                </a>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="video-prompt" className="block text-sm font-medium">Prompt</label>
                <textarea
                    id="video-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A neon hologram of a cat driving at top speed..."
                    className="w-full h-24 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
            >
                {isLoading ? <LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> : <VideoIcon className="w-5 h-5 mr-2" />}
                Generate Video
            </button>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}

            <div className="mt-6 relative min-h-[300px] bg-gray-700/50 rounded-lg flex items-center justify-center">
                 {isLoading && <LoadingOverlay message={loadingMessage} />}
                {videoUrl ? (
                    <video src={videoUrl} controls autoPlay loop className="rounded-lg w-full max-w-2xl" />
                ) : !isLoading && (
                    <div className="text-center text-gray-400">
                        <VideoIcon className="w-12 h-12 mx-auto" />
                        <p className="mt-2">Your generated video will appear here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VideoGenTab;