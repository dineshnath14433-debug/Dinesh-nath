export type ToolId = 'story' | 'script' | 'photo' | 'voice' | 'logo' | 'translate';

export interface ToolDefinition {
  id: ToolId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
  accentColor: string;
  gradient: string;
  category: string;
  popularPrompt: string;
}

export interface SavedCreation {
  id: string;
  toolId: ToolId;
  title: string;
  preview: string;
  content: any;
  timestamp: number;
  metadata?: Record<string, any>;
}

export interface StoryGeneration {
  title: string;
  genre: string;
  tone: string;
  protagonist: string;
  content: string;
}

export interface ScriptGeneration {
  title: string;
  format: string;
  duration: string;
  targetAudience: string;
  content: string;
}

export interface PhotoGeneration {
  prompt: string;
  style: string;
  aspectRatio: string;
  imageUrl: string;
  seed: number;
}

export interface VoiceGeneration {
  text: string;
  voice: string;
  speed: number;
  pitch: number;
  pacingNotes?: string;
  durationSeconds?: number;
}

export interface LogoGeneration {
  brandName: string;
  tagline: string;
  designConcept: string;
  palette: string[];
  typography: {
    fontFamily: string;
    letterSpacing: string;
    fontStyle: string;
  };
  svgContent: string;
}

export interface TranslationGeneration {
  sourceLang: string;
  targetLang: string;
  originalText: string;
  translatedText: string;
  pronunciation?: string;
  formalityNotes?: string;
  culturalNuance?: string;
  keyVocabulary?: Array<{ term: string; translation: string; notes: string }>;
}
