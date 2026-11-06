import React, { useState, useEffect } from 'react';
import { BookOpen, Sparkles, Copy, Check, Download, Volume2, Square, ArrowLeft, BookmarkPlus, Sliders, RefreshCw, Globe } from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager } from '../../utils/sound';
import { speechController } from '../../utils/speech';
import { SavedCreation } from '../../types';

interface StoryWriterProps {
  onBack: () => void;
  onSaveCreation: (creation: Omit<SavedCreation, 'id' | 'timestamp'>) => void;
  initialPrompt?: string;
}

const GENRES = [
  'Fable / Folk Tale (लोक कथा)',
  'Mythological (पौराणिक)',
  'Adventure (रोमांचक)',
  'Sci-Fi (विज्ञान कथा)',
  'Fantasy (काल्पनिक)',
  'Mystery (रहस्यमय)',
  'Thriller (थ्रिलर)',
  'Historical (ऐतिहासिक)',
];

const TONES = [
  'Wisdom & Moral (ज्ञानवर्धक व प्रेरक)',
  'Epic & Cinematic (भव्य व रोमांचक)',
  'Emotional & Warm (भावुक व संवेदनशील)',
  'Dark & Gritty (गंभीर व रहस्यमयी)',
  'Fast-Paced Action (तीव्र गति व रोमांच)',
];

const TWIST_LEVELS = ['Subtle (हल्का)', 'Moderate (संतुलित)', 'Mind-Bending (अप्रत्याशित)'];

const STORY_LANGUAGES = [
  { id: 'Auto-Detect', label: '⚡ Auto-Detect (Match Prompt)' },
  { id: 'Hindi', label: '🇮🇳 हिन्दी (Hindi)' },
  { id: 'English', label: '🇬🇧 English' },
  { id: 'Spanish', label: '🇪🇸 Español (Spanish)' },
  { id: 'French', label: '🇫🇷 Français (French)' },
  { id: 'German', label: '🇩🇪 Deutsch (German)' },
  { id: 'Japanese', label: '🇯🇵 日本語 (Japanese)' },
  { id: 'Bengali', label: '🇧🇩 বাংলা (Bengali)' },
  { id: 'Marathi', label: '🇮🇳 मराठी (Marathi)' },
  { id: 'Tamil', label: '🇮🇳 தமிழ் (Tamil)' },
  { id: 'Telugu', label: '🇮🇳 తెలుగు (Telugu)' },
  { id: 'Arabic', label: '🇸🇦 العربية (Arabic)' },
];

const STORY_PRESETS = [
  {
    label: '🐘 बुद्धिमान हाथी और सूखा (Hindi)',
    prompt: 'नीलगिरि के घने जंगलों में जब पचास वर्षों का सबसे भीषण सूखा पड़ा, तब गजानन नाम के एक बुद्धिमान हाथी ने अपने पूर्वजों के गुप्त जलस्रोत की खोज कर पूरे जंगल के पशु-पक्षियों की जान बचाई।',
    genre: 'Fable / Folk Tale (लोक कथा)',
    language: 'Hindi',
    protagonist: 'गजानन (एक विशाल और बुद्धिमान हाथी)',
    tone: 'Wisdom & Moral (ज्ञानवर्धक व प्रेरक)'
  },
  {
    label: '🐘 Guardian Elephant (English)',
    prompt: 'During an unprecedented dry season in the Western Ghats, an ancient and noble tusker named Gajraj guides the desperate jungle herds through a rocky gorge to awaken a sacred underground aquifer.',
    genre: 'Adventure (रोमांचक)',
    language: 'English',
    protagonist: 'Gajraj the noble tusker',
    tone: 'Epic & Cinematic (भव्य व रोमांचक)'
  },
  {
    label: '👑 ऐरावत और न्यायप्रिय राजा (Hindi)',
    prompt: 'एक प्राचीन भारतीय राज्य में राजा विक्रमादित्य को एक दिव्य सफेद हाथी मिला, जो केवल तभी मार्ग दिखाता था जब राजा सत्य और धर्म के मार्ग पर चलता था।',
    genre: 'Mythological (पौराणिक)',
    language: 'Hindi',
    protagonist: 'राजा विक्रमादित्य और ऐरावत',
    tone: 'Wisdom & Moral (ज्ञानवर्धक व प्रेरक)'
  },
  {
    label: '🚀 विक्रम: मंगल अन्वेषक (Hindi)',
    prompt: 'मंगल ग्रह के लाल मरुस्थल पर पहले भारतीय अनुसंधान दल के कमांडर विक्रम को बर्फ की परतों के नीचे दबी एक प्राचीन सभ्यता की संदेश-शिला मिली।',
    genre: 'Sci-Fi (विज्ञान कथा)',
    language: 'Hindi',
    protagonist: 'कमांडर विक्रम',
    tone: 'Epic & Cinematic (भव्य व रोमांचक)'
  },
  {
    label: '⚡ Quantum Detective (English)',
    prompt: 'A detective in Neo-Chicago investigates a murder where the victim was simultaneously killed across three alternate timelines.',
    genre: 'Sci-Fi (विज्ञान कथा)',
    language: 'English',
    protagonist: 'Detective Silas Vance',
    tone: 'Dark & Gritty (गंभीर व रहस्यमयी)'
  }
];

