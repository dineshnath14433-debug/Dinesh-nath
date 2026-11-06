import { ToolDefinition, SavedCreation } from '../types';

export const TOOLS: ToolDefinition[] = [
  {
    id: 'story',
    name: 'AI Story Writer',
    tagline: 'Hindi, English & Multilingual Lore',
    description: 'Craft rich stories in Hindi (हिन्दी), English, and 10+ languages with strict topic fidelity, custom characters, and voice narration.',
    iconName: 'BookOpen',
    accentColor: '#8B5CF6',
    gradient: 'from-violet-600 to-indigo-600',
    category: 'Creative Writing',
    popularPrompt: 'नीलगिरि के घने जंगलों में सूखे के समय एक बुद्धिमान हाथी गजानन ने सभी जानवरों की जान बचाई।',
  },
  {
    id: 'script',
    name: 'AI Script Writer',
    tagline: 'Screenplays & Video Hooks',
    description: 'Generate production-ready video scripts, YouTube hooks, TikTok viral beats, podcasts, and short film dialogues.',
    iconName: 'Film',
    accentColor: '#F59E0B',
    gradient: 'from-amber-500 to-orange-600',
    category: 'Video & Film',
    popularPrompt: 'A 60-second high-retention TikTok hook explaining quantum entanglement with coffee beans.',
  },
  {
    id: 'photo',
    name: 'AI Photo Generator',
    tagline: '8K Masterpiece Visuals',
    description: 'Transform concepts into photorealistic portraits, cinematic sceneries, cyberpunk renders, and 3D isometric art.',
    iconName: 'Sparkles',
    accentColor: '#06B6D4',
    gradient: 'from-cyan-500 to-blue-600',
    category: 'Generative Imagery',
    popularPrompt: 'A holographic greenhouse bioluminescent orchid garden on a rainy neo-Tokyo rooftop, cinematic 8k.',
  },
  {
    id: 'voice',
    name: 'AI Voice Generator',
    tagline: 'Hyper-Realistic Spoken Audio',
    description: 'Turn text into cinematic speech with distinct voice personas, emotional inflection, speed control, and live waveform playback.',
    iconName: 'Mic',
    accentColor: '#EC4899',
    gradient: 'from-pink-500 to-rose-600',
    category: 'Audio & Speech',
    popularPrompt: 'Welcome listeners to another episode of Future Synthetics. Today we explore neural interfaces.',
  },
  {
    id: 'logo',
    name: 'AI Logo Maker',
    tagline: 'Vector Branding & Monograms',
    description: 'Design startup vector logos, tech geometric emblems, and brand identity kits with instant SVG & PNG export and product mockups.',
    iconName: 'PenTool',
    accentColor: '#10B981',
    gradient: 'from-emerald-500 to-teal-600',
    category: 'Brand Design',
    popularPrompt: 'Hyperion Robotics - clean geometric cyber-falcon monogram with glowing circuit nodes.',
  },
  {
    id: 'translate',
    name: 'AI Translator',
    tagline: '40+ Languages & Cultural Nuance',
    description: 'Break language barriers with contextual translations, phonetic guides, cultural registers, and native audio pronunciation.',
    iconName: 'Languages',
    accentColor: '#6366F1',
    gradient: 'from-indigo-500 to-purple-600',
    category: 'Linguistics',
    popularPrompt: 'Welcome to our global studio. We craft intelligent experiences for creators worldwide.',
  },
];

