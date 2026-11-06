import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Volume2, Copy, Check, ArrowLeft, BookmarkPlus, Sparkles, BookOpen, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { speechController } from '../../utils/speech';
import { SavedCreation, TranslationGeneration } from '../../types';

interface TranslatorProps {
  onBack: () => void;
  onSaveCreation: (creation: Omit<SavedCreation, 'id' | 'timestamp'>) => void;
  initialText?: string;
}

const LANGUAGES = [
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'Japanese', code: 'ja' },
  { name: 'German', code: 'de' },
  { name: 'Chinese (Mandarin)', code: 'zh' },
  { name: 'Hindi', code: 'hi' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Italian', code: 'it' },
  { name: 'Korean', code: 'ko' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian', code: 'ru' },
  { name: 'Dutch', code: 'nl' },
  { name: 'Turkish', code: 'tr' },
  { name: 'English', code: 'en' },
];

const TONES = ['Natural & Fluent', 'Business Formal', 'Casual / Slang', 'Friendly & Warm', 'Diplomatic'];

const TRANSLATION_PRESETS = [
  { label: '👋 Warm Welcome', text: 'Welcome to SMART AI HUB. Experience the future of artificial intelligence in your pocket.' },
  { label: '💼 Enterprise Deal', text: 'We look forward to forging a strategic partnership and scaling our computational infrastructure together.' },
  { label: '✈️ Travel Request', text: 'Could you please recommend an authentic local restaurant away from the tourist crowd?' },
  { label: '💡 Creative Vision', text: 'Art and technology are not opposites; they are twin lenses through which humanity reflects its dreams.' }
];

export const Translator: React.FC<TranslatorProps> = ({ onBack, onSaveCreation, initialText = '' }) => {
  const [sourceLang, setSourceLang] = useState<string>('Auto Detect');
  const [targetLang, setTargetLang] = useState<string>('Spanish');
  const [text, setText] = useState<string>(initialText || TRANSLATION_PRESETS[0].text);
  const [tone, setTone] = useState<string>('Natural & Fluent');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [translationResult, setTranslationResult] = useState<TranslationGeneration | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const handleSwap = () => {
    soundManager.playTap();
    if (sourceLang === 'Auto Detect') {
      setSourceLang(targetLang);
      setTargetLang('English');
    } else {
      const prevSource = sourceLang;
      setSourceLang(targetLang);
      setTargetLang(prevSource);
    }
    if (translationResult?.translatedText) {
      setText(translationResult.translatedText);
      setTranslationResult(null);
    }
  };

  const handleTranslate = async () => {
    if (!text.trim()) return;
    soundManager.playTap();
    setIsLoading(true);
    setSaved(false);

    try {
      const response = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          sourceLang,
          targetLang,
          tone,
        }),
      });

      const data = await response.json();
      if (data.result) {
        setTranslationResult({
          sourceLang: data.result.detectedSourceLang || sourceLang,
          targetLang,
          originalText: text,
          translatedText: data.result.translatedText,
          pronunciation: data.result.pronunciation,
          formalityNotes: data.result.formalityNotes,
          culturalNuance: data.result.culturalNuance,
          keyVocabulary: data.result.keyVocabulary,
        });
        soundManager.playSuccess();
        confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakTranslation = () => {
    if (!translationResult?.translatedText) return;
    soundManager.playTap();

    const targetObj = LANGUAGES.find((l) => l.name === targetLang);
    const langCode = targetObj ? targetObj.code : 'es';

    speechController.speak({
      text: translationResult.translatedText,
      lang: langCode,
      rate: 0.95,
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleCopy = () => {
    if (!translationResult?.translatedText) return;
    soundManager.playTap();
    navigator.clipboard.writeText(translationResult.translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    if (!translationResult) return;
    soundManager.playTap();
    onSaveCreation({
      toolId: 'translate',
      title: `${targetLang}: ${text.slice(0, 30)}...`,
      preview: `${sourceLang} ➔ ${targetLang} • ${tone}`,
      content: translationResult,
      metadata: { targetLang, tone },
    });
    setSaved(true);
    confetti({ particleCount: 35, spread: 60, origin: { y: 0.5 } });
  };

  return (
    <div className="p-4 flex flex-col gap-5 max-w-2xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playTap();
            speechController.stop();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
          <span className="text-xs font-semibold text-indigo-300">AI Translator</span>
        </div>
      </div>

      {/* Language Switcher Bar */}
      <div className="glass-card p-3 rounded-2xl flex items-center justify-between gap-2 border border-slate-800">
        <div className="flex-1 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">From</span>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="Auto Detect">Auto Detect</option>
            {LANGUAGES.map((l) => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={handleSwap}
          className="p-2 rounded-full bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 transition-all self-end mb-0.5"
          title="Swap Languages"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 flex flex-col">
          <span className="text-[10px] text-slate-400 uppercase font-semibold">To</span>
          <select
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="bg-slate-900 border border-slate-700/80 rounded-lg px-2 py-1.5 text-xs font-semibold text-indigo-300 focus:outline-none focus:border-indigo-500"
          >
            {LANGUAGES.filter(l => l.name !== 'Auto Detect').map((l) => (
              <option key={l.name} value={l.name}>{l.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Source Text Input */}
      <div className="glass-panel p-4 rounded-2xl border border-indigo-500/20 shadow-lg shadow-indigo-950/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
            <Languages className="w-4 h-4 text-indigo-400" />
            <span>Text to Translate</span>
          </label>
          <span className="text-[10px] text-slate-400">{text.length} chars</span>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste any phrase, conversation, or article to translate..."
          rows={3}
          className="w-full bg-slate-900/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700/70 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
        />

        {/* Preset Sentences */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Sample Phrases:</span>
          <div className="flex flex-wrap gap-1.5">
            {TRANSLATION_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setText(p.text);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-slate-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Register / Tone Selector */}
      <div className="glass-card p-3 rounded-2xl flex items-center justify-between gap-3">
        <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Register & Tone:</span>
        <div className="flex gap-1.5 overflow-x-auto py-1">
          {TONES.map((t) => (
            <button
              key={t}
              onClick={() => {
                soundManager.playTap();
                setTone(t);
              }}
              className={`text-xs px-2.5 py-1 rounded-lg border whitespace-nowrap transition-all ${
                tone === t
                  ? 'bg-indigo-600/30 border-indigo-500 text-white font-medium'
                  : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Translate Action Button */}
      <button
        onClick={handleTranslate}
        disabled={isLoading || !text.trim()}
        className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
      >
        {isLoading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-indigo-200" />
            <span>Translating with Nuance...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4" />
            <span>Translate to {targetLang}</span>
          </>
        )}
      </button>

      {/* Translation Output Card */}
      {translationResult && (
        <div className="flex flex-col gap-4 mt-2">
          {/* Main Translated Box */}
          <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-slate-900/90 to-indigo-950/20 flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                {translationResult.targetLang} Translation
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleSpeakTranslation}
                  className={`p-2 rounded-lg transition-all ${
                    isPlayingAudio
                      ? 'bg-pink-600 text-white animate-pulse'
                      : 'bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30'
                  }`}
                  title="Listen Pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Copy Translation"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    saved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-600 text-white hover:bg-indigo-500'
                  }`}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            <p className="text-base sm:text-lg font-medium text-white leading-relaxed">
              {translationResult.translatedText}
            </p>

            {translationResult.pronunciation && (
              <p className="text-xs font-mono text-indigo-300/80 italic">
                Phonetics: {translationResult.pronunciation}
              </p>
            )}

            {translationResult.culturalNuance && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 mt-2 flex items-start gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-indigo-300">Cultural Context: </span>
                  {translationResult.culturalNuance}
                </div>
              </div>
            )}

            {/* Key Vocabulary Pills */}
            {translationResult.keyVocabulary && translationResult.keyVocabulary.length > 0 && (
              <div className="mt-2 flex flex-col gap-1.5">
                <span className="text-[11px] font-semibold text-slate-400">Vocabulary Breakdown:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {translationResult.keyVocabulary.map((vocab, i) => (
                    <div key={i} className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-xs flex flex-col gap-0.5">
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-200">{vocab.term}</span>
                        <span className="text-indigo-400">{vocab.translation}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{vocab.notes}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
