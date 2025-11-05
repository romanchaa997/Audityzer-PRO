import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LoaderIcon, ImageIcon } from '../ui/Icons';

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-10 rounded-lg">
        <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="mt-4 text-gray-300">{message}</p>
    </div>
);

const ImageGenTab: React.FC = () => {
    const [prompt, setPrompt] = useState('A futuristic Web3 logo, combining a shield and a data stream, minimalist, neon on a dark background');
    const [numImages, setNumImages] = useState(1);
    const [aspectRatio, setAspectRatio] = useState('1:1');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedImages, setGeneratedImages] = useState<string[]>([]);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');
        setGeneratedImages([]);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt,
                config: {
                    numberOfImages: numImages,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
                },
            });

            const imageUrls = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
            setGeneratedImages(imageUrls);

        } catch (e) {
            console.error("Error generating images:", e);
            setError('Failed to generate images. Please check your prompt and try again.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const getGridCols = () => {
        if (numImages === 1) return 'grid-cols-1';
        if (numImages === 2) return 'grid-cols-1 sm:grid-cols-2';
        return 'grid-cols-1 sm:grid-cols-2';
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label htmlFor="img-prompt" className="block text-sm font-medium">Prompt</label>
                <textarea
                    id="img-prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., A photorealistic image of a developer working in a futuristic command center..."
                    className="w-full h-24 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="num-images" className="block text-sm font-medium">Number of Images</label>
                    <select
                        id="num-images"
                        value={numImages}
                        onChange={(e) => setNumImages(Number(e.target.value))}
                        className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value={1}>1</option>
                        <option value={2}>2</option>
                        <option value={3}>3</option>
                        <option value={4}>4</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="aspect-ratio" className="block text-sm font-medium">Aspect Ratio</label>
                    <select
                        id="aspect-ratio"
                        value={aspectRatio}
                        onChange={(e) => setAspectRatio(e.target.value)}
                        className="w-full mt-1 bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                        <option value="1:1">1:1 (Square)</option>
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                        <option value="4:3">4:3 (Landscape)</option>
                        <option value="3:4">3:4 (Tall)</option>
                    </select>
                </div>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="self-end px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center"
                >
                    {isLoading ? <LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> : <ImageIcon className="w-5 h-5 mr-2"/>}
                    Generate
                </button>
            </div>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}

            <div className="mt-6 relative">
                 {isLoading && <LoadingOverlay message="Generating images with Imagen..." />}
                {generatedImages.length > 0 && (
                     <div className={`grid ${getGridCols()} gap-4`}>
                        {generatedImages.map((src, index) => (
                            <img key={index} src={src} alt={`Generated image ${index + 1}`} className="rounded-lg shadow-lg w-full object-contain" />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageGenTab;
