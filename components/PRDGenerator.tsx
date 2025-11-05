import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { LoaderIcon } from './ui/Icons';

type Font = 'font-sans' | 'font-serif' | 'font-mono';
type Theme = 'dark-matter' | 'arctic-white' | 'cyber-teal';

const fonts: { [key in Font]: { name: string; className: string } } = {
    'font-sans': { name: 'Inter', className: 'font-sans' },
    'font-serif': { name: 'Roboto Serif', className: 'font-serif' },
    'font-mono': { name: 'Roboto Mono', className: 'font-mono' },
};

const themes: { [key in Theme]: { name: string; classes: { bg: string; text: string; border: string; heading: string; } } } = {
    'dark-matter': { name: 'Dark Matter', classes: { bg: 'bg-gray-800', text: 'text-gray-200', border: 'border-gray-700', heading: 'text-cyan-400' } },
    'arctic-white': { name: 'Arctic White', classes: { bg: 'bg-white', text: 'text-gray-800', border: 'border-gray-200', heading: 'text-blue-600' } },
    'cyber-teal': { name: 'Cyber Teal', classes: { bg: 'bg-teal-950', text: 'text-teal-100', border: 'border-teal-700', heading: 'text-yellow-300' } },
};

const PrdDisplay: React.FC<{ content: string }> = ({ content }) => {
    const [activeFont, setActiveFont] = useState<Font>('font-sans');
    const [activeTheme, setActiveTheme] = useState<Theme>('dark-matter');
    const themeClasses = themes[activeTheme].classes;

    return (
        <div className={`mt-6 rounded-lg border ${themeClasses.border} transition-colors duration-300`}>
            <div className={`flex flex-wrap items-center justify-between p-3 border-b ${themeClasses.border} ${themeClasses.bg} rounded-t-lg`}>
                <div className="flex items-center space-x-4">
                    <div>
                        <label htmlFor="font-select" className="text-xs font-medium mr-2">Font:</label>
                        <select id="font-select" value={activeFont} onChange={(e) => setActiveFont(e.target.value as Font)} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                           {Object.entries(fonts).map(([key, value]) => (
                               <option key={key} value={key}>{value.name}</option>
                           ))}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="theme-select" className="text-xs font-medium mr-2">Theme:</label>
                        <select id="theme-select" value={activeTheme} onChange={(e) => setActiveTheme(e.target.value as Theme)} className="bg-gray-700 border border-gray-600 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500">
                           {Object.entries(themes).map(([key, value]) => (
                               <option key={key} value={key}>{value.name}</option>
                           ))}
                        </select>
                    </div>
                </div>
            </div>
            <div 
              className={`p-6 prose prose-invert max-w-none ${themeClasses.bg} ${themeClasses.text} ${fonts[activeFont].className} rounded-b-lg`}
              style={{ 
                  '--tw-prose-headings': themes[activeTheme].classes.heading.replace('text-', 'var(--tw-color-') + ')',
              }}
            >
              <pre className="whitespace-pre-wrap font-inherit text-inherit bg-transparent p-0">{content}</pre>
            </div>
        </div>
    );
};


const PRDGenerator: React.FC = () => {
    const [featureDescription, setFeatureDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [generatedPrd, setGeneratedPrd] = useState('');
    const [error, setError] = useState('');

    const handleGenerate = useCallback(async () => {
        if (!featureDescription.trim()) return;

        setIsLoading(true);
        setError('');
        setGeneratedPrd('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD format

            const prompt = `You are an expert Senior Product Manager specializing in Web3, AI, and security products. Generate a comprehensive Product Requirements Document (PRD) in Markdown format based on the following feature description:
---
${featureDescription}
---

The PRD must include the following sections with detailed content:

1.  **Introduction/Overview**: A brief summary of the feature and the problem it solves.

2.  **Goals and Objectives**: What this feature aims to achieve. Use SMART goals.

3.  **User Stories**: Generate 2-3 detailed user stories for the highest priority features. Use the format: 'As a [user type], I want [functionality] so that [benefit]'.

4.  **Go-to-Market Strategy**:
    *   **Target User Personas**: Include detailed descriptions for 'DAO Community Manager' and 'Web3 Project Founder'.
    *   **Pricing Model**: Propose a three-tiered model: 'Freemium', 'Pro', and 'Enterprise', with a breakdown of key features for each tier.
    *   **Phased Rollout Plan**: Outline an 'Alpha', 'Beta', and 'Public Launch' phase with key milestones and success metrics for each phase.

5.  **Technical Architecture Overview**:
    *   **Core Components**: Suggest a microservices-based architecture. Name 2-3 potential microservices and their responsibilities. Specify communication methods (e.g., REST, gRPC).
    *   **Data Flow and Storage**: Suggest specific database technologies (e.g., PostgreSQL for relational data, a vector DB like Pinecone for AI features). Propose a data pipeline for event streaming (e.g., Kafka).
    *   **API and Integration Points**: Detail the types of APIs to expose (e.g., RESTful API for core functionalities). Describe a webhook strategy for real-time updates. List 2-3 key third-party integrations (e.g., Alchemy for blockchain data, Discord for community notifications).

6.  **Revision History**: Create a Markdown table with the columns 'Version', 'Date', 'Author', and 'Changes'. The first row must be pre-filled as follows:
    *   Version: 1.0
    *   Date: ${today}
    *   Author: AI Agent
    *   Changes: Initial document generation
`;
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-pro',
              contents: prompt,
            });

            setGeneratedPrd(response.text);

        } catch (e) {
            console.error("Error generating PRD:", e);
            setError('Failed to generate PRD. The AI model might be unavailable or returned an unexpected response. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [featureDescription]);


    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">AI PRD Generator</h1>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg space-y-4">
                <h2 className="text-xl font-semibold">Describe Your Feature</h2>
                <p className="text-sm text-gray-400">Enter a description of the product or feature you want to build. The more detail you provide, the better the result.</p>
                <textarea 
                    value={featureDescription}
                    onChange={(e) => setFeatureDescription(e.target.value)}
                    placeholder="e.g., An AI-powered tool that automatically suggests gas fee optimizations for smart contract functions..."
                    className="w-full h-32 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    aria-label="Feature description"
                />
                <button 
                    onClick={handleGenerate} 
                    disabled={isLoading || !featureDescription.trim()} 
                    className="px-6 py-2 bg-cyan-500 text-white font-semibold rounded-md hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center"
                >
                    {isLoading && <LoaderIcon className="w-5 h-5 mr-2 animate-spin" />}
                    {isLoading ? 'Generating...' : 'Generate PRD'}
                </button>
            </div>
            
            {error && <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg">{error}</div>}

            {isLoading && (
                <div className="flex flex-col items-center justify-center bg-gray-800 p-8 rounded-lg">
                    <LoaderIcon className="w-12 h-12 text-cyan-400 animate-spin" />
                    <p className="mt-4 text-lg text-gray-300">Generating your Product Requirements Document...</p>
                    <p className="text-sm text-gray-500">This may take a moment.</p>
                </div>
            )}

            {generatedPrd && <PrdDisplay content={generatedPrd} />}

        </div>
    );
};

export default PRDGenerator;