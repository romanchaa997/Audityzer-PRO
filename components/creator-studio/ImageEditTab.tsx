import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import { LoaderIcon, ImageIcon, SparklesIcon } from '../ui/Icons';

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

const LoadingOverlay: React.FC<{ message: string }> = ({ message }) => (
    <div className="absolute inset-0 bg-gray-800 bg-opacity-75 flex flex-col items-center justify-center z-10 rounded-lg">
        <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400" />
        <p className="mt-4 text-gray-300">{message}</p>
    </div>
);

const ImageEditTab: React.FC = () => {
    const [prompt, setPrompt] = useState('Add a glowing, futuristic data stream effect around the object');
    const [sourceImageFile, setSourceImageFile] = useState<File | null>(null);
    const [sourceImagePreview, setSourceImagePreview] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSourceImageFile(file);
            setSourceImagePreview(URL.createObjectURL(file));
            setResultImage(null);
            setError('');
        }
    };

    const handleEdit = async () => {
        if (!prompt.trim() || !sourceImageFile) return;
        setIsLoading(true);
        setError('');
        setResultImage(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const base64Data = await fileToBase64(sourceImageFile);

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                    parts: [
                        { inlineData: { data: base64Data, mimeType: sourceImageFile.type } },
                        { text: prompt },
                    ],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setResultImage(imageUrl);
                    break;
                }
            }
             if (!response.candidates[0].content.parts.some(p => p.inlineData)) {
                throw new Error("The model did not return an image. It may have refused the request.");
            }

        } catch (e) {
            console.error("Error editing image:", e);
            setError(`Failed to edit image. ${e instanceof Error ? e.message : 'Please check your prompt and image and try again.'}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-700/50 p-4 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-600 h-64">
                    {sourceImagePreview ? (
                        <img src={sourceImagePreview} alt="Source" className="max-h-full max-w-full object-contain rounded-md" />
                    ) : (
                        <div className="text-center text-gray-400">
                            <ImageIcon className="w-12 h-12 mx-auto" />
                            <p className="mt-2">Upload an image to edit</p>
                        </div>
                    )}
                </div>
                <div className="bg-gray-700/50 p-4 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-600 h-64 relative">
                    {isLoading && <LoadingOverlay message="Editing image..." />}
                    {resultImage ? (
                        <img src={resultImage} alt="Result" className="max-h-full max-w-full object-contain rounded-md" />
                    ) : (
                         <div className="text-center text-gray-400">
                            <SparklesIcon className="w-12 h-12 mx-auto" />
                            <p className="mt-2">Your edited image will appear here</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="edit-prompt" className="block text-sm font-medium">Edit Instruction</label>
                <input
                    id="edit-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Change the background to a cyber city..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
                <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-500 transition">
                    Choose Image...
                </label>
                 {sourceImageFile && <span className="text-sm text-gray-400 truncate max-w-xs">{sourceImageFile.name}</span>}
                <button
                    onClick={handleEdit}
                    disabled={isLoading || !prompt.trim() || !sourceImageFile}
                    className="ml-auto px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                    {isLoading ? <LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> : <SparklesIcon className="w-5 h-5 mr-2" />}
                    Apply Edit
                </button>
            </div>
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}
        </div>
    );
};

export default ImageEditTab;
