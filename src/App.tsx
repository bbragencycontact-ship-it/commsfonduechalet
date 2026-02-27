/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Camera, 
  Video, 
  FileText, 
  Megaphone, 
  ChevronRight, 
  Users, 
  Clock, 
  Calendar, 
  Target, 
  Sparkles,
  Coffee,
  Wine,
  Briefcase,
  Home,
  Moon,
  Utensils,
  Mail,
  Star
} from 'lucide-react';

// --- Types ---

type Channel = 'Photo' | 'Video' | 'Post' | 'Ad' | 'EDM' | 'Influencer';

interface EvaluationResult {
  score: number;
  reasoning: string;
  improvementTip: string;
  visualSuggestions: string[];
  keywordCheck: {
    found: string[];
    missing: string[];
    count: number;
  };
}

interface AudienceProfile {
  id: string;
  title: string;
  description: string;
  profile: string;
  avgAge: string;
  decisionTime: string;
  interests: string[];
  bestVisitTimes: string[];
  peakOnlineTime: string[];
  expectation: string;
  icon: React.ReactNode;
}

// --- Data ---

const CHANNELS: { id: Channel; label: string; icon: React.ReactNode }[] = [
  { id: 'Photo', label: 'Photography', icon: <Camera className="w-5 h-5" /> },
  { id: 'Video', label: 'Video Content', icon: <Video className="w-5 h-5" /> },
  { id: 'Post', label: 'Social Post', icon: <FileText className="w-5 h-5" /> },
  { id: 'Ad', label: 'Paid Advertisement', icon: <Megaphone className="w-5 h-5" /> },
  { id: 'EDM', label: 'Email Marketing', icon: <Mail className="w-5 h-5" /> },
  { id: 'Influencer', label: 'Influencer Partnership', icon: <Star className="w-5 h-5" /> },
];

const AUDIENCES: AudienceProfile[] = [
  {
    id: 'foodies',
    title: 'Food and Event Enthusiasts',
    description: 'A rare chance to experience a true French Alpine cheese ritual, exactly as it’s meant to be shared.',
    profile: 'High-end foodies, "Broadsheet" readers.',
    avgAge: '35–45',
    decisionTime: '1–3 days',
    interests: ['Wine pairing', 'Food photography', 'Cultural authenticity'],
    bestVisitTimes: ['Thu/Fri (7pm–9pm)'],
    peakOnlineTime: ['12pm (Lunch)', '8pm'],
    expectation: 'Aesthetic perfection (Instagrammable) and premium ingredient quality.',
    icon: <Utensils className="w-6 h-6" />
  },
  {
    id: 'young-friends',
    title: 'Young Group of Friends',
    description: 'A winter night in the French Alps built for gathering - one chalet, one table, one shared ritual.',
    profile: 'Established white-collar professionals (South Yarra/Fitzroy).',
    avgAge: '30–38',
    decisionTime: '3–5 days (coordinated via WhatsApp)',
    interests: ['Pilates', 'Mt Buller skiing', 'Weekend brunch'],
    bestVisitTimes: ['Sat (7pm–9pm)', 'Sun (11am–2pm)'],
    peakOnlineTime: ['6pm–9pm (Post-work)'],
    expectation: 'Social vibe and a unique "night out" alternative to standard bars.',
    icon: <Coffee className="w-6 h-6" />
  },
  {
    id: 'old-friends',
    title: 'Old Group of Friends',
    description: 'A fun French Alpine evening designed for long conversations, great food, and shared moments.',
    profile: 'Long-time residents (Brighton/Hawthorn), established couples.',
    avgAge: '50–65',
    decisionTime: '1–2 weeks (Planned ahead)',
    interests: ['Golfing', 'Gardening', 'Theater', 'Wine collections'],
    bestVisitTimes: ['Sun (11am–2pm)', 'Thu (7pm)'],
    peakOnlineTime: ['8am–10am'],
    expectation: 'Comfort, high-quality service, and low ambient noise for conversation.',
    icon: <Wine className="w-6 h-6" />
  },
  {
    id: 'families',
    title: 'Families',
    description: 'A cultural and fun immersion for the entire family that brings them together (5pm sessions, gifts for kids).',
    profile: 'Active parents looking for educational/bonding winter activities.',
    avgAge: '38–50',
    decisionTime: '5 days (Decided early in the week)',
    interests: ['School sports', 'Family travel', 'Sustainability'],
    bestVisitTimes: ['Sat/Sun (11am–2pm)'],
    peakOnlineTime: ['7am', '9pm (After kids are asleep)'],
    expectation: 'Kid-friendly engagement and creating a "European Winter" memory.',
    icon: <Home className="w-6 h-6" />
  },
  {
    id: 'corporate',
    title: 'Corporate Group',
    description: 'A winter team experience that brings people together naturally, beyond the office.',
    profile: 'CBD/Docklands Managers and Directors.',
    avgAge: '35–55',
    decisionTime: 'Fast (Once budget is approved)',
    interests: ['Networking', 'LinkedIn', 'Tennis', 'Economics'],
    bestVisitTimes: ['Thu (7pm–9pm)'],
    peakOnlineTime: ['9am–11am (Office hours)'],
    expectation: 'Seamless booking and a natural "ice-breaker" activity.',
    icon: <Briefcase className="w-6 h-6" />
  },
  {
    id: 'internationals',
    title: 'Late-dinner Internationals',
    description: 'A European-style Alpine night, with late dinners, shared fondue, and time to linger.',
    profile: 'European/South American expats or locals with a late-night lifestyle.',
    avgAge: '32–45',
    decisionTime: 'Spontaneous (1–2 days)',
    interests: ['Contemporary art', 'Nightlife', 'Electronic music/jazz'],
    bestVisitTimes: ['Fri/Sat (7pm–9pm, staying late)'],
    peakOnlineTime: ['10pm–12am'],
    expectation: 'Warm hospitality, European wine list, and a sense of escapism.',
    icon: <Moon className="w-6 h-6" />
  },
];

