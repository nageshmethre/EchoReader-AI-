import axios from 'axios';

export interface TTSConfig {
  provider: 'openai' | 'azure' | 'elevenlabs' | 'local';
  voiceId: string;
  speed: number;
  pitch: number;
  emotion?: string;
}

/**
 * Request speech synthesis audio buffer from OpenAI TTS.
 */
export async function synthesizeOpenAI(text: string, voiceId = 'alloy', speed = 1.0): Promise<Buffer> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY');

  const response = await axios.post(
    'https://api.openai.com/v1/audio/speech',
    {
      model: 'tts-1',
      input: text,
      voice: voiceId, // alloy, echo, fable, onyx, nova, shimmer
      speed: speed,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
}

/**
 * Request speech synthesis audio buffer from ElevenLabs.
 */
export async function synthesizeElevenLabs(text: string, voiceId = '21m00Tcm4TlvDq8ikWAM', speed = 1.0): Promise<Buffer> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error('Missing ELEVENLABS_API_KEY');

  const response = await axios.post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    },
    {
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
}

/**
 * Request speech synthesis from Microsoft Azure Speech.
 */
export async function synthesizeAzure(text: string, voiceId = 'en-US-JennyNeural', speed = 1.0): Promise<Buffer> {
  const apiKey = process.env.AZURE_TTS_KEY;
  const region = process.env.AZURE_TTS_REGION || 'eastus';
  if (!apiKey) throw new Error('Missing AZURE_TTS_KEY');

  // Convert speed value into Azure SSML format
  const speedPercentage = Math.round((speed - 1.0) * 100);
  const speedStr = speedPercentage >= 0 ? `+${speedPercentage}%` : `${speedPercentage}%`;

  const ssml = `
    <speak version='1.0' xml:lang='en-US'>
      <voice name='${voiceId}'>
        <prosody rate='${speedStr}'>
          ${text}
        </prosody>
      </voice>
    </speak>
  `;

  const response = await axios.post(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    ssml,
    {
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
        'Content-Type': 'application/ssml+xml',
        'X-Search-AppId': '07D32C83-1D15-4540-A610-855D54D5A60F',
        'X-Search-ClientID': '1EC2A22F-1010-4A00-BD02-793D45DCA8C8',
        'User-Agent': 'EchoReaderAI',
        'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
      },
      responseType: 'arraybuffer',
    }
  );

  return Buffer.from(response.data);
}

/**
 * Master synthesis orchestrator.
 * If credentials are not present, it defaults to returning a mock speech buffer (to maintain offline & local-only running capabilities).
 */
export async function generateSpeechAudio(text: string, config: TTSConfig): Promise<Buffer> {
  try {
    if (config.provider === 'openai' && process.env.OPENAI_API_KEY) {
      return await synthesizeOpenAI(text, config.voiceId, config.speed);
    }
    if (config.provider === 'elevenlabs' && process.env.ELEVENLABS_API_KEY) {
      return await synthesizeElevenLabs(text, config.voiceId, config.speed);
    }
    if (config.provider === 'azure' && process.env.AZURE_TTS_KEY) {
      return await synthesizeAzure(text, config.voiceId, config.speed);
    }
    
    // Default mock local fallback for offline usage (generates silent or simple WAV mock buffer)
    console.warn(`TTS provider "${config.provider}" API key not found. Using local synthesis mock.`);
    return Buffer.alloc(1024); // Return a placeholder silent buffer
  } catch (error: any) {
    console.error('TTS Synthesis error:', error.message);
    throw error;
  }
}
