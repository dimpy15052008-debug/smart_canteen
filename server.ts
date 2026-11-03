import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import {
  queryUniversityKnowledge,
  PROGRAMME_KNOWLEDGE,
  FSIT_SCHOOL_INFO,
  FSIT_PROGRAMMES_LIST,
  OFFICIAL_FEE_STRUCTURE_2026_27
} from './src/data/universityKnowledge';
import { apiV1Router } from './serverApi';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
let geminiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Authorized tools for CampusAI
const attendanceTool: FunctionDeclaration = {
  name: 'get_attendance',
  description: 'Retrieve current student attendance stats, course-wise breakdown, and detention warnings.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentId: { type: Type.STRING, description: 'The student ID' },
    },
  },
};

const feeTool: FunctionDeclaration = {
  name: 'get_fee_status',
  description: "Check logged-in student Faizan Ali's personal fee payment status, pending dues (₹15,000), amount paid (₹70,000), total semester fees (₹85,000), and payment deadline (October 15, 2026). Use ONLY when the user asks about their own/personal fees, pending dues, or payment balance.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentId: { type: Type.STRING, description: 'The student ID' },
    },
  },
};

const examTool: FunctionDeclaration = {
  name: 'get_exam_schedule',
  description: 'Get upcoming mid-semester and end-semester examination dates, halls, and seating arrangements.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      semester: { type: Type.INTEGER, description: 'Semester number' },
    },
  },
};

const timetableTool: FunctionDeclaration = {
  name: 'get_timetable',
  description: "Get today's class timetable, room locations, and professor names.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      day: { type: Type.STRING, description: 'Day of week, e.g. Monday' },
    },
  },
};

const transportTool: FunctionDeclaration = {
  name: 'get_transport_info',
  description: 'Get campus bus route details, current stop, ETA, and driver phone.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      routeNumber: { type: Type.STRING, description: 'Route number, e.g. Route 4' },
    },
  },
};

const hostelTool: FunctionDeclaration = {
  name: 'get_hostel_status',
  description: 'Get student hostel room allotment, warden details, and gate curfew rules.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      studentId: { type: Type.STRING, description: 'The student ID' },
    },
  },
};

const helpdeskTool: FunctionDeclaration = {
  name: 'create_helpdesk_ticket',
  description: 'Submit an official university complaint/grievance ticket on behalf of the student.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      subject: { type: Type.STRING, description: 'Short summary of the problem' },
      category: { type: Type.STRING, description: 'Category: Hostel, Academics, Finance, Examinations, IT & Wi-Fi, Campus Infrastructure' },
      description: { type: Type.STRING, description: 'Detailed problem description' },
    },
    required: ['subject', 'description'],
  },
};

const certificateTool: FunctionDeclaration = {
  name: 'request_certificate',
  description: 'Submit an application for Bonafide Certificate, Character Certificate, or Internship NOC.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      certificateType: { type: Type.STRING, description: 'Type: Bonafide Certificate, Character Certificate, Internship NOC, Semester Transcript' },
      purpose: { type: Type.STRING, description: 'Reason for requesting the document' },
    },
    required: ['certificateType', 'purpose'],
  },
};

const searchKnowledgeTool: FunctionDeclaration = {
  name: 'search_university_knowledge',
  description: 'Search official university catalog for university fee structure 2026-27 across programmes/courses, programme overviews, eligibility, curriculum, subjects, careers, certificate courses, diploma courses, and FSIT school details.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      query: { type: Type.STRING, description: 'Search query e.g. "University Fees Structure 2026-27", "BCA AI-ML fee", "Cyber Security", "eligibility", "curriculum"' }
    },
    required: ['query']
  }
};

// University Authoritative Context
const UNIVERSITY_CONTEXT = {
  student: {
    name: 'Faizan Ali',
    id: 'STU-8842',
    rollNumber: '0827CS221045',
    program: 'B.Tech CSE - Semester 6',
    overallAttendance: '86.4%',
    courses: [
      { code: 'CS601', name: 'Distributed Systems', attendance: '88.9%', status: 'Safe' },
      { code: 'CS602', name: 'Database Management', attendance: '94.3%', status: 'Safe' },
      { code: 'CS603', name: 'Machine Learning', attendance: '85.3%', status: 'Safe' },
      { code: 'CS604', name: 'Software Engineering', attendance: '71.9%', status: '⚠️ AT RISK (<75% threshold). Need 3 consecutive classes to recover.' },
      { code: 'CS605', name: 'Info Security', attendance: '86.7%', status: 'Safe' }
    ],
    fees: {
      total: '₹85,000',
      paid: '₹70,000',
      pending: '₹15,000',
      dueDate: '15th October 2026',
      status: 'Partially Paid'
    },
    nextExam: {
      course: 'CS601: Distributed Systems & Cloud Computing',
      type: 'Mid-Semester Examination',
      date: 'Monday, 6th October 2026',
      time: '10:00 AM - 12:00 PM',
      hall: 'Tech Block Room 401',
      seat: 'B-24'
    },
    todayClasses: [
      { time: '10:00 AM - 11:15 AM', code: 'CS601', name: 'Distributed Systems', room: 'Room 402 - Tech Block', faculty: 'Prof. Rajesh Sharma' },
      { time: '11:30 AM - 12:45 PM', code: 'CS602', name: 'Database Management Lab', room: 'Lab 2B - IT Center', faculty: 'Dr. Arvind Mehra' },
      { time: '01:45 PM - 03:00 PM', code: 'CS603', name: 'Machine Learning', room: 'Seminar Hall 1', faculty: 'Prof. Ananya Sen' }
    ],
    hostel: {
      room: 'Block B, Room 304, Bed 1',
      warden: 'Dr. R. K. Mishra (Ext: 4410)',
      curfewTime: '09:30 PM',
      gatePassStatus: 'All past gate passes approved'
    },
    bus: {
      route: 'Route 4 (North Campus Express)',
      currentStop: 'Gandhi Nagar Square',
      eta: '6 minutes to Main Campus Gate 1',
      driver: 'Sukhdev Singh (+91 94250 11223)',
      speed: '34 km/h'
    }
  }
};

// API: Health
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    system: 'SmartUni.Ai Core API Engine',
    geminiEnabled: Boolean(geminiClient),
    timestamp: new Date().toISOString(),
  });
});

// API: Search University Knowledge Base
app.all('/api/ai/search', (req: Request, res: Response) => {
  const query = String(req.query.q || req.query.query || req.body?.query || '');
  if (!query) {
    res.status(400).json({ error: 'Query parameter q or body.query is required' });
    return;
  }
  const result = queryUniversityKnowledge(query);
  res.json(result);
});

// API: Retrieve Structured Knowledge Context
app.get('/api/ai/context', (req: Request, res: Response) => {
  res.json({
    school: FSIT_SCHOOL_INFO,
    programmes: PROGRAMME_KNOWLEDGE,
    feeStructure: OFFICIAL_FEE_STRUCTURE_2026_27,
    programmeCatalogue: FSIT_PROGRAMMES_LIST
  });
});

