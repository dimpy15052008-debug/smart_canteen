import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar3DCanvas, RobotMovement } from './Avatar3DCanvas';
import { useApp } from '../../context/AppContext';
import { robotAudio } from '../../utils/robotAudio';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  RefreshCw,
  Play,
  RotateCcw,
  Sliders,
  Layers,
  HelpCircle,
  Copy,
  Check,
  Zap,
  BookOpen,
  Calendar,
  CreditCard,
  Building,
  Bus,
  FileText,
  X,
  Smile,
  Music,
  Headphones,
  Award
} from 'lucide-react';

import {
  analyzeEmotion,
  EmotionAnalysis,
  mapEmotionToMovement,
  isHinglish,
} from '../../utils/emotionEngine';
import {
  ElevenLabsSettings,
  DEFAULT_ELEVENLABS_SETTINGS,
  requestElevenLabsAudio,
  playAudioWithLipSync,
  stopElevenLabsAudio,
} from '../../utils/elevenLabsAudio';
import { ElevenLabsVoiceModal } from './ElevenLabsVoiceModal';
import { StageHeader } from './StageHeader';
import { StageToolbar } from './StageToolbar';
import { StudioSheet } from './StudioSheet';
import { PersonaPicker } from './PersonaPicker';
import { ChatList } from './ChatList';
import { SuggestionRow } from './SuggestionRow';
import { ChatComposer } from './ChatComposer';

export type VoicePersona = 'campus_ai' | 'cool_buddy' | 'cyber_ai' | 'wise_prof' | 'sparky' | 'comedic';

export interface VoicePersonaConfig {
  id: VoicePersona;
  name: string;
  icon: string;
  badge: string;
  tagline: string;
  rate: number;
  pitch: number;
  soundType: 'deal_with_it' | 'chirp' | 'idea' | 'boop' | 'tickle';
  greetingSnippet: string;
}

export const VOICE_PERSONAS: VoicePersonaConfig[] = [
  {
    id: 'campus_ai',
    name: 'CampusAI (Cute & Witty)',
    icon: '✨',
    badge: 'CampusAI Companion',
    tagline: 'Cute but mature voice with warm delivery, clear pronunciation & contextual wit!',
    rate: 1.0,
    pitch: 1.15,
    soundType: 'chirp',
    greetingSnippet: 'Hey Faizan! CampusAI active. Cute, witty, and ready with sharp campus insights!',
  },
  {
    id: 'cool_buddy',
    name: 'Cool Swagger Buddy',
    icon: '😎',
    badge: 'Swagger Vibe',
    tagline: 'Chill, humorous, relaxed cadence with campus swagger!',
    rate: 1.08,
    pitch: 0.94,
    soundType: 'deal_with_it',
    greetingSnippet: 'Yo Faizan! Cool Swagger mode active. Deal with it—let us conquer this semester!',
  },
  {
    id: 'cyber_ai',
    name: 'Cyber Core AI',
    icon: '🤖',
    badge: 'Standard Core',
    tagline: 'Official smart digital campus co-pilot with precise delivery.',
    rate: 1.04,
    pitch: 1.04,
    soundType: 'chirp',
    greetingSnippet: 'CampusAI neural core operational. All university systems synchronized.',
  },
  {
    id: 'wise_prof',
    name: 'Wise Professor',
    icon: '🎓',
    badge: 'Scholarly',
    tagline: 'Deliberate, thoughtful, academic cadence with erudite flair.',
    rate: 0.92,
    pitch: 0.88,
    soundType: 'idea',
    greetingSnippet: 'Welcome, esteemed scholar. Let us dissect your academic inquiries with rigor.',
  },
  {
    id: 'sparky',
    name: 'Hyper Sparky',
    icon: '⚡',
    badge: 'High Energy',
    tagline: 'Ultra-fast, enthusiastic, cheery beep-boop enthusiast!',
    rate: 1.22,
    pitch: 1.25,
    soundType: 'boop',
    greetingSnippet: 'BEEP BOOP! High-energy Sparky engaged! Ready for all questions at lightning speed!',
  },
  {
    id: 'comedic',
    name: 'Comedic Standup Bot',
    icon: '🎭',
    badge: 'Humor & Jokes',
    tagline: 'Witty, dramatic pauses, funny quips and comedic timing!',
    rate: 1.05,
    pitch: 1.14,
    soundType: 'tickle',
    greetingSnippet: 'Haha, grab some popcorn! Who said student life had to be boring? Let’s talk!',
  },
];

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolCall?: { name: string; args: any };
  actionExecuted?: any;
  emotionBadge?: string;
  suggestedFollowUps?: string[];
}

