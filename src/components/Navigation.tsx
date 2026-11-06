import React from 'react';
import { Sparkles, LayoutGrid, BookmarkCheck, Settings, Volume2, VolumeX, Home } from 'lucide-react';
import { soundManager } from '../utils/sound';

export type TabType = 'home' | 'tools' | 'creations' | 'settings';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  credits: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  creationsCount: number;
  onOpenSettings: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  credits,
  soundEnabled,
  onToggleSound,
  creationsCount,
  onOpenSettings,
}) => {
  const handleTabClick = (tab: TabType) => {
    soundManager.playTap();
    if (tab === 'settings') {
      onOpenSettings();
    } else {
      onTabChange(tab);
    }
  };

  return (
    <>
      {/* Top App Bar inside mobile container */}
      <div className="w-full px-4 py-3 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/60 flex items-center justify-between sticky top-0 z-40">
        <div 
          onClick={() => handleTabClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wide bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                SMART AI HUB
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">All-in-One Studio</p>
          </div>
        </div>

        {/* Right action badges */}
        <div className="flex items-center gap-1.5">
          {/* Sound toggle */}
          <button
            onClick={() => {
              soundManager.playTap();
              onToggleSound();
            }}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
          </button>

          {/* Credits pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <span className="text-amber-400 text-xs">⚡</span>
            <span>{credits.toLocaleString()}</span>
          </div>

          {/* Quick Settings Gear */}
          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
            title="App Settings"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Floating Navigation Bar */}
      <div className="w-full px-3 py-2 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/80 sticky bottom-0 z-40">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* Home */}
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              activeTab === 'home'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Dashboard</span>
            {activeTab === 'home' && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 absolute -bottom-1" />
            )}
          </button>

          {/* Tools Grid */}
          <button
            onClick={() => handleTabClick('tools')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              activeTab === 'tools'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutGrid className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">6 Tools</span>
            {activeTab === 'tools' && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 absolute -bottom-1" />
            )}
          </button>

          {/* Creations */}
          <button
            onClick={() => handleTabClick('creations')}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all relative ${
              activeTab === 'creations'
                ? 'text-indigo-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="relative">
              <BookmarkCheck className="w-5 h-5 mb-0.5" />
              {creationsCount > 0 && (
                <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-pink-500 text-white rounded-full text-[9px] flex items-center justify-center font-bold">
                  {creationsCount}
                </span>
              )}
            </div>
            <span className="text-[10px]">Library</span>
            {activeTab === 'creations' && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 absolute -bottom-1" />
            )}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-400 hover:text-slate-200 transition-all"
          >
            <Settings className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
};
