import React, { useState, useEffect, useRef } from 'react';
import { Film, Sparkles, Copy, Check, Download, ArrowLeft, BookmarkPlus, Play, Pause, RotateCcw, MonitorPlay, Sliders, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { SavedCreation } from '../../types';

interface ScriptWriterProps {
  onBack: () => void;
  onSaveCreation: (creation: Omit<SavedCreation, 'id' | 'timestamp'>) => void;
  initialTopic?: string;
}

const FORMATS = ['YouTube Video', 'TikTok / Reel', 'Short Film', 'Podcast Episode', 'Commercial Ad'];
const DURATIONS = ['30-60 Seconds', '2-3 Minutes', '5-8 Minutes', '10-15 Minutes'];
const TONES = ['Punchy & High Energy', 'Cinematic & Atmospheric', 'Educational & Authoritative', 'Humorous & Relatable'];

const SCRIPT_PRESETS = [
  { label: '📱 60s Viral Reel', topic: 'Why waking up at 5 AM might actually be ruining your productivity.', format: 'TikTok / Reel', duration: '30-60 Seconds' },
  { label: '🎬 Neo-Noir Short', topic: 'Two rogue android detectives interrogate a human suspect who claims to possess real biological tears.', format: 'Short Film', duration: '5-8 Minutes' },
  { label: '🎙️ Tech Podcast', topic: 'The rise of quantum neural chips and whether human memories can be copied.', format: 'Podcast Episode', duration: '10-15 Minutes' },
  { label: '📺 High-Converting Ad', topic: 'A next-generation smart water bottle that dynamically tracks mineral electrolyte levels.', format: 'Commercial Ad', duration: '30-60 Seconds' }
];

export const ScriptWriter: React.FC<ScriptWriterProps> = ({ onBack, onSaveCreation, initialTopic = '' }) => {
  const [topic, setTopic] = useState<string>(initialTopic);
  const [format, setFormat] = useState<string>('YouTube Video');
  const [duration, setDuration] = useState<string>('2-3 Minutes');
  const [tone, setTone] = useState<string>('Punchy & High Energy');
  const [targetAudience, setTargetAudience] = useState<string>('Creators & Tech enthusiasts');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [scriptOutput, setScriptOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  
  // Teleprompter state
  const [isTeleprompterOpen, setIsTeleprompterOpen] = useState<boolean>(false);
  const [isPrompterScrolling, setIsPrompterScrolling] = useState<boolean>(false);
  const [prompterSpeed, setPrompterSpeed] = useState<number>(1.2);
  const prompterRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialTopic) setTopic(initialTopic);
  }, [initialTopic]);

  // Teleprompter auto-scroll loop
  useEffect(() => {
    let animationFrameId: number;
    const scrollPrompter = () => {
      if (isPrompterScrolling && prompterRef.current) {
        prompterRef.current.scrollTop += prompterSpeed;
        if (
          prompterRef.current.scrollTop + prompterRef.current.clientHeight >=
          prompterRef.current.scrollHeight
        ) {
          setIsPrompterScrolling(false);
          return;
        }
      }
      if (isPrompterScrolling) {
        animationFrameId = requestAnimationFrame(scrollPrompter);
      }
    };

    if (isPrompterScrolling) {
      animationFrameId = requestAnimationFrame(scrollPrompter);
    }
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPrompterScrolling, prompterSpeed]);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    soundManager.playTap();
    setIsLoading(true);
    setSaved(false);

    try {
      const response = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          format,
          duration,
          tone,
          targetAudience,
        }),
      });

      const data = await response.json();
      if (data.script) {
        setScriptOutput(data.script);
        soundManager.playSuccess();
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    soundManager.playTap();
    navigator.clipboard.writeText(scriptOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundManager.playTap();
    const blob = new Blob([scriptOutput], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Script_${format.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!scriptOutput) return;
    soundManager.playTap();
    const title = topic.slice(0, 40) || `${format} Script`;
    onSaveCreation({
      toolId: 'script',
      title,
      preview: `${format} • ${duration} • ${tone}`,
      content: {
        title,
        format,
        duration,
        targetAudience,
        content: scriptOutput,
      },
      metadata: { format, duration, tone },
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
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-semibold text-amber-300">AI Script Writer</span>
        </div>
      </div>

      {/* Main Input Form */}
      <div className="flex flex-col gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-amber-500/20 shadow-lg shadow-amber-950/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-amber-400" />
              <span>Video / Film Concept</span>
            </label>
            <span className="text-[10px] text-slate-400">Gemini 3.8 Flash</span>
          </div>

          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="What is your video or script about? (e.g. 5 AI tools that will replace boring work in 2026...)"
            rows={3}
            className="w-full bg-slate-900/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700/70 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all resize-none"
          />

          {/* Quick presets */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-slate-400 font-medium">Trending Formats:</span>
            <div className="flex flex-wrap gap-1.5">
              {SCRIPT_PRESETS.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    soundManager.playTap();
                    setTopic(p.topic);
                    setFormat(p.format);
                    setDuration(p.duration);
                  }}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-amber-950/40 border border-slate-800 hover:border-amber-500/40 text-slate-300 transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Script Parameters */}
        <div className="glass-card p-4 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Format & Audience</span>
          </div>

          {/* Format selection */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Target Medium</span>
            <div className="flex flex-wrap gap-1.5">
              {FORMATS.map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => {
                    soundManager.playTap();
                    setFormat(fmt);
                  }}
                  className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${
                    format === fmt
                      ? 'bg-amber-600/30 border-amber-500 text-white font-medium shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Duration & Tone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Target Duration</span>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {DURATIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs text-slate-400">Tone of Voice</span>
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              >
                {TONES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/60">
            <span className="text-xs text-slate-400">Target Audience</span>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g. Gen Z entrepreneurs, fitness enthusiasts, cinephiles"
              className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-amber-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-200" />
              <span>Formatting Production Script...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Script</span>
            </>
          )}
        </button>
      </div>

      {/* Script Output Card */}
      {scriptOutput && (
        <div className="flex flex-col gap-3 mt-2">
          {/* Output Toolbar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex-wrap gap-2">
            <button
              onClick={() => {
                soundManager.playTap();
                setIsTeleprompterOpen(!isTeleprompterOpen);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition-colors"
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>{isTeleprompterOpen ? 'Exit Prompter' : 'Teleprompter Mode'}</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Script"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Download .txt"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-600 text-white hover:bg-amber-500'
                }`}
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Teleprompter Overlay Modal */}
          {isTeleprompterOpen ? (
            <div className="bg-black/95 rounded-2xl border border-amber-500/30 p-4 flex flex-col gap-3 shadow-2xl relative min-h-[420px]">
              {/* Prompter Controls */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPrompterScrolling(!isPrompterScrolling)}
                    className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500 text-slate-950 font-bold hover:bg-amber-400"
                  >
                    {isPrompterScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPrompterScrolling ? 'Pause' : 'Start'}</span>
                  </button>
                  <button
                    onClick={() => {
                      if (prompterRef.current) prompterRef.current.scrollTop = 0;
                    }}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                    title="Restart from top"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Speed:</span>
                  {[0.8, 1.2, 1.8].map((s) => (
                    <button
                      key={s}
                      onClick={() => setPrompterSpeed(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        prompterSpeed === s ? 'bg-amber-500 text-black' : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      {s}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrolling Prompter Text Viewport */}
              <div
                ref={prompterRef}
                className="flex-1 max-h-[380px] overflow-y-auto px-4 py-8 text-amber-100 font-sans text-xl leading-relaxed whitespace-pre-wrap select-none scroll-smooth"
              >
                {scriptOutput}
              </div>
            </div>
          ) : (
            /* Standard Screenplay Script Layout */
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-slate-200 text-xs sm:text-sm font-mono leading-relaxed whitespace-pre-wrap select-text bg-slate-950/80">
              {scriptOutput}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
