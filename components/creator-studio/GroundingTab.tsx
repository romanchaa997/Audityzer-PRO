import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LoaderIcon, SendIcon } from '../ui/Icons';

type GroundingSource = 'search' | 'maps';

const GroundingTab: React.FC = () => {
    const [prompt, setPrompt] = useState('Who won the most recent F1 Grand Prix?');
    const [source, setSource] = useState<GroundingSource>('search');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ text: string; chunks: any[] } | null>(null);
    const [error, setError] = useState('');

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            let config: any = { tools: [] };
            let toolConfig: any = {};

            if (source === 'search') {
                config.tools.push({ googleSearch: {} });
            } else if (source === 'maps') {
                config.tools.push({ googleMaps: {} });
                
                // Get user location for Maps grounding
                const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                });

                toolConfig = {
                    retrievalConfig: {
                        latLng: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                        }
                    }
                };
            }

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config,
                ...(Object.keys(toolConfig).length > 0 && { toolConfig }),
            });

            const text = response.text;
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            setResult({ text, chunks });

        } catch (e) {
            console.error("Error with grounding:", e);
            if (e instanceof GeolocationPositionError) {
                 setError('Failed to get location. Please enable location services in your browser.');
            } else {
                 setError('Failed to get response. The model may be unavailable or the query is unsupported.');
            }
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderChunk = (chunk: any, index: number) => {
        if (chunk.web) {
            return (
                <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition">
                    <span className="font-semibold text-cyan-400">{chunk.web.title}</span>
                    <span className="block text-xs text-gray-400 truncate">{chunk.web.uri}</span>
                </a>
            );
        }
        if (chunk.maps) {
            return (
                 <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="block p-3 bg-gray-700/50 rounded-lg hover:bg-gray-700 transition">
                    <span className="font-semibold text-cyan-400">{chunk.maps.title}</span>
                    {chunk.maps.placeAnswerSources?.[0]?.reviewSnippets?.[0] && 
                        <span className="block text-xs text-gray-400 italic mt-1">"{chunk.maps.placeAnswerSources[0].reviewSnippets[0]}"</span>
                    }
                </a>
            )
        }
        return null;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center space-x-4 bg-gray-700/50 p-2 rounded-lg">
                <span className="text-sm font-medium">Grounding Source:</span>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="source" value="search" checked={source === 'search'} onChange={() => setSource('search')} className="form-radio h-4 w-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500" />
                    <span>Google Search</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="source" value="maps" checked={source === 'maps'} onChange={() => setSource('maps')} className="form-radio h-4 w-4 text-cyan-500 bg-gray-800 border-gray-600 focus:ring-cyan-500" />
                    <span>Google Maps</span>
                </label>
            </div>
            <div className="flex items-center space-x-2">
                <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={source === 'maps' ? "e.g., Good coffee shops nearby" : "Ask a question about recent events..."}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    disabled={isLoading}
                />
                <button
                    onClick={handleGenerate}
                    disabled={isLoading || !prompt.trim()}
                    className="p-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center w-10 h-10"
                >
                    {isLoading ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-5 h-5" />}
                </button>
            </div>

            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}
            
            {isLoading && (
                 <div className="flex flex-col items-center justify-center pt-8">
                    <LoaderIcon className="w-8 h-8 text-cyan-400 animate-spin" />
                    <p className="mt-4 text-gray-300">Searching for up-to-date information...</p>
                </div>
            )}

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-gray-700/30 p-4 rounded-lg">
                        <h3 className="text-lg font-semibold mb-2 text-cyan-400">Answer</h3>
                        <div className="prose prose-invert max-w-none text-gray-200" dangerouslySetInnerHTML={{ __html: result.text.replace(/\n/g, '<br/>') }} />
                    </div>
                     <div className="lg:col-span-1">
                        <h3 className="text-lg font-semibold mb-2 text-cyan-400">Sources</h3>
                        {result.chunks.length > 0 ? (
                             <div className="space-y-2 max-h-96 overflow-y-auto">
                                {result.chunks.map(renderChunk)}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500">No specific sources were cited for this response.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroundingTab;