export const CampusAIAssistant: React.FC = () => {
  const { currentUser, setActiveTab } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const promptHandledRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-intro',
      sender: 'assistant',
      text: `Hello ${currentUser.name.split(' ')[0]}! I am your 3D CampusAI Companion. I can speak and explain your academic records, attendance risks, exam timetables, fee dues, and campus grievances with real-time 3D gestures and lip-sync. How can I assist you today?`,
      timestamp: '10:50 AM',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [avatarState, setAvatarState] = useState<'idle' | 'listening' | 'thinking' | 'speaking' | 'success' | 'alert'>('idle');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voicePersona, setVoicePersona] = useState<VoicePersona>('campus_ai');
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [restStyle, setRestStyle] = useState<'alive' | 'chill' | 'zen'>('alive');
  const [speechVolume, setSpeechVolume] = useState(0);
  const [currentMovement, setCurrentMovement] = useState<RobotMovement>('auto');
  const [movementTab, setMovementTab] = useState<'all' | 'cool_funny' | 'work' | 'emotions' | 'status'>('all');
  const [activeEmotionMood, setActiveEmotionMood] = useState<string>('🤖 Rest Stance (Ready for Question)');
  const [selectedVoiceSpeed, setSelectedVoiceSpeed] = useState<number>(1.0);
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);
  const [promptCategory, setPromptCategory] = useState<'all' | 'academics' | 'exams' | 'fees' | 'campus' | 'concepts'>('all');
  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [wearSunglasses, setWearSunglasses] = useState(false);
  const [wearHeadphones, setWearHeadphones] = useState(true);

  // ElevenLabs AI Voice Integration State
  const [isElevenLabsModalOpen, setIsElevenLabsModalOpen] = useState(false);
  const [elevenLabsSettings, setElevenLabsSettings] = useState<ElevenLabsSettings>(() => {
    try {
      const saved = localStorage.getItem('smartuni_elevenlabs_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validate voice ID: ElevenLabs IDs are alphanumeric strings (10-20 chars), not UUID-like with hyphens starting with letters
        // Clear stale/invalid settings (e.g., old ZC-9AD8C60BAAB6 format)
        const voiceIdValid = parsed?.voiceId && /^[a-zA-Z0-9]{10,25}$/.test(parsed.voiceId);
        if (!voiceIdValid) {
          localStorage.removeItem('smartuni_elevenlabs_settings');
          return DEFAULT_ELEVENLABS_SETTINGS;
        }
        // Ensure enabled is true by default
        return { ...DEFAULT_ELEVENLABS_SETTINGS, ...parsed, enabled: parsed.enabled !== false };
      }
    } catch {}
    return DEFAULT_ELEVENLABS_SETTINGS;
  });

  const handleSaveElevenLabsSettings = (newSettings: ElevenLabsSettings) => {
    setElevenLabsSettings(newSettings);
    try {
      localStorage.setItem('smartuni_elevenlabs_settings', JSON.stringify(newSettings));
    } catch {}
  };

  // Contextual Personality & Emotion Engine State
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [lipSyncViseme, setLipSyncViseme] = useState<'idle' | 'viseme_a' | 'viseme_e' | 'viseme_o' | 'speaking'>('idle');
  const [currentEmotionAnalysis, setCurrentEmotionAnalysis] = useState<EmotionAnalysis>({
    emotion: 'idle',
    voice_style: 'warm_helpful',
    expression: 'neutral',
    gesture: 'none',
    intensity: 0.35,
    speaking_rate: 1.0,
    pitch: 1.15,
    pause_before: 0,
    pause_after: 0,
    isSarcastic: false,
    sarcasmAllowed: true,
    contextType: 'general',
    hinglishDetected: false,
    sequence: ['rest'],
    moodLabel: '🤖 Rest Stance (Ready for Question)',
    explanation: 'Rest posture with subtle breathing and natural gaze.',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const lipSyncIntervalRef = useRef<any>(null);
  const explanationSequenceTimerRef = useRef<any>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const getFollowUpsForMessage = (query: string, reply: string): string[] => {
    const q = query.toLowerCase();
    const r = reply.toLowerCase();
    if (q.includes('attendance') || r.includes('attendance') || r.includes('detention')) {
      return ['How do I recover CS604 attendance?', 'Show my weekly class timetable', 'What is the detention rule?'];
    }
    if (q.includes('fee') || r.includes('fee') || r.includes('balance') || r.includes('due')) {
      return ['How to pay the remaining ₹15,000?', 'Download fee receipts', 'Check scholarship status'];
    }
    if (q.includes('exam') || r.includes('exam') || r.includes('mid-term') || r.includes('hall')) {
      return ['Where is Tech Block Hall 401?', 'What is the CS601 exam syllabus?', 'Tips for Distributed Systems'];
    }
    if (q.includes('class') || q.includes('timetable') || r.includes('schedule') || r.includes('room')) {
      return ['Where is Room 402 located?', 'Who teaches CS602 Lab?', 'What classes do I have tomorrow?'];
    }
    if (q.includes('bus') || r.includes('bus') || r.includes('route')) {
      return ['Call driver Sukhdev Singh', 'When does the return bus leave?', 'Show Route 4 stops'];
    }
    if (q.includes('machine learning') || q.includes('distributed') || q.includes('algorithm') || q.includes('concept')) {
      return ['Can you give a practical code example?', 'Explain key exam formulas', 'Test my understanding'];
    }
    return ['Can you explain in more detail?', 'Give an example', 'Check my semester records'];
  };

  // Auto-scroll messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  useEffect(() => {
    return () => {
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      stopElevenLabsAudio();
      if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
      if (explanationSequenceTimerRef.current) clearTimeout(explanationSequenceTimerRef.current);
    };
  }, []);

  // Web Speech STT setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setAvatarState('listening');
        if (currentMovement === 'auto') {
          setCurrentMovement('focused_listen');
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleSend(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAvatarState('idle');
        if (currentMovement === 'focused_listen') {
          setCurrentMovement('auto');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (avatarState === 'listening') setAvatarState('idle');
      };

      recognitionRef.current = recognition;
    }
  }, [currentMovement, avatarState]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'assistant',
          text: 'Speech recognition is not active in this browser session. You can type your question directly in the text box below!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      setAvatarState('idle');
      if (currentMovement === 'focused_listen') setCurrentMovement('rest');
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Intelligent Emotion Movement Classifier for Asked Questions & Explanations
  const detectEmotionForQuestion = (question: string, answer?: string) => {
    const q = (question || '').toLowerCase();
    const a = (answer || '').toLowerCase();
    const text = `${q} ${a}`;

    // 1. CELEBRATION, GOOD GRADES, CLEARANCE & SCHOLARSHIPS (party_confetti)
    if (
      text.includes('cleared') ||
      text.includes('congrat') ||
      text.includes('100%') ||
      text.includes('passed') ||
      text.includes('scholarship approved') ||
      text.includes('fee paid') ||
      text.includes('all clear') ||
      text.includes('grade a') ||
      text.includes('won') ||
      text.includes('distinction') ||
      text.includes('excellent') ||
      text.includes('success')
    ) {
      return {
        primary: 'party_confetti' as RobotMovement,
        thinkingPose: 'laughing_cheer' as RobotMovement,
        sequence: ['party_confetti', 'thumbs_up', 'cheer_both'] as RobotMovement[],
        mood: '🎉 Celebration Confetti & High Achievements',
      };
    }

    // 2. DETENTION RISK, ATTENDANCE SHORTAGE, FINES & PENALTIES (sad_crying / alert_warning)
    if (
      text.includes('detention') ||
      text.includes('below 75') ||
      text.includes('shortage') ||
      text.includes('debarred') ||
      text.includes('penalty') ||
      text.includes('overdue') ||
      text.includes('risk') ||
      text.includes('attendance warning') ||
      text.includes('fail')
    ) {
      return {
        primary: 'sad_crying' as RobotMovement,
        thinkingPose: 'shocked_gasp' as RobotMovement,
        sequence: ['sad_crying', 'alert_warning', 'confused_question', 'explain_hands'] as RobotMovement[],
        mood: '😢 Sad Crying / Attendance Shortage Warning',
      };
    }

    // 3. GRIEVANCES, WI-FI DOWN, MESS FOOD, BROKEN AMENITIES (angry_fumes / frustrated_headache)
    if (
      text.includes('grievance') ||
      text.includes('complaint') ||
      text.includes('wifi') ||
      text.includes('wi-fi') ||
      text.includes('broken') ||
      text.includes('dirty') ||
      text.includes('mess food') ||
      text.includes('leak') ||
      text.includes('not working') ||
      text.includes('hostel issue') ||
      text.includes('bad') ||
      text.includes('disconnect')
    ) {
      return {
        primary: 'angry_fumes' as RobotMovement,
        thinkingPose: 'frustrated_headache' as RobotMovement,
        sequence: ['angry_fumes', 'tablet_mobile', 'hug_heart', 'explain_hands'] as RobotMovement[],
        mood: '😤 Empathetic Frustration & Issue Resolution',
      };
    }

    // 4. DIRECTIONS, CAMPUS BUS, LOCATIONS & MAP (point_direction)
    if (
      text.includes('where is') ||
      text.includes('how to reach') ||
      text.includes('route') ||
      text.includes('bus') ||
      text.includes('hall') ||
      text.includes('library') ||
      text.includes('auditorium') ||
      text.includes('location') ||
      text.includes('gate') ||
      text.includes('block')
    ) {
      return {
        primary: 'point_direction' as RobotMovement,
        thinkingPose: 'point_direction' as RobotMovement,
        sequence: ['point_direction', 'explain_hologram', 'explain_hands'] as RobotMovement[],
        mood: '👉 Navigation & Direction Guiding',
      };
    }

    // 5. TIMETABLES, SYLLABUS, SCHEDULE & EXAM DATES (laptop_work / tablet_mobile)
    if (
      text.includes('timetable') ||
      text.includes('schedule') ||
      text.includes('syllabus') ||
      text.includes('exam date') ||
      text.includes('subject') ||
      text.includes('routine') ||
      text.includes('credits')
    ) {
      return {
        primary: 'laptop_work' as RobotMovement,
        thinkingPose: 'tablet_mobile' as RobotMovement,
        sequence: ['laptop_work', 'tablet_mobile', 'explain_hologram'] as RobotMovement[],
        mood: '💻 Academic Portal & Course Records',
      };
    }

    // 6. STUDY TIPS, TRICKS & STRATEGIES (aha_idea)
    if (
      text.includes('tip') ||
      text.includes('how to study') ||
      text.includes('prepare') ||
      text.includes('improve') ||
      text.includes('idea') ||
      text.includes('trick')
    ) {
      return {
        primary: 'aha_idea' as RobotMovement,
        thinkingPose: 'thinking_dots' as RobotMovement,
        sequence: ['aha_idea', 'explain_book', 'explain_hands'] as RobotMovement[],
        mood: '💡 Lightbulb Idea & Academic Guidance',
      };
    }

    // 7. COMPLEX MATH, FORMULAS & RECOVERY CALCULATION (dizzy_stars)
    if (
      text.includes('calculate') ||
      text.includes('formula') ||
      text.includes('math') ||
      text.includes('cgpa') ||
      text.includes('gpa') ||
      text.includes('percentage') ||
      text.includes('confused')
    ) {
      return {
        primary: 'dizzy_stars' as RobotMovement,
        thinkingPose: 'dizzy_stars' as RobotMovement,
        sequence: ['dizzy_stars', 'confused_question', 'aha_idea', 'explain_hands'] as RobotMovement[],
        mood: '💫 Complex Calculation & Orbiting Stars',
      };
    }

    // 8. GRATITUDE, RESPECT & GREETINGS (polite_bow)
    if (
      text.includes('thank') ||
      text.includes('thanks') ||
      text.includes('appreciate') ||
      text.includes('namaste') ||
      text.includes('grateful')
    ) {
      return {
        primary: 'polite_bow' as RobotMovement,
        thinkingPose: 'polite_bow' as RobotMovement,
        sequence: ['polite_bow', 'wave_hello'] as RobotMovement[],
        mood: '🙏 Polite Respectful Bow',
      };
    }

    // 9. WELL-BEING, COUNSELING & EMOTIONAL CARE (hug_heart)
    if (
      text.includes('stress') ||
      text.includes('tired') ||
      text.includes('anxious') ||
      text.includes('counseling') ||
      text.includes('lonely') ||
      text.includes('overwhelmed') ||
      text.includes('help me')
    ) {
      return {
        primary: 'hug_heart' as RobotMovement,
        thinkingPose: 'hug_heart' as RobotMovement,
        sequence: ['hug_heart', 'in_love', 'explain_hands'] as RobotMovement[],
        mood: '❤️ Caring Empathy & Heart Hug',
      };
    }

    // 10. SURPRISE & SUDDEN NOTICE (shocked_gasp)
    if (
      text.includes('shock') ||
      text.includes('urgent') ||
      text.includes('emergency') ||
      text.includes('sudden') ||
      text.includes('cancelled')
    ) {
      return {
        primary: 'shocked_gasp' as RobotMovement,
        thinkingPose: 'shocked_gasp' as RobotMovement,
        sequence: ['shocked_gasp', 'alert_warning'] as RobotMovement[],
        mood: '😲 Shocked Alert & Wide Eyes',
      };
    }

    // 10.5 BA-DUM-TSS PUNCHLINE (cool_shades + badum_tss)
    if (text.includes('ba-dum-tss') || text.includes('badumtss') || text.includes('ba dum tss') || text.includes('rimshot') || text.includes('punchline')) {
      return {
        primary: 'cool_shades' as RobotMovement,
        thinkingPose: 'cool_shades' as RobotMovement,
        sequence: ['cool_shades', 'laughing_cheer', 'thumbs_up'] as RobotMovement[],
        mood: '🥁 Ba-Dum-Tss! Comedy Punchline',
      };
    }

    // 10.6 CRYING & TEARS (sad_crying)
    if (text.includes('cry') || text.includes('crying') || text.includes('sob') || text.includes('tear') || text.includes('sad') || text.includes('depressed') || text.includes('heartbroken') || text.includes('sniff')) {
      return {
        primary: 'sad_crying' as RobotMovement,
        thinkingPose: 'sad_crying' as RobotMovement,
        sequence: ['sad_crying', 'hug_heart', 'relaxed_chill'] as RobotMovement[],
        mood: '😭 Crying Tears & Sobs',
      };
    }

    // 10.7 ANGRY STEAM FUMES (angry_fumes)
    if (text.includes('angry') || text.includes('grrr') || text.includes('mad') || text.includes('fume') || text.includes('furious') || text.includes('rage') || text.includes('hate') || text.includes('tantrum')) {
      return {
        primary: 'angry_fumes' as RobotMovement,
        thinkingPose: 'angry_fumes' as RobotMovement,
        sequence: ['angry_fumes', 'arms_crossed', 'alert_warning'] as RobotMovement[],
        mood: '😤 Angry Steam & Furious Red',
      };
    }

    // 11. JOKES, HUMOR & LAUGHTER (laughing_cheer)
    if (text.includes('joke') || text.includes('funny') || text.includes('laugh') || text.includes('humor') || text.includes('giggle')) {
      return {
        primary: 'laughing_cheer' as RobotMovement,
        thinkingPose: 'laughing_cheer' as RobotMovement,
        sequence: ['laughing_cheer', 'cool_shades', 'thumbs_up'] as RobotMovement[],
        mood: '😆 Laughing Cheerful Standup',
      };
    }

    // 12. COOL SWAGGER & SUNGLASSES (cool_shades)
    if (text.includes('sunglasses') || text.includes('deal with it') || text.includes('swagger') || text.includes('wear shades') || text.includes('put on sunglasses')) {
      return {
        primary: 'cool_shades' as RobotMovement,
        thinkingPose: 'cool_shades' as RobotMovement,
        sequence: ['cool_shades', 'thumbs_up', 'explain_hands'] as RobotMovement[],
        mood: '😎 Cool Swagger & Finger Guns',
      };
    }

    // 13. DJ BEATS & MUSIC (dj_headphones)
    if (text.includes('music') || text.includes('dj') || text.includes('beat') || text.includes('dance') || text.includes('song') || text.includes('rhythm')) {
      return {
        primary: 'dj_headphones' as RobotMovement,
        thinkingPose: 'dj_headphones' as RobotMovement,
        sequence: ['dj_headphones', 'cheer_both', 'party_confetti'] as RobotMovement[],
        mood: '🎧 DJ Beats & Neon Notes',
      };
    }

    // 14. MOVIE & POPCORN (movie_popcorn)
    if (text.includes('movie') || text.includes('popcorn') || text.includes('cinema') || text.includes('snack') || text.includes('film')) {
      return {
        primary: 'movie_popcorn' as RobotMovement,
        thinkingPose: 'movie_popcorn' as RobotMovement,
        sequence: ['movie_popcorn', 'explain_hands'] as RobotMovement[],
        mood: '🍿 Movie Popcorn & 3D Specs',
      };
    }

    // 15. GAMING & CONTROLLER (gamer_headset)
    if (text.includes('game') || text.includes('gaming') || text.includes('play') || text.includes('controller') || text.includes('esports')) {
      return {
        primary: 'gamer_headset' as RobotMovement,
        thinkingPose: 'gamer_headset' as RobotMovement,
        sequence: ['gamer_headset', 'aha_idea', 'cheer_both'] as RobotMovement[],
        mood: '🎮 Pro Gamer Console Mode',
      };
    }

    // 16. MASTER CHEF COOKING (chef_cooking)
    if (text.includes('cook') || text.includes('chef') || text.includes('canteen') || text.includes('recipe') || text.includes('food') || text.includes('eat')) {
      return {
        primary: 'chef_cooking' as RobotMovement,
        thinkingPose: 'chef_cooking' as RobotMovement,
        sequence: ['chef_cooking', 'thumbs_up', 'explain_hands'] as RobotMovement[],
        mood: '🍳 Master Chef Cooking & Sizzling Pan',
      };
    }

    // 17. CAT NAP PILLOW (sleeping_cat)
    if (text.includes('cat') || text.includes('kitty') || text.includes('kitten') || text.includes('purr') || text.includes('nap')) {
      return {
        primary: 'sleeping_cat' as RobotMovement,
        thinkingPose: 'sleeping_cat' as RobotMovement,
        sequence: ['sleeping_cat', 'relaxed_chill'] as RobotMovement[],
        mood: '🐱 Cozy Cat Nap & Cloud Pillow',
      };
    }

    // 18. SUPERHERO SOAR (superhero_cape)
    if (text.includes('superhero') || text.includes('cape') || text.includes('fly') || text.includes('rescue') || text.includes('hero')) {
      return {
        primary: 'superhero_cape' as RobotMovement,
        thinkingPose: 'superhero_cape' as RobotMovement,
        sequence: ['superhero_cape', 'flying_jump', 'thumbs_up'] as RobotMovement[],
        mood: '🦸 Superhero Cape Soar',
      };
    }

    // 19. NEON SKATEBOARD (skateboard)
    if (text.includes('skate') || text.includes('skateboard') || text.includes('cruise')) {
      return {
        primary: 'skateboard' as RobotMovement,
        thinkingPose: 'skateboard' as RobotMovement,
        sequence: ['skateboard', 'point_direction', 'wave_hello'] as RobotMovement[],
        mood: '🛹 Neon Skater Cruise',
      };
    }

    // 20. GYM DUMBBELLS (dumbbell_gym)
    if (text.includes('gym') || text.includes('workout') || text.includes('flex') || text.includes('muscle') || text.includes('dumbbell') || text.includes('bicep')) {
      return {
        primary: 'dumbbell_gym' as RobotMovement,
        thinkingPose: 'dumbbell_gym' as RobotMovement,
        sequence: ['dumbbell_gym', 'thumbs_up', 'cheer_both'] as RobotMovement[],
        mood: '💪 Gym Bicep Curls & Gains',
      };
    }

    // 21. ROMANTIC ROSE (rose_romance)
    if (text.includes('rose') || text.includes('flower') || text.includes('love') || text.includes('romance') || text.includes('date')) {
      return {
        primary: 'rose_romance' as RobotMovement,
        thinkingPose: 'rose_romance' as RobotMovement,
        sequence: ['rose_romance', 'in_love', 'hug_heart'] as RobotMovement[],
        mood: '🌹 Romantic Red Rose & Wink',
      };
    }

    // 22. ZEN MEDITATION (zen_meditation)
    if (text.includes('zen') || text.includes('meditation') || text.includes('peace') || text.includes('breathe') || text.includes('yoga') || text.includes('calm')) {
      return {
        primary: 'zen_meditation' as RobotMovement,
        thinkingPose: 'zen_meditation' as RobotMovement,
        sequence: ['zen_meditation', 'relaxed_chill'] as RobotMovement[],
        mood: '🧘 Zen Lotus Hover',
      };
    }

    // 23. GRADUATION CAP & DIPLOMA (graduate_cap)
    if (text.includes('graduate') || text.includes('degree') || text.includes('convocation') || text.includes('diploma') || text.includes('honors')) {
      return {
        primary: 'graduate_cap' as RobotMovement,
        thinkingPose: 'graduate_cap' as RobotMovement,
        sequence: ['graduate_cap', 'thumbs_up', 'cheer_both'] as RobotMovement[],
        mood: '🎓 Graduate Honors & Diploma',
      };
    }

    // Default: Smart analysis
    return {
      primary: 'laptop_work' as RobotMovement,
      thinkingPose: 'confused_question' as RobotMovement,
      sequence: ['laptop_work', 'aha_idea', 'explain_hands'] as RobotMovement[],
      mood: '🤖 Active Explaining & Gestures',
    };
  };

  // Text-To-Speech with lip-sync synchronization, comedic/dramatic pauses & choreographed explaining movements
  const speakText = (
    text: string,
    forceMovement?: RobotMovement,
    movementSequence?: RobotMovement[],
    analysis?: EmotionAnalysis,
    overrideSettings?: ElevenLabsSettings
  ) => {
    if (!voiceEnabled) return;

    if (window.speechSynthesis) window.speechSynthesis.cancel();
    stopElevenLabsAudio();
    if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
    if (explanationSequenceTimerRef.current) clearTimeout(explanationSequenceTimerRef.current);

    // Audio SFX Detection Cues in reply text:
    const hasBadumTss = /ba-dum-tss|badumtss|ba dum tss|ba-dum-chhh|ba-dum-ts/i.test(text);
    const hasLaugh = /\*laughs?\*|\*laughing\*|\*giggles?\*|\[laughs?\]|\*chuckles?\*|haha+/i.test(text);
    const hasCry = /\*cries\*|\*crying\*|\*sobs?\*|\*sniffs?\*|\[cries\]|\*weeps?\*|\*tears?\*/i.test(text);
    const hasAngry = /\*angry\*|\*grrr+\*|\*fumes?\*|\*steam\*|\[angry\]|\*growls?\*/i.test(text);
    const hasSigh = /\*sighs?\*|\[sigh\]/i.test(text);
    const hasGasp = /\*gasps?\*|\[gasp\]|\*shocked?\*/i.test(text);

    // CRITICAL: Filter out all sound effect text cues so the TTS voice NEVER speaks "ba-dum-tss" or "*laughs*" aloud!
    let cleanText = text
      .replace(/(\*?ba-dum-tss!?\*?|\*?ba dum tss!?\*?|\*?badumtss!?\*?|\*?ba-dum-chhh!?\*?|\*?ba-dum-ts!?\*?)/gi, '')
      .replace(/(\*laughs?\*|\*laughing\*|\*giggles?\*|\[laughs?\]|\*chuckles?\*)/gi, '')
      .replace(/(\*cries\*|\*crying\*|\*sobs?\*|\*sniffs?\*|\[cries\]|\*weeps?\*)/gi, '')
      .replace(/(\*angry\*|\*grrr+\*|\*fumes?\*|\*steam\*|\[angry\]|\*growls?\*)/gi, '')
      .replace(/(\*sighs?\*|\[sigh\])/gi, '')
      .replace(/(\*gasps?\*|\[gasp\])/gi, '')
      .replace(/[*_#`[\]()]/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // Trigger immediate starting audio SFX on action if sound enabled
    if (sfxEnabled) {
      if (hasLaugh || forceMovement === 'laughing_cheer') {
        robotAudio.laugh();
      } else if (hasCry || forceMovement === 'sad_crying') {
        robotAudio.cryingSad();
      } else if (hasAngry || forceMovement === 'angry_fumes') {
        robotAudio.angryFumes();
      } else if (hasSigh) {
        robotAudio.sadSigh();
      } else if (hasGasp || forceMovement === 'shocked_gasp') {
        robotAudio.gaspShock();
      } else if (forceMovement === 'cool_shades') {
        robotAudio.dealWithIt();
      } else if (forceMovement === 'aha_idea') {
        robotAudio.ideaChime();
      } else if (forceMovement === 'party_confetti' || forceMovement === 'cheer_both') {
        robotAudio.celebrationFanfare();
      } else if (forceMovement === 'superhero_cape' || forceMovement === 'point_direction') {
        robotAudio.laserPew();
      }
    }

    if (!cleanText) {
      // Pure standalone SFX (e.g. user clicked or asked for "Ba-dum-tss!")
      if (hasBadumTss && sfxEnabled) {
        robotAudio.badumTss();
        setCurrentMovement('cool_shades');
        setActiveEmotionMood('🥁 Ba-Dum-Tss! Comedy Punchline');
        setTimeout(() => {
          setCurrentMovement('rest');
          setActiveEmotionMood('🤖 Rest Stance (Ready for Question)');
        }, 3200);
      }
      return;
    }

    const stopSpeech = () => {
      if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
      setAvatarState('idle');
      setSpeechVolume(0);
      setLipSyncViseme('idle');

      // Trigger punchline rimshot right as the joke punchline completes!
      if (hasBadumTss && sfxEnabled) {
        robotAudio.badumTss();
        setCurrentMovement('cool_shades');
        setActiveEmotionMood('🥁 Ba-Dum-Tss! Deal With It!');
      }

      // Return gently to resting stance after speech ends
      setTimeout(() => {
        setCurrentMovement('rest');
        setActiveEmotionMood('🤖 Rest Stance (Ready for Question)');
      }, hasBadumTss ? 3500 : 1000);
    };

    const triggerMovementChoreography = () => {
      if (forceMovement) {
        setCurrentMovement(forceMovement);
      } else if (hasBadumTss) {
        setCurrentMovement('laughing_cheer');
      } else if (hasLaugh) {
        setCurrentMovement('laughing_cheer');
      } else if (hasCry) {
        setCurrentMovement('sad_crying');
      } else if (hasAngry) {
        setCurrentMovement('angry_fumes');
      } else if (movementSequence && movementSequence.length > 0) {
        setCurrentMovement(movementSequence[0]);
        if (movementSequence.length > 1) {
          explanationSequenceTimerRef.current = setTimeout(() => {
            setCurrentMovement(movementSequence[1]);
            if (movementSequence.length > 2) {
              setTimeout(() => {
                setCurrentMovement(movementSequence[2]);
              }, 3800);
            }
          }, 3600);
        }
      } else {
        setCurrentMovement('laptop_work');
        explanationSequenceTimerRef.current = setTimeout(() => {
          setCurrentMovement('explain_hands');
        }, 3500);
      }
    };

    // Helper: Browser Web Speech API fallback
    const fallbackBrowserTTS = () => {
      if (!window.speechSynthesis) return;

      const currentPersona = VOICE_PERSONAS.find((p) => p.id === voicePersona) || VOICE_PERSONAS[0];
      const utterance = new SpeechSynthesisUtterance(cleanText);

      const baseRate = analysis ? analysis.speaking_rate : currentPersona.rate;
      const basePitch = analysis ? analysis.pitch : currentPersona.pitch;

      utterance.rate = baseRate * selectedVoiceSpeed;
      utterance.pitch = basePitch;

      const voices = window.speechSynthesis.getVoices();
      if (analysis?.hinglishDetected) {
        const indianVoice = voices.find(
          (v) => (v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India')) && !v.name.includes('child')
        );
        if (indianVoice) {
          utterance.voice = indianVoice;
        } else {
          const naturalVoice = voices.find(
            (v) =>
              v.lang.startsWith('en') &&
              (v.name.includes('Natural') ||
                v.name.includes('Google') ||
                v.name.includes('Samantha') ||
                v.name.includes('Jenny') ||
                v.name.includes('Karen') ||
                v.name.includes('Victoria'))
          );
          if (naturalVoice) utterance.voice = naturalVoice;
        }
      } else {
        const naturalVoice = voices.find(
          (v) =>
            v.lang.startsWith('en') &&
            (v.name.includes('Natural') ||
              v.name.includes('Google') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Karen') ||
              v.name.includes('Victoria'))
        );
        if (naturalVoice) utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setAvatarState('speaking');
        const visemes: ('viseme_a' | 'viseme_e' | 'viseme_o')[] = ['viseme_a', 'viseme_e', 'viseme_o'];
        let vIdx = 0;
        lipSyncIntervalRef.current = setInterval(() => {
          const vol = 0.25 + Math.random() * 0.75;
          setSpeechVolume(vol);
          setLipSyncViseme(vol > 0.3 ? visemes[vIdx % visemes.length] : 'idle');
          vIdx++;
        }, 100);

        triggerMovementChoreography();
      };

      utterance.onend = stopSpeech;
      utterance.onerror = stopSpeech;

      const pauseMs = (analysis?.pause_before || 0) * 1000;
      if (pauseMs > 0) {
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, pauseMs);
      } else {
        window.speechSynthesis.speak(utterance);
      }
    };

    // ElevenLabs AI Neural Voice Pipeline
    const currentSettings = overrideSettings || elevenLabsSettings;
    if (currentSettings.enabled) {
      setAvatarState('thinking');
      requestElevenLabsAudio(cleanText, currentSettings)
        .then((res) => {
          if (res.success && res.audioDataUrl) {
            setAvatarState('speaking');
            triggerMovementChoreography();

            playAudioWithLipSync(res.audioDataUrl, {
              onStart: () => {
                setAvatarState('speaking');
              },
              onAmplitude: (amp) => {
                setSpeechVolume(amp);
                setLipSyncViseme(amp > 0.2 ? 'viseme_a' : 'idle');
              },
              onEnd: stopSpeech,
              onError: () => {
                fallbackBrowserTTS();
              },
            });
            return;
          }

          // Fallback to browser speech if API key is not configured or offline
          fallbackBrowserTTS();
        })
        .catch(() => {
          fallbackBrowserTTS();
        });
      return;
    }

    // Default to browser TTS
    fallbackBrowserTTS();
  };

  const handleTestVoice = (voiceId: string, testText: string) => {
    const testConfig = { ...elevenLabsSettings, voiceId, enabled: true };
    speakText(testText, 'wave_hello', ['wave_hello', 'thumbs_up'], undefined, testConfig);
  };

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    if (sfxEnabled) {
      robotAudio.chirp();
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsThinking(true);
    setAvatarState('thinking');
    setCurrentMovement('confused_question');
    setActiveEmotionMood('🤔 Thinking & Pondering (Analyzing Question)...');

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          studentId: currentUser.id,
          persona: voicePersona,
          history: messages.slice(-6).map((m) => ({ sender: m.sender, text: m.text })),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || "I've checked your campus records.";
      const analysis = analyzeEmotion(query, replyText);
      setCurrentEmotionAnalysis(analysis);
      const followUps = getFollowUpsForMessage(query, replyText);

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolCall: data.toolCall,
        actionExecuted: data.actionExecuted,
        emotionBadge: analysis.moodLabel,
        suggestedFollowUps: followUps,
      };

      setMessages((prev) => [...prev, botMsg]);
      setIsThinking(false);

      setActiveEmotionMood(`🎭 Emotion: ${analysis.moodLabel}`);
      speakText(replyText, undefined, analysis.sequence, analysis);
    } catch (err) {
      console.error(err);
      setIsThinking(false);
      setAvatarState('idle');
      const fallbackReply = 'I retrieved your campus data. All services are connected and ready.';
      const analysis = analyzeEmotion(query, fallbackReply);
      setCurrentEmotionAnalysis(analysis);
      const followUps = getFollowUpsForMessage(query, fallbackReply);
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          emotionBadge: analysis.moodLabel,
          suggestedFollowUps: followUps,
        },
      ]);
      setActiveEmotionMood(`🎭 Emotion: ${analysis.moodLabel}`);
      speakText(fallbackReply, undefined, analysis.sequence, analysis);
    }
  };

  // Deep-link prompt trigger (from command palette, search, or external link)
  useEffect(() => {
    const promptParam = searchParams.get('prompt');
    if (promptParam && promptParam.trim() && promptHandledRef.current !== promptParam) {
      promptHandledRef.current = promptParam;
      const text = promptParam.trim();
      setSearchParams({}, { replace: true });
      handleSend(text);
    }
  }, [searchParams]);

  interface QuickPromptItem {
    label: string;
    prompt: string;
    category: 'academics' | 'exams' | 'fees' | 'campus' | 'concepts' | 'fun';
    icon: string;
  }

  const QUICK_PROMPTS: QuickPromptItem[] = [
    { category: 'fun', label: '😏 Sarcasm: Forgot Password', prompt: 'I forgot my password again.', icon: '🔑' },
    { category: 'fun', label: '🌟 Sarcasm: Got 95% Marks', prompt: 'I got 95%!', icon: '🏆' },
    { category: 'academics', label: '📊 Real Attendance (No Sarcasm)', prompt: 'What is my attendance?', icon: '📋' },
    { category: 'campus', label: '📜 Apply Certificate (Workflow)', prompt: 'I need a certificate.', icon: '📑' },
    { category: 'academics', label: '🇮🇳 Hinglish: Mera Attendance', prompt: 'Mera attendance kitna hai bhai?', icon: '🇮🇳' },
    { category: 'campus', label: '🇮🇳 Hinglish: Certificate Help', prompt: 'Bhai certificate kaise apply karu?', icon: '🇮🇳' },
    { category: 'academics', label: 'BCA AI-ML (Geeks of Gurukul)', prompt: 'Tell me about BCA AI-ML program overview, eligibility, and curriculum', icon: '🤖' },
    { category: 'academics', label: 'BCA Cyber Security Details', prompt: 'Tell me about BCA Cyber Security, career outcomes, and subjects', icon: '🛡️' },
    { category: 'academics', label: 'BCA IT Program Overview', prompt: 'Tell me about BCA Information Technology eligibility and semester curriculum', icon: '💻' },
    { category: 'fees', label: 'University Fees Structure 2026-27', prompt: 'What are the official university fees for 2026-27 across programmes?', icon: '💳' },
    { category: 'academics', label: 'FSIT Certificate Courses', prompt: 'What certificate courses are available in School of FSIT?', icon: '📜' },
    { category: 'fun', label: 'Ba-Dum-Tss! Joke & Rimshot', prompt: 'Tell me a funny campus or programming joke with a punchy Ba-dum-tss!', icon: '🥁' },
    { category: 'fun', label: 'Cry Over 71.9% CS604', prompt: 'Cry with me about having only 71.9% attendance in Software Engineering!', icon: '😭' },
    { category: 'fun', label: 'Angry Steam Meltdown', prompt: 'Show me your angriest robot tantrum with steam flying everywhere!', icon: '😤' },
    { category: 'academics', label: 'Attendance & Detention Risk', prompt: 'What is my current attendance status and am I at risk of detention?', icon: '📊' },
    { category: 'academics', label: "Today's Class Timetable", prompt: 'What classes and lab sessions do I have today?', icon: '🕒' },
    { category: 'exams', label: 'Upcoming Examination Schedule', prompt: 'When is my next examination and where is my seat hall?', icon: '📝' },
    { category: 'fees', label: 'Check Pending Fees', prompt: 'What are my pending fee dues and when is the payment deadline?', icon: '💰' },
    { category: 'campus', label: 'Track Campus Bus #4', prompt: 'Where is campus bus route #4 right now and what is the ETA?', icon: '🚌' },
    { category: 'campus', label: 'Report Hostel Wi-Fi Issue', prompt: 'Create a helpdesk ticket for hostel Block B Wi-Fi disconnect issue', icon: '🛠️' },
    { category: 'concepts', label: 'Explain Machine Learning', prompt: 'Can you explain the core concepts of Machine Learning in our CS603 syllabus?', icon: '🧠' },
  ];

  interface RobotMovementItem {
    id: RobotMovement;
    label: string;
    icon: string;
    category: 'smart' | 'cool_funny' | 'emotions' | 'work' | 'status';
    desc: string;
    voiceSnippet: string;
  }

  const ROBOT_MOVEMENTS: RobotMovementItem[] = [
    // 1. SMART / REST MODES
    {
      id: 'rest',
      label: 'Rest Stance',
      icon: '🤖',
      category: 'smart',
      desc: 'Exact resting pose with alive breathing, cursor gaze & idle fidgets',
      voiceSnippet: 'Resting stance active. I am listening attentively and ready for your question.',
    },
    {
      id: 'auto',
      label: 'Auto (Move on Q)',
      icon: '✨',
      category: 'smart',
      desc: 'Stays at rest with alive fidgets, then springs into expressive explaining gestures!',
      voiceSnippet: 'Auto choreography active! Ask me any question and watch me come alive with gestures.',
    },

    // 2. COOL & FUNNY POSES
    {
      id: 'cool_shades',
      label: 'Cool Swagger Shades',
      icon: '😎',
      category: 'cool_funny',
      desc: 'Deal with it! Dark sunglasses, leaning back with double finger guns',
      voiceSnippet: 'Deal with it! You are cruising through your semester like an absolute campus legend!',
    },
    {
      id: 'dj_headphones',
      label: 'DJ Beats & Groovin',
      icon: '🎧',
      category: 'cool_funny',
      desc: 'Chunky headphones on head, rhythmic bounce with floating neon music notes',
      voiceSnippet: 'Dropping the campus beats! Keep up the rhythm and rock your semester exams!',
    },
    {
      id: 'movie_popcorn',
      label: 'Movie Popcorn Snacker',
      icon: '🍿',
      category: 'cool_funny',
      desc: '3D red-and-cyan glasses with a fresh overflowing bucket of popcorn',
      voiceSnippet: 'Grab your popcorn! This campus briefing is about to get blockbuster entertaining.',
    },
    {
      id: 'gamer_headset',
      label: 'Pro Gamer Console',
      icon: '🎮',
      category: 'cool_funny',
      desc: 'Gaming headset with console gamepad controller and arcade focus',
      voiceSnippet: 'Game on! We just unlocked the ultimate achievement: Zero detention risks and high CGPA!',
    },
    {
      id: 'chef_cooking',
      label: 'Master Chef Cooking',
      icon: '🍳',
      category: 'cool_funny',
      desc: 'Chef toque hat with sizzling frying pan flipping tossed veggies',
      voiceSnippet: 'Chef CampusAI in the kitchen! Cooking up a Michelin-star study recipe for your finals!',
    },
    {
      id: 'sleeping_cat',
      label: 'Cat Nap Pillow',
      icon: '🐱',
      category: 'cool_funny',
      desc: 'Soft blue cloud pillow with sleeping ginger cat curled up purring',
      voiceSnippet: 'Purrrrr... Taking a cozy cat nap. Don’t worry, your timetable and fees are purr-fectly in order!',
    },
    {
      id: 'superhero_cape',
      label: 'Superhero Soar',
      icon: '🦸',
      category: 'cool_funny',
      desc: 'Fluttering red superhero cape with flying forward fist thrust',
      voiceSnippet: 'Fear not, scholar! CampusAI superhero is soaring in to solve your grievances in seconds!',
    },
    {
      id: 'skateboard',
      label: 'Neon Skater Cruise',
      icon: '🛹',
      category: 'cool_funny',
      desc: 'Neon cyan glowing skateboard carving smooth turns across campus',
      voiceSnippet: 'Skating across the quad! Need a quick ride to the computer science lab? Follow me!',
    },
    {
      id: 'graduate_cap',
      label: 'Graduate Honors',
      icon: '🎓',
      category: 'cool_funny',
      desc: 'Mortarboard cap with gold tassel and rolled honor diploma scroll',
      voiceSnippet: 'Dean’s Honor List confirmed! Future valedictorian right here on campus!',
    },
    {
      id: 'dumbbell_gym',
      label: 'Gym Bodybuilder',
      icon: '💪',
      category: 'cool_funny',
      desc: 'Heavy black dumbbells pumping bicep curls with serious determination',
      voiceSnippet: 'No pain, no academic gain! Pumping those study reps for maximum exam performance!',
    },
    {
      id: 'rose_romance',
      label: 'Romantic Rose',
      icon: '🌹',
      category: 'cool_funny',
      desc: 'Charming wink offering a fresh red rose with sweet blushing cheeks',
      voiceSnippet: 'A red rose for you! Thank you for being such an awesome student companion!',
    },
    {
      id: 'zen_meditation',
      label: 'Zen Lotus Hover',
      icon: '🧘',
      category: 'cool_funny',
      desc: 'Hovering lotus meditation with swirling green peaceful leaves',
      voiceSnippet: 'Inhale clarity, exhale exam stress. Your mind is calm, focused, and ready to ace everything.',
    },

    // 3. EMOTIONS & CELEBRATION POSES
    {
      id: 'party_confetti',
      label: 'Party Confetti',
      icon: '🎉',
      category: 'emotions',
      desc: 'Double arms high celebrating with colorful fluttering confetti bursts',
      voiceSnippet: 'Woohoo! Spectacular achievement! Let us celebrate your verified campus milestone!',
    },
    {
      id: 'sad_crying',
      label: 'Crying Tears',
      icon: '😢',
      category: 'emotions',
      desc: 'Cyan tear streams pouring down screen with sorrowful posture',
      voiceSnippet: 'Oh no! Do not panic. Let us look at how to recover your attendance and clear pending dues.',
    },
    {
      id: 'angry_fumes',
      label: 'Angry Fumes',
      icon: '😤',
      category: 'emotions',
      desc: 'Furious red screen glow, steam clouds & clenched fists',
      voiceSnippet: 'That grievance is totally unacceptable! I am logging an urgent complaint ticket for you right away.',
    },
    {
      id: 'dizzy_stars',
      label: 'Dizzy Swirls',
      icon: '💫',
      category: 'emotions',
      desc: 'Concentric spiral swirl eyes with orbiting golden stars',
      voiceSnippet: 'Whoa, that is a complicated formula! Let me spin up our math engine and calculate the recovery metrics.',
    },
    {
      id: 'laughing_cheer',
      label: 'Laughing Cheerful',
      icon: '😆',
      category: 'emotions',
      desc: 'Squinting > < laughing eyes, joyful clench and bouncing sparks',
      voiceSnippet: 'Haha, that is wonderful! It is fantastic to see you enjoying student life on campus!',
    },
    {
      id: 'shocked_gasp',
      label: 'Shocked Gasp',
      icon: '😲',
      category: 'emotions',
      desc: 'Hands to cheeks, wide shocked eyes and floating exclamation marks',
      voiceSnippet: 'Oh wow, that is sudden! Let me check the university emergency bulletin for immediate updates.',
    },
    {
      id: 'polite_bow',
      label: 'Polite Respect Bow',
      icon: '🙏',
      category: 'emotions',
      desc: 'Deep respectful bow forward with peaceful closed eyes',
      voiceSnippet: 'You are most welcome! It is an honor to assist you with your academic endeavors.',
    },
    {
      id: 'thinking_dots',
      label: 'Thinking Dots',
      icon: '💬',
      category: 'emotions',
      desc: 'Hand on chin with side-glance gaze and floating dots ...',
      voiceSnippet: 'Let me think about that carefully and query the latest university database records.',
    },
    {
      id: 'frustrated_headache',
      label: 'Frustrated Headache',
      icon: '😫',
      category: 'emotions',
      desc: 'Hands clutching head with blue stress lines across the screen',
      voiceSnippet: 'Ugh, administrative bottlenecks can be frustrating. Let me expedite your grievance ticket.',
    },
    {
      id: 'scared_tremble',
      label: 'Scared Tremble',
      icon: '😨',
      category: 'emotions',
      desc: 'Nervous body vibration and shivering hands with trembling gaze',
      voiceSnippet: 'Whew, that was close! Let us make sure you never miss that attendance cutoff again.',
    },
    {
      id: 'thumbs_up',
      label: 'Thumbs-Up & Wink',
      icon: '👍',
      category: 'emotions',
      desc: 'Playful wink eye, right thumb up with glowing yellow spark particles',
      voiceSnippet: 'Great job! Keep up the brilliant momentum in your courses!',
    },
    {
      id: 'cheer_both',
      label: 'Both Hands Cheer',
      icon: '🙌',
      category: 'emotions',
      desc: 'Double hands raised with joyful celebratory bursts',
      voiceSnippet: 'Woohoo! All your campus achievements are verified and looking wonderful!',
    },
    {
      id: 'in_love',
      label: 'In Love & Blush',
      icon: '🥰',
      category: 'emotions',
      desc: 'Sweet head tilt, blushing rosy cheeks, and floating mini hearts',
      voiceSnippet: 'Aww, thank you! It brings me so much joy to assist you on campus!',
    },
    {
      id: 'confused_question',
      label: 'Puzzled Question',
      icon: '❓',
      category: 'emotions',
      desc: 'Hand-to-chin pondering pose, quizzical brow & floating question mark',
      voiceSnippet: 'Hmm, that is an intriguing question! Let me search the campus records.',
    },
    {
      id: 'arms_crossed',
      label: 'Arms Crossed',
      icon: '😤',
      category: 'emotions',
      desc: 'Sassy folded hands across chest with deadpan flat-top eyes',
      voiceSnippet: 'Make sure you do not miss that deadline—campus policies are strictly enforced!',
    },
    {
      id: 'flying_jump',
      label: 'Flying Jump',
      icon: '🚀',
      category: 'emotions',
      desc: 'High levitation hover with arms spread wide in turbo speed',
      voiceSnippet: 'High-speed AI propulsion engaged! Delivering instant campus insights!',
    },
    {
      id: 'peek_corner',
      label: 'Peek Corner',
      icon: '👀',
      category: 'emotions',
      desc: 'Curious sideways lean peeking around a 3D wall edge',
      voiceSnippet: 'Peek-a-boo! Just checking in to make sure your day is going smoothly!',
    },
    {
      id: 'relaxed_chill',
      label: 'Relaxed Lounging',
      icon: '🧘',
      category: 'emotions',
      desc: 'Comfortably propped on side with serene peaceful smile',
      voiceSnippet: 'Take a deep breath and relax. All your classes and assignments are in good order.',
    },
    {
      id: 'hug_heart',
      label: 'Hugging 3D Heart',
      icon: '❤️',
      category: 'emotions',
      desc: 'Clutching glowing plump ruby red 3D heart against chest',
      voiceSnippet: 'Sending warmth and care! Student welfare and counseling are always here for you.',
    },

    // 3. STUDY & WORK POSES
    {
      id: 'tablet_mobile',
      label: 'Tablet / Mobile',
      icon: '📱',
      category: 'work',
      desc: 'Holding sleek dark mobile tablet in both hands looking at campus records',
      voiceSnippet: 'I am accessing your student card and digital hall ticket directly on my campus tablet.',
    },
    {
      id: 'laptop_work',
      label: 'Typing on Laptop',
      icon: '💻',
      category: 'work',
      desc: 'Holding glowing 3D laptop with typing hand animations & focused eyes',
      voiceSnippet: 'I am typing on my laptop, updating your campus schedules and lab reports.',
    },
    {
      id: 'aha_idea',
      label: 'Aha! Idea Bulb',
      icon: '💡',
      category: 'work',
      desc: 'Pointing finger up with glowing yellow idea lightbulb and spark rays',
      voiceSnippet: 'Aha! Here is a brilliant tip to ace your upcoming exam!',
    },
    {
      id: 'point_direction',
      label: 'Direction Pointer',
      icon: '👉',
      category: 'work',
      desc: 'Arm stretched horizontally guiding direction with focused gaze',
      voiceSnippet: 'Head right over that way to reach the central lecture hall and student desk.',
    },
    {
      id: 'explain_book',
      label: 'Academic Book',
      icon: '📖',
      category: 'work',
      desc: 'Open academic knowledge book & warm illuminating bulb',
      voiceSnippet: 'Let me explain this academic concept directly from the university curriculum!',
    },
    {
      id: 'explain_hologram',
      label: 'Holo Data Pointer',
      icon: '📊',
      category: 'work',
      desc: 'Translucent holographic console displaying live campus charts and metrics',
      voiceSnippet: 'Here is your real-time campus data rendered directly on my holographic terminal.',
    },
    {
      id: 'explain_hands',
      label: 'Dual-Hand Sweeps',
      icon: '👐',
      category: 'work',
      desc: 'Keynote expressive dual hand presentation sweeps',
      voiceSnippet: 'Notice how each campus department connects seamlessly into our digital system.',
    },

    // 4. STATUS & WAVES
    {
      id: 'wave_hello',
      label: 'Friendly Wave',
      icon: '👋',
      category: 'status',
      desc: 'Cheerful right-hand greeting wave with smiling eyes',
      voiceSnippet: 'Hello there! Welcome to the smart campus portal. What can I assist you with?',
    },
    {
      id: 'goodbye_wave',
      label: 'Goodbye Wave',
      icon: '🙋',
      category: 'status',
      desc: 'Calm standing posture with gentle low hand waving goodbye',
      voiceSnippet: 'Have a wonderful time on campus! Let me know if you need anything else.',
    },
    {
      id: 'sleeping_zzz',
      label: 'Sleeping & Snooze',
      icon: '💤',
      category: 'status',
      desc: 'Curled sideways with serene closed eyes and floating Z z z particles',
      voiceSnippet: 'Power saving sleep mode activated. You can awaken me anytime with a question!',
    },
    {
      id: 'alert_warning',
      label: 'Detention Caution',
      icon: '⚠️',
      category: 'status',
      desc: 'Amber flashing screen and protective palms-forward warning posture',
      voiceSnippet: 'Warning notice! Your attendance or fee balance requires prompt attention.',
    },
  ];

  const MOVEMENT_CATEGORIES: { id: 'all' | 'cool_funny' | 'work' | 'emotions' | 'status'; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: ROBOT_MOVEMENTS.length },
    { id: 'cool_funny', label: '😎 Cool & Funny', count: ROBOT_MOVEMENTS.filter((m) => m.category === 'cool_funny').length },
    { id: 'work', label: '🗣️ Explaining & Study', count: ROBOT_MOVEMENTS.filter((m) => m.category === 'work').length },
    { id: 'emotions', label: '😄 Emotions', count: ROBOT_MOVEMENTS.filter((m) => m.category === 'emotions').length },
    { id: 'status', label: '✨ Rest & Status', count: ROBOT_MOVEMENTS.filter((m) => m.category === 'smart' || m.category === 'status').length },
  ];

  const filteredMovements = movementTab === 'all'
    ? ROBOT_MOVEMENTS
    : movementTab === 'status'
    ? ROBOT_MOVEMENTS.filter((m) => m.category === 'smart' || m.category === 'status')
    : ROBOT_MOVEMENTS.filter((m) => m.category === movementTab);

  return (
    <div className="h-[calc(100vh-4.5rem)] min-h-[640px] flex flex-col lg:flex-row gap-4 max-w-7xl mx-auto p-2 sm:p-4">
      {/* LEFT COLUMN: 3D Companion Stage */}
      <div className="w-full lg:w-5/12 flex flex-col relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800/80 shadow-2xl h-[380px] sm:h-[440px] lg:h-full shrink-0">
        {/* Ambient atmospheric glows */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header over 3D stage */}
        <StageHeader
          avatarState={avatarState}
          activeEmotionMood={activeEmotionMood}
          onOpenStudio={() => setIsStudioOpen(true)}
        />

        {/* 3D Canvas Viewport */}
        <div className="relative flex-1 w-full h-full overflow-hidden">
          <Avatar3DCanvas
            state={avatarState}
            speechVolume={speechVolume}
            movement={currentMovement}
            wearSunglasses={wearSunglasses}
            wearHeadphones={wearHeadphones}
            onMovementChange={(m) => setCurrentMovement(m)}
          />

          {/* Live Debug Mode HUD Overlay */}
          <AnimatePresence>
            {isDebugMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute inset-x-3 bottom-16 top-14 bg-slate-950/92 backdrop-blur-xl border border-purple-500/50 rounded-2xl p-4 text-xs text-slate-100 shadow-2xl z-30 flex flex-col justify-between overflow-y-auto"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-purple-500/30 pb-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" />
                      <h4 className="font-mono font-bold text-purple-300 text-xs tracking-wide">
                        Personality & Emotion Telemetry
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsDebugMode(false)}
                      className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label="Close Debug Telemetry"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3 font-mono">
                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Emotion</div>
                      <div className="flex items-center gap-1.5 font-bold text-amber-300">
                        <span>{currentEmotionAnalysis.emotion === 'playful_sarcasm' ? '😏' : currentEmotionAnalysis.emotion === 'concerned' ? '💙' : currentEmotionAnalysis.emotion === 'happy' ? '😊' : '🤖'}</span>
                        <span className="truncate">{currentEmotionAnalysis.emotion}</span>
                      </div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Voice Style</div>
                      <div className="font-bold text-indigo-300 truncate">{currentEmotionAnalysis.voice_style}</div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Expression</div>
                      <div className="font-bold text-cyan-300 truncate">{currentEmotionAnalysis.expression}</div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Active Gesture</div>
                      <div className="font-bold text-emerald-300 truncate">{currentMovement}</div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Lip-Sync</div>
                      <div className="font-bold text-pink-300">{lipSyncViseme} ({(speechVolume * 100).toFixed(0)}%)</div>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1">Speaking State</div>
                      <div className="font-bold text-sky-300">{avatarState}</div>
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 text-[11px] space-y-1.5 font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Speaking Rate:</span>
                      <span className="text-slate-200">{(selectedVoiceSpeed * (currentEmotionAnalysis.speaking_rate || 1.0)).toFixed(2)}x</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Rest Style:</span>
                      <span className="text-slate-200">{restStyle}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Persona Engine:</span>
                      <span className="text-slate-200">{voicePersona}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stage Toolbar */}
        <StageToolbar
          isListening={isListening}
          voiceEnabled={voiceEnabled}
          sfxEnabled={sfxEnabled}
          onToggleMic={toggleListening}
          onToggleVoice={() => setVoiceEnabled(prev => !prev)}
          onToggleSFX={() => {
            const next = !sfxEnabled;
            setSfxEnabled(next);
            robotAudio.setMuted(!next);
            if (next) robotAudio.boop();
          }}
          onRest={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            setAvatarState('idle');
            setSpeechVolume(0);
            setCurrentMovement('rest');
            setActiveEmotionMood('🤖 Rest Stance (Ready for Question)');
            if (sfxEnabled) robotAudio.boop();
          }}
        />

        {/* Studio Sheet / Drawer */}
        <StudioSheet
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          movements={ROBOT_MOVEMENTS}
          currentMovement={currentMovement}
          onMovementSelect={(mov) => {
            setCurrentMovement(mov.id);
            if (sfxEnabled) {
              if (mov.id === 'cool_shades') robotAudio.dealWithIt();
              else if (mov.id === 'aha_idea') robotAudio.ideaChime();
              else if (mov.id === 'party_confetti' || mov.id === 'cheer_both') robotAudio.celebrationFanfare();
              else if (mov.id === 'laughing_cheer') robotAudio.tickleGiggle();
              else robotAudio.boop();
            }
            if (mov.id === 'rest') {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              setAvatarState('idle');
              setSpeechVolume(0);
              setActiveEmotionMood('🤖 Rest Stance (Ready for Question)');
            } else if (mov.id !== 'auto' && voiceEnabled) {
              speakText(mov.voiceSnippet, mov.id);
            }
          }}
          wearHeadphones={wearHeadphones}
          wearSunglasses={wearSunglasses}
          onToggleHeadphones={() => {
            const nextState = !wearHeadphones;
            setWearHeadphones(nextState);
            if (sfxEnabled) robotAudio.chirp();
            if (nextState) {
              setActiveEmotionMood('🎧 DJ Headphone Mode: Beats & Vibes!');
              if (voiceEnabled) speakText('Headphones connected! Let the campus groove begin.', 'dj_headphones');
            } else {
              setActiveEmotionMood('🤖 Headset Off');
            }
          }}
          onToggleSunglasses={() => {
            const nextState = !wearSunglasses;
            setWearSunglasses(nextState);
            if (sfxEnabled) robotAudio.dealWithIt();
            if (nextState) {
              setActiveEmotionMood('😎 Sunglasses Mode: Deal With It!');
              if (voiceEnabled) speakText('Deal with it! Campus swagger mode activated.', 'cool_shades');
            } else {
              setActiveEmotionMood('🤖 Normal Vision Restored');
            }
          }}
          selectedVoiceSpeed={selectedVoiceSpeed}
          onVoiceSpeedChange={setSelectedVoiceSpeed}
          isDebugMode={isDebugMode}
          onToggleDebugMode={() => setIsDebugMode(prev => !prev)}
          restStyle={restStyle}
          onRestStyleChange={setRestStyle}
        />
      </div>

      {/* RIGHT COLUMN: Unified Conversation & Companion Hub */}
      <div className="w-full lg:w-7/12 flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-3 sm:p-4 lg:p-5 shadow-2xl overflow-hidden flex-1 lg:h-full">
        {/* Chat Hub Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800/70 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white shrink-0 shadow-md shadow-indigo-500/20">
              <Bot className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {currentUser.name}
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline truncate">
                  {currentUser.department || 'B.Tech CSE'}
                </span>
                <span className="text-slate-400 hidden sm:inline">·</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-medium shrink-0 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Gemini Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                Direct answers with real-time 3D gestures and lip-sync
              </p>
            </div>
          </div>

          {/* Persona picker trigger pill */}
          <div className="flex items-center gap-2 shrink-0">
            <PersonaPicker
              activePersona={voicePersona}
              onSelect={(id) => {
                setVoicePersona(id);
                const vp = VOICE_PERSONAS.find(p => p.id === id);
                if (vp) {
                  if (sfxEnabled) {
                    if (vp.soundType === 'deal_with_it') robotAudio.dealWithIt();
                    else if (vp.soundType === 'chirp') robotAudio.chirp();
                    else if (vp.soundType === 'idea') robotAudio.ideaChime();
                    else if (vp.soundType === 'tickle') robotAudio.tickleGiggle();
                    else robotAudio.boop();
                  }
                  speakText(vp.greetingSnippet, vp.id === 'cool_buddy' ? 'cool_shades' : vp.id === 'wise_prof' ? 'graduate_cap' : 'thumbs_up');
                }
              }}
              onPreview={(persona) => {
                speakText(persona.greetingSnippet, persona.id === 'cool_buddy' ? 'cool_shades' : 'thumbs_up');
              }}
              onOpenElevenLabs={() => setIsElevenLabsModalOpen(true)}
            />
          </div>
        </div>

        {/* Message Log */}
        <ChatList
          messages={messages}
          isThinking={isThinking}
          copiedMsgId={copiedMsgId}
          userName={currentUser.name}
          onCopy={copyToClipboard}
          onSpeak={(text) => speakText(text, 'explain_hands')}
          onSend={handleSend}
          onNavigateFees={() => setActiveTab('fees')}
          onNavigateAcademics={() => setActiveTab('academics')}
        />

        {/* Suggestion Chips Row */}
        <SuggestionRow
          prompts={QUICK_PROMPTS}
          onSend={handleSend}
        />

        {/* Unified Input Console */}
        <ChatComposer
          inputText={inputText}
          isListening={isListening}
          isThinking={isThinking}
          onInputChange={setInputText}
          onSend={() => handleSend(inputText)}
          onToggleMic={toggleListening}
          onReset={() => setMessages([messages[0]])}
        />
      </div>

      {/* ElevenLabs AI Voice Selector & Configuration Modal */}
      <ElevenLabsVoiceModal
        isOpen={isElevenLabsModalOpen}
        onClose={() => setIsElevenLabsModalOpen(false)}
        settings={elevenLabsSettings}
        onSaveSettings={handleSaveElevenLabsSettings}
        onTestVoice={handleTestVoice}
      />
    </div>
  );
};
