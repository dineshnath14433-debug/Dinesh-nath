// Web Speech API Voice Controller

export interface SpeakOptions {
  text: string;
  voiceName?: string;
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

class SpeechController {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    if (this.voices.length === 0) {
      this.voices = this.synth.getVoices();
    }
    return this.voices;
  }

  public findVoiceForPersona(personaName: string, langCode: string = 'en'): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    if (!voices || voices.length === 0) return null;

    // Filter by lang if specified
    const langVoices = voices.filter(v => v.lang.toLowerCase().startsWith(langCode.toLowerCase()));
    const targetPool = langVoices.length > 0 ? langVoices : voices;

    const lower = personaName.toLowerCase();
    if (lower.includes('nova') || lower.includes('shimmer')) {
      // Female preference
      const female = targetPool.find(v => 
        v.name.toLowerCase().includes('female') || 
        v.name.toLowerCase().includes('zira') || 
        v.name.toLowerCase().includes('samantha') || 
        v.name.toLowerCase().includes('victoria') ||
        v.name.toLowerCase().includes('karen') ||
        v.name.toLowerCase().includes('google uk english female')
      );
      if (female) return female;
    } else if (lower.includes('echo') || lower.includes('onyx')) {
      // Male / deeper preference
      const male = targetPool.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('daniel') || 
        v.name.toLowerCase().includes('alex') || 
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('google uk english male')
      );
      if (male) return male;
    } else if (lower.includes('fable')) {
      // British preference
      const british = targetPool.find(v => v.lang.toLowerCase().includes('gb') || v.name.toLowerCase().includes('uk') || v.name.toLowerCase().includes('british'));
      if (british) return british;
    }

    return targetPool[0] || null;
  }

  public findVoiceForLang(langCode: string): SpeechSynthesisVoice | null {
    const voices = this.getVoices();
    const lower = langCode.toLowerCase();
    const match = voices.find(v => 
      v.lang.toLowerCase().startsWith(lower) || 
      (lower.startsWith('hi') && (v.name.toLowerCase().includes('hindi') || v.lang.toLowerCase().includes('hi')))
    );
    if (match) return match;
    return voices.find(v => v.lang.toLowerCase().startsWith(lower.slice(0, 2))) || null;
  }

  public speak(options: SpeakOptions) {
    if (!this.synth) {
      options.onError?.('Speech synthesis not supported in this browser.');
      return;
    }

    this.stop();

    const utterance = new SpeechSynthesisUtterance(options.text);
    if (options.rate !== undefined) utterance.rate = options.rate;
    if (options.pitch !== undefined) utterance.pitch = options.pitch;
    if (options.volume !== undefined) utterance.volume = options.volume;

    const isHindi = /[\u0900-\u097F]/.test(options.text) || options.lang?.toLowerCase().startsWith('hi');
    const targetLang = isHindi ? 'hi-IN' : (options.lang || 'en-US');
    utterance.lang = targetLang;

    let selectedVoice: SpeechSynthesisVoice | null = null;
    if (isHindi) {
      selectedVoice = this.findVoiceForLang('hi');
    } else if (options.voiceName) {
      selectedVoice = this.findVoiceForPersona(options.voiceName, targetLang);
    } else if (options.lang) {
      selectedVoice = this.findVoiceForLang(options.lang);
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      options.onStart?.();
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.isSpeaking = false;
      options.onError?.(e);
    };

    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.isSpeaking = false;
    }
  }

  public pause() {
    if (this.synth) {
      this.synth.pause();
    }
  }

  public resume() {
    if (this.synth) {
      this.synth.resume();
    }
  }

  public getIsSpeaking(): boolean {
    return this.isSpeaking;
  }
}

export const speechController = new SpeechController();
