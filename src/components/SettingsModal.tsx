import React, { useState } from 'react';
import { X, Sparkles, Volume2, RefreshCw, Shield, HelpCircle, Heart, Zap, FolderArchive, Download, Code2, Check } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credits: number;
  onAddCredits: (amount: number) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  credits,
  onAddCredits,
  soundEnabled,
  onToggleSound,
  onResetDemoData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-sm w-full flex flex-col gap-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black">
              S
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SMART AI HUB Settings</h3>
              <p className="text-[10px] text-slate-400">Next-Gen Mobile Suite v2.5</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onClose();
            }}
            className="p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Engine Status */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <p className="text-xs font-bold text-slate-200">AI Engine</p>
              <p className="text-[10px] text-slate-400">Gemini 3.8 Flash • Online</p>
            </div>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Ultra-Fast
          </span>
        </div>

        {/* Credits Control */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border border-slate-800">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Credits</span>
            </div>
            <p className="text-[11px] font-mono text-amber-300 font-semibold">{credits.toLocaleString()} available</p>
          </div>
          <button
            onClick={() => {
              soundManager.playSuccess();
              onAddCredits(500);
            }}
            className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 text-xs font-bold transition-colors"
          >
            + 500 Free
          </button>
        </div>

        {/* Audio Haptics Toggle */}
        <div className="glass-panel p-3.5 rounded-2xl flex items-center justify-between border border-slate-800">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <div>
              <p className="text-xs font-bold text-slate-200">Sound Feedback</p>
              <p className="text-[10px] text-slate-400">Tactile taps & generation chimes</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playTap();
              onToggleSound();
            }}
            className={`w-11 h-6 rounded-full transition-colors p-0.5 flex items-center ${
              soundEnabled ? 'bg-indigo-600 justify-end' : 'bg-slate-800 justify-start'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-white shadow-sm" />
          </button>
        </div>
        {/* Export Source Code (.ZIP) Card */}
        <div className="glass-panel p-3.5 rounded-2xl flex flex-col gap-2.5 border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/60 shadow-lg shadow-indigo-950/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <FolderArchive className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-100">Export Source Code (.ZIP)</p>
                <p className="text-[10px] text-indigo-300">प्रोजेक्ट कोड डाउनलोड करें (All Files)</p>
              </div>
            </div>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Ready
            </span>
          </div>

          <p className="text-[11px] text-slate-300 leading-relaxed">
            Downloads complete full-stack source code (Express backend, React 19 UI, Tailwind styles, and all 6 AI tools).
          </p>

          <a
            href="/api/download-project-zip"
            download="smart-ai-hub-source-code.zip"
            onClick={() => soundManager.playSuccess()}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 transition-all text-center"
          >
            <Download className="w-4 h-4" />
            <span>Download Project ZIP</span>
          </a>

          <div className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400 flex flex-col gap-1">
            <span className="font-semibold text-slate-300">💡 Local Quickstart:</span>
            <span>1. Extract ZIP → run <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">npm install</code></span>
            <span>2. Start dev server: <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded font-mono">npm run dev</code> (port 3000)</span>
          </div>
        </div>

        {/* Demo reset */}
        <button
          onClick={() => {
            soundManager.playTap();
            onResetDemoData();
            onClose();
          }}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors border border-slate-700"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reload Sample Showcase Data</span>
        </button>

        {/* Footer info */}
        <div className="text-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/60 flex items-center justify-center gap-1">
          <span>SMART AI HUB • Built with</span>
          <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" />
          <span>for creators</span>
        </div>
      </div>
    </div>
  );
};
