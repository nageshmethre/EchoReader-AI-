import { GoogleGenAI } from '@google/generative-ai';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize APIs if keys are available
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  // Note: Depending on SDK version, GoogleGenAI or GoogleGenerativeAI is instantiated.
  // We can write a clean direct fetch wrapper or use the SDK wrapper. Let's make it robust.
  return new GoogleGenAI({ apiKey });
};

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
};

const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Generate Summary of a document
 */
export async function generateSummary(text: string, provider: 'gemini' | 'openai' | 'ollama' = 'gemini'): Promise<string> {
  const prompt = `Please summarize the following document content in a concise, professional structure outlining key ideas and findings:\n\n${text.substring(0, 10000)}`;

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No summary generated.';
    }
  }

  if (provider === 'openai') {
    const openai = getOpenAIClient();
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      return completion.choices[0].message.content || '';
    }
  }

  // Ollama Local Fallback
  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: 'llama3',
      prompt: prompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    console.error('Ollama connection failed:', error);
    return 'Summary Service Offline. Please check your local Ollama connection.';
  }
}

/**
 * Translate a text block to a destination language
 */
export async function translateText(text: string, targetLanguage: string, provider: 'gemini' | 'openai' | 'ollama' = 'gemini'): Promise<string> {
  const prompt = `Translate the following text into ${targetLanguage}. Return ONLY the direct translation:\n\n${text}`;

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }]
        }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    }
  }

  if (provider === 'openai') {
    const openai = getOpenAIClient();
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }]
      });
      return completion.choices[0].message.content?.trim() || '';
    }
  }

  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: 'llama3',
      prompt: prompt,
      stream: false
    });
    return response.data.response.trim();
  } catch (error) {
    throw new Error('Translation Engine Offline');
  }
}

/**
 * RAG QA Pipeline over document contexts
 */
export async function queryDocumentRAG(
  query: string,
  contextChunks: string[],
  history: ChatMessage[],
  provider: 'gemini' | 'openai' | 'ollama' = 'gemini'
): Promise<string> {
  const contextBlock = contextChunks.join('\n\n');
  const systemPrompt = `You are EchoReader AI, a helpful document reading assistant.
Answer the user's question about the document using ONLY the provided context blocks.
If the answer cannot be found in the context blocks, politely state that the context does not contain this information.

Context chunks:
"""
${contextBlock}
"""`;

  const messages: ChatMessage[] = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: query }
  ];

  if (provider === 'gemini') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      // Map OpenAI structured history into Gemini API parts structures
      const contents = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
      })).filter(c => c.role === 'user' || c.role === 'model');

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        { contents }
      );
      return response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    }
  }

  if (provider === 'openai') {
    const openai = getOpenAIClient();
    if (openai) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: messages
      });
      return completion.choices[0].message.content || '';
    }
  }

  // Local Ollama
  try {
    const ollamaPrompt = `${systemPrompt}\n\nChat history:\n${history.map(h => `${h.role}: ${h.content}`).join('\n')}\n\nuser: ${query}`;
    const response = await axios.post(`${OLLAMA_HOST}/api/generate`, {
      model: 'llama3',
      prompt: ollamaPrompt,
      stream: false
    });
    return response.data.response;
  } catch (error) {
    throw new Error('Local LLM service failed to respond.');
  }
}

/**
 * Generate semantic embeddings vectors for search queries
 */
export async function generateEmbeddings(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    const openai = new OpenAI({ apiKey });
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  // If OpenAI is unavailable, try Ollama local embeddings
  try {
    const response = await axios.post(`${OLLAMA_HOST}/api/embeddings`, {
      model: 'nomic-embed-text',
      prompt: text
    });
    return response.data.embedding;
  } catch (error) {
    // Return empty mock vector for testing if offline and Ollama is not configured
    return new Array(1536).fill(0.0);
  }
}