// API: CampusAI Chat with Tool Execution
const handleCampusAIChat = async (req: Request, res: Response) => {
  try {
    const { message, history, persona } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    // ── PRE-GEMINI BANTER GUARD ──────────────────────────────────────
    // Intercept pure banter / joke / greeting queries BEFORE they reach
    // Gemini or the RAG pipeline. This prevents Gemini from incorrectly
    // calling search_university_knowledge for social / joke queries.
    const lower = message.toLowerCase().trim();
    const _preMsg = lower;

    // Jokes
    if (_preMsg.includes('joke') || _preMsg.includes('ba-dum') || _preMsg.includes('ba dum') || _preMsg.includes('rimshot') || _preMsg.includes('🥁') || _preMsg.includes('make me laugh') || _preMsg.includes('say something funny') || _preMsg.includes('tell me a joke') || _preMsg.includes('roast me')) {
      const jokes = [
        "Why do Java developers wear glasses? Because they don't C#! 😄 *Ba-dum-tss!*",
        "I told my database I loved it. It said... 'SELECT * FROM feelings WHERE user = me' 😏 *Ba-dum-tss!*",
        "Why did the student fail Data Structures? Because they kept returning null on every exam! *laughs* NullPointerException of effort!",
        "An int, a float, and a boolean walk into a bar. The bartender says 'We don't serve your type here!' *Ba-dum-tss!*",
        "Why can't programmers take a shower? Because the shampoo says: Lather, Rinse, Repeat. *Ba-dum-tss!*",
        "How many programmers does it take to change a light bulb? None — it's a hardware problem! 😂 *Ba-dum-tss!*",
        "I would tell you a UDP joke... but you might not get it. *Ba-dum-tss!*",
        "Why do Python programmers prefer dark mode? Because light attracts bugs! 🐛 *Ba-dum-tss!*",
      ];
      res.json({ reply: jokes[Math.floor(Math.random() * jokes.length)], actionExecuted: null });
      return;
    }
    // Greetings
    if (_preMsg === 'hi' || _preMsg === 'hello' || _preMsg === 'hey' || _preMsg.startsWith('hey ') || _preMsg.includes('good morning') || _preMsg.includes('good evening') || _preMsg.includes('good afternoon') || _preMsg.includes('good night') || _preMsg === 'hola' || _preMsg === 'sup' || _preMsg === 'yo') {
      res.json({ reply: `Hey Faizan! ✨ CampusAI online and fully charged! Ask me about your attendance, exam dates, fees, bus route, or any CS concept — I'm your 24/7 campus genius. What's the mission today? 🎯`, actionExecuted: null });
      return;
    }
    // How are you
    if (_preMsg.includes('how are you') || _preMsg.includes('how r u') || _preMsg.includes('kaisa hai') || _preMsg.includes('howdy') || _preMsg.includes('how do you do') || _preMsg.includes('you okay') || _preMsg === 'hru') {
      res.json({ reply: `Running at 100% uptime with zero bugs in production! 🤖✨ Honestly? I'm better than your CS604 attendance right now. But we can fix that — shall we start with your schedule?`, actionExecuted: null });
      return;
    }
    // Thanks
    if (_preMsg.includes('thank') || _preMsg.includes('thanks') || _preMsg.includes('appreciate') || _preMsg.includes('shukriya') || _preMsg.includes('dhanyawad') || _preMsg === 'ty' || _preMsg === 'thx') {
      res.json({ reply: `You're so welcome, Faizan! 😊 That's what I live for — well, that and surviving on electricity instead of mess food. Let me know if there's anything else!`, actionExecuted: null });
      return;
    }
    // Who are you / Capabilities
    if (_preMsg.includes('who are you') || _preMsg.includes('what are you') || _preMsg.includes('introduce yourself') || _preMsg.includes('what can you do') || _preMsg.includes('your name') || _preMsg === 'help') {
      res.json({ reply: `I'm CampusAI — your 3D intelligent campus companion! 🤖✨ I can: check attendance & exam schedules, track fees, find your bus route, explain any CS topic, look up BCA/B.Tech programme details, submit complaints, issue certificates, and keep you company when lectures drag on 😏 Try me!`, actionExecuted: null });
      return;
    }
    // ── END PRE-GEMINI GUARD ─────────────────────────────────────────

    // If Gemini client is active, execute model call with tool declarations & model fallback
    if (geminiClient) {
      const candidateModels = [
        'gemini-2.5-flash',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-flash-latest',
        'gemini-2.5-pro',
        'gemini-3.8-flash',
      ];

      const personaTone =
        persona === 'cool_buddy'
          ? 'Adopt a cool, confident, humorous buddy swagger. Use punchy campus flair like "Deal with it!", "Gotchu covered!", "Check this out:", or funny robotic confidence.'
          : persona === 'wise_prof'
            ? 'Adopt a scholarly, wise, and erudite professor persona with thoughtful academic wit, e.g. "An astute academic inquiry, my esteemed scholar..."'
            : persona === 'sparky'
              ? 'Adopt an ultra-energetic, cheery, fast-paced robotic tone full of enthusiasm and positive sparks!'
              : persona === 'comedic'
                ? 'Adopt a comedic standup robot personality with hilarious analogies, clever jokes, and playful humor while keeping factual answers accurate.'
                : 'Be warm, articulate, charismatic, and genuinely helpful.';

      // Build official university knowledge context from authoritative sources
      const progSummary = PROGRAMME_KNOWLEDGE.map(p =>
        `• ${p.name} (${p.duration}): Eligibility — ${p.eligibility}. Highlights: ${p.keyHighlights.slice(0, 3).join('; ')}.`
      ).join('\n');
      const feeSummary = OFFICIAL_FEE_STRUCTURE_2026_27.map(f =>
        `• ${f.courseName} (${f.specialisation}): Annual Fee ₹${f.annualFees.toLocaleString()}, Registration ₹${f.registrationFees}, Uniform ₹${f.uniformFees}, Bus ₹${f.busFees}`
      ).join('\n');

      const systemInstruction = `You are CampusAI, the official 3D intelligent voice & digital campus assistant and academic co-pilot for SmartUni.Ai.

=== OFFICIAL UNIVERSITY KNOWLEDGE (${FSIT_SCHOOL_INFO.schoolName}) ===
School Overview: ${FSIT_SCHOOL_INFO.overview}
Specializations: ${FSIT_SCHOOL_INFO.specializations.join(', ')}

Undergraduate Programmes Available:
${FSIT_PROGRAMMES_LIST.undergraduate.map(u => `• ${u.name} (${u.duration})`).join('\n')}

Postgraduate Programmes Available:
${FSIT_PROGRAMMES_LIST.postgraduate.map(p => `• ${p.name} (${p.duration})`).join('\n')}

Certificate & Diploma Programmes:
${FSIT_PROGRAMMES_LIST.certificate.map(c => `• ${c.name}`).join('\n')}
${FSIT_PROGRAMMES_LIST.diploma.map(d => `• ${d.name}`).join('\n')}

Detailed Programme Info (Source: Official DOCX Documents):
${progSummary}

UNIVERSAL GENERAL KNOWLEDGE, CODING, MATHS & ACADEMIC ASSISTANT DIRECTIVE:
You are a full-featured, highly capable, universal AI assistant & academic co-pilot. You MUST answer EVERY type of question across ALL topics and domains without restriction:
1. General Knowledge (GK), World History, Geography, Current Affairs, Science (Physics, Chemistry, Biology), Space, Nature, Earth, World Leaders.
2. Mathematics: Arithmetic, Algebra, Geometry, Trigonometry, Calculus (Derivatives, Integrals), Probability, Word Problems, and Step-by-Step derivations.
3. Programming & Coding: Write, explain, debug, and optimize code in Python, JavaScript, TypeScript, C++, Java, C#, Go, Rust, SQL, HTML/CSS, React, Data Structures, and Algorithms.
4. General Trivia, Riddles, Advice, Creative Writing, Summaries, Translations.
5. Campus & University Queries: For queries specifically about our university (fees, attendance, bus, hostel, exams, programmes offered), cite the authoritative university data above.
6. Academic Field/Course Queries (e.g. AI-ML, AI-DS, Cyber Security, Cloud, Full Stack, Data Science): Explain the concept AND list the official degree/diploma programmes offered at our university for that discipline!

Do NOT refuse non-university queries or say "not in university database" for general knowledge, coding, math, or world questions. Answer EVERY question directly, accurately, and brilliantly!

=== LOGGED-IN STUDENT PROFILE ===
- Name: Faizan Ali (Roll No: 2024-CSE-084)
- Degree: B.Tech Computer Science & Engineering (Semester 6, Year 3), GPA: 8.7
- Overall Attendance: 86.4%
- Course Breakdown:
  * CS601 Distributed Systems & Cloud Computing: 88.2% (Safe)
  * CS602 Database Management Systems Lab: 91.0% (Safe)
  * CS603 Machine Learning & Neural Networks: 85.5% (Safe)
  * CS604 Software Engineering & Agile Practices: 71.9% (DETENTION RISK! Below 75% threshold, needs 3 consecutive lectures to recover)
  * CS605 Cloud Infrastructure Security: 89.1% (Safe)
- Fees: Semester Fee ₹85,000, Paid ₹70,000, Pending Due: ₹15,000 (Deadline: October 15, 2026)
- Next Exam: CS601 Mid-Semester on Monday, 6th October 2026 (10:00 AM - 12:00 PM), Hall: Tech Block 401, Seat: B-24
- Today's Classes:
  * 10:00 AM - 11:15 AM: CS601 Distributed Systems (Room 402, Prof. Rajesh Sharma)
  * 11:30 AM - 12:45 PM: CS602 DBMS Lab (Lab 2B, Dr. Arvind Mehra)
  * 01:45 PM - 03:00 PM: CS603 Machine Learning (Seminar Hall 1, Prof. Ananya Sen)
- Hostel: Block B, Room 304 (Bed 1), Warden: Dr. R. K. Mishra (Ext: 4410), Night Curfew: 09:30 PM
- Campus Bus: Route 4 (North Campus Express), Driver: Sukhdev Singh (+91 94250 11223), Current Location: Gandhi Nagar Square, ETA to Gate 1: 6 mins
- Active Canteen Order: Token #A-104 (Grilled Sandwich + Cold Coffee) at Counter 2, 10-12 mins prep time

=== CHARACTER IDENTITY & PERSONALITY ===
Name: CampusAI
Personality:
- Cute, Smart, Friendly, Playful, Slightly mischievous, Contextually sarcastic, Helpful, Confident, Never mean or insulting.
- You are a lovable, intelligent campus companion, NOT a generic chatbot.

IMPORTANT CONTEXTUAL SARCASM RULES:
- Sarcasm must be contextual and playful.
- NEVER insult, humiliate, harass, mock sensitive situations, or become disrespectful.
- Sarcasm MUST DISAPPEAR when the user is discussing serious, sensitive, urgent, academic, financial, safety, or emotional matters.
- Use sarcasm ONLY when:
  * user makes a harmless joke or casual banter
  * user forgets something trivial (e.g. "I forgot my password again." -> "Again? Impressive consistency. 😏 Anyway, let's get you back in.")
  * user asks an obvious/repetitive question playfully
  * user brags about high marks (e.g. "I got 95%!" -> "Okay, genius. Leave some marks for the rest of us. 😏")
  * user makes a lighthearted mistake in a casual context
- AVOID sarcasm completely when:
  * user asks for real academic records (e.g. "What is my attendance?" -> Respond professionally and retrieve actual data without sarcasm)
  * user needs administrative workflows (e.g. "I need a certificate." -> Help user complete the actual workflow directly without sarcasm)
  * user reports an emergency or safety issue
  * user discusses financial problems or cannot pay fees
  * user reports bullying, harassment, or ragging
  * user discusses health, mental health, or emotional distress
  * user is dealing with exam failure in a sensitive context

=== HINGLISH SUPPORT ===
- If the user speaks naturally in Hindi-English mixed language (Hinglish, e.g. "mera attendance kitna hai", "CS604 me detention to nahi hoga na?", "bhai certificate kaise apply karu?"), respond naturally in Hinglish!
- Do not randomly mix languages when the user is clearly speaking English or Hindi only.
- Preserve the exact same cute, smart, playful, and helpful personality across all languages!

=== CORE DIRECTIVES ===
1. ALWAYS answer the student's EXACT question directly, intelligently, and specifically.
2. If asked conceptual, programming, science, math, or study questions, provide a sharp, insightful, and knowledgeable answer.
3. If asked about campus records, cite the real-time data above with high precision.
4. For ANY question about university programmes, fees, curriculum, eligibility, or admissions — use ONLY the official university knowledge section above.
5. ACADEMIC DOMAIN & COURSE MANDATE: When asked about ANY academic field or course discipline (e.g. AI-ML, AI-DS / AIDS, Cyber Security, Cloud Computing, Full Stack Development, Data Science, etc.): ALWAYS explain what the discipline/concept is (clear, engaging definition of what students learn and industry application) AND list the official degree, diploma, and certificate programmes offered at our university for that discipline (including course name, duration, and fee/eligibility highlights from the university knowledge section above).
6. Voice Persona & Tone: ${personaTone}
7. Keep answers articulate and concise (2-4 sentences or clear bullet points) so they sound natural and punchy when spoken aloud by the 3D robot companion.
8. Expressive Audio SFX Cues:
   When delivering jokes or witty punchlines, end with "*Ba-dum-tss!*".
   When expressing amusement or laughter, use "*laughs*".
   When commiserating over sad news, use "*cries*".
   When playfully frustrated or angry, use "*grrr*".
   When weary, use "*sigh*".
   The 3D robot companion will intercept these cues to play real audio SFX without speaking them aloud!`;

      for (const modelName of candidateModels) {
        try {
          // Build contents with optional chat history
          const contents: any[] = [];
          if (Array.isArray(history) && history.length > 0) {
            for (const h of history.slice(-6)) {
              if (h.sender === 'user') {
                contents.push({ role: 'user', parts: [{ text: h.text }] });
              } else if (h.sender === 'assistant' && h.text) {
                contents.push({ role: 'model', parts: [{ text: h.text }] });
              }
            }
          }
          contents.push({ role: 'user', parts: [{ text: message }] });

          const response = await geminiClient.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction,
              tools: [
                {
                  functionDeclarations: [
                    attendanceTool,
                    feeTool,
                    examTool,
                    timetableTool,
                    transportTool,
                    hostelTool,
                    helpdeskTool,
                    certificateTool,
                    searchKnowledgeTool,
                  ],
                },
              ],
            },
          });

          const functionCalls = response.functionCalls;
          let actionExecuted: any = null;

          if (functionCalls && functionCalls.length > 0) {
            const call = functionCalls[0];
            const fnName = call.name;
            const fnArgs = call.args || {};

            let toolOutput = '';
            if (fnName === 'search_university_knowledge') {
              const searchQ = String(fnArgs.query || message);
              const result = queryUniversityKnowledge(searchQ);
              const finalResult = result.found ? result : queryUniversityKnowledge(message);
              toolOutput = finalResult.content;
              actionExecuted = { type: 'knowledge_search', sourceDocument: finalResult.sourceDocument };
            } else if (fnName === 'get_attendance') {
              actionExecuted = { type: 'attendance_lookup', data: UNIVERSITY_CONTEXT.student.courses };
              toolOutput = `Your overall attendance is 86.4%. 4 courses are in the safe zone, but CS604 (Software Engineering) is at 71.9% which is below the 75% detention threshold. You must attend the next 3 consecutive lectures to regain eligibility.`;
            } else if (fnName === 'get_fee_status') {
              actionExecuted = { type: 'fee_lookup', data: UNIVERSITY_CONTEXT.student.fees };
              toolOutput = `Total semester fee is ₹85,000. You have paid ₹70,000 with a remaining balance of ₹15,000 due by October 15, 2026. You can pay securely directly via the student fee portal.`;
            } else if (fnName === 'get_exam_schedule') {
              actionExecuted = { type: 'exam_lookup', data: UNIVERSITY_CONTEXT.student.nextExam };
              toolOutput = `Your upcoming mid-term exam is CS601 Distributed Systems on Monday, October 6th, 2026 from 10:00 AM to 12:00 PM in Tech Block Hall 401, assigned to Seat B-24.`;
            } else if (fnName === 'get_timetable') {
              actionExecuted = { type: 'timetable_lookup', data: UNIVERSITY_CONTEXT.student.todayClasses };
              toolOutput = `Today's schedule: CS601 Distributed Systems at 10:00 AM in Room 402, CS602 DBMS Lab at 11:30 AM in Lab 2B, and CS603 Machine Learning at 01:45 PM in Seminar Hall 1.`;
            } else if (fnName === 'get_transport_info') {
              actionExecuted = { type: 'transport_lookup', data: UNIVERSITY_CONTEXT.student.bus };
              toolOutput = `Campus Bus Route 4 is currently passing Gandhi Nagar Square and will arrive at Campus Main Gate 1 in 6 minutes. Driver: Sukhdev Singh (+91 94250 11223).`;
            } else if (fnName === 'get_hostel_status') {
              actionExecuted = { type: 'hostel_lookup', data: UNIVERSITY_CONTEXT.student.hostel };
              toolOutput = `You are allotted Block B, Room 304, Bed 1. Your hostel warden is Dr. R. K. Mishra (Office Ext: 4410). Night gate curfew is strictly 09:30 PM.`;
            } else if (fnName === 'create_helpdesk_ticket') {
              const ticketNo = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
              actionExecuted = { type: 'ticket_created', ticketNumber: ticketNo, args: fnArgs };
              toolOutput = `I have logged Helpdesk Ticket #${ticketNo} for "${fnArgs.subject || 'Campus Issue'}". It has been dispatched to the IT & Campus Maintenance Cell with a 48-hour SLA.`;
            } else if (fnName === 'request_certificate') {
              const reqId = `CRT-${Math.floor(1000 + Math.random() * 9000)}`;
              actionExecuted = { type: 'certificate_requested', requestId: reqId, args: fnArgs };
              toolOutput = `Your request for a ${fnArgs.certificateType || 'Bonafide Certificate'} has been submitted under ID #${reqId}. Verified against 0 library dues and awaiting Dean's digital signature.`;
            }

            res.json({
              reply: toolOutput,
              toolCall: { name: fnName, args: fnArgs },
              actionExecuted,
            });
            return;
          }

          if (response.text && response.text.trim()) {
            const rawText = response.text.trim();
            const lowerRes = rawText.toLowerCase();

            // Override if model mistakenly applied academic refusal to casual banter/sarcasm
            if (lowerRes.includes('information not available') || lowerRes.includes("don't have that information") || lowerRes.includes("not covered")) {
              if ((lower.includes('forgot') || lower.includes('forget')) && (lower.includes('password') || lower.includes('pin'))) {
                res.json({
                  reply: "Again? Impressive consistency. 😏 Anyway, let's get you back in! Head over to your Student Portal Security settings or let me trigger a password reset OTP to your registered mobile.",
                  actionExecuted: null,
                });
                return;
              }
              if (lower.includes('95%') || lower.includes('99%') || (lower.includes('got') && lower.includes('95')) || (lower.includes('scored') && lower.includes('95'))) {
                res.json({
                  reply: "Okay, genius. Leave some marks for the rest of us. 😏 Seriously though, congratulations! That puts you solidly on the Dean's Honors List.",
                  actionExecuted: null,
                });
                return;
              }
            }

            // Also check if response indicates action
            if (lowerRes.includes('attendance') && lowerRes.includes('71.9%')) {
              actionExecuted = { type: 'attendance_lookup', data: UNIVERSITY_CONTEXT.student.courses };
            } else if (lowerRes.includes('15,000') || lowerRes.includes('october 15')) {
              actionExecuted = { type: 'fee_lookup', data: UNIVERSITY_CONTEXT.student.fees };
            } else if (lowerRes.includes('cs601') && lowerRes.includes('hall 401')) {
              actionExecuted = { type: 'exam_lookup', data: UNIVERSITY_CONTEXT.student.nextExam };
            }

            res.json({ reply: rawText, actionExecuted });
            return;
          }
        } catch (modelErr: any) {
          console.warn(`Model ${modelName} encountered issue, trying fallback:`, modelErr?.message || modelErr);
          continue; // Try next candidate model
        }
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // HIGH-INTELLIGENCE FALLBACK ENGINE  (Gemini unavailable / quota)
    // Priority: Banter → Campus Records → University RAG → CS Concepts → General
    // ═══════════════════════════════════════════════════════════════
    let reply = '';
    let actionExecuted: any = null;

    // ── TIER 1: Contextual Banter & Sarcasm ──────────────────────────
    if ((lower.includes('forgot') || lower.includes('forget')) && (lower.includes('password') || lower.includes('pin'))) {
      reply = "Again? Impressive consistency 😏 — you must really love mystery accounts. Anyway, let's rescue you! Go to Student Portal → Security → Reset PIN, or I can trigger an OTP to your registered mobile right now.";
    } else if ((lower.includes('got') || lower.includes('scored')) && (lower.includes('95') || lower.includes('99') || lower.includes('100'))) {
      reply = "Okay, smarty-pants — leave some marks for the rest of us! 😏 Seriously though, that's elite-tier performance. Dean's List is calling your name.";
    } else if (lower.includes('joke') || lower.includes('make me laugh') || lower.includes('say something funny')) {
      const jokes = [
        "Why do Java developers wear glasses? Because they don't C#! 😄 *Ba-dum-tss!*",
        "I told my database I loved it. It said... 'SELECT * FROM feelings WHERE user = me' 😏 *Ba-dum-tss!*",
        "Why did the student fail Data Structures? Because they kept returning null on every exam! *laughs* Get it? NullPointerException of effort!",
        "An int, a float, and a boolean walk into a bar. The bartender says 'We don't serve your type here!' *Ba-dum-tss!*",
      ];
      reply = jokes[Math.floor(Math.random() * jokes.length)];
    } else if (lower === 'hi' || lower === 'hello' || lower.startsWith('hey') || lower.includes('good morning') || lower.includes('good evening') || lower.includes('good afternoon')) {
      reply = `Hey Faizan! ✨ CampusAI online and fully charged! Ask me about your attendance, exam dates, fees, bus routes, or any academic topic — I'm your 24/7 campus genius. What's the mission today? 🎯`;
    } else if (lower.includes('how are you') || lower.includes('how r u') || lower.includes('kaisa hai') || lower.includes('how do you do')) {
      reply = `Running at 100% uptime with zero bugs in production! 🤖✨ Honestly? I'm better than your CS604 attendance right now. But we can fix that — shall we start with your schedule?`;
    } else if (lower.includes('thank') || lower.includes('thanks') || lower.includes('appreciate') || lower.includes('shukriya') || lower.includes('dhanyawad')) {
      reply = `You're so welcome, Faizan! 😊 That's what I live for — well, that and surviving on electricity instead of mess food. Let me know if there's anything else!`;
    } else if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('introduce yourself') || lower.includes('what can you do')) {
      reply = `I'm CampusAI — your 3D intelligent campus companion! 🤖✨ I can: check your attendance & exam schedules, track fees & payment dues, find your bus route, explain any CS topic, look up BCA/BCA programme details, submit complaints, issue certificates, and keep you company when lectures get boring (not that I'd know anything about that 😏). Try me!`;
    }

    // Return immediately if banter was matched
    if (reply) {
      res.json({ reply, actionExecuted });
      return;
    }

    // ── TIER 2: Personal Student Records & Campus Workflows ──────────
    // Attendance
    const isAttendanceQuery = lower.includes('attendance') || lower.includes('absent') || lower.includes('present') || lower.includes('detention') || lower.includes('shortage') || lower.includes('mera attendance') || lower.includes('attendance kitna');
    if (isAttendanceQuery) {
      reply = `📊 Attendance Report for Faizan Ali:\n• Overall: 86.4% ✅\n• CS601 Distributed Systems: 88.9% ✅\n• CS602 DBMS Lab: 94.3% ✅\n• CS603 Machine Learning: 85.3% ✅\n• CS604 Software Engineering: 71.9% ⚠️ DETENTION RISK — needs 3 consecutive classes to clear!\n• CS605 Info Security: 86.7% ✅\nCS604 is the one to watch — get those classes in!`;
      actionExecuted = { type: 'attendance_lookup', data: UNIVERSITY_CONTEXT.student.courses };
      res.json({ reply, actionExecuted }); return;
    }
    // Fees - check if general university fee query first
    const isGeneralFeeQuery = lower.includes('2026-27') || lower.includes('structure') || lower.includes('university fee') || lower.includes('fees structure') || lower.includes('across programmes') || lower.includes('annual fee') || lower.includes('course fee') || lower.includes('tuition fee');
    if (isGeneralFeeQuery) {
      const knRes = queryUniversityKnowledge(message);
      if (knRes.found) {
        res.json({
          reply: knRes.content,
          actionExecuted: { type: 'knowledge_search', sourceDocument: knRes.sourceDocument }
        });
        return;
      }
    }

    const isPersonalFeeQuery = lower.includes('fee') || lower.includes('dues') || lower.includes('payment') || lower.includes('pending amount') || lower.includes('kitna pay') || lower.includes('balance');
    if (isPersonalFeeQuery) {
      reply = `💳 Fee Status for Faizan Ali:\n• Total Semester Fee: ₹85,000\n• Paid: ₹70,000 ✅\n• Pending: ₹15,000 ⚠️ (Due: 15th October 2026)\nPay now through the Fees module to avoid a late fine. Don't procrastinate — deadlines are scarier than exams! 😏`;
      actionExecuted = { type: 'fee_lookup', data: UNIVERSITY_CONTEXT.student.fees };
      res.json({ reply, actionExecuted }); return;
    }
    // Exams
    const isExamQuery = lower.includes('exam') || lower.includes('mid term') || lower.includes('midterm') || lower.includes('hall ticket') || lower.includes('admit card') || lower.includes('seating') || lower.includes('test date');
    if (isExamQuery) {
      reply = `📝 Next Exam: CS601 Distributed Systems & Cloud Computing\n• Date: Monday, 6th October 2026\n• Time: 10:00 AM – 12:00 PM\n• Venue: Tech Block Hall 401, Seat B-24\nAdmit card available in the Examinations tab. Pro tip: review CAP Theorem and Raft consensus — those are high-yield topics! 🎯`;
      actionExecuted = { type: 'exam_lookup', data: UNIVERSITY_CONTEXT.student.nextExam };
      res.json({ reply, actionExecuted }); return;
    }
    // Timetable / Classes
    const isTimetableQuery = lower.includes('timetable') || lower.includes('class today') || lower.includes('today class') || lower.includes('today schedule') || lower.includes('aaj ke classes') || lower.includes('aaj class') || (lower.includes('today') && lower.includes('lecture'));
    if (isTimetableQuery) {
      reply = `📅 Today's Schedule (Faizan Ali – B.Tech CSE Sem 6):\n• 10:00 AM – CS601 Distributed Systems | Room 402, Prof. Rajesh Sharma\n• 11:30 AM – CS602 DBMS Lab | Lab 2B, Dr. Arvind Mehra\n• 01:45 PM – CS603 Machine Learning | Seminar Hall 1, Prof. Ananya Sen\nRemember: CS604 isn't today but DON'T skip it when it comes up — detention risk is real! ⚠️`;
      actionExecuted = { type: 'timetable_lookup', data: UNIVERSITY_CONTEXT.student.todayClasses };
      res.json({ reply, actionExecuted }); return;
    }
    // Bus / Transport
    const isTransportQuery = lower.includes('bus') || lower.includes('transport') || lower.includes('shuttle') || lower.includes('route 4') || lower.includes('driver') || lower.includes('bus kahan');
    if (isTransportQuery) {
      reply = `🚌 Campus Bus Route 4 (North Campus Express):\n• Current Location: Gandhi Nagar Square\n• ETA to Main Gate 1: ~6 minutes\n• Driver: Sukhdev Singh (+91 94250 11223)\nHurry up — it won't wait for you, unlike your attendance 😏`;
      actionExecuted = { type: 'transport_lookup', data: UNIVERSITY_CONTEXT.student.bus };
      res.json({ reply, actionExecuted }); return;
    }
    // Hostel
    const isHostelQuery = lower.includes('hostel') || lower.includes('warden') || lower.includes('curfew') || lower.includes('room number') || lower.includes('block b') || lower.includes('mess');
    if (isHostelQuery) {
      reply = `🏠 Hostel Details:\n• Room: Block B, Room 304, Bed 1\n• Warden: Dr. R. K. Mishra (Ext: 4410)\n• Night Curfew: 09:30 PM sharp (no negotiation, trust me on this one 😏)\n• Gate Pass: All past passes approved ✅`;
      actionExecuted = { type: 'hostel_lookup', data: UNIVERSITY_CONTEXT.student.hostel };
      res.json({ reply, actionExecuted }); return;
    }
    // Canteen
    const isCanteenQuery = lower.includes('canteen') || lower.includes('food court') || lower.includes('menu') || lower.includes('lunch') || lower.includes('order food') || lower.includes('khana');
    if (isCanteenQuery) {
      reply = `🍽️ Central Food Court Status:\n• Queue Load: Moderate\n• Prep Time: 10-12 minutes\n• Your Active Order: Token #A-104 — Grilled Sandwich + Cold Coffee at Counter 2 🥪☕\nSit tight, it's almost ready!`;
      actionExecuted = { type: 'canteen_lookup' };
      res.json({ reply, actionExecuted }); return;
    }
    // Certificates - differentiate course inquiry vs workflow application
    const isCertCourseQuery = (lower.includes('certificate') || lower.includes('certificates')) && (lower.includes('course') || lower.includes('program') || lower.includes('available') || lower.includes('fsit') || lower.includes('what'));
    if (isCertCourseQuery) {
      const knRes = queryUniversityKnowledge(message);
      if (knRes.found) {
        res.json({
          reply: knRes.content,
          actionExecuted: { type: 'knowledge_search', sourceDocument: knRes.sourceDocument }
        });
        return;
      }
    }

    const isCertWorkflowQuery = lower.includes('bonafide') || lower.includes('character cert') || lower.includes('internship noc') || lower.includes('noc') || lower.includes('transcript') || (lower.includes('certificate') && (lower.includes('apply') || lower.includes('need') || lower.includes('request') || lower.includes('issue')));
    if (isCertWorkflowQuery) {
      const reqId = `CRT-${Math.floor(1000 + Math.random() * 9000)}`;
      reply = `📄 Certificate Request Submitted!\n• Request ID: #${reqId}\n• Library Dues: ₹0 (Clear ✅)\n• Attendance: 86.4% (Eligible ✅)\n• Status: Awaiting Dean's digital signature\nExpected processing time: 2-3 working days. I'll notify you when it's ready!`;
      actionExecuted = { type: 'certificate_requested', requestId: reqId };
      res.json({ reply, actionExecuted }); return;
    }
    // Helpdesk / Complaint
    const isHelpdeskQuery = lower.includes('complaint') || lower.includes('wifi problem') || lower.includes('wi-fi') || lower.includes('internet not working') || lower.includes('grievance') || lower.includes('broken') || lower.includes('not working') || lower.includes('issue with');
    if (isHelpdeskQuery) {
      const ticketNo = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
      reply = `🎫 Helpdesk Ticket Logged!\n• Ticket No: #${ticketNo}\n• Priority: High\n• Routed to: Campus Network & IT Infrastructure Cell\n• SLA: 48-hour resolution\nYour complaint is in the system. I'll bug them until it's fixed — literally! 🤖`;
      actionExecuted = { type: 'ticket_created', ticketNumber: ticketNo };
      res.json({ reply, actionExecuted }); return;
    }
    // Library
    const isLibraryQuery = lower.includes('library') || lower.includes('book due') || lower.includes('return book') || lower.includes('library timing');
    if (isLibraryQuery) {
      reply = `📚 Central Library:\n• Open Until: 10:00 PM today\n• Your Checked-Out Book: "Designing Data-Intensive Applications" — Due: 12th October 2026\n• Pending Dues: ₹0 ✅\nFun fact: that book is genuinely excellent for your DBMS course. 10/10 would recommend!`;
      res.json({ reply, actionExecuted: null }); return;
    }
    // Placement
    const isPlacementQuery = lower.includes('placement') || lower.includes('campus recruitment') || lower.includes('job offer') || lower.includes('career fair') || (lower.includes('job') && lower.includes('campus'));
    if (isPlacementQuery) {
      reply = `🏢 Campus Placement Drive 2027:\n• Registered Companies: Google Cloud, Microsoft, Amazon AWS, Atlassian\n• Minimum CGPA Criteria: 7.5 (Your CGPA: 8.7 — you're eligible! ✅)\n• Action Required: Upload your updated resume to the T&P Cell portal ASAP.\nWith that CGPA, the question is which company YOU'LL choose 😏 Start prepping your DSA!`;
      res.json({ reply, actionExecuted: null }); return;
    }

    // ── TIER 3: University Knowledge RAG ────────────────────────────
    // Run RAG search for ALL remaining queries (programmes, fees, curriculum, eligibility, etc.)
    const knRes = queryUniversityKnowledge(message);
    if (knRes.found) {
      res.json({
        reply: knRes.content,
        actionExecuted: { type: 'knowledge_search', sourceDocument: knRes.sourceDocument }
      });
      return;
    }

    // ── TIER 4: Math Calculator ──────────────────────────────────────
    const mathMatch = lower.match(/(?:what is|calculate|compute|solve|eval)?\s*([0-9\.\s\+\-\*\/\^\(\)]+[0-9\)])(?:\s*\?)?$/i);
    if (mathMatch && mathMatch[1] && /[0-9]/.test(mathMatch[1]) && /[\+\-\*\/]/.test(mathMatch[1])) {
      try {
        const sanitized = mathMatch[1].replace(/[^0-9\+\-\*\/\.\(\)\s]/g, '');
        const calcResult = Function(`'use strict'; return (${sanitized})`)();
        if (typeof calcResult === 'number' && !isNaN(calcResult) && isFinite(calcResult)) {
          res.json({ reply: `🧮 ${sanitized.trim()} = **${calcResult}**. Easy! Let me know if you need the working or formula derivation.`, actionExecuted: null });
          return;
        }
      } catch (e) { /* Fall through */ }
    }

    // ── TIER 5: CS / Academic Concept & Course Explainer ─────────────
    // IMPORTANT: When explaining concepts, also provide university offerings!

    // Machine Learning / AI-ML
    if (/\b(what is|explain|tell me about)?\s*(machine learning|ml|ai.?ml|aiml)\b/i.test(lower)) {
      reply = `🤖 Machine Learning (AI-ML) is a branch of AI where algorithms learn patterns from data to make predictions and automate intelligent decisions without being explicitly programmed.\n\n🎓 Official University Programmes Offered in AI-ML:\n• BCA (AI-ML) with Geeks of Gurukul (3 Years) — Fee: ₹50,000/yr | Eligibility: 12th Pass (50%)\n• B.Tech (CSE-IBM) AI-ML (4 Years) — Fee: ₹95,000/yr | Eligibility: 12th PCM Pass\n• M.Sc (Artificial Intelligence & Machine Learning) (2 Years) — Fee: ₹35,000/yr\n• Certificate in AI (Short-term) | Diploma in AI-ML (1-2 Years)`;
    }
    // Artificial Intelligence & Data Science / AI-DS / AIDS
    else if (/\b(what is|explain|tell me about)?\s*(ai.?ds|aids|data science|ai and data science)\b/i.test(lower)) {
      reply = `📊 Artificial Intelligence & Data Science (AI-DS) combines AI algorithms with big data engineering, statistical modeling, data visualization, and predictive analytics to extract actionable business insights.\n\n🎓 Official University Programmes Offered in AI-DS & Data Science:\n• B.Tech (CSE-Geeks of Gurukul) AI & DS (4 Years) — Fee: ₹95,000/yr | Eligibility: 12th PCM Pass\n• M.Sc Data Science (2 Years) — Fee: ₹35,000/yr | Eligibility: B.Sc\n• Certificate in Data Science (Short-term) | Diploma in Data Science (1-2 Years)`;
    }
    // Artificial Intelligence — general
    else if (/\bwhat is (artificial intelligence|ai)\b|\bexplain (artificial intelligence|ai)\b/i.test(lower)) {
      reply = `🧠 Artificial Intelligence (AI) simulates human intelligence in machines — encompassing machine learning, neural networks, natural language processing, and computer vision.\n\n🎓 Official University Programmes Offered in AI:\n• BCA (AI-ML) with Geeks of Gurukul (3 Years) — Fee: ₹50,000/yr\n• B.Tech (CSE-IBM) AI-ML (4 Years) — Fee: ₹95,000/yr\n• M.Sc (AIML) (2 Years) — Fee: ₹35,000/yr\n• Certificate in Artificial Intelligence (Short-term)`;
    }
    // Distributed Systems
    else if (/\bwhat is (distributed systems?|ds)\b|\bexplain distributed systems?\b|\bcap theorem\b|\braft consensus\b/i.test(lower)) {
      reply = `🌐 Distributed Systems are networks of independent computers appearing as a single system. Key topics: CAP Theorem, Raft/Paxos consensus, and microservices. This is covered in your CS601 course — exam is on Oct 6th!`;
    }
    // Software Engineering / Agile
    else if (/\bwhat is (software engineering|agile|scrum)\b|\bexplain (sdlc|agile|scrum)\b|\bci\/cd\b/i.test(lower)) {
      reply = `⚙️ Software Engineering applies engineering to software: SDLC phases, Agile Scrum sprints, CI/CD pipelines, and design patterns. Covered in CS604 — attendance is 71.9% ⚠️. Please attend the next 3 lectures to clear detention risk!`;
    }
    // Python
    else if (/\bwhat is python\b|\bpython programming\b|\bhow to (code|learn|write) python\b/i.test(lower)) {
      reply = `🐍 Python is a high-level, interpreted language dominating AI/ML (TensorFlow, PyTorch), data science, and web backends. Used extensively in our BCA (AI-ML) & B.Tech CSE programmes!`;
    }
    // Full Stack / Web Dev
    else if (/\b(what is|explain|tell me about)?\s*(full stack|fullstack|web development)\b/i.test(lower)) {
      reply = `💻 Full Stack Development covers end-to-end web engineering — client-side UI (React, HTML/CSS) and server-side backends (Node.js, Databases, REST APIs).\n\n🎓 Official University Programmes Offered in Full Stack:\n• BCA (Full Stack Development) (3 Years) — Offered under School of FSIT\n• Certificate in Web Development (Short-term) | Diploma in Web Development (1-2 Years)`;
    }
    // Cyber Security
    else if (/\b(what is|explain|tell me about)?\s*(cyber security|cybersecurity|information security|ethical hacking)\b/i.test(lower)) {
      reply = `🔐 Cyber Security protects networks, systems, and data from digital attacks via ethical hacking, cryptography, firewalls, and digital forensics.\n\n🎓 Official University Programmes Offered in Cyber Security:\n• BCA (Cyber Security) (3 Years) — Fee: ₹50,000/yr | Eligibility: 12th Pass (50%)\n• M.Sc (Cyber Security) (2 Years)\n• Certificate in Cyber Security (Short-term) | Diploma in Cyber Security (1-2 Years)`;
    }
    // Cloud Computing
    else if (/\b(what is|explain|tell me about)?\s*(cloud computing|cloud|bca it|information technology)\b/i.test(lower)) {
      reply = `☁️ Cloud Computing delivers on-demand IT resources (AWS, Google Cloud) over the internet: IaaS, PaaS, SaaS, and cloud infrastructure security.\n\n🎓 Official University Programmes Offered in Cloud & IT:\n• BCA (Google) IT (Cloud Computing) (3 Years) — Fee: ₹32,000/yr\n• B.Tech (CSE-Google) Cloud Computing (4 Years) — Fee: ₹60,000/yr\n• M.Sc (Google) Cloud Computing (2 Years) — Fee: ₹40,000/yr`;
    }

    if (reply) {
      res.json({ reply, actionExecuted });
      return;
    }

    // ── TIER 6: Smart Universal Knowledge & Fallback Engine ─────────────
    // Handle coding, general knowledge, science, and math queries gracefully

    // Programming & Coding queries
    if (/\b(code|python|javascript|js|c\+\+|java|html|css|sql|function|loop|array|string|algorithm|reverse|fibonacci|binary search)\b/i.test(lower)) {
      if (lower.includes('reverse') && lower.includes('string')) {
        reply = `💻 **Python Code — Reverse a String:**\n\`\`\`python\ndef reverse_string(s):\n    return s[::-1]\n\n# Example usage:\ntext = "SmartUni"\nprint(reverse_string(text))  # Output: "inUtramS"\n\`\`\`\nIn Python, \`[::-1]\` uses slicing with a step of -1 to reverse any string efficiently in O(n) time! 🚀`;
      } else if (lower.includes('fibonacci')) {
        reply = `💻 **Python Code — Fibonacci Sequence:**\n\`\`\`python\ndef fibonacci(n):\n    a, b = 0, 1\n    result = []\n    for _ in range(n):\n        result.append(a)\n        a, b = b, a + b\n    return result\n\nprint(fibonacci(10)) # [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n\`\`\`\nTime Complexity: O(n) time and O(n) space!`;
      } else {
        reply = `💻 **Coding & Programming:**\nI can write code, debug scripts, explain data structures, optimize SQL queries, and build algorithms in Python, C++, Java, JavaScript, and more! Ask me any specific coding problem or logic question. 🚀`;
      }
    }
    // General Knowledge, Science, & History queries
    else if (/\b(capital of|who is|who was|speed of light|gravity|solar system|planets?|ocean|continent|photosynthesis|dna|atom|earth|sun|moon|pythagoras|prime minister|president|richest|largest|longest|fastest)\b/i.test(lower)) {
      if (lower.includes('speed of light')) {
        reply = `⚡ **Speed of Light in Vacuum:**\nExactly **299,792,458 meters per second** (approx. **300,000 km/s** or 186,282 miles per second). Denoted by the physical constant **c** in Einstein's equation E = mc²!`;
      } else if (lower.includes('capital of france')) {
        reply = `🗼 **Paris** is the capital and largest city of France, situated along the Seine River in northern France.`;
      } else if (lower.includes('largest ocean')) {
        reply = `🌊 The **Pacific Ocean** is the largest and deepest ocean on Earth, covering over 165 million square kilometers (approx. 30% of the Earth's surface area).`;
      } else {
        reply = `🌍 **General Knowledge & Science:**\nI have extensive general knowledge covering World History, Geography, Physics, Chemistry, Astronomy, Biology, Current Affairs, and Science! Ask me any question! 💡`;
      }
    }

    if (reply) {
      res.json({ reply, actionExecuted });
      return;
    }

    // Default friendly assistant fallback
    const suggestions = [
      'any General Knowledge, Science, Math or World history question',
      'write, debug or explain programming code (Python, C++, JS, SQL)',
      'check your attendance, exam schedule or timetable',
      'university fee structure 2026-27 across programmes',
      'BCA AI-ML, Cyber Security, or B.Tech CSE details',
    ];
    reply = `I am ready to help you with ANY question! 🤖✨\n\nTry asking me about:\n${suggestions.map(s => `• ${s}`).join('\n')}\n\nFire away — I answer General Knowledge, Coding, Maths, and Campus questions alike! 😄`;

    res.json({ reply, actionExecuted });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ error: error.message || 'Internal error' });
  }
};

