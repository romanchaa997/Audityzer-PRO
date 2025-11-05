import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveSession, Modality, Blob } from "@google/genai";
import { MicIcon, PlayIcon, StopIcon, LoaderIcon } from '../ui/Icons';

// --- HELPER FUNCTIONS ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
async function decodeAudioData(
  data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

const AudioTab: React.FC = () => {
    type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error' | 'closing';
    const [status, setStatus] = useState<ConnectionStatus>('idle');
    const [error, setError] = useState('');

    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef(0);
    const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

    const stopSession = useCallback(async () => {
        setStatus('closing');
        if (sessionPromiseRef.current) {
            try {
                const session = await sessionPromiseRef.current;
                session.close();
            } catch (e) { console.error("Error closing session:", e); }
        }
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        await audioContextRef.current?.close();
        await outputAudioContextRef.current?.close();

        sessionPromiseRef.current = null;
        mediaStreamRef.current = null;
        audioContextRef.current = null;
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current = null;
        outputAudioContextRef.current = null;
        nextStartTimeRef.current = 0;
        audioSourcesRef.current.clear();
        
        setStatus('idle');
    }, []);

    const startSession = useCallback(async () => {
        setStatus('connecting');
        setError('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaStreamRef.current = stream;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            audioContextRef.current = inputAudioContext;
            
            const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            outputAudioContextRef.current = outputAudioContext;
            const outputNode = outputAudioContext.createGain();
            outputNode.connect(outputAudioContext.destination);


            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('connected');
                        const source = inputAudioContext.createMediaStreamSource(stream);
                        mediaStreamSourceRef.current = source;
                        const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                        scriptProcessorRef.current = scriptProcessor;

                        scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        source.connect(scriptProcessor);
                        scriptProcessor.connect(inputAudioContext.destination);
                    },
                    onmessage: async (message) => {
                        const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (audioData && outputAudioContextRef.current) {
                            const ctx = outputAudioContextRef.current;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputNode);
                            source.addEventListener('ended', () => {
                                audioSourcesRef.current.delete(source);
                            });
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            audioSourcesRef.current.add(source);
                        }
                    },
                    onerror: (e) => {
                        console.error('Live session error:', e);
                        setError('A connection error occurred.');
                        setStatus('error');
                        stopSession();
                    },
                    onclose: () => {
                       // Handled by explicit stopSession call
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                    systemInstruction: 'You are a helpful Web3 assistant named Audityzer.',
                },
            });
        } catch (e) {
            console.error('Failed to start audio session:', e);
            setError('Could not access microphone. Please grant permission and try again.');
            setStatus('error');
        }
    }, [stopSession]);
    
    // Cleanup on component unmount
    useEffect(() => {
        return () => {
            if (status === 'connected' || status === 'connecting') {
                stopSession();
            }
        };
    }, [status, stopSession]);


    const handleToggle = () => {
        if (status === 'idle' || status === 'error') {
            startSession();
        } else if (status === 'connected') {
            stopSession();
        }
    };

    const getButtonContent = () => {
        switch (status) {
            case 'connecting':
            case 'closing':
                return <><LoaderIcon className="w-5 h-5 mr-2 animate-spin" /> {status === 'connecting' ? 'Connecting...' : 'Stopping...'}</>;
            case 'connected':
                return <><StopIcon className="w-5 h-5 mr-2" /> Stop Session</>;
            case 'idle':
            case 'error':
            default:
                return <><PlayIcon className="w-5 h-5 mr-2" /> Start Session</>;
        }
    };
    
    const getStatusIndicator = () => {
         switch (status) {
            case 'connecting': return <span className="text-yellow-400">CONNECTING</span>;
            case 'connected': return <span className="text-green-400">LIVE</span>;
            case 'error': return <span className="text-red-400">ERROR</span>;
            case 'closing': return <span className="text-gray-400">CLOSING</span>;
            default: return <span className="text-gray-400">IDLE</span>;
        }
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <MicIcon className="w-24 h-24 text-gray-500" />
            <h2 className="text-xl font-bold">Real-time Audio Conversation</h2>
            <p className="text-gray-400 max-w-md">
                Press "Start Session" and speak into your microphone to have a live conversation with the Audityzer AI assistant.
            </p>
            <div className="flex items-center space-x-4 p-2 bg-gray-900/50 rounded-full">
                <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
                <span className="font-mono text-sm tracking-widest">{getStatusIndicator()}</span>
            </div>
            <button
                onClick={handleToggle}
                disabled={status === 'connecting' || status === 'closing'}
                className="px-8 py-4 bg-cyan-500 text-white font-semibold rounded-full hover:bg-cyan-600 transition disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center text-lg"
            >
                {getButtonContent()}
            </button>
            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
        </div>
    );
};

export default AudioTab;
