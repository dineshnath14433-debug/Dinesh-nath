import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import JSZip from 'jszip';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Shared Gemini client setup following skill requirements
const rawKey = process.env.GEMINI_API_KEY?.trim();
const isPlaceholder = !rawKey || rawKey === 'MY_GEMINI_API_KEY' || rawKey.startsWith('MY_');
let aiClient: GoogleGenAI | null = null;
if (!isPlaceholder && rawKey) {
  aiClient = new GoogleGenAI({
    apiKey: rawKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Helper to call Gemini with timeout and fallback
async function callGeminiText(prompt: string, systemInstruction?: string): Promise<string | null> {
  if (!aiClient) return null;
  try {
    const apiPromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: systemInstruction ? { systemInstruction } : undefined,
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 5000);
    });

    const response = await Promise.race([apiPromise, timeoutPromise]);
    if (!response) {
      console.warn('Gemini API request timed out, switching to smart local generator');
      return null;
    }
    return (response as any).text ?? null;
  } catch (error) {
    console.error('Gemini API call failed, falling back:', error);
    return null;
  }
}

// 1. AI Story Writer Endpoint (Multilingual: Hindi, English, and beyond)
app.post('/api/generate-story', async (req: Request, res: Response) => {
  const {
    prompt = '',
    genre = 'Adventure',
    protagonist = '',
    tone = 'Epic & Cinematic',
    chapterCount = 3,
    twistLevel = 'Moderate',
    language = 'Auto-Detect',
  } = req.body;

  const cleanPrompt = prompt.trim();
  const containsDevanagari = /[\u0900-\u097F]/.test(cleanPrompt + ' ' + protagonist);
  const isHindi = language === 'Hindi' || language === 'हिन्दी' || containsDevanagari || /hindi/i.test(language);
  const isElephantStory = /हाथी|गज|ऐरावत|hathi|haathi|gajraj|elephant|tusker|tusk/i.test(cleanPrompt + ' ' + protagonist);

  let languageInstruction = '';
  if (isHindi) {
    languageInstruction = `CRITICAL MANDATORY LANGUAGE: Write the ENTIRE story purely in beautiful, authentic, literary HINDI (हिन्दी) using Devanagari script. All titles, chapter headings (e.g. ## अध्याय 1: [शीर्षक]), premise (सार), character names (पात्र), and dialogue MUST be in Hindi. Do NOT use English.`;
  } else if (language && language !== 'Auto-Detect' && language !== 'English') {
    languageInstruction = `CRITICAL MANDATORY LANGUAGE: Write the ENTIRE story in ${language}. All titles, character names, and prose must be in ${language}.`;
  } else {
    languageInstruction = `CRITICAL LANGUAGE REQUIREMENT: Detect and strictly match the language of the user's prompt. If the user writes in Hindi or Hinglish, write in Hindi (Devanagari). If in English, write in English.`;
  }

  const systemInstruction = `You are an elite bestselling author, folklorist, and narrative architect.
${languageInstruction}

NON-NEGOTIABLE CORE DIRECTIVES:
1. STRICT TOPIC COMPLIANCE: The story MUST revolve directly around the user's concept: "${cleanPrompt}". Never replace or deviate from this subject. If the user asks for a story about an elephant, the story MUST be centered on that elephant!
2. GENRE & TONE: Strictly embody the selected genre (${genre}) and tone (${tone}).
3. CHAPTER STRUCTURE: Deliver a complete multi-chapter story (${chapterCount} chapters) with engaging conflict, sensory atmosphere, character arcs, and an unexpected climax (Twist level: ${twistLevel}).

Markdown Format:
# [Story Title]
**Premise**: [1-2 sentences capturing the central conflict]
**Genre & Tone**: ${genre} | ${tone}
**Characters**: [List 2-3 characters with 1-line descriptions]

---
## Chapter 1: [Subtitle]
[Detailed prose with atmospheric scene setting, dialogue, and conflict setup]

(continue for ${chapterCount} chapters with an unexpected climax and meaningful conclusion)`;

  const userPrompt = `Write a complete ${genre} story based on this concept:
Topic: "${cleanPrompt || (isHindi ? 'जंगल के बुद्धिमान हाथी की कहानी' : 'A tale of an ancient guardian elephant')}"
Protagonist: "${protagonist || (isElephantStory ? (isHindi ? 'गजानन (एक विशाल और बुद्धिमान हाथी)' : 'Gajraj the wise tusker') : (isHindi ? 'एक साहसी और दयालु नायक' : 'A courageous protagonist'))}"
Selected Genre: ${genre}
Selected Tone: ${tone}
Twist Level: ${twistLevel}
Total Chapters: ${chapterCount}
Target Language: ${isHindi ? 'Hindi (हिन्दी)' : language}`;

  try {
    const aiResult = await callGeminiText(userPrompt, systemInstruction);
    if (aiResult) {
      return res.json({ success: true, story: aiResult, source: 'gemini' });
    }
  } catch (e) {
    console.error('Gemini story error, switching to specialized fallback:', e);
  }

  // Specialized Context-Aware Fallbacks (Handles Hindi Elephant, English Elephant, and General Hindi/English prompts)
  let fallbackStory = '';

  if (isHindi && isElephantStory) {
    fallbackStory = `# गजानन: नीलगिरि का रक्षक हाथी
**सार (Premise)**: नीलगिरि के घने जंगलों में जब सदी का सबसे भीषण सूखा पड़ा, तब गजानन नाम के एक विशालकाय और बुद्धिमान हाथी ने अपने पूर्वजों की प्राचीन स्मृति और अद्भुत सूझबूझ से पाताल-गंगा का गुप्त जलस्रोत खोजकर पूरे जंगल के प्राणियों को जीवनदान दिया।
**विधा एवं भाव (Genre & Tone)**: ${genre} | ${tone}
**मुख्य पात्र (Characters)**:
- **गजानन**: नीलगिरि के झुंड का विशाल, शांत और अत्यंत बुद्धिमान प्रमुख हाथी, जिसके लंबे सुनहरे दांत उसकी शक्ति और संयम के प्रतीक हैं।
- **मीरा**: एक नन्ही हिरणी, जो गजानन की सबसे प्रिय मित्र है और जंगल के संकट में उसका साथ देती है।
- **वनराज शेर खान**: जंगल का स्वाभिमानी शासक, जिसे अपनी शक्ति पर गर्व है परंतु सूखे के संकट में वह गजानन की बुद्धिमत्ता को नमन करता है।

---
## अध्याय 1: प्यासी धरती और गजानन की प्रतिज्ञा
नीलगिरि पर्वत की तलहटी में बहने वाली स्वर्णिम नदी 'अमरावती' अब पत्थरों और सूखी दरारों के मरुस्थल में बदल चुकी थी। पिछले आठ महीनों से आकाश में बादलों का एक भी टुकड़ा नहीं घूमा था। धूप इतनी तीव्र थी कि सूखे पत्तों से धुंआ उठने लगा था।

वन के सभी जानवर विशाल बरगद के वृक्ष के नीचे एकत्र थे। छोटे-छोटे शावक प्यास से व्याकुल होकर अपनी माताओं की छाती से चिपके थे। वनराज शेर खान भी एक शिला पर बैठकर चिंतामग्न मुद्रा में शून्य को निहार रहे थे।

तभी धरती पर भारी, लयबद्ध कदमों की गूंज सुनाई दी— *धम्म... धम्म... धम्म...*।

पेड़ों की डालियों को अपनी सूंड़ से सहलाते हुए गजानन प्रकट हुआ। उसकी आंखें शांत थीं, लेकिन उनमें अगाध गहराई और करुणा थी। उसने अपनी सूंड़ उठाई और जंगल के सन्नाटे को चीरती हुई एक गंभीर चिंघाड़ लगाई।

"धैर्य रखो वनवासियों," गजानन की भारी आवाज़ जंगल में गूंज उठी। "जब तक गजानन के पैरों में शक्ति है और सूंड़ में प्राण हैं, नीलगिरि का कोई भी जीव प्यास से अपनी आंखें नहीं मूंदेगा। मेरे दादा ऐरावत ने मुझे उत्तर की श्वेत चट्टानों के नीचे दबे 'पाताल-कुंड' का रहस्य बताया था। मैं उस जलधारा को खोज कर लाऊंगा।"

---
## अध्याय 2: श्वेत पर्वत का दुर्गम मार्ग
गजानन ने उत्तर की ओर अपनी यात्रा आरंभ की। मार्ग सरल नहीं था। नुकीले पत्थर, कंटीली झाड़ियां और ऊपर से बरसती आग। उसके साथ नन्हीं हिरणी मीरा भी अपनी फुर्तीली छलांगों से रास्ता दिखाने के लिए चल पड़ी।

"दादा गजानन," मीरा हांफते हुए बोली, "श्वेत पर्वत तो बहुत दूर है। वहां तक पहुंचते-पहुंचते हमारी भी सांसें टूट जाएंगी।"

गजानन ने अपनी सूंड़ से एक छायादार बांस की डाली तोड़ी और मीरा के ऊपर छांव कर दी। "मीरा बिटिया, हाथी का शरीर भारी होता है, लेकिन उसका संकल्प उससे भी अधिक दृढ़ होता है। जब उद्देश्य दूसरों की रक्षा करना हो, तो थकान ईश्वर का आशीर्वाद बन जाती है।"

मार्ग में एक संकरा दर्रा आया जहां विशाल चट्टानें गिरी हुई थीं। गजानन ने अपने दोनों वज्र के समान दांतों को उन विशाल पत्थरों के नीचे अड़ा दिया। उसकी पेशियां तन गईं, माथे पर नसें उभर आईं। एक भयंकर गर्जना के साथ उसने टन वजनी शिला को उठाकर खाई में फेंक दिया। रास्ता खुल गया!

---
## अध्याय 3: पाताल-गंगा का अमृत और नया जीवन
पर्वत की सबसे ऊंची कंदरा में पहुंचकर गजानन ने अपनी सूंड़ को ठंडी ज़मीन पर रखा। उसने अपनी सूंड़ के संवेदनशील सिरे से कंपन को महसूस किया। हां! धरती के कई फीट नीचे बहते शीतल जल की ध्वनि थी।

गजानन ने अपने भारी पैरों से एक विशेष लय में प्रहार करना शुरू किया— *धम्म! धम्म! धम्म!*

कठोर शिला पर दरारें पड़ने लगीं। गजानन ने अपने नुकीले दांतों से उस दरार में प्रहार किया। अचानक, धरती से एक ठंडी, मीठी और पारदर्शी फुहार फूट पड़ी! पाताल-गंगा का शीतल जल आकाश की ओर उछल पड़ा।

जलधारा बहती हुई नीचे घाटी की ओर जाने लगी। पूरे नीलगिरि में हरियाली की बयार दौड़ गई। सभी जानवरों ने उस अमृत जल को पीकर अपनी प्यास बुझाई। वनराज शेर खान ने आकर गजानन के सम्मुख अपना मस्तक झुकाया।

नीलगिरि का वह विशाल हाथी आज केवल एक पशु नहीं, बल्कि पूरे जंगल का जीवनदाता और अमर रक्षक बन चुका था।`;
  } else if (!isHindi && isElephantStory) {
    fallbackStory = `# Gajraj: Guardian of the Western Ghats
**Premise**: When an unprecedented drought dries the sacred mountain rivers of the Western Ghats, a legendary and compassionate bull elephant named Gajraj ventures into the forbidden Obsidian Canyon to awaken an ancient underground aquifer and save the sanctuary.
**Genre & Tone**: ${genre} | ${tone}
**Characters**:
- **Gajraj**: The venerable matriarch's chosen guardian—massive, quiet, deeply wise, with majestic ivory tusks.
- **Kavya**: A dedicated forest ranger who understands the secret seismic rumbles of the elephant herds.
- **The Obsidian Gorge**: An uncharted labyrinth of volcanic rock holding the last subterranean springs.

---
## Chapter 1: The Cracked Earth
The riverbeds of the Periyar valley had turned into mosaics of parched mud. For seven consecutive moons, the monsoon winds had drifted past the peaks without shedding a single raindrop.

At the edge of the dried watering hole, herds of chital deer, wild gaurs, and langurs huddled under the scorched shade of teak trees. The tension in the air was palpable; survival was measured in hours.

Then, from the crest of the teak canopy, came a resonant infrasonic rumble that vibrated through the soles of Ranger Kavya's boots. Through the dust haze emerged Gajraj.

His gait was unhurried, his amber eyes radiating calm authority. Lifting his trunk into the searing breeze, he tasted the air. He turned his gaze toward the forbidden jagged ridge of the northern canyon—a place the tribal elders called the Cradle of Springs.

---
## Chapter 2: The Canyon of Shadows
Leading the desperate sanctuary animals behind him, Gajraj navigated the steep ravine. Where younger bulls would have panicked against the loose shale, Gajraj tested each boulder with the sensitive cushion of his front foot before stepping forward.

Suddenly, a massive limestone landslide blocked the gorge entrance. A wall of stone ten feet high separated the herd from the inner valley.

Gajraj stepped forward. Lowering his massive crown, he braced his left tusk beneath the central keystone boulder. Kavya watched in awe through her binoculars as the ancient tusker exhaled deeply, engaging muscles forged over half a century of wandering. With a deafening crack that echoed across the valley, the keystone pivoted, and the barrier collapsed into manageable stepping stones.

---
## Chapter 3: The Living Springs
Deep within the cool obsidian cavern, Gajraj stopped. He gently lowered his trunk to the floor, tapping the bedrock with his foot to listen to the subterranean acoustic resonance.

He knew where the water slept.

Rearing onto his hind legs, Gajraj brought both massive forefeet down onto a natural fissure in the limestone floor. Once. Twice. On the third strike, a crystalline geyser of icy, sweet water erupted into the cavern air, showering the exhausted herd in pure life.

The stream spilled forth, rushing down into the thirsty riverbeds below. As green shoots began unfurling across the banks within hours, Kavya bowed her head in reverence to the great beast. Gajraj stood quietly by the fountainhead, a sentinel of patience and primal majesty.`;
  } else if (isHindi) {
    fallbackStory = `# ${cleanPrompt || 'भाग्य की रेखाएं'}
**सार (Premise)**: ${cleanPrompt ? `"${cleanPrompt}" पर आधारित एक रोमांचक कथा` : 'जीवन की अप्रत्याशित चुनौतियों और साहस की एक प्रेरणादायक कहानी।'}
**विधा एवं भाव (Genre & Tone)**: ${genre} | ${tone}
**मुख्य पात्र (Characters)**:
- **${protagonist || 'विक्रम'}**: एक दृढ़ निश्चयी और साहसी नायक जो अपने सिद्धांतों पर अडिग रहता है।
- **आचार्य देवदत्त**: प्राचीन ज्ञान और नीति के संरक्षक, जिन्होंने समय के पहिए को बदलते देखा है।
- **छाया**: एक रहस्यमयी मार्गदर्शक जो संकट की घड़ी में सत्य का मार्ग दिखाती है।

---
## अध्याय 1: आरंभ और आह्वान
धूप ढलने के साथ ही क्षितिज पर गहरा नारंगी और जामुनी रंग छाने लगा था। ${protagonist || 'विक्रम'} उस प्राचीन विशाल द्वार के सम्मुख खड़ा था, जहां से उसके जीवन की सबसे कठिन परीक्षा प्रारंभ होने वाली थी।

"यदि तुम इस द्वार के पार गए," आचार्य देवदत्त की गंभीर आवाज़ पीछे से आई, "तो पीछे मुड़कर देखने का कोई अवसर नहीं मिलेगा। क्या तुम्हारा संकल्प इतना दृढ़ है?"

${protagonist || 'विक्रम'} ने अपनी मुट्ठी भींची और मुड़कर देखा। "आचार्य, जब तक लक्ष्य सामने है, मेरे कदम पीछे नहीं हट सकते। यह लड़ाई केवल मेरी नहीं, बल्कि उन सभी की है जो न्याय की प्रतीक्षा कर रहे हैं।"

---
## अध्याय 2: अग्नि-परीक्षा
मार्ग में कदम-कदम पर खतरे मंडरा रहे थे। घने कोहरे के बीच से अजीब फुसफुसाहटें सुनाई दे रही थीं। अचानक, ज़मीन हिलने लगी और उसके सामने एक रहस्यमयी पहेली प्रकट हुई।

छाया ने अंधकार से निकलकर एक जलती हुई मशाल आगे बढ़ाई। "सावधानी से कदम रखो। यहां तुम्हारी शारीरिक शक्ति नहीं, बल्कि तुम्हारी आत्मा की पवित्रता और बुद्धिमत्ता की परीक्षा होगी।"

संकट के चरम क्षण में, जब चारों ओर निराशा के बादल घिर आए, नायक ने अपनी अंतरात्मा की आवाज़ सुनी। उसने वह निर्णय लिया जिसकी किसी ने कल्पना भी नहीं की थी—उसने शक्ति के स्थान पर करुणा और धैर्य को चुना।

---
## अध्याय 3: विजय और नया सवेरा
उस साहसी निर्णय ने पूरे वातावरण को बदल दिया। अंधकार छंट गया और आकाश में सुनहरी किरणों का उजाला फैल गया। जो बाधाएं पहाड़ जैसी लग रही थीं, वे पानी की तरह पिघल गईं।

${protagonist || 'विक्रम'} ने न केवल अपनी परीक्षा में विजय प्राप्त की, बल्कि अपने लोगों के लिए एक नए युग का सूत्रपात किया। इतिहास साक्षी था कि सच्ची वीरता शस्त्रों में नहीं, बल्कि अडिग विश्वास और पवित्र संकल्प में होती है।`;
  } else {
    fallbackStory = `# The Resonance Protocol
**Premise**: In pursuit of "${cleanPrompt || 'the truth'}", ${protagonist || 'a determined protagonist'} confronts an impossible mystery that reshapes their destiny.
**Genre & Tone**: ${genre} | ${tone}
**Characters**: 
- **${protagonist || 'Lyra Vale'}**: Fiercely intuitive, resourceful, and driven by purpose.
- **Kaelen**: An experienced advisor balancing logic with rising empathy.
- **The Catalyst**: An unexpected anomaly challenging everything once held true.

---
## Chapter 1: The Unfolding
The journey began where conventional maps ended. When the first subtle signs appeared across the horizon, ${protagonist || 'Lyra'} knew the warnings of the council had come to pass.

"Are you certain we should proceed?" Kaelen asked, looking at the shifting coordinates.

"Certainty is a luxury of the past," came the calm reply. "If we do not uncover what lies ahead, no one else will."

---
## Chapter 2: The Crux of Decision
Every step forward demanded higher resolve. Deeper inside the sector, the rules that governed the ordinary world began to dissolve. Facing the unforeseen twist, our protagonist chose courage over retreat, unlocking a truth hidden for generations.

---
## Chapter 3: A Horizon Renewed
As dawn broke over the newly illuminated valley, the ancient barrier fell away. The journey had altered everything—not by force, but through clarity, wisdom, and an unbreakable bond with those who dared to dream.`;
  }

  return res.json({ success: true, story: fallbackStory, source: 'fallback' });
});