export const StoryWriter: React.FC<StoryWriterProps> = ({ onBack, onSaveCreation, initialPrompt = '' }) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [language, setLanguage] = useState<string>('Auto-Detect');
  const [genre, setGenre] = useState<string>(GENRES[2]);
  const [tone, setTone] = useState<string>(TONES[1]);
  const [protagonist, setProtagonist] = useState<string>('');
  const [chapterCount, setChapterCount] = useState<number>(3);
  const [twistLevel, setTwistLevel] = useState<string>('Moderate (संतुलित)');
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [storyOutput, setStoryOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'create' | 'read'>('create');

  // Detect Devanagari / Hindi in input
  const isInputDevanagari = /[\u0900-\u097F]/.test(prompt + ' ' + protagonist);
  const effectiveIsHindi = language === 'Hindi' || isInputDevanagari;

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt);
      if (/[\u0900-\u097F]/.test(initialPrompt)) {
        setLanguage('Hindi');
      }
    }
  }, [initialPrompt]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    soundManager.playTap();
    setIsLoading(true);
    setSaved(false);

    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          genre,
          tone,
          protagonist,
          chapterCount,
          twistLevel,
          language: language === 'Auto-Detect' && isInputDevanagari ? 'Hindi' : language,
        }),
      });

      const data = await response.json();
      if (data.story) {
        setStoryOutput(data.story);
        setActiveTab('read');
        soundManager.playSuccess();
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.6 } });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    soundManager.playTap();
    navigator.clipboard.writeText(storyOutput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    soundManager.playTap();
    const blob = new Blob([storyOutput], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Story_${effectiveIsHindi ? 'Hindi' : 'Global'}_${Date.now()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    if (!storyOutput) return;
    soundManager.playTap();
    const firstLine = storyOutput.split('\n')[0].replace(/#/g, '').trim() || `${genre} Story`;
    onSaveCreation({
      toolId: 'story',
      title: firstLine,
      preview: `${effectiveIsHindi ? 'हिन्दी' : language} • ${genre} • ${chapterCount} Chapters`,
      content: {
        title: firstLine,
        genre,
        tone,
        protagonist,
        language: effectiveIsHindi ? 'Hindi' : language,
        content: storyOutput,
      },
      metadata: { genre, chapterCount, tone, language: effectiveIsHindi ? 'Hindi' : language },
    });
    setSaved(true);
    confetti({ particleCount: 40, spread: 70, origin: { y: 0.5 } });
  };

  const toggleNarration = () => {
    soundManager.playTap();
    if (isNarrating) {
      speechController.stop();
      setIsNarrating(false);
    } else {
      // Strip markdown symbols for clean spoken narration
      const cleanText = storyOutput.replace(/[#*_~`>-]/g, ' ').replace(/\n+/g, ' ');
      const isHindiStory = /[\u0900-\u097F]/.test(cleanText) || effectiveIsHindi;

      speechController.speak({
        text: cleanText.slice(0, 1600), // read excerpt smoothly
        lang: isHindiStory ? 'hi-IN' : 'en-US',
        voiceName: isHindiStory ? undefined : 'Fable',
        rate: isHindiStory ? 0.92 : 1.0,
        pitch: 1.0,
        onStart: () => setIsNarrating(true),
        onEnd: () => setIsNarrating(false),
        onError: () => setIsNarrating(false),
      });
    }
  };

  return (
    <div className="p-4 flex flex-col gap-5 max-w-2xl mx-auto pb-16">
      {/* Header bar */}
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
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          <span className="text-xs font-semibold text-violet-300">
            {effectiveIsHindi ? 'एआई कहानी लेखक (Story Writer)' : 'AI Story Writer'}
          </span>
        </div>
      </div>

      {/* Mode Switcher if story generated */}
      {storyOutput && (
        <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-800">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'create' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {effectiveIsHindi ? 'कहानी सेटिंग्स' : 'Story Settings'}
          </button>
          <button
            onClick={() => setActiveTab('read')}
            className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all ${
              activeTab === 'read' ? 'bg-violet-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {effectiveIsHindi ? 'कहानी पढ़ें व सुनें' : 'Read & Narrate'}
          </button>
        </div>
      )}

      {activeTab === 'create' || !storyOutput ? (
        <div className="flex flex-col gap-4">
          {/* Language Selector Bar */}
          <div className="glass-panel p-3 rounded-2xl border border-violet-500/20 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-violet-400" />
                <span>Story Language / भाषा चुनें</span>
              </span>
              {isInputDevanagari && (
                <span className="text-[10px] text-amber-300 font-semibold px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                  🇮🇳 Hindi input detected
                </span>
              )}
            </div>

            {/* Quick Language Pills */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setLanguage('Auto-Detect');
                }}
                className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                  language === 'Auto-Detect'
                    ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                ⚡ Auto-Detect
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setLanguage('Hindi');
                }}
                className={`text-xs px-3 py-1 rounded-lg border transition-all flex items-center gap-1 ${
                  language === 'Hindi'
                    ? 'bg-gradient-to-r from-orange-500/80 to-amber-600 border-orange-400 text-white font-bold'
                    : 'bg-slate-900 border-slate-800 text-orange-300 hover:text-white'
                }`}
              >
                <span>🇮🇳 हिन्दी (Hindi)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundManager.playTap();
                  setLanguage('English');
                }}
                className={`text-xs px-3 py-1 rounded-lg border transition-all ${
                  language === 'English'
                    ? 'bg-violet-600 border-violet-500 text-white font-semibold'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                🇬🇧 English
              </button>

              {/* Extended language dropdown */}
              <select
                value={language}
                onChange={(e) => {
                  soundManager.playTap();
                  setLanguage(e.target.value);
                }}
                className="bg-slate-900 border border-slate-800 text-slate-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-violet-500"
              >
                <option value="" disabled>More Languages...</option>
                {STORY_LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hero input card */}
          <div className="glass-panel p-4 rounded-2xl border border-violet-500/20 shadow-lg shadow-violet-950/20 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-violet-400" />
                <span>
                  {effectiveIsHindi ? 'कहानी का विचार व कथानक (Topic / Idea)' : 'Story Concept & Premise'}
                </span>
              </label>
              <span className="text-[10px] text-slate-400">Gemini 3.8 Flash</span>
            </div>

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                effectiveIsHindi
                  ? 'अपनी कहानी का विषय या विचार यहाँ लिखें (उदा. एक समझदार हाथी की कहानी जो जंगल को सूखे से बचाता है)...'
                  : 'Describe your story idea, dilemma, character, or premise (e.g. A wise elephant protecting the forest)...'
              }
              rows={4}
              className="w-full bg-slate-900/80 rounded-xl p-3 text-sm text-slate-100 placeholder:text-slate-500 border border-slate-700/70 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition-all resize-none leading-relaxed"
            />

            {/* Inspiration presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] text-slate-400 font-medium">
                {effectiveIsHindi ? 'शीघ्र प्रेरणादायक विचार (Presets):' : 'Quick Presets (Elephant & Lore):'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {STORY_PRESETS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      soundManager.playTap();
                      setPrompt(item.prompt);
                      setGenre(item.genre);
                      setLanguage(item.language);
                      setTone(item.tone);
                      setProtagonist(item.protagonist);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900 hover:bg-violet-950/50 border border-slate-800 hover:border-violet-500/40 text-slate-300 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration controls */}
          <div className="glass-card p-4 rounded-2xl flex flex-col gap-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <Sliders className="w-3.5 h-3.5 text-violet-400" />
              <span>{effectiveIsHindi ? 'विधा एवं पात्र सेटिंग्स (Parameters)' : 'Narrative Parameters'}</span>
            </div>

            {/* Genre */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-400">
                {effectiveIsHindi ? 'कहानी की विधा (Genre)' : 'Genre'}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      soundManager.playTap();
                      setGenre(g);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                      genre === g
                        ? 'bg-violet-600/30 border-violet-500 text-white font-medium shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Protagonist and Tone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">
                  {effectiveIsHindi ? 'मुख्य पात्र (Protagonist)' : 'Protagonist (Optional)'}
                </span>
                <input
                  type="text"
                  value={protagonist}
                  onChange={(e) => setProtagonist(e.target.value)}
                  placeholder={effectiveIsHindi ? 'उदा. गजानन (हाथी), विक्रम (नायक)' : 'e.g. Gajraj the wise elephant'}
                  className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs text-slate-400">
                  {effectiveIsHindi ? 'कहानी का भाव (Tone)' : 'Narrative Tone'}
                </span>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chapters & Twist */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-800/60">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">{effectiveIsHindi ? 'अध्याय (Chapters)' : 'Chapters'}</span>
                  <span className="font-semibold text-violet-400">{chapterCount}</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 5].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setChapterCount(cnt)}
                      className={`flex-1 py-1 rounded-lg text-xs font-semibold border ${
                        chapterCount === cnt
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">{effectiveIsHindi ? 'रोमांचक मोड़' : 'Twist Level'}</span>
                <div className="flex gap-1">
                  {TWIST_LEVELS.map((tw) => (
                    <button
                      key={tw}
                      onClick={() => setTwistLevel(tw)}
                      className={`flex-1 py-1 rounded-lg text-[10px] font-medium border truncate ${
                        twistLevel === tw
                          ? 'bg-violet-600 border-violet-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {tw.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.99]"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-violet-200" />
                <span>{effectiveIsHindi ? 'कहानी लिखी जा रही है...' : 'Crafting Masterpiece...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {effectiveIsHindi
                    ? 'कहानी बनाएं (Generate Story)'
                    : `Generate ${language !== 'Auto-Detect' ? language + ' ' : ''}Story`}
                </span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Reading Experience */
        <div className="flex flex-col gap-3">
          {/* Action Toolbar */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleNarration}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isNarrating
                    ? 'bg-pink-600 text-white animate-pulse'
                    : 'bg-violet-600/20 text-violet-300 border border-violet-500/40 hover:bg-violet-600/30'
                }`}
              >
                {isNarrating ? <Square className="w-3.5 h-3.5 fill-white" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>
                  {isNarrating
                    ? 'Stop Audio'
                    : /[\u0900-\u097F]/.test(storyOutput)
                      ? 'हिन्दी में सुनें (Listen)'
                      : 'Listen Narration'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Copy Markdown"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>

              <button
                onClick={handleDownload}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Download .md file"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleSave}
                disabled={saved}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  saved
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-600 text-white hover:bg-indigo-500'
                }`}
              >
                {saved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                <span>{saved ? 'Saved' : 'Save'}</span>
              </button>
            </div>
          </div>

          {/* Story Prose Display */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap select-text font-serif">
            {storyOutput}
          </div>
        </div>
      )}
    </div>
  );
};