export const INITIAL_CREATIONS: SavedCreation[] = [
  {
    id: 'demo-logo-1',
    toolId: 'logo',
    title: 'AURA AI - Neural Logo System',
    preview: 'Vector geometric brand crest with neon gradients',
    timestamp: Date.now() - 3600000 * 2,
    content: {
      brandName: 'AURA',
      tagline: 'INTELLIGENT FUTURE',
      designConcept: 'An aerodynamic geometric crest uniting the A monogram with quantum orbits.',
      palette: ['#6366F1', '#EC4899', '#0F172A', '#F8FAFC'],
      typography: { fontFamily: 'Plus Jakarta Sans', letterSpacing: '0.2em', fontStyle: 'bold' },
      svgContent: `<svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradDemo" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#6366F1" />
      <stop offset="100%" stop-color="#EC4899" />
    </linearGradient>
  </defs>
  <rect width="500" height="500" rx="40" fill="#090D16" />
  <circle cx="250" cy="200" r="140" fill="none" stroke="#6366F1" stroke-opacity="0.15" stroke-width="2" stroke-dasharray="6 6" />
  <g transform="translate(250, 195)">
    <polygon points="0,-80 70,-40 70,40 0,80 -70,40 -70,-40" fill="none" stroke="url(#gradDemo)" stroke-width="8" stroke-linejoin="round" />
    <polygon points="0,-45 40,0 0,45 -40,0" fill="#6366F1" fill-opacity="0.25" stroke="url(#gradDemo)" stroke-width="4" />
    <circle cx="0" cy="0" r="10" fill="#FFFFFF" />
    <text x="0" y="7" font-family="'Plus Jakarta Sans', sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">A</text>
  </g>
  <text x="250" y="365" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">AURA AI</text>
  <text x="250" y="400" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="#6366F1" text-anchor="middle" letter-spacing="6">INTELLIGENT FUTURE</text>
</svg>`
    }
  },
  {
    id: 'demo-photo-1',
    toolId: 'photo',
    title: 'Cyberpunk Neon Archivist',
    preview: '8K Cinematic Cyberpunk render',
    timestamp: Date.now() - 3600000 * 5,
    content: {
      prompt: 'A futuristic cybernetic android wearing sleek iridescent silk robes reading holographic parchment in rain, neon bokeh, 8k resolution.',
      style: 'Cyberpunk',
      aspectRatio: '1:1',
      imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=80',
      seed: 842104
    }
  },
  {
    id: 'demo-story-1',
    toolId: 'story',
    title: 'The Starlight Protocol',
    preview: 'Chapter 1: The Echo in Sector 9',
    timestamp: Date.now() - 3600000 * 12,
    content: {
      title: 'The Starlight Protocol',
      genre: 'Sci-Fi Space Opera',
      tone: 'Cinematic & Thrilling',
      protagonist: 'Captain Elena Vance',
      content: `# The Starlight Protocol
**Premise**: Deep within the abandoned orbital relay of Centauri, Captain Elena Vance discovers an operational distress signal that was encoded before the human race mastered faster-than-light travel.
**Genre & Tone**: Sci-Fi | Cinematic & Thrilling

---
## Chapter 1: The Cold Beacon
The grav-boots struck the frozen hull with a dull magnetic clang. Elena adjusted her visor's polarization as the corona of Proxima cast long, jagged shadows across the derelict docking bay.

"Telemetry is confirmed, Captain," sounded AI Lyra in her earpiece. "The transmitter is drawing power from an auxiliary micro-fusion cell that should have decayed two centuries ago."

Elena drew her thermal cutter. The airlock seal was fused shut by stellar ice. With three precise incisions, the seal hissed, releasing a puff of ancient nitrogen into the vacuum...`
    }
  },
  {
    id: 'demo-story-hindi-1',
    toolId: 'story',
    title: 'गजानन: नीलगिरि का रक्षक हाथी',
    preview: 'हिन्दी • लोक कथा • 3 अध्याय',
    timestamp: Date.now() - 3600000 * 1,
    content: {
      title: 'गजानन: नीलगिरि का रक्षक हाथी',
      genre: 'Fable / Folk Tale (लोक कथा)',
      tone: 'Wisdom & Moral (ज्ञानवर्धक व प्रेरक)',
      protagonist: 'गजानन (एक विशाल और बुद्धिमान हाथी)',
      language: 'Hindi',
      content: `# गजानन: नीलगिरि का रक्षक हाथी
**सार (Premise)**: नीलगिरि के घने जंगलों में जब सदी का सबसे भीषण सूखा पड़ा, तब गजानन नाम के एक विशालकाय और बुद्धिमान हाथी ने अपने पूर्वजों की प्राचीन स्मृति से पाताल-गंगा का गुप्त जलस्रोत खोजकर पूरे जंगल के प्राणियों को जीवनदान दिया।
**विधा एवं भाव (Genre & Tone)**: लोक कथा | ज्ञानवर्धक व प्रेरक
**मुख्य पात्र (Characters)**:
- **गजानन**: नीलगिरि का विशाल और शांत स्वभाव का समझदार प्रमुख हाथी।
- **मीरा**: एक नन्ही चंचल हिरणी, जो गजानन की सबसे प्रिय मित्र है।
- **वनराज शेर खान**: जंगल का शासक जो गजानन के विवेक का सम्मान करता है।

---
## अध्याय 1: प्यासी धरती और गजानन की प्रतिज्ञा
नीलगिरि पर्वत की तलहटी में बहने वाली नदी सूखकर पत्थरों का मैदान बन चुकी थी। आठ महीनों से बादलों का कोई नामोनिशान नहीं था। वन के सारे पशु-पक्षी बरगद के पेड़ के नीचे बेबस बैठे थे।

तभी भारी कदमों की थाप गूंजी। गजानन ने अपनी सूंड़ उठाई और धीर-गंभीर स्वर में कहा: "धैर्य रखो वनवासियों। जब तक गजानन जीवित है, नीलगिरि का कोई भी जीव प्यास से नहीं मरेगा। मैं उत्तर की श्वेत चट्टानों के नीचे दबे गुप्त जलकुंड को खोज कर लाऊंगा।"

---
## अध्याय 2: श्वेत पर्वत का दुर्गम मार्ग
गजानन ने नन्ही हिरणी मीरा के साथ यात्रा शुरू की। रास्ते में तीखी धूप और चट्टानों का अंबार था। मार्ग में विशाल शिलाएं गिरी थीं। गजानन ने अपने वज्र के समान दांतों से उन शिलाओं को हटाकर रास्ता साफ किया।

---
## अध्याय 3: पाताल-गंगा का अमृत और नया सवेरा
कंदरा के भीतर पहुंचकर गजानन ने अपनी सूंड़ से भूमिगत जल की स्पंदन तरंगों को सुना। उसने अपने विशाल पैरों से कठोर शिला पर प्रहार किया। अचानक धरती से मीठे पानी का शीतल फव्वारा फूट पड़ा! पूरा नीलगिरि जंगल फिर से हरा-भरा हो उठा।`
    }
  }
];