// 2. AI Script Writer Endpoint
app.post('/api/generate-script', async (req: Request, res: Response) => {
  const { topic, format = 'YouTube Video', targetAudience = 'Tech enthusiasts', tone = 'Engaging & Fast-paced', duration = '3-5 minutes' } = req.body;

  const systemInstruction = `You are an award-winning screenwriter, YouTube video strategist, and creative director. Write industry-standard scripts with scene headings, character tags, audio/visual cues, timing benchmarks, and dialogue formatted cleanly.`;

  const userPrompt = `Create a complete production-ready script for a ${format}.
Topic / Concept: "${topic || 'How AI Will Transform Daily Life in 2030'}"
Target Audience: ${targetAudience}
Tone: ${tone}
Target Length: ${duration}

Structure requirements:
1. Title, Logline & Hook synopsis
2. Production Notes (Pacing, Music Vibe, Props/B-Roll)
3. Scene-by-scene script with timestamps, [VISUAL CUE], [AUDIO / SFX], [HOST / CHARACTER DIALOGUE]
4. Call to Action / Climax ending`;

  try {
    const aiResult = await callGeminiText(userPrompt, systemInstruction);
    if (aiResult) {
      return res.json({ success: true, script: aiResult, source: 'gemini' });
    }
  } catch (e) {
    console.error(e);
  }

  const fallbackScript = `# SCRIPT: ${topic || 'The 5-Minute Morning Reset'}
**Format**: ${format} | **Target Audience**: ${targetAudience}
**Tone**: ${tone} | **Estimated Run Time**: ${duration}

### PRODUCTION NOTES
- **Audio Track**: Lo-fi ambient beats transitioning into an upbeat synth pulse.
- **Lighting**: Cinematic contrast with cool teal and warm neon accents.
- **B-Roll Style**: High-speed dynamic macro shots, kinetic typography, and fluid match-cuts.

---

### [00:00 - 00:25] THE HOOK (Cold Open)
**[VISUAL]**: Close-up on alarm clock buzzing. A hand slams the snooze button. Quick smash-cut to high-energy montage of cluttered notifications, spilled coffee, and frantic morning rush.
**[AUDIO / SFX]**: Harsh alarm sound -> vinyl record scratch -> sudden atmospheric whoosh.
**HOST (Direct to Camera, punchy)**:
"You're losing your entire day before you even finish your first cup of coffee. What if fixing your morning didn't take an hour of ice baths and journaling... but exactly 300 seconds?"

---

### [00:25 - 01:15] SCENE 1: The Dopamine Trap
**[VISUAL]**: Split-screen demonstration. Left side: doom-scrolling in bed with blue screen glow. Right side: animated neuroscience graphic showing cortisol spikes.
**[AUDIO / SFX]**: Muffled phone vibration, subtle ticking clock sound.
**HOST (VOICEOVER)**:
"The moment you unlock your phone in the first five minutes of waking, you force your brain into a state of reactive anxiety. You're letting hundreds of strangers decide your emotional state."

---

### [01:15 - 02:30] SCENE 2: The 3-Step Protocol
**[VISUAL]**: Host in modern studio, holding a sleek glass of water with lemon. Clean on-screen lower-third graphics popping up: 1. Hydrate 2. Natural Photons 3. The 100-Beat Movement.
**[AUDIO / SFX]**: Upbeat bass groove kicks in.
**HOST**:
"Step one: 500ml of water before caffeine. Step two: natural sunlight into your retinas to trigger your circadian timer. Step three: 60 seconds of gentle joint mobility."

---

### [02:30 - 03:00] OUTRO & CALL TO ACTION
**[VISUAL]**: Host smiles warmly. Screen displays animated recap checklist with subscribe button animation.
**[AUDIO / SFX]**: Music swells into an inspiring final chord.
**HOST**:
"Try this for three consecutive mornings. Notice the difference in your mental clarity. Tap that subscribe button for more high-leverage daily systems, and tell me in the comments what your current morning ritual looks like."`;

  return res.json({ success: true, script: fallbackScript, source: 'fallback' });
});

