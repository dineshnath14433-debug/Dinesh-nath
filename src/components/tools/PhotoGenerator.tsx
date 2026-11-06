import React, { useState, useEffect } from 'react';
import { Sparkles, Download, Copy, Check, ArrowLeft, BookmarkPlus, Maximize2, X, RefreshCw, Wand2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { SavedCreation } from '../../types';

interface PhotoGeneratorProps {
  onBack: () => void;
  onSaveCreation: (creation: Omit<SavedCreation, 'id' | 'timestamp'>) => void;
  initialPrompt?: string;
}

const STYLES = [
  'Photorealistic',
  'Cyberpunk',
  '3D Render',
  'Anime',
  'Cinematic',
  'Isometric 3D',
  'Digital Art',
  'Watercolor'
];

const RATIOS = [
  { id: '1:1', label: '1:1 Square' },
  { id: '16:9', label: '16:9 Cinema' },
  { id: '9:16', label: '9:16 Story' },
  { id: '4:3', label: '4:3 Standard' }
];

const PHOTO_PRESETS = [
  { label: '🏙️ Neo-Tokyo Rooftop', prompt: 'Bioluminescent greenhouse garden on a futuristic Tokyo skyscraper rooftop, rainy dusk, neon reflections, 8k cinematic.' },
  { label: '🪐 Quantum Core', prompt: 'Levitating crystalline quantum computer core emitting azure plasma rings inside a minimalist research laboratory.' },
  { label: '🦊 Cybernetic Fox', prompt: 'Mechanical cyber-fox with glowing amber optical lenses resting on ancient mossy stone ruins, hyper-detailed textures.' },
  { label: '🏛️ Martian Glass Dome', prompt: 'Futuristic architectural colony inside a glass geodesic dome on red Martian sands under twin moons, ultra-realistic.' }
];

export const PhotoGenerator: React.FC<PhotoGeneratorProps> = ({ onBack, onSaveCreation, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt || PHOTO_PRESETS[0].prompt);
  const [style, setStyle] = useState<string>('Photorealistic');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEnhancing, setIsEnhancing] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [activePromptUsed, setActivePromptUsed] = useState<string>('');
  const [seed, setSeed] = useState<number>(0);
  
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState<boolean>(false);

  useEffect(() => {
    if (initialPrompt) setPrompt(initialPrompt);
  }, [initialPrompt]);

  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;
    soundManager.playTap();
    setIsEnhancing(true);

    try {
      const response = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });
      const data = await response.json();
      if (data.promptUsed) {
        setPrompt(data.promptUsed);
        soundManager.playSuccess();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    soundManager.playTap();
    setIsLoading(true);
    setSaved(false);

    try {
      const response = await fetch('/api/generate-photo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style, aspectRatio }),
      });

      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        setActivePromptUsed(data.promptUsed || prompt);
        setSeed(data.seed || Math.floor(Math.random() * 99999));
        soundManager.playSuccess();
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyPrompt = () => {
    soundManager.playTap();
    navigator.clipboard.writeText(activePromptUsed || prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    soundManager.playTap();
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `SmartAI_Photo_${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      window.open(generatedImage, '_blank');
    }
  };

  const handleSave = () => {
    if (!generatedImage) return;
    soundManager.playTap();
    onSaveCreation({
      toolId: 'photo',
      title: prompt.slice(0, 36) || `${style} Artwork`,
      preview: `${style} • ${aspectRatio}`,
      content: {
        prompt: activePromptUsed || prompt,
        style,
        aspectRatio,
        imageUrl: generatedImage,
        seed,
      },
      metadata: { style, aspectRatio, seed },
    });
    setSaved(true);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.5 } });
  };

  return (
    <div className="p-4 flex flex-col gap-5 max-w-2xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            soundManager.playTap();
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-semibold text-cyan-300">AI Photo Generator</span>
        </div>
      </div>

      {/* Main Form */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/20 shadow-lg shadow-cyan-950/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Visual Prompt</span>
            </label>
            <button
              onClick={handleEnhancePrompt}
              disabled={isEnhancing || !prompt.trim()}
              className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/30 px-2.5 py-1 rounded-full transition-colors disabled:opacity-50"
            >
              <Wand2 className={`w-3 h-3 ${isEnhancing ? 'animate-spin' : ''}`} />
              <span>{isEnhancing ? 'Enhancing...' : 'Magic Prompt'}</span>
            </button>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to see in high detail..."
            rows={3}
            className="w-full bg-slate-900/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700/70 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
          />

          {/* Preset Prompts */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Inspiring Concepts:</span>
            <div className="flex flex-wrap gap-1.5">
              {PHOTO_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    setPrompt(p.prompt);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-slate-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Style & Aspect Ratio Controls */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400 font-medium">Art Style</span>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    soundManager.playTap();
                    setStyle(s);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    style === s
                      ? 'bg-cyan-600/30 border-cyan-500 text-white font-medium shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/60">
            <span className="text-xs text-slate-400 font-medium">Aspect Ratio</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    soundManager.playTap();
                    setAspectRatio(r.id);
                  }}
                  className={`py-2 px-2 text-center rounded-xl text-xs font-medium border transition-all ${
                    aspectRatio === r.id
                      ? 'bg-cyan-600/30 border-cyan-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-200" />
              <span>Rendering 8K Visual...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Photo</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Image Showcase */}
      {generatedImage && (
        <div className="flex flex-col gap-3 mt-2">
          {/* Card Frame */}
          <div className="glass-panel p-3 rounded-2xl border border-slate-800 relative group overflow-hidden">
            <div className="relative rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center">
              <img
                src={generatedImage}
                alt="AI Generated result"
                className="w-full h-auto max-h-[460px] object-contain rounded-xl transition-transform duration-300"
              />
              
              {/* Overlay quick zoom */}
              <button
                onClick={() => setIsLightboxOpen(true)}
                className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 backdrop-blur-md text-white border border-white/20 opacity-90 hover:opacity-100 transition-opacity"
                title="Fullscreen Preview"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Prompt details bar */}
            <div className="mt-3 px-1 flex flex-col gap-1">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="font-semibold text-cyan-400">{style} • {aspectRatio}</span>
                <span>Seed: {seed}</span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 italic">
                "{activePromptUsed}"
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-800/80">
              <button
                onClick={handleCopyPrompt}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied Prompt' : 'Copy Prompt'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>

                <button
                  onClick={handleSave}
                  disabled={saved}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    saved
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-cyan-600 text-white hover:bg-cyan-500'
                  }`}
                >
                  {saved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                  <span>{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && generatedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4">
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={generatedImage}
            alt="Fullscreen view"
            className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