// --- Constants ---

const KEY_SENTENCES = [
  "A French Melted Cheese Experience",
  "Choose your cheese ritual and escape into your own chalet in the Alps (…at Fed Square)",
  "Feast cheese Fondue or Raclette in your private chalet.",
  "For 7 weeks only in the heart of Melbourne",
  "A French Alpine Village is popping at Fed Square",
  "This Winter, escape to the French Alps right in the heart of Melbourne",
  "Dine in your private chalet in the Alps",
  "18 authentic wooden chalets imported from France",
  "Expect snow falling, melted cheese and mulled wine",
  "Gather your loved ones for a unique night"
];

const KEYWORDS = [
  "Alps", "French", "wooden", "chalet", "private", "winter", "escape", "snow", "forest", "village", 
  "Melbourne", "Fed Square", "mountain", "Cheese", "melted", "Savoyarde Fondue", "Mountain Raclette", 
  "team", "ritual", "tradition", "iconic", "unique", "authentic", "gather", "loved one", "warm", 
  "cosy", "convivial", "shared", "cocktail", "fire pit", "cheers", "ski bar", "share", "midweek", 
  "break", "rendez-vous", "late-night", "experience"
];

// --- Components ---

const Header = () => (
  <header className="relative py-12 flex items-center justify-center bg-[#111111] text-white">
    <div className="relative z-10 text-center px-4">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl md:text-5xl font-serif italic tracking-tight mb-2">Fondue Chalet</h1>
        <p className="text-xs uppercase tracking-[0.3em] font-sans opacity-60">Melbourne Strategy Tool</p>
      </motion.div>
    </div>
    <div className="absolute bottom-0 left-0 w-full h-1 bg-[#8B4513]" />
  </header>
);