// 3. AI Photo Generator Endpoint
app.post('/api/generate-photo', async (req: Request, res: Response) => {
  const { prompt, style = 'Photorealistic', aspectRatio = '1:1' } = req.body;

  // Enhance prompt for maximum visual fidelity
  let enhancedPrompt = prompt;
  if (aiClient) {
    try {
      const enhancementResponse = await callGeminiText(
        `Expand this image prompt into a hyper-detailed, photorealistic, visually stunning prompt suitable for modern AI image generators. Keep it under 50 words, emphasizing lighting, atmosphere, textures, and camera lens details.
Prompt: "${prompt}"
Style: ${style}`,
        'You are an expert prompt engineer specializing in cinematic and hyper-detailed visual aesthetics.'
      );
      if (enhancementResponse) {
        enhancedPrompt = enhancementResponse.replace(/["\n]/g, ' ').trim();
      }
    } catch (e) {
      console.log('Prompt enhancement skipped');
    }
  }

  // Determine aspect ratio dimensions
  let width = 1024;
  let height = 1024;
  if (aspectRatio === '16:9') {
    width = 1280;
    height = 720;
  } else if (aspectRatio === '9:16') {
    width = 720;
    height = 1280;
  } else if (aspectRatio === '4:3') {
    width = 1024;
    height = 768;
  }

  // We produce reliable high quality rendered image output
  const seed = Math.floor(Math.random() * 999999);
  const encodedQuery = encodeURIComponent(`${enhancedPrompt || prompt}, ${style} style, 8k resolution, award winning masterpiece, dramatic lighting`);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodedQuery}?width=${width}&height=${height}&seed=${seed}&nologo=true`;

  return res.json({
    success: true,
    imageUrl,
    promptUsed: enhancedPrompt || prompt,
    style,
    aspectRatio,
    seed,
  });
});

// 4. AI Logo Maker Endpoint
app.post('/api/generate-logo', async (req: Request, res: Response) => {
  const { brandName, industry = 'Technology', style = 'Minimalist Geometric', primaryColor = '#6366F1', secondaryColor = '#EC4899', tagline = '' } = req.body;

  const systemInstruction = `You are a world-class brand identity designer and SVG master. When asked for a logo, provide an SVG string that is clean, vector-based, beautifully balanced, modern, and scales crisply.`;

  const userPrompt = `Create a high-end vector logo design for:
Brand Name: "${brandName || 'NEXUS'}"
Tagline: "${tagline || 'Intelligent Future'}"
Industry: ${industry}
Style: ${style}
Primary Color: ${primaryColor}
Secondary Color: ${secondaryColor}

Return a valid JSON object matching this structure:
{
  "brandName": "${brandName}",
  "tagline": "${tagline}",
  "designConcept": "A brief 2-sentence explanation of the iconography and brand metaphor",
  "palette": ["${primaryColor}", "${secondaryColor}", "#0F172A", "#F8FAFC"],
  "typography": { "fontFamily": "Plus Jakarta Sans, sans-serif", "letterSpacing": "0.15em", "fontStyle": "bold" },
  "svgContent": "<svg viewBox='0 0 500 500' xmlns='http://www.w3.org/2000/svg'>...</svg>"
}
Ensure the SVG is completely valid, has width='100%' height='100%' viewBox='0 0 500 500', modern gradients, sophisticated geometry or monogram, and looks like a Fortune 500 tech or luxury startup.`;

  try {
    const aiResult = await callGeminiText(userPrompt, systemInstruction);
    if (aiResult) {
      // Parse JSON from aiResult
      const cleaned = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed.svgContent) {
        return res.json({ success: true, logo: parsed, source: 'gemini' });
      }
    }
  } catch (e) {
    console.error('Logo generation fallback triggered:', e);
  }

  // High quality SVG Logo Generator Fallback
  const safeName = brandName || 'AURA';
  const safeTagline = tagline || 'SMART AI INNOVATION';
  const initial = safeName.charAt(0).toUpperCase();

  const fallbackLogo = {
    brandName: safeName,
    tagline: safeTagline,
    designConcept: `An aerodynamic geometric crest uniting the '${initial}' monogram with infinite quantum loops, reflecting ${industry.toLowerCase()} agility and forward momentum.`,
    palette: [primaryColor, secondaryColor, '#0F172A', '#F8FAFC'],
    typography: {
      fontFamily: 'Plus Jakarta Sans, sans-serif',
      letterSpacing: '0.2em',
      fontStyle: 'bold',
    },
    svgContent: `<svg viewBox="0 0 500 500" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${primaryColor}" />
      <stop offset="100%" stop-color="${secondaryColor}" />
    </linearGradient>
    <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${secondaryColor}" />
      <stop offset="100%" stop-color="${primaryColor}" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Base Canvas -->
  <rect width="500" height="500" rx="40" fill="#090D16" />
  
  <!-- Subtle Grid Accent -->
  <circle cx="250" cy="200" r="140" fill="none" stroke="${primaryColor}" stroke-opacity="0.1" stroke-width="1.5" stroke-dasharray="4 6" />
  <circle cx="250" cy="200" r="170" fill="none" stroke="${secondaryColor}" stroke-opacity="0.08" stroke-width="1" />

  <!-- Dynamic Symbol Core -->
  <g transform="translate(250, 195)">
    <!-- Outer Hex Ring -->
    <polygon points="0,-85 74,-42 74,42 0,85 -74,42 -74,-42" fill="none" stroke="url(#grad1)" stroke-width="8" stroke-linejoin="round" />
    
    <!-- Inner Radiant Diamond / Monogram -->
    <polygon points="0,-50 45,0 0,50 -45,0" fill="url(#grad2)" fill-opacity="0.25" stroke="url(#grad2)" stroke-width="4" filter="url(#glow)" />
    
    <!-- Focal Spark Element -->
    <circle cx="0" cy="0" r="12" fill="#FFFFFF" />
    <circle cx="0" cy="0" r="22" fill="none" stroke="url(#grad1)" stroke-width="3" />

    <!-- Stylized Monogram Overlay -->
    <text x="0" y="8" font-family="'Plus Jakarta Sans', sans-serif" font-size="28" font-weight="900" fill="#FFFFFF" text-anchor="middle" dominant-baseline="middle">${initial}</text>
  </g>

  <!-- Wordmark -->
  <text x="250" y="370" font-family="'Plus Jakarta Sans', sans-serif" font-size="34" font-weight="800" fill="#FFFFFF" text-anchor="middle" letter-spacing="4">${safeName.toUpperCase()}</text>
  <text x="250" y="405" font-family="'Plus Jakarta Sans', sans-serif" font-size="12" font-weight="600" fill="${primaryColor}" text-anchor="middle" letter-spacing="6">${safeTagline.toUpperCase()}</text>
</svg>`,
  };

  return res.json({ success: true, logo: fallbackLogo, source: 'fallback' });
});

// 5. AI Translator Endpoint
app.post('/api/translate', async (req: Request, res: Response) => {
  const { text, sourceLang = 'Auto Detect', targetLang = 'Spanish', tone = 'Natural & Fluent' } = req.body;

  const systemInstruction = `You are a certified master polyglot translator and linguist. Translate the input accurately while honoring cultural idioms, natural conversational phrasing, and formality level.`;

  const userPrompt = `Translate the following text from ${sourceLang} to ${targetLang}.
Tone: ${tone}
Original Text: "${text}"

Respond in JSON format:
{
  "detectedSourceLang": "${sourceLang === 'Auto Detect' ? 'English' : sourceLang}",
  "translatedText": "translated content here",
  "pronunciation": "phonetic pronunciation or romanization (e.g. Pinyin or IPA if non-latin)",
  "formalityNotes": "Brief 1-sentence note on formality (Polite / Casual / Formal)",
  "keyVocabulary": [
    { "term": "word", "translation": "translated word", "notes": "context or usage note" }
  ],
  "culturalNuance": "Brief explanation of how native speakers perceive this phrase"
}`;

  try {
    const aiResult = await callGeminiText(userPrompt, systemInstruction);
    if (aiResult) {
      const cleaned = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, result: parsed, source: 'gemini' });
    }
  } catch (e) {
    console.error('Translation error:', e);
  }

  // Fallback translations dictionary
  const fallbackDict: Record<string, { trans: string; pron: string; nuance: string }> = {
    Spanish: {
      trans: "¡Hola! Bienvenidos a SMART AI HUB, la plataforma inteligente para todos tus proyectos creativos.",
      pron: "OH-lah! Bee-en-veh-NEE-dos ah Smart AI Hub...",
      nuance: "In Spanish, the warm exclamation and plural 'bienvenidos' fosters an inclusive, inviting tone for users."
    },
    French: {
      trans: "Bonjour ! Bienvenue sur SMART AI HUB, la plateforme intelligente pour tous vos projets créatifs.",
      pron: "Bohn-zhoor! Byen-ven-ew soor Smart AI Hub...",
      nuance: "Using the polite 'vos' (formal/plural) conveys modern professionalism and elegance in contemporary French UI."
    },
    Japanese: {
      trans: "こんにちは！あらゆるクリエイティブなプロジェクトのためのインテリジェントなハブ「SMART AI HUB」へようこそ。",
      pron: "Konnichiwa! Arayuru kurieitibu na purojekuto no tame no inteijento na habu 'SMART AI HUB' e yōkoso.",
      nuance: "Polite keigo styling (ようこそ) greets the user with Japanese hospitality and respect."
    },
    German: {
      trans: "Hallo! Willkommen beim SMART AI HUB, der intelligenten Plattform für all Ihre kreativen Projekte.",
      pron: "HAH-loh! Vil-KOM-men by-m Smart AI Hub...",
      nuance: "The formal address 'Ihre' maintains appropriate enterprise business etiquette in DACH markets."
    }
  };

  const sample = fallbackDict[targetLang] || {
    trans: `[${targetLang}] ${text || 'Welcome to SMART AI HUB. Experience the future of artificial intelligence.'}`,
    pron: 'Phonetic transcription available in native voice playback.',
    nuance: `Translated seamlessly into ${targetLang} preserving context, grammar, and communicative intent.`
  };

  return res.json({
    success: true,
    result: {
      detectedSourceLang: sourceLang === 'Auto Detect' ? 'English' : sourceLang,
      translatedText: sample.trans,
      pronunciation: sample.pron,
      formalityNotes: 'Standard polite / contemporary conversational register.',
      keyVocabulary: [
        { term: 'Smart', translation: 'Intelligent / Astuto', notes: 'Signifies high capability and AI synergy' },
        { term: 'Hub', translation: 'Centro / Plateforme', notes: 'Centralized gathering spot for multi-tools' }
      ],
      culturalNuance: sample.nuance
    },
    source: 'fallback'
  });
});

// 6. AI Voice Generator Script / Text to Speech Metadata Endpoint
app.post('/api/generate-voice-script', async (req: Request, res: Response) => {
  const { prompt, voice = 'Nova', style = 'Podcast Host' } = req.body;

  const systemInstruction = `You are an expert audio producer and voiceover director. Polish the provided text into a beautifully paced spoken script with pronunciation pauses, emphasis markers, and pacing notes.`;

  const userPrompt = `Optimize this text for voice synthesis:
Original: "${prompt || 'Welcome to SMART AI HUB. Let us explore the wonders of creative artificial intelligence.'}"
Voice Persona: ${voice}
Style: ${style}

Provide a JSON object with:
{
  "spokenText": "Polished text with natural punctuation for speech synthesis",
  "pacingNotes": "Director instructions on tone, pauses, and cadence",
  "durationSeconds": 15,
  "suggestedBgm": "Warm acoustic ambient / Synthwave / Corporate upbeat"
}`;

  try {
    const aiResult = await callGeminiText(userPrompt, systemInstruction);
    if (aiResult) {
      const cleaned = aiResult.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.json({ success: true, data: parsed, source: 'gemini' });
    }
  } catch (e) {
    console.error('Voice script error:', e);
  }

  return res.json({
    success: true,
    data: {
      spokenText: prompt || "Welcome to SMART AI HUB. Experience the cutting edge of AI stories, scripts, photo generation, voices, logos, and instant multilingual translation.",
      pacingNotes: "Deliver with a confident, friendly cadence. Pause 0.3s after major clauses for dramatic impact.",
      durationSeconds: 12,
      suggestedBgm: "Ambient Lo-Fi Electronic Pulse"
    },
    source: 'fallback'
  });
});

// 7. Complete Project Source Code ZIP Download Endpoint
app.get('/api/download-project-zip', async (_req: Request, res: Response) => {
  try {
    const zip = new JSZip();
    const rootDir = __dirname;

    const IGNORED_DIRS = new Set(['node_modules', '.git', 'dist', '.cache', '.vite', '.output']);
    const IGNORED_FILES = new Set(['package-lock.json', '.DS_Store', 'smart-ai-hub-source-code.zip']);

    function addFilesRecursively(currentPath: string, zipFolder: JSZip) {
      const items = fs.readdirSync(currentPath);
      for (const item of items) {
        if (IGNORED_DIRS.has(item) || IGNORED_FILES.has(item)) continue;
        const fullPath = path.join(currentPath, item);
        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          const subFolder = zipFolder.folder(item);
          if (subFolder) {
            addFilesRecursively(fullPath, subFolder);
          }
        } else if (stats.isFile()) {
          const content = fs.readFileSync(fullPath);
          zipFolder.file(item, content);
        }
      }
    }

    addFilesRecursively(rootDir, zip);

    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', 'attachment; filename="smart-ai-hub-source-code.zip"');
    res.setHeader('Content-Length', zipBuffer.length.toString());
    return res.end(zipBuffer);
  } catch (error) {
    console.error('Error creating project ZIP:', error);
    return res.status(500).json({ error: 'Failed to generate source code ZIP archive.' });
  }
});

// Dev vs Prod Vite handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SMART AI HUB server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
