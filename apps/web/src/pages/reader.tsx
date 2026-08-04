import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTTSPlayback, useKeyPress } from '@echoreader/hooks';
import { FloatingPlayer, ReaderPanel, ChatSidebar, ChatMessage } from '@echoreader/ui';

export default function ReaderPage() {
  const router = useRouter();
  const { title } = router.query;

  const [documentTitle, setDocumentTitle] = useState('Loading Document...');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('dark');
  const [speed, setSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('local-en');

  // Core sentence list representing the parsed content of the uploaded document
  const [sentences, setSentences] = useState<string[]>([
    "EchoReader AI transforms documents into voice.",
    "This system handles layout scanning, optical character recognition, and sentence segmenting.",
    "By dividing text block arrays, it feeds speech synthesizers incrementally.",
    "The client interface monitors the spoken character offsets and updates the visual markers.",
    "You can press the Spacebar to toggle playback state or the Left/Right arrow keys to skip sentences.",
    "The sidebar includes a Retrieval-Augmented Generation chatbot.",
    "This chatbot utilizes local embeddings to reference text snippets from the document db.",
    "Ask a question to test it out."
  ]);

  // Sync title from query parameter
  useEffect(() => {
    if (title) {
      setDocumentTitle(decodeURIComponent(title as string));
    }
  }, [title]);

  // Web Speech synthesis voices list resolver
  const [availableVoices, setAvailableVoices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const updateVoices = () => {
        const list = window.speechSynthesis.getVoices().map(v => ({
          id: v.name,
          name: `${v.name} (${v.lang})`
        }));
        setAvailableVoices(list.length > 0 ? list : [{ id: 'local-en', name: 'Default English Voice' }]);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  // Hook-up custom Speech Synthesizer controller
  const {
    isPlaying,
    currentIndex,
    setCurrentIndex,
    play,
    pause,
    stop,
    skipForward,
    skipBackward
  } = useTTSPlayback({
    sentences,
    speed,
    onSentenceChange: (idx) => console.log('Sentence highlighted:', idx),
    onPlaybackEnd: () => console.log('Finished reading document')
  });

  // Bind hotkeys for extreme accessibility control
  useKeyPress(' ', () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying]);

  useKeyPress('ArrowRight', () => {
    skipForward();
  }, [currentIndex]);

  useKeyPress('ArrowLeft', () => {
    skipBackward();
  }, [currentIndex]);

  // AI Chat session state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage: ChatMessage = { sender: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsGenerating(true);

    // Simulate RAG retrieval QA response delay
    setTimeout(() => {
      let content = "I checked the document. ";
      const query = chatInput.toLowerCase();

      if (query.includes('summary') || query.includes('about')) {
        content += `This document is titled "${documentTitle}" and explains EchoReader AI parsing workflows, TTS speech synthesis synchronizations, and RAG architectures.`;
      } else if (query.includes('shortcut') || query.includes('keys')) {
        content += "You can use spacebar to play/pause, left arrow to go back, and right arrow to skip ahead.";
      } else {
        content += "According to the parsed text, layout scans are sliced into sentences, matched with embeddings, and index-queried via Meilisearch or Fuse.js.";
      }

      setChatMessages(prev => [...prev, { sender: 'assistant', content }]);
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${
      theme === 'light' ? 'bg-zinc-50' : theme === 'dark' ? 'bg-zinc-950' : 'bg-[#faf4e8]'
    }`}>
      <Head>
        <title>{documentTitle} - EchoReader AI Reader Workspace</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>

      {/* Top Navbar */}
      <header className="px-6 py-3 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-900 bg-transparent">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 dark:text-zinc-400 font-semibold"
          >
            &larr; Back to Dashboard
          </button>
          <span className="h-4 w-px bg-zinc-800" />
          <h1 className="font-bold text-sm tracking-tight text-zinc-800 dark:text-zinc-100 max-w-sm truncate">
            {documentTitle}
          </h1>
        </div>

        {/* Theme Settings selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-200 dark:bg-zinc-900 rounded-lg p-0.5 border border-zinc-300 dark:border-zinc-800">
            {(['light', 'dark', 'sepia'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-1 text-xs font-semibold capitalize rounded-md transition-all ${
                  theme === t
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Workspace split */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-[calc(100vh-140px)] overflow-hidden">
        {/* Document view panel */}
        <div className="md:col-span-2 h-full">
          <ReaderPanel
            sentences={sentences}
            currentIndex={currentIndex}
            onSentenceClick={(idx) => setCurrentIndex(idx)}
            title={documentTitle}
            theme={theme}
          />
        </div>

        {/* AI QA panel */}
        <div className="h-full">
          <ChatSidebar
            messages={chatMessages}
            inputValue={chatInput}
            onInputChange={setChatInput}
            onSendMessage={handleSendMessage}
            isGenerating={isGenerating}
          />
        </div>
      </div>

      {/* Floating Audio Playback Controls bar */}
      <FloatingPlayer
        isPlaying={isPlaying}
        onPlayPause={isPlaying ? pause : play}
        onStop={stop}
        onNext={skipForward}
        onPrev={skipBackward}
        speed={speed}
        onSpeedChange={setSpeed}
        currentIndex={currentIndex}
        totalIndex={sentences.length}
        voices={availableVoices}
        selectedVoice={selectedVoice}
        onVoiceChange={setSelectedVoice}
      />
    </div>
  );
}
