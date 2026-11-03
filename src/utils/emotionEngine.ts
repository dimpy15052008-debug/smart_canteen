/**
 * CampusAI Contextual Emotion Engine
 * ===================================
 * Standalone contextual personality & emotion layer for CampusAI.
 * Completely separated from React UI and Three.js 3D rendering.
 *
 * Responsibilities:
 * - Detects user intent, sentiment, playful sarcasm cues, and Hinglish language.
 * - Enforces safety and context rules (sarcasm disappears for urgent, academic,
 *   financial, safety, exam distress, and administrative requests).
 * - Maps emotional state to voice style, facial expressions, gestures, intensity,
 *   speech rate, pauses, and 3D avatar pose choreography sequences.
 */

import { RobotMovement } from '../components/campus-ai/Avatar3DCanvas';

export type EmotionType =
  | 'idle'
  | 'listening'
  | 'thinking'
  | 'happy'
  | 'playful_sarcasm'
  | 'excited'
  | 'concerned'
  | 'error'
  | 'success';

export type VoiceStyle =
  | 'cute_sarcastic'
  | 'warm_helpful'
  | 'cheerful'
  | 'empathic'
  | 'curious'
  | 'confident'
  | 'calm_reassuring';

export type FacialExpression =
  | 'smirk'
  | 'smile'
  | 'wide_smile'
  | 'thinking'
  | 'attentive'
  | 'concerned'
  | 'confused'
  | 'neutral'
  | 'wink'
  | 'eyebrow_raise';

export type GestureType =
  | 'head_tilt'
  | 'eyebrow_raise'
  | 'shrug'
  | 'nod'
  | 'bounce'
  | 'hand_wave'
  | 'clap'
  | 'look_away'
  | 'finger_point'
  | 'none';

export type ContextClassification =
  | 'casual_joke'
  | 'bragging'
  | 'forgetful_trivial'
  | 'academic_records'
  | 'administrative_workflow'
  | 'sensitive_safety'
  | 'financial_distress'
  | 'emotional_distress'
  | 'technical_query'
  | 'general';

export interface EmotionAnalysis {
  emotion: EmotionType;
  voice_style: VoiceStyle;
  expression: FacialExpression;
  gesture: GestureType;
  intensity: number; // 0.0 to 1.0
  speaking_rate: number; // e.g. 0.92 for sarcastic timing, 1.0 default
  pitch: number; // e.g. 1.12 to 1.18 for cute but mature voice
  pause_before: number; // seconds to pause before speaking (for comic timing)
  pause_after: number; // seconds
  isSarcastic: boolean;
  sarcasmAllowed: boolean;
  contextType: ContextClassification;
  hinglishDetected: boolean;
  sequence: RobotMovement[];
  moodLabel: string;
  explanation: string;
}

// Common Hinglish keywords and expressions
const HINGLISH_PATTERNS = [
  /\b(kya|kaise|kyun|kyu|kab|kaha|kahan|kitna|kitne|kaun|kis|kisko)\b/i,
  /\b(bhai|yaar|dost|sir|maam|mam)\b/i,
  /\b(hai|hain|hu|hoon|hoga|hogi|honge|tha|thi|the)\b/i,
  /\b(mera|meri|mere|tera|teri|tere|apna|apni|apne)\b/i,
  /\b(karu|kare|karna|kar|batao|bata|dekh|dekho|chahiye|milega|hoga)\b/i,
  /\b(attendance|fee|fees|exam|result|marks|pass|fail|detention)\b.*\b(batao|kitna|hai|bhai)\b/i,
  /\b(accha|theek|sahi|arre|arrey|chalo|bilkul)\b/i,
];

/**
 * Checks whether user input is naturally in Hinglish
 */
export function isHinglish(text: string): boolean {
  if (!text) return false;
  let matches = 0;
  for (const regex of HINGLISH_PATTERNS) {
    if (regex.test(text)) {
      matches++;
      if (matches >= 2) return true;
    }
  }
  // Single strong marker if combined with English campus words
  const hasHindiWord = /\b(bhai|yaar|kya|kaise|batao|mera|meri|hai|chahiye)\b/i.test(text);
  const hasEnglishWord = /\b(attendance|fees|hostel|exam|class|bus|library|certificate|cgpa|subject|pass)\b/i.test(text);
  return hasHindiWord && hasEnglishWord;
}

