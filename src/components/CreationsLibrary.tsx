import React, { useState } from 'react';
import { BookmarkCheck, Trash2, Download, Search, Sparkles, X, Copy, Check, Eye } from 'lucide-react';
import { SavedCreation, ToolId } from '../types';
import { soundManager } from '../utils/sound';

interface CreationsLibraryProps {
  creations: SavedCreation[];
  onDeleteCreation: (id: string) => void;
  onOpenCreationTool: (toolId: ToolId, content: any) => void;
}

export const CreationsLibrary: React.FC<CreationsLibraryProps> = ({
  creations,
  onDeleteCreation,
  onOpenCreationTool,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeItem, setActiveItem] = useState<SavedCreation | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const filters = [
    { id: 'all', label: 'All Items' },
    { id: 'story', label: 'Stories' },
    { id: 'script', label: 'Scripts' },
    { id: 'photo', label: 'Photos' },
    { id: 'voice', label: 'Voices' },
    { id: 'logo', label: 'Logos' },
    { id: 'translate', label: 'Translations' },
  ];

  const filteredCreations = creations.filter((item) => {
    const matchesFilter = selectedFilter === 'all' || item.toolId === selectedFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDownload = (item: SavedCreation) => {
    soundManager.playTap();
    if (item.toolId === 'photo' && item.content.imageUrl) {
      window.open(item.content.imageUrl, '_blank');
      return;
    }
    if (item.toolId === 'logo' && item.content.svgContent) {
      const blob = new Blob([item.content.svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.svg`;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    const textToDownload = item.content.content || item.content.text || item.content.translatedText || JSON.stringify(item.content, null, 2);
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.title.toLowerCase().replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string) => {
    soundManager.playTap();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 flex flex-col gap-5 max-w-2xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-indigo-400" />
            <span>Saved Creations</span>
          </h2>
          <p className="text-xs text-slate-400">All your generated assets saved locally</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">
          {creations.length} Assets
        </span>
      </div>

      {/* Search & Filter Chips */}
      <div className="flex flex-col gap-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved creations..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => {
                soundManager.playTap();
                setSelectedFilter(f.id);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedFilter === f.id
                  ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Creations Grid */}
      {filteredCreations.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {filteredCreations.map((item) => (
            <div
              key={item.id}
              className="glass-card p-3.5 rounded-2xl flex flex-col justify-between gap-3 border border-slate-800/80 group hover:border-slate-700 transition-all"
            >
              {/* Visual preview if logo or photo */}
              {item.toolId === 'photo' && item.content.imageUrl ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950">
                  <img
                    src={item.content.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-cyan-300 font-semibold">
                    Photo • {item.content.style}
                  </span>
                </div>
              ) : item.toolId === 'logo' && item.content.svgContent ? (
                <div className="w-full h-36 rounded-xl bg-slate-950 p-2 flex items-center justify-center relative overflow-hidden">
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: item.content.svgContent }}
                  />
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[10px] text-emerald-300 font-semibold">
                    Vector Logo
                  </span>
                </div>
              ) : (
                <div className="w-full h-28 rounded-xl bg-slate-950/80 p-3 text-xs text-slate-300 font-sans leading-relaxed overflow-hidden border border-slate-800/60 flex flex-col justify-between">
                  <p className="line-clamp-3 italic">
                    "{item.content.content || item.content.text || item.content.translatedText || item.preview}"
                  </p>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    {item.toolId}
                  </span>
                </div>
              )}

              {/* Title & metadata */}
              <div>
                <h4 className="font-bold text-sm text-slate-200 truncate">{item.title}</h4>
                <p className="text-[11px] text-slate-400 truncate">{item.preview}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Card Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => setActiveItem(item)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleDownload(item)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    title="Download Asset"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playTap();
                      onDeleteCreation(item.id);
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center gap-3 my-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-200">No creations found</h3>
          <p className="text-xs text-slate-400 max-w-xs">
            Start creating with any of the 6 AI tools and tap "Save" to build your private collection.
          </p>
        </div>
      )}

      {/* Inspect Item Modal */}
      {activeItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 max-w-lg w-full max-h-[85vh] flex flex-col gap-4 shadow-2xl overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white">{activeItem.title}</h3>
                <p className="text-[11px] text-indigo-400">{activeItem.preview}</p>
              </div>
              <button
                onClick={() => setActiveItem(null)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            {activeItem.toolId === 'photo' && activeItem.content.imageUrl ? (
              <img
                src={activeItem.content.imageUrl}
                alt={activeItem.title}
                className="w-full max-h-80 object-contain rounded-xl bg-black"
              />
            ) : activeItem.toolId === 'logo' && activeItem.content.svgContent ? (
              <div
                className="w-full max-h-72 aspect-square mx-auto flex items-center justify-center bg-slate-950 rounded-2xl p-4"
                dangerouslySetInnerHTML={{ __html: activeItem.content.svgContent }}
              />
            ) : (
              <div className="bg-slate-950 p-4 rounded-xl text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto border border-slate-800">
                {activeItem.content.content || activeItem.content.text || activeItem.content.translatedText}
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  const text = activeItem.content.content || activeItem.content.text || activeItem.content.translatedText || activeItem.content.prompt || activeItem.content.svgContent;
                  if (text) handleCopy(text);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-xs text-slate-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy Content'}</span>
              </button>

              <button
                onClick={() => handleDownload(activeItem)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Asset</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
