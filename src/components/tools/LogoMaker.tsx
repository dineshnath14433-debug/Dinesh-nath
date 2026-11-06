import React, { useState } from 'react';
import { PenTool, Sparkles, Download, Check, ArrowLeft, BookmarkPlus, Sliders, Smartphone, CreditCard, Shirt, Palette, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { SavedCreation, LogoGeneration } from '../../types';

interface LogoMakerProps {
  onBack: () => void;
  onSaveCreation: (creation: Omit<SavedCreation, 'id' | 'timestamp'>) => void;
  initialBrand?: string;
}

const INDUSTRIES = ['Technology & AI', 'Gaming & Esports', 'Luxury & Fashion', 'Finance & Web3', 'Health & Bio', 'Creative Studio'];
const LOGO_STYLES = ['Minimalist Geometric', 'Cyber Monogram', 'Modern Crest', 'Abstract Neon', 'Hex Shield', 'Futuristic Lettermark'];

const PALETTES = [
  { name: 'Cyber Indigo', primary: '#6366F1', secondary: '#A855F7' },
  { name: 'Emerald Pulse', primary: '#10B981', secondary: '#06B6D4' },
  { name: 'Sunset Fusion', primary: '#F43F5E', secondary: '#FB923C' },
  { name: 'Electric Gold', primary: '#F59E0B', secondary: '#FCD34D' },
  { name: 'Neon Cyberpunk', primary: '#EC4899', secondary: '#3B82F6' },
  { name: 'Monochrome Obsidian', primary: '#F8FAFC', secondary: '#94A3B8' }
];

export const LogoMaker: React.FC<LogoMakerProps> = ({ onBack, onSaveCreation, initialBrand = '' }) => {
  const [brandName, setBrandName] = useState<string>(initialBrand || 'NEXUS');
  const [tagline, setTagline] = useState<string>('INTELLIGENT SYSTEMS');
  const [industry, setIndustry] = useState<string>('Technology & AI');
  const [style, setStyle] = useState<string>('Minimalist Geometric');
  const [selectedPalette, setSelectedPalette] = useState(PALETTES[0]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [generatedLogo, setGeneratedLogo] = useState<LogoGeneration | null>(null);
  const [mockupView, setMockupView] = useState<'canvas' | 'appIcon' | 'businessCard' | 'apparel'>('canvas');
  const [saved, setSaved] = useState<boolean>(false);

  const handleGenerate = async () => {
    if (!brandName.trim()) return;
    soundManager.playTap();
    setIsLoading(true);
    setSaved(false);

    try {
      const response = await fetch('/api/generate-logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          tagline,
          industry,
          style,
          primaryColor: selectedPalette.primary,
          secondaryColor: selectedPalette.secondary,
        }),
      });

      const data = await response.json();
      if (data.logo) {
        setGeneratedLogo(data.logo);
        soundManager.playSuccess();
        confetti({ particleCount: 40, spread: 65, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadSVG = () => {
    if (!generatedLogo) return;
    soundManager.playTap();
    const blob = new Blob([generatedLogo.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${brandName.toLowerCase()}_logo.svg`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadPNG = () => {
    if (!generatedLogo) return;
    soundManager.playTap();
    const svgBlob = new Blob([generatedLogo.svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const URLObject = window.URL || window.webkitURL || window;
    const blobURL = URLObject.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 1000;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(image, 0, 0, 1000, 1000);
        const png = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${brandName.toLowerCase()}_logo_1000px.png`;
        link.href = png;
        link.click();
      }
      URLObject.revokeObjectURL(blobURL);
    };
    image.src = blobURL;
  };

  const handleSave = () => {
    if (!generatedLogo) return;
    soundManager.playTap();
    onSaveCreation({
      toolId: 'logo',
      title: `${brandName} Logo Kit`,
      preview: `${industry} • ${style}`,
      content: generatedLogo,
      metadata: { industry, style, palette: selectedPalette.name },
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
            onBack();
          }}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Dashboard</span>
        </button>

        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-emerald-300">AI Logo Maker</span>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-emerald-500/20 shadow-lg shadow-emerald-950/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <PenTool className="w-4 h-4 text-emerald-400" />
              <span>Brand Identity</span>
            </label>
            <span className="text-[10px] text-slate-400">Vector SVG Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Brand / Company Name</span>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. NEXUS, CYBERA, SOLARIA"
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-sm font-bold text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Tagline / Slogan</span>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. Next-Gen Intelligence"
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Style, Industry & Palette Config */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span>Design Aesthetics</span>
          </div>

          {/* Industry selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Industry</span>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map((ind) => (
                <button
                  key={ind}
                  onClick={() => {
                    soundManager.playTap();
                    setIndustry(ind);
                  }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                    industry === ind
                      ? 'bg-emerald-600/30 border-emerald-500 text-white font-medium shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          {/* Style selector */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Icon & Monogram Style</span>
            <div className="flex flex-wrap gap-1.5">
              {LOGO_STYLES.map((st) => (
                <button
                  key={st}
                  onClick={() => {
                    soundManager.playTap();
                    setStyle(st);
                  }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                    style === st
                      ? 'bg-emerald-600/30 border-emerald-500 text-white font-medium shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes */}
          <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Color Palette</span>
              <span className="text-emerald-400 font-medium">{selectedPalette.name}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PALETTES.map((pal) => (
                <div
                  key={pal.name}
                  onClick={() => {
                    soundManager.playTap();
                    setSelectedPalette(pal);
                  }}
                  className={`p-2 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                    selectedPalette.name === pal.name
                      ? 'bg-emerald-950/30 border-emerald-500'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span className="text-[11px] text-slate-300 font-medium">{pal.name}</span>
                  <div className="flex items-center -space-x-1">
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-900" style={{ backgroundColor: pal.primary }} />
                    <div className="w-3.5 h-3.5 rounded-full border border-slate-900" style={{ backgroundColor: pal.secondary }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !brandName.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
              <span>Architecting Vector Emblem...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Logo Kit</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Logo Section */}
      {generatedLogo && (
        <div className="flex flex-col gap-4 mt-2">
          {/* Mockup Mode Selector */}
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
            <button
              onClick={() => setMockupView('canvas')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mockupView === 'canvas' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Canvas</span>
            </button>
            <button
              onClick={() => setMockupView('appIcon')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mockupView === 'appIcon' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App Icon</span>
            </button>
            <button
              onClick={() => setMockupView('businessCard')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mockupView === 'businessCard' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Card</span>
            </button>
            <button
              onClick={() => setMockupView('apparel')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                mockupView === 'apparel' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shirt className="w-3.5 h-3.5" />
              <span>Merch</span>
            </button>
          </div>

          {/* Interactive Visual Display */}
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 flex flex-col items-center justify-center min-h-[340px] relative overflow-hidden bg-gradient-to-b from-slate-900/80 to-slate-950/80">
            {mockupView === 'canvas' && (
              <div 
                className="w-full max-w-[280px] aspect-square flex items-center justify-center drop-shadow-2xl"
                dangerouslySetInnerHTML={{ __html: generatedLogo.svgContent }}
              />
            )}

            {mockupView === 'appIcon' && (
              <div className="flex flex-col items-center justify-center gap-3">
                <div className="w-36 h-36 rounded-[28px] p-2 bg-gradient-to-tr from-slate-900 to-slate-800 border-2 border-slate-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden">
                  <div
                    className="w-full h-full scale-110 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: generatedLogo.svgContent }}
                  />
                </div>
                <span className="text-xs font-bold text-slate-300 tracking-wider">{brandName} App</span>
              </div>
            )}

            {mockupView === 'businessCard' && (
              <div className="w-full max-w-[320px] aspect-[1.75/1] rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-zinc-900 border border-slate-700/80 p-5 shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14" dangerouslySetInnerHTML={{ __html: generatedLogo.svgContent }} />
                  <span className="text-[10px] font-mono tracking-widest text-emerald-400">EXECUTIVE CARD</span>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-widest">{brandName}</h4>
                  <p className="text-[9px] text-slate-400 tracking-wider">{tagline}</p>
                  <p className="text-[8px] text-slate-500 mt-2 font-mono">hello@{brandName.toLowerCase()}.ai • smartai.hub</p>
                </div>
              </div>
            )}

            {mockupView === 'apparel' && (
              <div className="w-full max-w-[300px] h-[220px] rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col items-center justify-center relative overflow-hidden shadow-inner">
                {/* Fabric texture subtle grid */}
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:8px_8px] opacity-40 pointer-events-none" />
                <div className="w-24 h-24 p-1 rounded-xl bg-black/40 border border-white/10 shadow-lg drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" dangerouslySetInnerHTML={{ __html: generatedLogo.svgContent }} />
                <span className="text-[10px] text-slate-400 mt-3 font-medium uppercase tracking-widest">Embroidered Cotton Patch</span>
              </div>
            )}

            {/* Design Concept note */}
            {generatedLogo.designConcept && (
              <p className="text-xs text-slate-400 text-center mt-4 max-w-md px-2">
                "{generatedLogo.designConcept}"
              </p>
            )}
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadSVG}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export SVG</span>
              </button>

              <button
                onClick={handleDownloadPNG}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export PNG</span>
              </button>
            </div>

            <button
              onClick={handleSave}
              disabled={saved}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                saved
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
              }`}
            >
              {saved ? <Check className="w-4 h-4 text-emerald-400" /> : <BookmarkPlus className="w-4 h-4" />}
              <span>{saved ? 'Saved to Library' : 'Save Logo Kit'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