/**
 * Checks whether the conversation is about serious, sensitive, urgent,
 * academic, financial, safety, or emotional matters where sarcasm MUST be disabled.
 */
export function isSensitiveContext(text: string): { isSensitive: boolean; reason: ContextClassification } {
  const t = text.toLowerCase();

  // 1. Emergency & Safety
  if (
    t.includes('emergency') ||
    t.includes('accident') ||
    t.includes('ambulance') ||
    t.includes('fire') ||
    t.includes('injury') ||
    t.includes('hurt') ||
    t.includes('threat') ||
    t.includes('danger')
  ) {
    return { isSensitive: true, reason: 'sensitive_safety' };
  }

  // 2. Harassment, Bullying, Ragging
  if (
    t.includes('ragging') ||
    t.includes('bully') ||
    t.includes('harass') ||
    t.includes('stalk') ||
    t.includes('abused') ||
    t.includes('safety') ||
    t.includes('security issue')
  ) {
    return { isSensitive: true, reason: 'sensitive_safety' };
  }

  // 3. Financial problems & hardship
  if (
    t.includes('cannot afford') ||
    t.includes('financial hardship') ||
    t.includes('financial problem') ||
    t.includes('cant pay') ||
    t.includes('cannot pay') ||
    t.includes('fee concession') ||
    t.includes('poverty') ||
    t.includes('financial crisis')
  ) {
    return { isSensitive: true, reason: 'financial_distress' };
  }

  // 4. Emotional distress / Mental Health
  if (
    t.includes('depressed') ||
    t.includes('anxiety') ||
    t.includes('crying') ||
    t.includes('hopeless') ||
    t.includes('suicide') ||
    t.includes('panic attack') ||
    t.includes('breakdown') ||
    t.includes('very sad') ||
    t.includes('lost my')
  ) {
    return { isSensitive: true, reason: 'emotional_distress' };
  }

  // 5. Exam failure distress
  if (
    (t.includes('failed') || t.includes('fail') || t.includes('detained') || t.includes('debarred') || t.includes('year back')) &&
    (t.includes('what should i do') || t.includes('scared') || t.includes('worried') || t.includes('ruined') || t.includes('depressed') || t.includes('career'))
  ) {
    return { isSensitive: true, reason: 'emotional_distress' };
  }

  // 6. Direct Academic Records Queries (Attendance, Marks, Schedule)
  if (
    t.includes('what is my attendance') ||
    t.includes('check attendance') ||
    t.includes('my attendance') ||
    t.includes('attendance kitna hai') ||
    t.includes('view timetable') ||
    t.includes('exam schedule') ||
    t.includes('seat number') ||
    t.includes('hall ticket')
  ) {
    return { isSensitive: true, reason: 'academic_records' };
  }

  // 7. Official Administrative Workflows (Certificates, Bonafide, NOC)
  if (
    t.includes('need a certificate') ||
    t.includes('apply for certificate') ||
    t.includes('bonafide') ||
    t.includes('transcript') ||
    t.includes('noc') ||
    t.includes('id card reissue') ||
    t.includes('gate pass')
  ) {
    return { isSensitive: true, reason: 'administrative_workflow' };
  }

  return { isSensitive: false, reason: 'general' };
}

/**
 * Core Emotion Engine: Analyzes query and response to determine full emotional
 * and animation parameters for CampusAI.
 */
