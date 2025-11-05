import React, { useState, lazy, Suspense } from 'react';
import { 
    LoaderIcon, SparklesIcon, ImageIcon, VideoIcon, MicIcon, MapIcon
} from './ui/Icons';

type Tab = 'chat' | 'imageGen' | 'imageEdit' | 'videoGen' | 'audio' | 'grounding';

// Lazy load tab components for better initial load performance
const ChatTab = lazy(() => import('./creator-studio/ChatTab'));
const ImageGenTab = lazy(() => import('./creator-studio/ImageGenTab'));
const ImageEditTab = lazy(() => import('./creator-studio/ImageEditTab'));
const VideoGenTab = lazy(() => import('./creator-studio/VideoGenTab'));
const AudioTab = lazy(() => import('./creator-studio/AudioTab'));
const GroundingTab = lazy(() => import('./creator-studio/GroundingTab'));


const TabButton: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; children: React.ReactNode }> = ({ active, onClick, icon, children }) => (
    <button
        onClick={onClick}
        className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            active
                ? 'bg-cyan-500 text-white'
                : 'text-gray-300 hover:bg-gray-700'
        }`}
    >
        {icon}
        <span className="hidden sm:inline">{children}</span>
    </button>
);


const CreatorStudio: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('chat');

    const renderActiveTab = () => {
        switch (activeTab) {
            case 'chat': return <ChatTab />;
            case 'imageGen': return <ImageGenTab />;
            case 'imageEdit': return <ImageEditTab />;
            case 'videoGen': return <VideoGenTab />;
            case 'audio': return <AudioTab />;
            case 'grounding': return <GroundingTab />;
            default: return null;
        }
    };

    const tabs: { id: Tab; name: string; icon: React.ReactNode }[] = [
        { id: 'chat', name: 'Chat', icon: <SparklesIcon className="w-5 h-5" /> },
        { id: 'imageGen', name: 'Image Gen', icon: <ImageIcon className="w-5 h-5" /> },
        { id: 'imageEdit', name: 'Image Edit', icon: <ImageIcon className="w-5 h-5" /> },
        { id: 'videoGen', name: 'Video Gen', icon: <VideoIcon className="w-5 h-5" /> },
        { id: 'audio', name: 'Audio', icon: <MicIcon className="w-5 h-5" /> },
        { id: 'grounding', name: 'Grounding', icon: <MapIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="space-y-6 flex flex-col h-full">
            <h1 className="text-3xl font-bold">Creator Studio</h1>

            <div className="bg-gray-800 p-2 sm:p-4 rounded-lg shadow-lg">
                <div className="flex space-x-1 sm:space-x-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <TabButton
                            key={tab.id}
                            active={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            icon={tab.icon}
                        >
                            {tab.name}
                        </TabButton>
                    ))}
                </div>
            </div>

            <div className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg flex-1 min-h-[60vh] relative">
               <Suspense 
                   fallback={
                       <div className="w-full h-full flex items-center justify-center">
                           <LoaderIcon className="w-10 h-10 animate-spin text-cyan-400"/>
                       </div>
                   }
               >
                   {renderActiveTab()}
               </Suspense>
            </div>
        </div>
    );
};

export default CreatorStudio;