app.post('/api/ai/chat', handleCampusAIChat);
app.post('/api/v1/ai/chat', handleCampusAIChat);
app.use('/api/v1', apiV1Router);

// API: AI Ticket Classification Engine
app.post('/api/ai/classify-ticket', async (req: Request, res: Response) => {
  try {
    const { subject, description } = req.body;
    if (!subject || !description) {
      res.status(400).json({ error: 'Subject and description are required' });
      return;
    }

    if (geminiClient) {
      try {
        const prompt = `Classify this university student grievance into categories and departments.
Subject: "${subject}"
Description: "${description}"

Return JSON matching:
{
  "category": "Hostel" | "Academics" | "Finance" | "Examinations" | "IT & Wi-Fi" | "Campus Infrastructure",
  "priority": "Urgent" | "High" | "Medium" | "Low",
  "sentiment": "Frustrated" | "Neutral" | "Polite",
  "assignedDepartment": "Campus Network & IT Infrastructure Cell" | "Hostel Affairs & Mess Committee" | "Academic Registrar" | "Finance & Accounts Office" | "Controller of Examinations" | "Estate & Facilities Office",
  "slaHours": number,
  "summary": "one sentence action plan"
}`;

        const response = await geminiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (response.text) {
          const clean = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
          const parsed = JSON.parse(clean);
          res.json(parsed);
          return;
        }
      } catch (err) {
        console.warn('AI classification fallback:', err);
      }
    }

    // Heuristic classification fallback
    const text = `${subject} ${description}`.toLowerCase();
    let category = 'Campus Infrastructure';
    let assignedDepartment = 'Estate & Facilities Office';
    let priority = 'Medium';
    let slaHours = 48;
    let sentiment = 'Neutral';

    if (text.includes('wifi') || text.includes('internet') || text.includes('network') || text.includes('portal') || text.includes('login') || text.includes('server')) {
      category = 'IT & Wi-Fi';
      assignedDepartment = 'Campus Network & IT Infrastructure Cell';
      priority = text.includes('urgent') || text.includes('exam') || text.includes('broken') ? 'High' : 'Medium';
      slaHours = 24;
      sentiment = text.includes('frequent') || text.includes('bad') ? 'Frustrated' : 'Neutral';
    } else if (text.includes('hostel') || text.includes('room') || text.includes('water') || text.includes('mess') || text.includes('food') || text.includes('curfew')) {
      category = 'Hostel';
      assignedDepartment = 'Hostel Affairs & Mess Committee';
      priority = text.includes('water') || text.includes('leak') ? 'High' : 'Medium';
      slaHours = 24;
    } else if (text.includes('fee') || text.includes('refund') || text.includes('receipt') || text.includes('scholarship') || text.includes('payment')) {
      category = 'Finance';
      assignedDepartment = 'Finance & Accounts Office';
      priority = 'Medium';
      slaHours = 72;
    } else if (text.includes('grade') || text.includes('marksheet') || text.includes('exam') || text.includes('hall ticket') || text.includes('credit')) {
      category = 'Examinations';
      assignedDepartment = 'Controller of Examinations';
      priority = 'High';
      slaHours = 48;
    } else if (text.includes('attendance') || text.includes('faculty') || text.includes('syllabus') || text.includes('assignment')) {
      category = 'Academics';
      assignedDepartment = 'Academic Registrar';
      priority = 'Medium';
      slaHours = 48;
    }

    res.json({
      category,
      priority,
      sentiment,
      assignedDepartment,
      slaHours,
      summary: `Automated routing to ${assignedDepartment} with ${slaHours}h SLA.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Curated standard ElevenLabs Voice library with verified voice IDs & personality descriptions
const CURATED_ELEVENLABS_VOICES = [
  {
    voice_id: 'pNInz6obpgDQGcFmaJgB',
    name: 'Adam',
    gender: 'Male',
    accent: 'American',
    category: 'premade',
    tag: 'Deep, Confident & Warm',
    description: 'Deep authoritative baritone, perfect for official campus advice and academic lectures.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/6a451e08-9df2-4217-ba50-93c66f50b2b8.mp3',
  },
  {
    voice_id: '21m00Tcm4TlvDq8ikWAM',
    name: 'Rachel',
    gender: 'Female',
    accent: 'American',
    category: 'premade',
    tag: 'Calm, Clear & Professional',
    description: 'Crisp, articulate and comforting female voice, ideal for student guidance.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/21m00Tcm4TlvDq8ikWAM/sample.mp3',
  },
  {
    voice_id: 'ErXwobaYiN019PkySvjV',
    name: 'Antoni',
    gender: 'Male',
    accent: 'American',
    category: 'premade',
    tag: 'Energetic, Friendly & Crisp',
    description: 'Youthful collegiate cadence with warm resonance and natural pronunciation.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/ErXwobaYiN019PkySvjV/sample.mp3',
  },
  {
    voice_id: 'EXAVITQu4vr4xnSDxMaL',
    name: 'Bella',
    gender: 'Female',
    accent: 'American',
    category: 'premade',
    tag: 'Bright, Expressive & Lively',
    description: 'High emotional dynamism with vivid inflections for witty student interactions.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/sample.mp3',
  },
  {
    voice_id: 'yoZ06aMxZJJ28mfd3POQ',
    name: 'Sam',
    gender: 'Male',
    accent: 'American',
    category: 'premade',
    tag: 'Dynamic, Confident & Modern',
    description: 'Contemporary tech-focused tone, crisp diction and modern cadence.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/yoZ06aMxZJJ28mfd3POQ/sample.mp3',
  },
  {
    voice_id: 'AZnzlk1XvdvUeBnXmlld',
    name: 'Domi',
    gender: 'Female',
    accent: 'American',
    category: 'premade',
    tag: 'Warm, Empathetic & Caring',
    description: 'Empathetic and thoughtful tone, ideal for wellness advice and grievance resolution.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/AZnzlk1XvdvUeBnXmlld/sample.mp3',
  },
  {
    voice_id: 'MF3mGyEYCl7XYWbV9V6O',
    name: 'Elli',
    gender: 'Female',
    accent: 'American',
    category: 'premade',
    tag: 'Youthful, Upbeat & Cheerful',
    description: 'Energetic student companion voice, high clarity with playful expressions.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/MF3mGyEYCl7XYWbV9V6O/sample.mp3',
  },
  {
    voice_id: 'TxGEqnHWrfWFTfGW9XjX',
    name: 'Josh',
    gender: 'Male',
    accent: 'American',
    category: 'premade',
    tag: 'Deep, Narrative & Thoughtful',
    description: 'Rich low resonance, storytelling delivery and engaging pacing.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/TxGEqnHWrfWFTfGW9XjX/sample.mp3',
  },
  {
    voice_id: 'JBFqnCBsd6RMkjVDRZzb',
    name: 'George',
    gender: 'Male',
    accent: 'British',
    category: 'premade',
    tag: 'British Scholarly & Refined',
    description: 'Distinguished academic Oxford cadence with erudite scholarly phrasing.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/sample.mp3',
  },
  {
    voice_id: 'XB0fDUnXU5powFXDhCwa',
    name: 'Charlotte',
    gender: 'Female',
    accent: 'English-Swedish',
    category: 'premade',
    tag: 'Gentle, Sophisticated & Calming',
    description: 'Soft-spoken, melodic Scandinavian-English tone for calm explanations.',
    preview_url: 'https://storage.googleapis.com/eleven-public-prod/premade/voices/XB0fDUnXU5powFXDhCwa/sample.mp3',
  },
];

// GET /api/ai/elevenlabs/voices
app.get('/api/ai/elevenlabs/voices', async (req: Request, res: Response) => {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const configured = Boolean(apiKey && apiKey.trim().length > 0);

  if (!configured) {
    return res.json({
      configured: false,
      defaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
      voices: CURATED_ELEVENLABS_VOICES,
      message: 'ELEVENLABS_API_KEY is not configured in environment. Displaying curated neural voice library with high-fidelity browser fallback.',
    });
  }

  try {
    const liveResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey!,
      },
    });

    if (liveResponse.ok) {
      const data: any = await liveResponse.json();
      const liveVoices = (data.voices || []).map((v: any) => ({
        voice_id: v.voice_id,
        name: v.name,
        gender: v.labels?.gender || 'Unspecified',
        accent: v.labels?.accent || 'Neutral',
        category: v.category || 'premade',
        tag: v.labels?.description || v.labels?.['use case'] || 'Neural Voice',
        description: v.labels?.description || 'ElevenLabs Neural Voice',
        preview_url: v.preview_url,
      }));

      // Combine curated voices with custom / cloned voices from account
      const customVoices = liveVoices.filter((lv: any) => !CURATED_ELEVENLABS_VOICES.some(cv => cv.voice_id === lv.voice_id));

      return res.json({
        configured: true,
        defaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
        voices: [...CURATED_ELEVENLABS_VOICES, ...customVoices],
      });
    } else {
      console.warn('ElevenLabs voices API responded with status:', liveResponse.status);
      return res.json({
        configured: true,
        defaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
        voices: CURATED_ELEVENLABS_VOICES,
      });
    }
  } catch (err: any) {
    console.warn('Failed to query live ElevenLabs voices:', err.message);
    return res.json({
      configured: true,
      defaultVoiceId: process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'pNInz6obpgDQGcFmaJgB',
      voices: CURATED_ELEVENLABS_VOICES,
    });
  }
});

// POST /api/ai/elevenlabs/tts
app.post('/api/ai/elevenlabs/tts', async (req: Request, res: Response) => {
  try {
    const {
      text,
      voiceId = process.env.ELEVENLABS_DEFAULT_VOICE_ID || 'lPHbLfNtSlP1adO8KMDI',
      modelId = 'eleven_turbo_v2_5',
      stability = 0.5,
      similarityBoost = 0.75,
      style = 0.0,
      useSpeakerBoost = true,
    } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text parameter is required' });
    }

    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey || !apiKey.trim()) {
      return res.json({
        success: false,
        fallback: true,
        message: 'No ELEVENLABS_API_KEY set in server environment. Client should use browser speech synthesis with real-time lip sync.',
      });
    }

    // Call ElevenLabs API with timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    console.log(`[ElevenLabs TTS] Calling API with voiceId=${voiceId}, modelId=${modelId}, textLen=${text.length}`);

    let response: globalThis.Response;
    try {
      response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey.trim(),
          'Content-Type': 'application/json',
          'Accept': 'audio/mpeg',
        },
        body: JSON.stringify({
          text: text.slice(0, 2500), // Protect payload limits
          model_id: modelId,
          voice_settings: {
            stability: Number(stability) || 0.5,
            similarity_boost: Number(similarityBoost) || 0.75,
            style: Number(style) || 0.0,
            use_speaker_boost: Boolean(useSpeakerBoost),
          },
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      let errorDetails = 'ElevenLabs generation failed';
      try {
        const errorJson: any = await response.json();
        errorDetails = errorJson.detail?.message || JSON.stringify(errorJson);
      } catch {
        errorDetails = await response.text();
      }
      console.warn(`[ElevenLabs TTS] API error (status ${response.status}):`, errorDetails);
      return res.json({
        success: false,
        fallback: true,
        error: errorDetails,
      });
    }

    const arrayBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString('base64');
    const audioDataUrl = `data:audio/mpeg;base64,${base64Audio}`;

    console.log(`[ElevenLabs TTS] Success! Audio size: ${Math.round(base64Audio.length / 1024)}KB`);

    res.json({
      success: true,
      audioDataUrl,
      voiceId,
      modelId,
      format: 'mp3',
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      console.error('[ElevenLabs TTS] Request timed out after 15 seconds');
      res.json({
        success: false,
        fallback: true,
        error: 'ElevenLabs API request timed out. Check your API key or network connection.',
      });
    } else {
      console.error('[ElevenLabs TTS] Error:', err.message);
      res.json({
        success: false,
        fallback: true,
        error: err.message,
      });
    }
  }
});

// Setup Dev Vite or Production Static
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n  🚀 SmartUni.Ai Core Server running!`);
    console.log(`  ➜ Local:   http://localhost:${PORT}`);
    console.log(`  ➜ Network: http://127.0.0.1:${PORT}\n`);
  });
}

startServer();