export function analyzeEmotion(query: string, reply: string = ''): EmotionAnalysis {
  const q = (query || '').trim();
  const r = (reply || '').trim();
  const qLower = q.toLowerCase();
  const rLower = r.toLowerCase();
  const combined = `${qLower} ${rLower}`;

  const hinglishDetected = isHinglish(q);
  const sensitivity = isSensitiveContext(combined);

  // If in sensitive context, sarcasm is strictly suppressed!
  const sarcasmAllowed = !sensitivity.isSensitive;

  // Sarcasm triggers in query:
  const isTrivialPassword =
    (qLower.includes('forgot') || qLower.includes('forget')) &&
    (qLower.includes('password') || qLower.includes('pin') || qLower.includes('login') || qLower.includes('again'));

  const isBragging =
    (qLower.includes('95%') || qLower.includes('99%') || qLower.includes('100%') || qLower.includes('full marks') || qLower.includes('topper') || qLower.includes('genius')) &&
    !qLower.includes('failed');

  const isHarmlessJoke =
    qLower.includes('joke') ||
    qLower.includes('roast me') ||
    qLower.includes('are you smart') ||
    qLower.includes('you are slow') ||
    qLower.includes('boring') ||
    qLower.includes('ba-dum-tss') ||
    qLower.includes('badumtss');

  const hasSmirkCue =
    r.includes('😏') ||
    rLower.includes('again? impressive consistency') ||
    rLower.includes('okay, genius') ||
    rLower.includes('leave some marks') ||
    rLower.includes('deal with it');

  // -------------------------------------------------------------------------
  // 1. PLAYFUL SARCASM STATE
  // Triggered when sarcasm is allowed AND harmless joke / forgetful password / bragging / smirk cue
  // -------------------------------------------------------------------------
  if (sarcasmAllowed && (hasSmirkCue || isTrivialPassword || isBragging || (isHarmlessJoke && (r.includes('😏') || r.includes('😉'))))) {
    return {
      emotion: 'playful_sarcasm',
      voice_style: 'cute_sarcastic',
      expression: 'smirk',
      gesture: 'head_tilt',
      intensity: 0.55,
      speaking_rate: 0.92, // Sarcastic delivery relies heavily on timing & slight pause
      pitch: 1.15, // Cute, mature, slightly elevated
      pause_before: 0.25, // Expressive short pause before sarcastic delivery
      pause_after: 0.2,
      isSarcastic: true,
      sarcasmAllowed: true,
      contextType: isTrivialPassword ? 'forgetful_trivial' : isBragging ? 'bragging' : 'casual_joke',
      hinglishDetected,
      sequence: ['arms_crossed', 'thumbs_up', 'laughing_cheer'],
      moodLabel: '😏 Playful Sarcasm (Smirk & Head Tilt)',
      explanation: 'Playful, context-aware witty response with comedic timing and mild smirk gesture.',
    };
  }

  // -------------------------------------------------------------------------
  // 2. CONCERNED / EMPATHIC STATE
  // Serious issues, low attendance, stress, sadness, failures
  // -------------------------------------------------------------------------
  if (
    sensitivity.reason === 'sensitive_safety' ||
    sensitivity.reason === 'financial_distress' ||
    sensitivity.reason === 'emotional_distress' ||
    combined.includes('shortage') ||
    combined.includes('detention') ||
    combined.includes('below 75') ||
    combined.includes('depressed') ||
    combined.includes('crying') ||
    combined.includes('worried') ||
    combined.includes('help me please')
  ) {
    return {
      emotion: 'concerned',
      voice_style: 'empathic',
      expression: 'concerned',
      gesture: 'nod',
      intensity: 0.7,
      speaking_rate: 0.94, // Softer, reassuring, slightly slower
      pitch: 1.08, // Softer, caring tone
      pause_before: 0.1,
      pause_after: 0.15,
      isSarcastic: false,
      sarcasmAllowed: false,
      contextType: sensitivity.reason,
      hinglishDetected,
      sequence: ['alert_warning', 'hug_heart', 'explain_hands'],
      moodLabel: '💙 Caring & Reassuring (Empathic Support)',
      explanation: 'Sarcasm disabled. Reassuring tone with compassionate body language for student well-being.',
    };
  }

  // -------------------------------------------------------------------------
  // 3. SUCCESS / CELEBRATION STATE
  // Approved, cleared, congratulations, high score without sarcasm
  // -------------------------------------------------------------------------
  if (
    combined.includes('congrat') ||
    combined.includes('cleared') ||
    combined.includes('approved') ||
    combined.includes('paid successfully') ||
    combined.includes('ticket created') ||
    combined.includes('submitted successfully') ||
    combined.includes('all clear')
  ) {
    return {
      emotion: 'success',
      voice_style: 'cheerful',
      expression: 'smile',
      gesture: 'nod',
      intensity: 0.8,
      speaking_rate: 1.05,
      pitch: 1.18,
      pause_before: 0.05,
      pause_after: 0.1,
      isSarcastic: false,
      sarcasmAllowed: true,
      contextType: 'general',
      hinglishDetected,
      sequence: ['party_confetti', 'cheer_both', 'thumbs_up'],
      moodLabel: '🎉 Success & Celebration (Celebratory Nod)',
      explanation: 'Celebratory positive confirmation with celebratory gestures and bright eyes.',
    };
  }

  // -------------------------------------------------------------------------
  // 4. EXCITED STATE
  // Fests, events, sports, hackathons, robots, AI breakthrough
  // -------------------------------------------------------------------------
  if (
    combined.includes('hackathon') ||
    combined.includes('fest') ||
    combined.includes('robotics') ||
    combined.includes('awesome') ||
    combined.includes('super excited') ||
    combined.includes('party') ||
    combined.includes('win')
  ) {
    return {
      emotion: 'excited',
      voice_style: 'cheerful',
      expression: 'wide_smile',
      gesture: 'bounce',
      intensity: 0.85,
      speaking_rate: 1.08,
      pitch: 1.2,
      pause_before: 0.05,
      pause_after: 0.1,
      isSarcastic: false,
      sarcasmAllowed: true,
      contextType: 'general',
      hinglishDetected,
      sequence: ['flying_jump', 'cheer_both', 'thumbs_up'],
      moodLabel: '⚡ High Energy & Excited (Energetic Bounce)',
      explanation: 'High enthusiasm with wide smiling expression and dynamic hand gestures.',
    };
  }

  // -------------------------------------------------------------------------
  // 5. ADMINISTRATIVE WORKFLOW & ACADEMIC RECORDS (Warm, helpful, professional)
  // -------------------------------------------------------------------------
  if (sensitivity.reason === 'academic_records' || sensitivity.reason === 'administrative_workflow') {
    return {
      emotion: 'happy',
      voice_style: 'warm_helpful',
      expression: 'smile',
      gesture: 'nod',
      intensity: 0.5,
      speaking_rate: 1.0,
      pitch: 1.14,
      pause_before: 0.05,
      pause_after: 0.1,
      isSarcastic: false,
      sarcasmAllowed: false,
      contextType: sensitivity.reason,
      hinglishDetected,
      sequence: ['laptop_work', 'explain_hands', 'thumbs_up'],
      moodLabel: '📋 Official Records Retrieval (Warm & Precise)',
      explanation: 'Zero sarcasm. Precise retrieval of official university records and workflows.',
    };
  }

  // -------------------------------------------------------------------------
  // 6. THINKING / ANALYSIS STATE
  // Complex question, calculating, searching database
  // -------------------------------------------------------------------------
  if (
    combined.includes('calculate') ||
    combined.includes('curriculum') ||
    combined.includes('eligibility') ||
    combined.includes('difference between') ||
    combined.includes('explain')
  ) {
    return {
      emotion: 'thinking',
      voice_style: 'curious',
      expression: 'thinking',
      gesture: 'head_tilt',
      intensity: 0.6,
      speaking_rate: 0.98,
      pitch: 1.12,
      pause_before: 0.15,
      pause_after: 0.1,
      isSarcastic: false,
      sarcasmAllowed: true,
      contextType: 'technical_query',
      hinglishDetected,
      sequence: ['thinking_dots', 'confused_question', 'explain_hologram'],
      moodLabel: '🧠 Analytical Thinking (Cognitive Reason)',
      explanation: 'Analytical mode with head tilt, gazing upward, and structured explanation.',
    };
  }

  // -------------------------------------------------------------------------
  // 7. DEFAULT HAPPY / FRIENDLY COMPANION
  // -------------------------------------------------------------------------
  return {
    emotion: 'happy',
    voice_style: 'warm_helpful',
    expression: 'smile',
    gesture: 'nod',
    intensity: 0.5,
    speaking_rate: 1.0,
    pitch: 1.15,
    pause_before: 0.05,
    pause_after: 0.1,
    isSarcastic: false,
    sarcasmAllowed: true,
    contextType: 'general',
    hinglishDetected,
    sequence: ['wave_hello', 'explain_hands', 'thumbs_up'],
    moodLabel: '✨ Friendly Campus Companion (Ready & Helpful)',
    explanation: 'Lovable intelligent campus companion with warm delivery and subtle head nods.',
  };
}

/**
 * Clean emotion-to-animation mapping layer.
 * Keeps animation choreography completely decoupled from AI logic.
 */
export function mapEmotionToMovement(analysis: EmotionAnalysis): RobotMovement {
  switch (analysis.emotion) {
    case 'playful_sarcasm':
      return 'arms_crossed';
    case 'concerned':
      return 'alert_warning';
    case 'excited':
      return 'cheer_both';
    case 'thinking':
      return 'thinking_dots';
    case 'success':
      return 'party_confetti';
    case 'error':
      return 'frustrated_headache';
    case 'listening':
      return 'focused_listen';
    case 'idle':
      return 'rest';
    case 'happy':
    default:
      return 'wave_hello';
  }
}
