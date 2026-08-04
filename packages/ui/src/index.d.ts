import React from 'react';
export declare function cn(...inputs: any[]): string;
export interface FloatingPlayerProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    onStop: () => void;
    onNext: () => void;
    onPrev: () => void;
    speed: number;
    onSpeedChange: (speed: number) => void;
    currentIndex: number;
    totalIndex: number;
    voices: {
        id: string;
        name: string;
    }[];
    selectedVoice: string;
    onVoiceChange: (voiceId: string) => void;
}
export declare const FloatingPlayer: React.FC<FloatingPlayerProps>;
export interface ReaderPanelProps {
    sentences: string[];
    currentIndex: number;
    onSentenceClick: (index: number) => void;
    title: string;
    theme?: 'light' | 'dark' | 'sepia';
}
export declare const ReaderPanel: React.FC<ReaderPanelProps>;
export interface ChatMessage {
    sender: 'user' | 'assistant';
    content: string;
}
export interface ChatSidebarProps {
    messages: ChatMessage[];
    inputValue: string;
    onInputChange: (val: string) => void;
    onSendMessage: () => void;
    isGenerating: boolean;
}
export declare const ChatSidebar: React.FC<ChatSidebarProps>;
//# sourceMappingURL=index.d.ts.map