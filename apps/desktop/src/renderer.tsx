import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useTTSPlayback, useKeyPress } from '@echoreader/hooks';
import { FloatingPlayer, ReaderPanel, ChatSidebar } from '@echoreader/ui';

// Type definitions for window.electronAPI injected via preload
declare global {
  interface Window {
    electronAPI?: {
      readLocalFile: (filePath: string) => Promise<any>;
      saveOfflineBookmark: (bookmarkData: any) => Promise<any>;
      onTTSToggle: (callback: () => void) => () => void;
    };
  }
}

const App: React.FC = () => {
  const [documentTitle, setDocumentTitle] = useState('Local User Guide.txt');
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('dark');
  const [speed, setSpeed] = useState(1.0);
  const [selectedVoice, setSelectedVoice] = useState('local');

  const sentences = [
    "This is EchoReader AI running inside native Electron.",
    "This environment supports local file system access offline.",
    "Offline storage caches bookmark arrays inside application user data folders.",
    "Web Speech Synthesis generates local audio playback without needing active server endpoints.",
    "You can trigger playback toggles globally using the Ctrl+Alt+Space shortcut."
  ];

  const [availableVoices, setAvailableVoices] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const update = () => {
        const list = window.speechSynthesis.getVoices().map(v => ({ id: v.name, name: v.name }));
        setAvailableVoices(list.length > 0 ? list : [{ id: 'local', name: 'Default Local voice' }]);
      };
      update();
      window.speechSynthesis.onvoiceschanged = update;
    }
  }, []);

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
    speed
  });

  // Listen to IPC toggle actions from global shortcuts
  useEffect(() => {
    if (window.electronAPI) {
      const unsubscribe = window.electronAPI.onTTSToggle(() => {
        if (isPlaying) {
          pause();
        } else {
          play();
        }
      });
      return unsubscribe;
    }
  }, [isPlaying, play, pause]);

  // Key bindings
  useKeyPress(' ', () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying]);

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    setChatMessages(prev => [...prev, { sender: 'user', content: chatInput }]);
    setChatInput('');
    setIsGenerating(true);

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          content: "Since we are offline in desktop mode, this is a local simulated answer. All TTS synthetics are running on your system speech libraries."
        }
      ]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleSaveBookmark = async () => {
    if (window.electronAPI) {
      const res = await window.electronAPI.saveOfflineBookmark({
        title: `Bookmark at sentence ${currentIndex}`,
        pageIndex: 0,
        paragraphIndex: Math.floor(currentIndex / 5),
        sentenceIndex: currentIndex
      });
      if (res.success) {
        alert('Bookmark saved offline successfully!');
      } else {
        alert(`Failed to save: ${res.error}`);
      }
    } else {
      alert('Local storage mock: Saved bookmark.');
    }
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'light' ? 'bg-white' : theme === 'dark' ? 'bg-zinc-950' : 'bg-[#faf4e8]'}`}>
      <header className="px-6 py-3 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 text-white">
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-sm text-emerald-400">EchoReader Desktop</span>
          <span className="text-xs text-zinc-500">{documentTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSaveBookmark}
            className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded text-xs font-bold"
          >
            Save Bookmark
          </button>
          <div className="flex gap-1 bg-zinc-800 rounded p-0.5 border border-zinc-700">
            {(['light', 'dark', 'sepia'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`px-2.5 py-0.5 text-xs rounded font-medium ${theme === t ? 'bg-emerald-500 text-black' : 'text-zinc-400'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-3 gap-6 p-6 h-[calc(100vh-140px)] overflow-hidden">
        <div className="col-span-2 h-full">
          <ReaderPanel
            sentences={sentences}
            currentIndex={currentIndex}
            onSentenceClick={setCurrentIndex}
            title={documentTitle}
            theme={theme}
          />
        </div>
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
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
