/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MobileFrame } from './components/MobileFrame';
import { Navigation, TabType } from './components/Navigation';
import { DashboardHome } from './components/DashboardHome';
import { CreationsLibrary } from './components/CreationsLibrary';
import { SettingsModal } from './components/SettingsModal';
import { StoryWriter } from './components/tools/StoryWriter';
import { ScriptWriter } from './components/tools/ScriptWriter';
import { PhotoGenerator } from './components/tools/PhotoGenerator';
import { VoiceGenerator } from './components/tools/VoiceGenerator';
import { LogoMaker } from './components/tools/LogoMaker';
import { Translator } from './components/tools/Translator';
import { ToolId, SavedCreation } from './types';
import { TOOLS, INITIAL_CREATIONS } from './constants/tools';
import { soundManager } from './utils/sound';
import { Sparkles, BookOpen, Film, Mic, PenTool, Languages, ChevronRight } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [activeTool, setActiveTool] = useState<ToolId | null>(null);
  const [initialToolPrompt, setInitialToolPrompt] = useState<string>('');
  
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('smartai_credits');
    return saved ? parseInt(saved, 10) : 1500;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('smartai_sound');
    return saved !== null ? saved === 'true' : true;
  });

  const [creations, setCreations] = useState<SavedCreation[]>(() => {
    const saved = localStorage.getItem('smartai_creations');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_CREATIONS;
      }
    }
    return INITIAL_CREATIONS;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('smartai_credits', credits.toString());
  }, [credits]);

  useEffect(() => {
    localStorage.setItem('smartai_sound', soundEnabled.toString());
    soundManager.setSoundEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('smartai_creations', JSON.stringify(creations));
  }, [creations]);

  const handleSelectTool = (toolId: ToolId, initialPrompt: string = '') => {
    soundManager.playTap();
    setInitialToolPrompt(initialPrompt);
    setActiveTool(toolId);
  };

  const handleSaveCreation = (newCreation: Omit<SavedCreation, 'id' | 'timestamp'>) => {
    const fullCreation: SavedCreation = {
      ...newCreation,
      id: `creation-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: Date.now(),
    };
    setCreations((prev) => [fullCreation, ...prev]);
    // Deduct nominal studio credits
    setCredits((prev) => Math.max(0, prev - 25));
  };

  const handleDeleteCreation = (id: string) => {
    setCreations((prev) => prev.filter((c) => c.id !== id));
  };

  const handleOpenCreation = (creation: SavedCreation) => {
    soundManager.playTap();
    setActiveTool(creation.toolId);
    if (creation.toolId === 'story' && creation.content?.content) {
      setInitialToolPrompt(creation.content.title || '');
    } else if (creation.toolId === 'script' && creation.content?.topic) {
      setInitialToolPrompt(creation.content.topic);
    } else if (creation.toolId === 'photo' && creation.content?.prompt) {
      setInitialToolPrompt(creation.content.prompt);
    } else if (creation.toolId === 'voice' && creation.content?.text) {
      setInitialToolPrompt(creation.content.text);
    } else if (creation.toolId === 'logo' && creation.content?.brandName) {
      setInitialToolPrompt(creation.content.brandName);
    } else if (creation.toolId === 'translate' && creation.content?.originalText) {
      setInitialToolPrompt(creation.content.originalText);
    }
  };

  const handleResetDemoData = () => {
    setCreations(INITIAL_CREATIONS);
    setCredits(1500);
  };

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

  return (
    <MobileFrame>
      <div className="flex-1 flex flex-col justify-between">
        {/* Navigation Top Bar */}
        <Navigation
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            setActiveTool(null);
          }}
          credits={credits}
          soundEnabled={soundEnabled}
          onToggleSound={() => setSoundEnabled(!soundEnabled)}
          creationsCount={creations.length}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Dynamic Tool or Tab View */}
        <div className="flex-1">
          {activeTool === 'story' && (
            <StoryWriter
              onBack={() => setActiveTool(null)}
              onSaveCreation={handleSaveCreation}
              initialPrompt={initialToolPrompt}
            />
          )}

          {activeTool === 'script' && (
            <ScriptWriter
              onBack={() => setActiveTool(null)}
              onSaveCreation={handleSaveCreation}
              initialTopic={initialToolPrompt}
            />
          )}

          {activeTool === 'photo' && (
            <PhotoGenerator
              onBack={() => setActiveTool(null)}
              onSaveCreation={handleSaveCreation}
              initialPrompt={initialToolPrompt}
            />
          )}

          {activeTool === 'voice' && (
            <VoiceGenerator
              onBack={() => setActiveTool(null)}
              onSaveCreation={handleSaveCreation}
              initialText={initialToolPrompt}
            />
          )}

          {activeTool === 'logo' && (
            <LogoMaker
              onBack={() => setActiveTool(null)}
              onSaveCreation={handleSaveCreation}
              initialBrand={initialToolPrompt}
            />
          )}

          {activeTool === 'translate' && (
            <Translator
              onBack={() => setActiveTool(null)}
              onSaveCreation={handleSaveCreation}
              initialText={initialToolPrompt}
            />
          )}

          {/* When no tool is currently open */}
          {activeTool === null && (
            <>
              {activeTab === 'home' && (
                <DashboardHome
                  onSelectTool={handleSelectTool}
                  recentCreations={creations}
                  onOpenCreation={handleOpenCreation}
                />
              )}

              {activeTab === 'tools' && (
                <div className="p-4 flex flex-col gap-4 max-w-2xl mx-auto pb-16">
                  <div>
                    <h2 className="text-lg font-black text-white">All 6 AI Tools</h2>
                    <p className="text-xs text-slate-400">Select any engine to begin creating</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {TOOLS.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => handleSelectTool(t.id)}
                        className="glass-card glass-card-hover p-4 rounded-2xl cursor-pointer flex items-center justify-between gap-3 border border-slate-800"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${t.gradient} flex items-center justify-center text-white shadow-lg shadow-indigo-950/40`}>
                            {getToolIcon(t.iconName)}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-white">{t.name}</h3>
                            <p className="text-xs text-slate-300 font-medium">{t.tagline}</p>
                            <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{t.description}</p>
                          </div>
                        </div>

                        <div className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-indigo-600 transition-colors">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'creations' && (
                <CreationsLibrary
                  creations={creations}
                  onDeleteCreation={handleDeleteCreation}
                  onOpenCreationTool={handleSelectTool}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        credits={credits}
        onAddCredits={(amount) => setCredits((prev) => prev + amount)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onResetDemoData={handleResetDemoData}
      />
    </MobileFrame>
  );
}
