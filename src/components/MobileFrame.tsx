import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Wifi, Battery, Signal, Download } from 'lucide-react';
import { soundManager } from '../utils/sound';

interface MobileFrameProps {
  children: React.ReactNode;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => {
  const [currentTime, setCurrentTime] = useState<string>('09:41');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const toggleFrame = () => {
    soundManager.playTap();
    setIsPhoneFrame(!isPhoneFrame);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-start relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/15 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* Floating View Switcher Bar for Desktop/Tablet */}
      <header className="w-full max-w-5xl px-4 py-2.5 z-40 flex items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-indigo-500/20">
            S
          </div>
          <span className="font-bold tracking-wide text-slate-200">SMART AI HUB</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-medium text-[11px]">
            Mobile AI Suite
          </span>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/download-project-zip"
            download="smart-ai-hub-source-code.zip"
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30"
            title="Download Complete Project Source Code as a ZIP file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Download ZIP</span>
          </a>

          <button
            onClick={toggleFrame}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50 transition-colors shadow-sm"
            title="Toggle between Mobile Phone Frame and Fluid Web Layout"
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xs:inline">Expand View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xs:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full flex-1 flex justify-center items-start p-0 sm:p-4 md:p-6 z-10">
        {isPhoneFrame ? (
          /* Mobile Phone Mockup Chassis */
          <div className="w-full max-w-[430px] my-auto sm:my-2 min-h-[880px] bg-slate-900/90 rounded-none sm:rounded-[44px] shadow-2xl sm:shadow-[0_0_60px_-15px_rgba(99,102,241,0.25)] border-0 sm:border-[8px] sm:border-slate-800 flex flex-col relative overflow-hidden backdrop-blur-xl">
            {/* Phone Top Notch / Dynamic Island */}
            <div className="w-full bg-slate-950/90 pt-3 pb-2 px-6 flex items-center justify-between text-slate-300 select-none border-b border-slate-800/40 sticky top-0 z-50">
              <span className="font-semibold text-xs tracking-tight text-white">{currentTime}</span>

              {/* Dynamic Island pill */}
              <div className="w-24 h-4 bg-black rounded-full flex items-center justify-center gap-1.5 border border-slate-800/60 shadow-inner">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-950 flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                </div>
              </div>

              {/* Status Icons */}
              <div className="flex items-center gap-1.5 text-slate-300">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <div className="flex items-center gap-0.5">
                  <span className="text-[10px] font-mono">98%</span>
                  <Battery className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                </div>
              </div>
            </div>

            {/* Scrollable Mobile App Body */}
            <div className="flex-1 flex flex-col overflow-y-auto bg-slate-950">
              {children}
            </div>

            {/* Mobile Bottom Home Bar */}
            <div className="w-full py-1.5 bg-slate-950/90 flex justify-center items-center pointer-events-none sticky bottom-0 z-50">
              <div className="w-32 h-1 bg-slate-600/70 rounded-full" />
            </div>
          </div>
        ) : (
          /* Fluid Fullscreen Layout */
          <div className="w-full max-w-4xl bg-slate-900/60 rounded-2xl border border-slate-800 shadow-xl overflow-hidden backdrop-blur-xl min-h-[850px] flex flex-col">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
