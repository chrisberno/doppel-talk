/**
 * Voice Library
 * 
 * Curated voices from doppel-center v1, ported to TypeScript.
 * Supports multiple providers: chatterbox, twilio, polly
 */

export type VoiceProvider = 'chatterbox' | 'twilio' | 'polly';
export type VoiceGender = 'male' | 'female' | 'neutral';

export interface Voice {
  id: string;
  name: string;
  provider: VoiceProvider;
  providerVoiceId: string; // The actual voice ID used by the provider
  language: string; // Display name (e.g., "English (US)")
  languageCode: string; // ISO code (e.g., "en-US")
  gender: VoiceGender;
  accent?: string;
  tone?: string;
  tags?: string[];
  description?: string;
  sampleUrl?: string;
  engine?: 'neural' | 'standard' | 'generative';
}

export const voices: Voice[] = [
  // Twilio/Polly Voices (from v1)
  {
    id: "polly-joanna-neural",
    name: "Joanna",
    provider: "twilio",
    providerVoiceId: "Polly.Joanna-Neural",
    language: "English (US)",
    languageCode: "en-US",
    gender: "female",
    accent: "american",
    tone: "professional",
    tags: ["professional", "warm", "clear"],
    description: "Clear, professional American female voice",
    sampleUrl: "/assets/audio/samples/polly-joanna-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-matthew-neural",
    name: "Matthew",
    provider: "twilio",
    providerVoiceId: "Polly.Matthew-Neural",
    language: "English (US)",
    languageCode: "en-US",
    gender: "male",
    accent: "american",
    tone: "formal",
    tags: ["professional", "calm", "authoritative"],
    description: "Calm and authoritative professional male voice",
    sampleUrl: "/assets/audio/samples/polly-matthew-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-ruth-generative",
    name: "Ruth",
    provider: "twilio",
    providerVoiceId: "Polly.Ruth-Generative",
    language: "English (US)",
    languageCode: "en-US",
    gender: "female",
    accent: "american",
    tone: "casual",
    tags: ["natural", "conversational", "warm"],
    description: "Natural, conversational style that feels warm and approachable",
    sampleUrl: "/assets/audio/samples/polly-ruth-generative.mp3",
    engine: "generative",
  },
  {
    id: "polly-stephen-generative",
    name: "Stephen",
    provider: "twilio",
    providerVoiceId: "Polly.Stephen-Generative",
    language: "English (US)",
    languageCode: "en-US",
    gender: "male",
    accent: "american",
    tone: "professional",
    tags: ["natural", "professional", "clear"],
    description: "Natural voice with professional clarity and modern sound",
    sampleUrl: "/assets/audio/samples/polly-stephen-generative.mp3",
    engine: "generative",
  },
  {
    id: "polly-ivy-neural",
    name: "Ivy",
    provider: "twilio",
    providerVoiceId: "Polly.Ivy-Neural",
    language: "English (US)",
    languageCode: "en-US",
    gender: "female",
    accent: "american",
    tone: "friendly",
    tags: ["friendly", "youthful", "clear"],
    description: "Friendly and youthful voice for engaging content",
    sampleUrl: "/assets/audio/samples/polly-ivy-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-joey-neural",
    name: "Joey",
    provider: "twilio",
    providerVoiceId: "Polly.Joey-Neural",
    language: "English (US)",
    languageCode: "en-US",
    gender: "male",
    accent: "american",
    tone: "casual",
    tags: ["friendly", "casual", "warm"],
    description: "Friendly and casual voice for relaxed conversations",
    sampleUrl: "/assets/audio/samples/polly-joey-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-amy-neural",
    name: "Amy",
    provider: "twilio",
    providerVoiceId: "Polly.Amy-Neural",
    language: "English (GB)",
    languageCode: "en-GB",
    gender: "female",
    accent: "british",
    tone: "professional",
    tags: ["professional", "british", "clear"],
    description: "Professional British accent with clear tone",
    sampleUrl: "/assets/audio/samples/polly-amy-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-brian-neural",
    name: "Brian",
    provider: "twilio",
    providerVoiceId: "Polly.Brian-Neural",
    language: "English (GB)",
    languageCode: "en-GB",
    gender: "male",
    accent: "british",
    tone: "formal",
    tags: ["professional", "british", "authoritative"],
    description: "Authoritative British voice for formal communications",
    sampleUrl: "/assets/audio/samples/polly-brian-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-emma-neural",
    name: "Emma",
    provider: "twilio",
    providerVoiceId: "Polly.Emma-Neural",
    language: "English (GB)",
    languageCode: "en-GB",
    gender: "female",
    accent: "british",
    tone: "friendly",
    tags: ["warm", "british", "friendly"],
    description: "Warm and friendly British voice for customer interactions",
    sampleUrl: "/assets/audio/samples/polly-emma-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-lupe-neural",
    name: "Lupe",
    provider: "twilio",
    providerVoiceId: "Polly.Lupe-Neural",
    language: "Spanish (US)",
    languageCode: "es-US",
    gender: "female",
    accent: "bilingual",
    tone: "professional",
    tags: ["professional", "clear", "bilingual"],
    description: "Professional voice perfect for bilingual communications",
    sampleUrl: "/assets/audio/samples/polly-lupe-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-pedro-neural",
    name: "Pedro",
    provider: "twilio",
    providerVoiceId: "Polly.Pedro-Neural",
    language: "Spanish (US)",
    languageCode: "es-US",
    gender: "male",
    accent: "bilingual",
    tone: "professional",
    tags: ["professional", "clear", "bilingual"],
    description: "Clear and professional voice for bilingual audiences",
    sampleUrl: "/assets/audio/samples/polly-pedro-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-mia-neural",
    name: "Mia",
    provider: "twilio",
    providerVoiceId: "Polly.Mia-Neural",
    language: "Spanish (MX)",
    languageCode: "es-MX",
    gender: "female",
    accent: "mexican-spanish",
    tone: "friendly",
    tags: ["warm", "mexican-spanish", "friendly"],
    description: "Warm and friendly voice ideal for Mexican market",
    sampleUrl: "/assets/audio/samples/polly-mia-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-camila-neural",
    name: "Camila",
    provider: "twilio",
    providerVoiceId: "Polly.Camila-Neural",
    language: "Portuguese (BR)",
    languageCode: "pt-BR",
    gender: "female",
    accent: "brazilian",
    tone: "professional",
    tags: ["professional", "brazilian", "clear"],
    description: "Professional and clear voice perfect for Brazilian market",
    sampleUrl: "/assets/audio/samples/polly-camila-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-thiago-neural",
    name: "Thiago",
    provider: "twilio",
    providerVoiceId: "Polly.Thiago-Neural",
    language: "Portuguese (BR)",
    languageCode: "pt-BR",
    gender: "male",
    accent: "brazilian",
    tone: "professional",
    tags: ["professional", "brazilian", "warm"],
    description: "Professional and warm voice ideal for business communications",
    sampleUrl: "/assets/audio/samples/polly-thiago-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-lea-neural",
    name: "Léa",
    provider: "twilio",
    providerVoiceId: "Polly.Lea-Neural",
    language: "French",
    languageCode: "fr-FR",
    gender: "female",
    accent: "french",
    tone: "professional",
    tags: ["professional", "french", "clear"],
    description: "Professional and clear voice perfect for communications",
    sampleUrl: "/assets/audio/samples/polly-lea-neural.mp3",
    engine: "neural",
  },
  {
    id: "polly-remi-neural",
    name: "Rémi",
    provider: "twilio",
    providerVoiceId: "Polly.Remi-Neural",
    language: "French",
    languageCode: "fr-FR",
    gender: "male",
    accent: "french",
    tone: "formal",
    tags: ["professional", "french", "warm"],
    description: "Warm and professional voice suitable for all communications",
    sampleUrl: "/assets/audio/samples/polly-remi-neural.mp3",
    engine: "neural",
  },
];

/**
 * Get voices filtered by provider
 */
export function getVoicesByProvider(provider: VoiceProvider): Voice[] {
  return voices.filter(v => v.provider === provider);
}

/**
 * Get voices filtered by language code
 */
export function getVoicesByLanguage(languageCode: string): Voice[] {
  return voices.filter(v => v.languageCode.startsWith(languageCode.split('-')[0] || ''));
}

/**
 * Get voices filtered by gender
 */
export function getVoicesByGender(gender: VoiceGender): Voice[] {
  return voices.filter(v => v.gender === gender);
}

/**
 * Get a voice by ID
 */
export function getVoiceById(id: string): Voice | undefined {
  return voices.find(v => v.id === id);
}

/**
 * Get all unique providers
 */
export function getAllProviders(): VoiceProvider[] {
  return Array.from(new Set(voices.map(v => v.provider))) as VoiceProvider[];
}

/**
 * Get all unique languages
 */
export function getAllLanguages(): string[] {
  return Array.from(new Set(voices.map(v => v.language)));
}