const DataCard = ({ profile, channel }: { profile: AudienceProfile; channel: Channel; key?: string }) => (
  <motion.div
    initial={{ x: 50, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    exit={{ x: -50, opacity: 0 }}
    className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-[#8B4513]/10"
  >
    <div className="bg-[#111111] p-6 text-white flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-white/10 rounded-xl">
          {profile.icon}
        </div>
        <div>
          <h3 className="text-xl font-bold">{profile.title}</h3>
          <p className="text-xs opacity-70 uppercase tracking-wider">Target Audience Profile</p>
        </div>
      </div>
      <div className="px-4 py-2 bg-[#8B4513] rounded-full text-xs font-bold uppercase tracking-widest">
        {channel} Strategy
      </div>
    </div>

    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <section>
          <h4 className="flex items-center gap-2 text-[#8B4513] font-bold uppercase text-xs tracking-widest mb-3">
            <Target className="w-4 h-4" /> The Angle
          </h4>
          <p className="text-gray-700 leading-relaxed italic">"{profile.description}"</p>
        </section>

        <section>
          <h4 className="flex items-center gap-2 text-[#8B4513] font-bold uppercase text-xs tracking-widest mb-3">
            <Users className="w-4 h-4" /> Demographics
          </h4>
          <div className="space-y-2">
            <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Profile:</span> {profile.profile}</p>
            <p className="text-sm text-gray-600"><span className="font-semibold text-gray-900">Avg Age:</span> {profile.avgAge}</p>
          </div>
        </section>

        <section>
          <h4 className="flex items-center gap-2 text-[#8B4513] font-bold uppercase text-xs tracking-widest mb-3">
            <Sparkles className="w-4 h-4" /> Interests
          </h4>
          <div className="flex flex-wrap gap-2">
            {profile.interests.map((interest, i) => (
              <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {interest}
              </span>
            ))}
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
          <h4 className="flex items-center gap-2 text-[#111111] font-bold uppercase text-xs tracking-widest mb-4">
            <Clock className="w-4 h-4" /> Logistics & Timing
          </h4>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Decision Window</p>
              <p className="text-sm text-gray-800">{profile.decisionTime}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Best Visit Times</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.bestVisitTimes.map((time, i) => (
                  <span key={i} className="flex items-center gap-1 text-xs text-gray-700">
                    <Calendar className="w-3 h-3 text-[#8B4513]" /> {time}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Peak Online Activity</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {profile.peakOnlineTime.map((time, i) => (
                  <span key={i} className="px-2 py-1 bg-[#111111]/5 text-[#111111] rounded text-[11px] font-bold">
                    {time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h4 className="flex items-center gap-2 text-[#8B4513] font-bold uppercase text-xs tracking-widest mb-3">
            <Utensils className="w-4 h-4" /> Core Expectation
          </h4>
          <p className="text-sm text-gray-700 bg-[#8B4513]/5 p-4 rounded-xl border-l-4 border-[#8B4513]">
            {profile.expectation}
          </p>
        </section>
      </div>
    </div>
  </motion.div>
);

const StrategyEvaluator = ({ 
  channel, 
  profile 
}: { 
  channel: Channel; 
  profile: AudienceProfile 
}) => {
  const [idea, setIdea] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const evaluateIdea = async () => {
    if (!idea.trim()) return;
    
    setIsEvaluating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Evaluate this marketing idea for Fondue Chalet Melbourne.
          Channel: ${channel}
          Audience: ${profile.title}
          Audience Context: ${profile.description}
          Demographics: ${profile.profile}, Age: ${profile.avgAge}
          Core Expectation: ${profile.expectation}
          
          BRAND GUIDELINES:
          Key Sentences: ${KEY_SENTENCES.join(" | ")}
          Mandatory Keywords: ${KEYWORDS.join(", ")}
          
          Idea: ${idea}`,
        config: {
          systemInstruction: "You are a senior marketing strategist. Evaluate ideas based on their alignment with the specific audience, channel, and brand guidelines. Return a JSON object with 'score' (number 0-100), 'reasoning' (string, max 2 sentences), 'improvementTip' (string, a specific tip on how to reach 100% alignment), 'visualSuggestions' (string array), and 'keywordCheck' (object with 'found' array, 'missing' array, and 'count' number). IMPORTANT: Be objective and consistent. If the user incorporates your previous 'improvementTip' or more brand keywords, the score MUST increase.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
              improvementTip: { type: Type.STRING },
              visualSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywordCheck: {
                type: Type.OBJECT,
                properties: {
                  found: { type: Type.ARRAY, items: { type: Type.STRING } },
                  missing: { type: Type.ARRAY, items: { type: Type.STRING } },
                  count: { type: Type.NUMBER }
                },
                required: ["found", "missing", "count"]
              }
            },
            required: ["score", "reasoning", "improvementTip", "visualSuggestions", "keywordCheck"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setResult(data);
    } catch (error) {
      console.error("Evaluation failed:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="mt-8 bg-white rounded-2xl shadow-xl border border-[#8B4513]/10 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-100 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-[#8B4513] text-white flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <h3 className="font-bold text-[#111111] uppercase text-sm tracking-widest">Step 3: Strategy Evaluator</h3>
      </div>
      
      <div className="p-8 space-y-6">
        <div>
          <label className="block text-[10px] uppercase text-gray-400 font-bold mb-2 tracking-widest">
            Your Creative Concept
          </label>
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="Describe your campaign idea here... (e.g., A sunset cheese tasting event with live jazz)"
            className="w-full h-32 p-4 rounded-xl border-2 border-gray-100 focus:border-[#8B4513] focus:ring-0 transition-all resize-none text-sm"
          />
        </div>

        <button
          onClick={evaluateIdea}
          disabled={isEvaluating || !idea.trim()}
          className={`
            w-full py-4 rounded-xl font-bold uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2
            ${isEvaluating || !idea.trim() 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'bg-[#111111] text-white hover:bg-[#111111]/90 shadow-lg hover:shadow-xl active:scale-[0.98]'}
          `}
        >
          {isEvaluating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing Strategy...
            </>
          ) : (
            <>Evaluate Alignment</>
          )}
        </button>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="pt-6 border-t border-gray-100"
            >
              <div className="flex items-start gap-6">
                <div className="relative flex-shrink-0">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      className="text-gray-100"
                    />
                    <motion.circle
                      cx="40"
                      cy="40"
                      r="36"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={226.2}
                      initial={{ strokeDashoffset: 226.2 }}
                      animate={{ strokeDashoffset: 226.2 - (226.2 * result.score) / 100 }}
                      className="text-[#8B4513]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-[#111111]">
                    {result.score}%
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-[#8B4513] mb-1">Strategic Fit Score</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{result.reasoning}</p>
                  </div>
                  <div className="bg-[#8B4513]/5 p-4 rounded-xl border border-[#8B4513]/10">
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#8B4513] mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" /> Path to 100%
                    </h4>
                    <p className="text-xs text-gray-700 italic leading-relaxed mb-4">
                      {result.improvementTip}
                    </p>
                    
                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-2 flex items-center gap-2">
                      <Camera className="w-3 h-3" /> Visual Suggestions
                    </h4>
                    <ul className="space-y-1 mb-4">
                      {result.visualSuggestions.map((tip, i) => (
                        <li key={i} className="text-[11px] text-gray-600 flex items-center gap-2">
                          <div className="w-1 h-1 rounded-full bg-[#8B4513]" /> {tip}
                        </li>
                      ))}
                    </ul>

                    <h4 className="text-[10px] font-bold uppercase tracking-widest text-[#111111] mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3" /> Keyword Check
                      </div>
                      <span className="text-[#8B4513]">{result.keywordCheck.count} Found</span>
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {result.keywordCheck.found.map((word, i) => (
                        <span key={i} className="px-2 py-0.5 bg-green-50 text-green-700 rounded text-[9px] font-bold border border-green-100">
                          {word}
                        </span>
                      ))}
                      {result.keywordCheck.missing.slice(0, 5).map((word, i) => (
                        <span key={i} className="px-2 py-0.5 bg-gray-50 text-gray-400 rounded text-[9px] font-bold border border-gray-100 opacity-60">
                          {word}
                        </span>
                      ))}
                      {result.keywordCheck.missing.length > 5 && (
                        <span className="text-[9px] text-gray-400 font-bold ml-1">
                          +{result.keywordCheck.missing.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};


export default function App() {
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [selectedAudiences, setSelectedAudiences] = useState<AudienceProfile[]>([]);
  const [isMixing, setIsMixing] = useState(false);
  const [mixedProfile, setMixedProfile] = useState<AudienceProfile | null>(null);

  const toggleAudience = (audience: AudienceProfile) => {
    setSelectedAudiences(prev => {
      const isSelected = prev.find(a => a.id === audience.id);
      if (isSelected) {
        return prev.filter(a => a.id !== audience.id);
      }
      if (prev.length >= 2) {
        return [prev[1], audience];
      }
      return [...prev, audience];
    });
    setMixedProfile(null);
  };

  const generateMixedProfile = async () => {
    if (selectedAudiences.length !== 2) return;
    
    setIsMixing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Create a mixed audience profile for Fondue Chalet Melbourne by combining these two segments:
          Segment 1: ${selectedAudiences[0].title} (${selectedAudiences[0].description})
          Segment 2: ${selectedAudiences[1].title} (${selectedAudiences[1].description})`,
        config: {
          systemInstruction: "You are a senior marketing strategist. Create a 'Mixed Audience Profile' that blends the characteristics, interests, and expectations of two segments. Return a JSON object matching the AudienceProfile interface (id, title, description, profile, avgAge, decisionTime, interests[], bestVisitTimes[], peakOnlineTime[], expectation). The title should be 'Mixed: [Title 1] & [Title 2]'.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              profile: { type: Type.STRING },
              avgAge: { type: Type.STRING },
              decisionTime: { type: Type.STRING },
              interests: { type: Type.ARRAY, items: { type: Type.STRING } },
              bestVisitTimes: { type: Type.ARRAY, items: { type: Type.STRING } },
              peakOnlineTime: { type: Type.ARRAY, items: { type: Type.STRING } },
              expectation: { type: Type.STRING }
            },
            required: ["id", "title", "description", "profile", "avgAge", "decisionTime", "interests", "bestVisitTimes", "peakOnlineTime", "expectation"]
          }
        }
      });

      const data = JSON.parse(response.text || "{}");
      setMixedProfile({ ...data, icon: <Sparkles className="w-6 h-6" /> });
    } catch (error) {
      console.error("Mixing failed:", error);
    } finally {
      setIsMixing(false);
    }
  };

  const reset = () => {
    setSelectedChannel(null);
    setSelectedAudiences([]);
    setMixedProfile(null);
  };

  const activeProfile = mixedProfile || (selectedAudiences.length === 1 ? selectedAudiences[0] : null);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-gray-900">
      <Header />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Bracket Navigation */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Step 1: Channel Selection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm font-bold">1</span>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[#111111]">Select Channel</h2>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {CHANNELS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedChannel(c.id);
                      setSelectedAudiences([]);
                      setMixedProfile(null);
                    }}
                    className={`
                      flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 group
                      ${selectedChannel === c.id 
                        ? 'border-[#8B4513] bg-[#8B4513]/5 shadow-lg' 
                        : 'border-gray-200 bg-white hover:border-[#111111]/30 hover:shadow-md'}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        p-2 rounded-lg transition-colors
                        ${selectedChannel === c.id ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}
                      `}>
                        {c.icon}
                      </div>
                      <span className={`font-bold ${selectedChannel === c.id ? 'text-[#8B4513]' : 'text-gray-700'}`}>
                        {c.label}
                      </span>
                    </div>
                    {selectedChannel === c.id && <ChevronRight className="w-5 h-5 text-[#8B4513]" />}
                  </button>
                ))}
              </div>
            </section>

            {/* Step 2: Audience Selection */}
            <AnimatePresence>
              {selectedChannel && (
                <motion.section
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center text-sm font-bold">2</span>
                      <h2 className="text-sm font-bold uppercase tracking-widest text-[#111111]">Select Angles</h2>
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      {selectedAudiences.length}/2 Selected
                    </span>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {AUDIENCES.map((a) => {
                      const isSelected = selectedAudiences.find(sa => sa.id === a.id);
                      return (
                        <button
                          key={a.id}
                          onClick={() => toggleAudience(a)}
                          className={`
                            flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 text-left
                            ${isSelected 
                              ? 'border-[#8B4513] bg-[#8B4513]/5 shadow-lg' 
                              : 'border-gray-200 bg-white hover:border-[#111111]/30 hover:shadow-md'}
                          `}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`
                              p-2 rounded-lg
                              ${isSelected ? 'bg-[#8B4513] text-white' : 'bg-gray-100 text-gray-500'}
                            `}>
                              {a.icon}
                            </div>
                            <span className={`text-sm font-bold leading-tight ${isSelected ? 'text-[#8B4513]' : 'text-gray-700'}`}>
                              {a.title}
                            </span>
                          </div>
                          {isSelected && <ChevronRight className="w-5 h-5 text-[#8B4513]" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAudiences.length === 2 && !mixedProfile && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      onClick={generateMixedProfile}
                      disabled={isMixing}
                      className="w-full mt-6 py-4 bg-[#8B4513] text-white rounded-xl font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-xl hover:bg-[#8B4513]/90 transition-all"
                    >
                      {isMixing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Mixing Audiences...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" /> Generate Mixed Angle
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.section>
              )}
            </AnimatePresence>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedChannel && activeProfile ? (
                <>
                  <DataCard 
                    key={`${selectedChannel}-${activeProfile.id}`}
                    profile={activeProfile} 
                    channel={selectedChannel} 
                  />
                  <StrategyEvaluator 
                    channel={selectedChannel} 
                    profile={activeProfile} 
                  />
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-12 border-4 border-dashed border-gray-200 rounded-3xl"
                >
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <Target className="w-12 h-12 text-gray-300" />
                  </div>
                  <h3 className="text-2xl font-serif italic text-gray-400 mb-2">Awaiting Strategy Selection</h3>
                  <p className="text-gray-400 max-w-xs">
                    {selectedAudiences.length === 2 && !mixedProfile 
                      ? "Click 'Generate Mixed Angle' to combine your selections."
                      : "Complete the decision bracket on the left to reveal the deep-dive audience profile."}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {(selectedChannel || selectedAudiences.length > 0) && (
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={reset}
                  className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#8B4513] transition-colors"
                >
                  Reset Selection
                </button>
              </div>
            )}
          </div>

        </div>
      </main>

      <footer className="bg-[#111111] text-white/40 py-12 border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs uppercase tracking-[0.2em] mb-4">Fondue Chalet Melbourne &copy; 2026</p>
          <div className="flex justify-center gap-8">
            <div className="text-[10px] uppercase tracking-widest">French Alpine Aesthetic</div>
            <div className="text-[10px] uppercase tracking-widest">Marketing Strategy Tool</div>
            <div className="text-[10px] uppercase tracking-widest">Decision Bracket Logic</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
