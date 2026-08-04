import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await uploadFile(files[0]);
    }
  };

  const uploadFile = async (file: File) => {
    setUploadStatus('Uploading and parsing document structure...');
    
    // Simulate upload processing logic for local/standalone client
    setTimeout(() => {
      // Create a mock document ID and redirect to the reader page
      router.push(`/reader?mock=true&title=${encodeURIComponent(file.name)}`);
    }, 1500);
  };

  const loadMockDocument = (title: string) => {
    router.push(`/reader?mock=true&title=${encodeURIComponent(title)}`);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-emerald-500/30 selection:text-emerald-300">
      <Head>
        <title>EchoReader AI - Convert PDF, EPUB, DOCX Documents to Natural Speech</title>
        <meta name="description" content="EchoReader AI is a professional cross-platform Document Reader that parses layout structures (PDF, EPUB, Word, spread sheets) and reads text with natural voice speech synchronizations and interactive RAG chat capabilities." />
        <meta name="keywords" content="Text to Speech, PDF reader, document to voice, AI reader, RAG document chat, EPUB speech, optical character recognition, local LLM Ollama reader" />
        <link rel="canonical" href="https://app.stream-in.app" />

        {/* OpenGraph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://app.stream-in.app" />
        <meta property="og:title" content="EchoReader AI - Intelligent Document to Speech" />
        <meta property="og:description" content="Convert PDFs, Word docs, Spreadsheets, or Epubs into natural high-fidelity voices with sentence highlights, auto-scroll, and an AI chat assistant running semantic queries." />
        <meta property="og:image" content="https://app.stream-in.app/assets/seo-banner.jpg" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.stream-in.app" />
        <meta property="twitter:title" content="EchoReader AI - Intelligent Document to Speech" />
        <meta property="twitter:description" content="Convert PDFs, Word docs, Spreadsheets, or Epubs into natural high-fidelity voices with sentence highlights, auto-scroll, and an AI chat assistant running semantic queries." />
        <meta property="twitter:image" content="https://app.stream-in.app/assets/seo-banner.jpg" />

        {/* Google Structured Data / Rich Snippets (Schema.org JSON-LD) */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "EchoReader AI",
              "url": "https://app.stream-in.app",
              "description": "An AI-powered cross-platform Document Reader that converts uploaded documents into natural human speech while allowing intelligent interaction with the document.",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Windows, macOS, Linux, Web",
              "features": [
                "Intelligent Document parsing",
                "Natural High-Fidelity Text-to-Speech",
                "Real-time follow-along highlights",
                "AI document chat RAG pipeline",
                "Tesseract local OCR"
              ],
              "offers": {
                "@type": "Offer",
                "price": "0.00",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </Head>

      {/* Header navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center font-bold text-black shadow-md shadow-emerald-500/20">
            ER
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            EchoReader <span className="text-emerald-500 font-medium">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold hover:text-zinc-300 transition-colors">Sign In</button>
          <button className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-3.5 py-1.5 rounded-lg text-sm font-bold shadow-md shadow-emerald-500/10 active:scale-95 transition-all">
            Get Started
          </button>
        </div>
      </header>

      {/* Main content hero */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-16 flex flex-col items-center justify-center text-center">
        
        {/* Glow accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            V1.0.0 Production-Ready Desktop & Web App
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-none">
            Listen to your documents,{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-500 bg-clip-text text-transparent block mt-2">
              interactively and naturally.
            </span>
          </h1>

          <p className="text-base md:text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Convert PDFs, Word docs, Spreadsheets, or Epubs into natural high-fidelity voices with sentence highlights, auto-scroll, and an AI chat assistant running semantic queries.
          </p>
        </div>

        {/* Drag and Drop Container */}
        <div className="mt-12 w-full max-w-xl relative z-10">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all duration-300 ${
              isDragging
                ? 'border-emerald-400 bg-emerald-500/5 scale-[1.01]'
                : 'border-zinc-800 bg-zinc-900/40 hover:border-zinc-700'
            }`}
          >
            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-4 text-emerald-400">
              <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            <p className="font-semibold text-zinc-300 mb-1">
              Drag and drop your file here, or{' '}
              <label className="text-emerald-400 hover:text-emerald-300 cursor-pointer underline">
                browse files
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.docx,.pptx,.txt,.rtf,.md,.html,.csv,.epub"
                />
              </label>
            </p>
            <p className="text-xs text-zinc-500">
              Supports PDF, DOCX, EPUB, MD, TXT (Max 50MB)
            </p>

            {uploadStatus && (
              <div className="mt-6 text-sm text-emerald-400 font-semibold animate-pulse">
                {uploadStatus}
              </div>
            )}
          </div>
        </div>

        {/* Demo Documents list */}
        <div className="mt-10 relative z-10 w-full max-w-xl text-left">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-3">Try these sample documents</h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => loadMockDocument('EchoReader AI Documentation.pdf')}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left rounded-xl flex items-center gap-3 group transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold text-xs group-hover:bg-emerald-500 group-hover:text-black transition-colors">
                DOC
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">ER-AI Documentation</p>
                <p className="text-[10px] text-zinc-500">Technical Overview</p>
              </div>
            </button>

            <button
              onClick={() => loadMockDocument('RAG Architecture Best Practices.epub')}
              className="p-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-left rounded-xl flex items-center gap-3 group transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-500 group-hover:text-black transition-colors">
                EPUB
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-300">RAG Best Practices</p>
                <p className="text-[10px] text-zinc-500">Ebook guide</p>
              </div>
            </button>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-zinc-900 text-center text-xs text-zinc-600">
        &copy; {new Date().getFullYear()} EchoReader AI Inc. All rights reserved.
      </footer>
    </div>
  );
}
