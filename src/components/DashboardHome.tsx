import React, { useState } from 'react';
import { BookOpen, Film, Sparkles, Mic, PenTool, Languages, ArrowRight, Zap, Search, Clock, Compass, ChevronRight } from 'lucide-react';
import { TOOLS } from '../constants/tools';
import { ToolId, SavedCreation } from '../types';
import { soundManager } from '../utils/sound';

interface DashboardHomeProps {
  onSelectTool: (toolId: ToolId, initialPrompt?: string) => void;
  recentCreations: SavedCreation[];
  onOpenCreation: (creation: SavedCreation) => void;
}

export const DashboardHome: React.FC<DashboardHomeProps> = ({
  onSelectTool,
  recentCreations,
  onOpenCreation,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen': return <BookOpen className="w-5 h-5" />;
      case 'Film': return <Film className="w-5 h-5" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5" />;
      case 'Mic': return <Mic className="w-5 h-5" />;
      case 'PenTool': return <PenTool className="w-5 h-5" />;
      case 'Languages': return <Languages className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const filteredTools = TOOLS.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TRENDING_PROMPTS = [
    { toolId: 'story' as ToolId, label: '🐘 बुद्धिमान हाथी (Hindi)', prompt: 'नीलगिरि के घने जंगलों में जब सदी का सबसे भीषण सूखा पड़ा, तब एक बुद्धिमान हाथी गजानन ने अपने पूर्वजों के गुप्त जलस्रोत की खोज कर पूरे जंगल के प्राणियों की रक्षा की।' },
    { toolId: 'photo' as ToolId, label: 'Cyberpunk Tokyo Rain', prompt: 'Cinematic rainy dusk in cyberpunk Tokyo, glowing neon signs, 8k.' },
    { toolId: 'story' as ToolId, label: '🐘 Guardian Elephant (English)', prompt: 'An ancient guardian elephant in the Western Ghats discovers a hidden underground spring to save the sanctuary during a historic drought.' },
    { toolId: 'logo' as ToolId, label: 'Quantum Tech Logo', prompt: 'Quantum core geometric monogram with electric purple gradients.' },
    { toolId: 'script' as ToolId, label: 'Viral 60s Reel', topic: 'The unexpected neuroscience behind deep focus and coffee.' }
  ];

  return (
    <div className="p-4 flex flex-col gap-6 max-w-2xl mx-auto pb-16">
      {/* Search & Discover Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search 6 AI tools, templates, or styles..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Hero Welcome Banner */}
      {!searchQuery && (
        <div className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-br from-indigo-900/60 via-purple-900/40 to-slate-950 border border-indigo-500/30 shadow-xl shadow-indigo-950/40">
          <div className="absolute -top-12 -right-12 w-44 h-44 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[10px] tracking-wider uppercase">
                Studio Edition 3.8
              </span>
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Instant Generative Suite</span>
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              Create stories, scripts, images & audio with <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">SMART AI</span>
            </h2>

            <p className="text-xs text-slate-300 leading-relaxed max-w-md">
              Your pocket AI studio with 6 dedicated professional tools. Fast, intuitive, and ready to export instantly.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  soundManager.playTap();
                  onSelectTool('story');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <span>Launch Story Writer</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  soundManager.playTap();
                  onSelectTool('photo');
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 font-semibold text-xs transition-colors"
              >
                <span>Make 8K Art</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Trending Inspiration Chips */}
      {!searchQuery && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-indigo-400" />
              <span>Trending Prompts</span>
            </span>
            <span className="text-[10px] text-slate-500">Tap to launch</span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
            {TRENDING_PROMPTS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  soundManager.playTap();
                  onSelectTool(item.toolId, item.prompt || (item as any).topic);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white text-xs whitespace-nowrap transition-all flex items-center gap-1.5 shadow-sm shrink-0"
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 6 Core AI Tools Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[11px]">
            AI Creation Tools ({filteredTools.length})
          </span>
          <span className="text-[10px] text-indigo-400 font-medium">All Free & Ready</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => {
                soundManager.playTap();
                onSelectTool(tool.id);
              }}
              className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer flex flex-col justify-between gap-3 relative overflow-hidden group border border-slate-800/80"
            >
              {/* Subtle accent glow */}
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{ backgroundColor: tool.accentColor }}
              />

              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-tr ${tool.gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-950/40 group-hover:scale-105 transition-transform`}
                  >
                    {getToolIcon(tool.iconName)}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                    <p className="text-[11px] text-slate-400">{tool.tagline}</p>
                  </div>
                </div>

                <div className="p-1 rounded-lg bg-slate-800/60 text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition-all">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {tool.description}
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                <span className="font-medium text-slate-400">{tool.category}</span>
                <span 
                  className="font-bold tracking-wide"
                  style={{ color: tool.accentColor }}
                >
                  Open Tool →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Creations Shelf */}
      {recentCreations.length > 0 && !searchQuery && (
        <div className="flex flex-col gap-3 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-pink-400" />
              <span>Recent Creations</span>
            </span>
            <span className="text-[10px] text-slate-500">{recentCreations.length} saved items</span>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-none">
            {recentCreations.slice(0, 4).map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  soundManager.playTap();
                  onOpenCreation(item);
                }}
                className="w-44 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 cursor-pointer flex flex-col justify-between gap-2 shrink-0 transition-all hover:-translate-y-1 shadow-md"
              >
                {item.toolId === 'photo' && item.content.imageUrl ? (
                  <img
                    src={item.content.imageUrl}
                    alt={item.title}
                    className="w-full h-24 object-cover rounded-xl"
                  />
                ) : item.toolId === 'logo' && item.content.svgContent ? (
                  <div
                    className="w-full h-24 rounded-xl bg-slate-950 p-1 flex items-center justify-center overflow-hidden"
                    dangerouslySetInnerHTML={{ __html: item.content.svgContent }}
                  />
                ) : (
                  <div className="w-full h-24 rounded-xl bg-slate-950 p-2 text-[10px] text-slate-400 font-mono overflow-hidden border border-slate-800/60">
                    <p className="line-clamp-4">{item.content.content || item.content.text || item.preview}</p>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-200 truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-400 truncate">{item.preview}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
