import React, { useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------
// FLOATING PLAYER
// ----------------------------------------------------------------------
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
  voices: { id: string; name: string }[];
  selectedVoice: string;
  onVoiceChange: (voiceId: string) => void;
}

export const FloatingPlayer: React.FC<FloatingPlayerProps> = ({
  isPlaying,
  onPlayPause,
  onStop,
  onNext,
  onPrev,
  speed,
  onSpeedChange,
  currentIndex,
  totalIndex,
  voices,
  selectedVoice,
  onVoiceChange
}) => {
  const progressPercent = totalIndex > 0 ? (currentIndex / totalIndex) * 100 : 0;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
      <div className="backdrop-blur-xl bg-zinc-900/90 dark:bg-black/80 text-white rounded-2xl shadow-2xl border border-zinc-800 p-4 transition-all duration-300 hover:border-zinc-700">
        
        {/* Progress Bar */}
        <div className="w-full bg-zinc-800 rounded-full h-1 mb-3 overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-200"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Track Info / Index Counter */}
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-400">
              Sentence {currentIndex + 1} of {totalIndex || 1}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={onPrev}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300"
              title="Previous Sentence (Left Arrow)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>

            <button
              onClick={onPlayPause}
              className="p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black active:scale-95 transition-all shadow-md shadow-emerald-500/20"
              title="Play / Pause (Spacebar)"
            >
              {isPlaying ? (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 9v6m4-6v6" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            <button
              onClick={onStop}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-red-900/40 text-red-400 active:scale-95 transition-all"
              title="Stop Playback"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h12V5H6v14z" />
              </svg>
            </button>

            <button
              onClick={onNext}
              className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 active:scale-95 transition-all text-zinc-300"
              title="Next Sentence (Right Arrow)"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 005 8v8a1 1 0 001.6.8l5.334-4zM19.934 12.8a1 1 0 000-1.6l-5.334-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.334-4z" />
              </svg>
            </button>
          </div>

          {/* Voice and Speed Controls */}
          <div className="flex items-center gap-3">
            <select
              value={selectedVoice}
              onChange={(e) => onVoiceChange(e.target.value)}
              className="bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 bg-zinc-800 rounded-lg px-2 py-1 border border-zinc-700">
              <span className="text-[10px] uppercase font-bold text-zinc-500">Speed</span>
              <select
                value={speed}
                onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
                className="bg-transparent text-xs font-semibold text-emerald-400 focus:outline-none"
              >
                <option value="0.75" className="bg-zinc-900 text-white">0.75x</option>
                <option value="1.0" className="bg-zinc-900 text-white">1.0x</option>
                <option value="1.25" className="bg-zinc-900 text-white">1.25x</option>
                <option value="1.5" className="bg-zinc-900 text-white">1.5x</option>
                <option value="2.0" className="bg-zinc-900 text-white">2.0x</option>
              </select>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// READER PANEL WITH AUTO-SCROLL
// ----------------------------------------------------------------------
export interface ReaderPanelProps {
  sentences: string[];
  currentIndex: number;
  onSentenceClick: (index: number) => void;
  title: string;
  theme?: 'light' | 'dark' | 'sepia';
}

export const ReaderPanel: React.FC<ReaderPanelProps> = ({
  sentences,
  currentIndex,
  onSentenceClick,
  title,
  theme = 'dark'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const activeSpan = containerRef.current?.querySelector(`[data-sentence-index="${currentIndex}"]`);
    if (activeSpan) {
      activeSpan.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentIndex]);

  const themeClasses = {
    light: 'bg-white text-zinc-900',
    dark: 'bg-zinc-950 text-zinc-100',
    sepia: 'bg-[#f4ecd8] text-[#5b4636]'
  };

  return (
    <div className={cn("flex flex-col h-full rounded-2xl border transition-all duration-300 p-6 overflow-hidden shadow-sm",
      theme === 'light' ? 'border-zinc-200' : theme === 'dark' ? 'border-zinc-800' : 'border-[#e4dcc4]',
      themeClasses[theme]
    )}>
      {/* Top Header info */}
      <div className="flex justify-between items-center border-b pb-4 mb-4 border-current/10">
        <h2 className="font-semibold text-sm tracking-wide opacity-80 uppercase">{title || 'Document Content'}</h2>
        <span className="text-xs bg-current/5 px-2.5 py-1 rounded-md opacity-60">
          Auto Scroll Active
        </span>
      </div>

      {/* Sentences Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto pr-2 space-y-4 text-lg leading-relaxed selection:bg-emerald-500/30"
        style={{ scrollBehavior: 'smooth' }}
      >
        <p className="indent-8 text-justify">
          {sentences.map((sentence, idx) => {
            const isActive = idx === currentIndex;
            return (
              <span
                key={idx}
                data-sentence-index={idx}
                onClick={() => onSentenceClick(idx)}
                className={cn(
                  "cursor-pointer px-1 rounded transition-all duration-300 ease-out select-text",
                  isActive
                    ? "bg-emerald-500/25 dark:bg-emerald-400/20 text-emerald-600 dark:text-emerald-300 font-medium scale-[1.01] shadow-sm"
                    : "hover:bg-zinc-500/10"
                )}
              >
                {sentence}{' '}
              </span>
            );
          })}
        </p>
      </div>
    </div>
  );
};

// ----------------------------------------------------------------------
// CHAT SIDEBAR (RAG CONVERSATION)
// ----------------------------------------------------------------------
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

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  messages,
  inputValue,
  onInputChange,
  onSendMessage,
  isGenerating
}) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden text-zinc-100 shadow-xl">
      {/* Header */}
      <div className="flex items-center gap-2 bg-zinc-800/50 p-4 border-b border-zinc-800">
        <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
        <h3 className="font-bold text-sm text-zinc-200">EchoReader AI Assistant</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center text-zinc-500 p-6">
            <svg className="w-12 h-12 mb-3 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-sm font-semibold mb-1 text-zinc-400">Intelligent RAG Query</p>
            <p className="text-xs max-w-xs text-zinc-500">Ask summarizing questions, key details, or table extraction queries over the parsed document.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex flex-col max-w-[85%] rounded-xl px-4 py-2.5 text-sm",
                m.sender === 'user'
                  ? "bg-emerald-600 text-white ml-auto rounded-br-none"
                  : "bg-zinc-800 text-zinc-200 mr-auto rounded-bl-none border border-zinc-700"
              )}
            >
              <p className="whitespace-pre-wrap">{m.content}</p>
            </div>
          ))
        )}
        {isGenerating && (
          <div className="bg-zinc-800 text-zinc-200 mr-auto rounded-xl rounded-bl-none border border-zinc-700 p-4 max-w-[85%]">
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-zinc-800 bg-zinc-950/40">
        <div className="flex gap-2 bg-zinc-800 rounded-lg p-1.5 border border-zinc-700 focus-within:border-emerald-500">
          <textarea
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about this document..."
            rows={1}
            className="flex-1 bg-transparent border-0 text-sm px-2 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-0 resize-none max-h-24 align-middle"
          />
          <button
            onClick={onSendMessage}
            disabled={!inputValue.trim() || isGenerating}
            className="p-1.5 rounded-md bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-700 text-black transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
