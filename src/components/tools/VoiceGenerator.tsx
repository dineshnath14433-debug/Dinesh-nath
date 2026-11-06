import React, { useState, useEffect } from 'react';
import { Mic, Play, Pause, Square, Sparkles, Volume2, ArrowLeft, BookmarkPlus, Sliders, Check, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { speechController } from '../../utils/speech';
import { SavedCreation } from '../../types';

interface VoiceGeneratorProps {
  onBack: () => void;
  onSaveCreation: (creation: Omit<SavedCreation, 'id' | 'timestamp'>) => void;
  initialText?: string;
}

interface VoicePersona {
  id: string;
  name: string;
  gender: string;
  accent: string;
  tone: string;
  avatarColor: string;
}

const PERSONAS: VoicePersona[] = [
  { id: 'Nova', name: 'Nova', gender: 'Female', accent: 'Natural Warm', tone: 'Expressive & Caring', avatarColor: 'from-pink-500 to-rose-600' },
  { id: 'Echo', name: 'Echo', gender: 'Male', accent: 'Cinematic Deep', tone: 'Commanding & Bold', avatarColor: 'from-indigo-500 to-blue-700' },
  { id: 'Shimmer', name: 'Shimmer', gender: 'Female', accent: 'Upbeat Tech', tone: 'Energetic & Crisp', avatarColor: 'from-amber-400 to-orange-500' },
  { id: 'Onyx', name: 'Onyx', gender: 'Male', accent: 'Radio Host', tone: 'Smooth & Resonant', avatarColor: 'from-purple-600 to-slate-900' },
  { id: 'Fable', name: 'Fable', gender: 'Neutral', accent: 'British Lore', tone: 'Refined & Poetic', avatarColor: 'from-emerald-500 to-teal-700' },
  { id: 'Alloy', name: 'Alloy', gender: 'Neutral', accent: 'Balanced Modern', tone: 'Clear & Trustworthy', avatarColor: 'from-cyan-500 to-indigo-600' }
];

const VOICE_PRESETS = [
  { label: '🎙️ Podcast Intro', text: 'Welcome back to Future Visions. Today, we dive into how artificial intelligence is reshaping human creativity and music production.' },
  { label: '🧘 Calm Meditation', text: 'Take a deep, slow breath in through your nose... hold for three seconds... and gently release. Allow all tension in your shoulders to dissolve.' },
  { label: '🚀 Keynote Reveal', text: 'Today, we are thrilled to unveil the next generation of creative computation. This isn’t an upgrade—it is a completely reimagined paradigm.' },
  { label: '📢 Breaking News', text: 'Astronomers in the Atacama Desert have verified an anomalous repeating radio signal emanating from the Gliese system.' }
];

export const VoiceGenerator: React.FC<VoiceGeneratorProps> = ({ onBack, onSaveCreation, initialText = '' }) => {
  const [text, setText] = useState<string>(initialText || VOICE_PRESETS[0].text);
  const [selectedPersona, setSelectedPersona] = useState<VoicePersona>(PERSONAS[0]);
  const [speed, setSpeed] = useState<number>(1.0);
  const [pitch, setPitch] = useState<number>(1.0);
  
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPolishing, setIsPolishing] = useState<boolean>(false);
  const [directorNotes, setDirectorNotes] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    if (initialText) setText(initialText);
  }, [initialText]);

  useEffect(() => {
    return () => {
      speechController.stop();
    };
  }, []);

  const handlePlayVoice = () => {
    soundManager.playTap();
    if (isPlaying) {
      speechController.stop();
      setIsPlaying(false);
      return;
    }

    speechController.speak({
      text,
      voiceName: selectedPersona.id,
      rate: speed,
      pitch: pitch,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleStopVoice = () => {
    soundManager.playTap();
    speechController.stop();
    setIsPlaying(false);
  };

  const handlePolishVoiceScript = async () => {
    if (!text.trim()) return;
    soundManager.playTap();
    setIsPolishing(true);

    try {
      const response = await fetch('/api/generate-voice-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          voice: selectedPersona.name,
          style: selectedPersona.tone,
        }),
      });

      const data = await response.json();
      if (data.data?.spokenText) {
        setText(data.data.spokenText);
        setDirectorNotes(data.data.pacingNotes || '');
        soundManager.playSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSave = () => {
    if (!text) return;
    soundManager.playTap();
    onSaveCreation({
      toolId: 'voice',
      title: `${selectedPersona.name} Voiceover`,
      preview: `${selectedPersona.name} (${selectedPersona.accent}) • ${speed}x speed`,
      content: {
        text,
        voice: selectedPersona.name,
        speed,
        pitch,
        pacingNotes: directorNotes,
      },
      metadata: { voice: selectedPersona.name, speed },
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
          <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
          <span className="text-xs font-semibold text-pink-300">AI Voice Generator</span>
        </div>
      </div>

      {/* Spoken Text Card */}
      <div className="glass-panel p-4 rounded-2xl border border-pink-500/20 shadow-lg shadow-pink-950/20 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-pink-400" />
            <span>Spoken Script</span>
          </label>
          <button
            onClick={handlePolishVoiceScript}
            disabled={isPolishing || !text.trim()}
            className="flex items-center gap-1 text-[11px] font-semibold text-pink-300 bg-pink-950/60 hover:bg-pink-900/60 border border-pink-500/30 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
          >
            <Wand2 className={`w-3 h-3 ${isPolishing ? 'animate-spin' : ''}`} />
            <span>{isPolishing ? 'Polishing Script...' : 'AI Voice Polish'}</span>
          </button>
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter the speech you want synthesized into realistic voice..."
          rows={4}
          className="w-full bg-slate-900/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700/70 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all resize-none"
        />

        {directorNotes && (
          <div className="px-3 py-2 rounded-xl bg-pink-950/30 border border-pink-500/20 text-[11px] text-pink-200">
            <span className="font-bold">Director Notes:</span> {directorNotes}
          </div>
        )}

        {/* Quick Voice Presets */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Script Inspirations:</span>
          <div className="flex flex-wrap gap-1.5">
            {VOICE_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setText(p.text);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-pink-950/40 border border-slate-800 hover:border-pink-500/40 text-slate-300 transition-colors"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Voice Persona Selector */}
      <div className="glass-card p-4 rounded-2xl flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300">Choose AI Persona</span>
          <span className="text-[11px] text-pink-400 font-medium">{selectedPersona.name} ({selectedPersona.gender})</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {PERSONAS.map((persona) => {
            const isSelected = selectedPersona.id === persona.id;
            return (
              <div
                key={persona.id}
                onClick={() => {
                  soundManager.playTap();
                  setSelectedPersona(persona);
                }}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-1 ${
                  isSelected
                    ? 'bg-pink-950/40 border-pink-500 shadow-md shadow-pink-950/40'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-tr ${persona.avatarColor} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                    {persona.name[0]}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-pink-400" />}
                </div>
                <div className="mt-1">
                  <h4 className="text-xs font-bold text-slate-100">{persona.name}</h4>
                  <p className="text-[10px] text-pink-300">{persona.accent}</p>
                  <p className="text-[10px] text-slate-400 truncate">{persona.tone}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Voice Controls: Speed & Pitch */}
      <div className="glass-card p-4 rounded-2xl flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-pink-400" />
          <span>Speech Dynamics</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Pace / Speed</span>
              <span className="font-mono text-pink-400 font-semibold">{speed.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              className="accent-pink-500 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Pitch / Tone</span>
              <span className="font-mono text-pink-400 font-semibold">{pitch.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.8"
              max="1.4"
              step="0.1"
              value={pitch}
              onChange={(e) => setPitch(parseFloat(e.target.value))}
              className="accent-pink-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Live Voice Playback Deck */}
      <div className="glass-panel p-4 rounded-2xl border border-pink-500/30 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center ${isPlaying ? 'text-pink-400 animate-pulse' : 'text-slate-400'}`}>
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">{selectedPersona.name} Synthesis</p>
              <p className="text-[10px] text-slate-400">{isPlaying ? 'Streaming Audio Playback...' : 'Ready to Synthesize'}</p>
            </div>
          </div>

          {/* Animated soundwaves */}
          <div className="flex items-center gap-1 h-6 px-3">
            {[1, 2, 3, 4, 5, 2, 4].map((n, idx) => (
              <span
                key={idx}
                className={`w-1 rounded-full bg-pink-500 transition-all ${
                  isPlaying ? `animate-wave-${(idx % 5) + 1}` : 'h-1.5 opacity-30'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Big Play / Stop Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handlePlayVoice}
            disabled={!text.trim()}
            className={`flex-1 py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
              isPlaying
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
                : 'bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 text-white shadow-lg shadow-pink-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Voice</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Synthesize & Speak</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              onClick={handleStopVoice}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              title="Stop Speech"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-1 px-3.5 py-3 rounded-xl text-xs font-semibold transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkPlus className="w-4 h-4" />}
            <span>{saved ? 'Saved' : 'Save'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
