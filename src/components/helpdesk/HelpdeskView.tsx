import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { HelpdeskTicket } from '../../types';
import {
  LifeBuoy,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building,
  Filter,
  Send,
  ArrowUpRight,
  ShieldAlert,
  Search,
  MessageSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const HelpdeskView: React.FC = () => {
  const {
    currentUser,
    currentRole,
    helpdeskTickets,
    createHelpdeskTicket,
    resolveHelpdeskTicket
  } = useApp();

  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiClassificationResult, setAiClassificationResult] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Resolution modal state
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('Issue investigated on site. Replaced faulty hardware switch.');

  // Pre-test AI classification when user finishes typing description
  const runAIAnalysis = async () => {
    if (!subject.trim() || !description.trim()) return;
    setIsAnalyzingAI(true);
    try {
      const res = await fetch('/api/ai/classify-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, description }),
      });
      const data = await res.json();
      setAiClassificationResult(data);
    } catch (err) {
      console.warn('AI ticket error:', err);
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;

    let classification = aiClassificationResult;
    if (!classification) {
      setIsAnalyzingAI(true);
      try {
        const res = await fetch('/api/ai/classify-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, description }),
        });
        classification = await res.json();
      } catch (err) {
        console.warn('Auto classification error:', err);
      } finally {
        setIsAnalyzingAI(false);
      }
    }

    let cat = classification?.category || 'Campus Infrastructure';
    let priority = classification?.priority || 'Medium';
    let dept = classification?.assignedDepartment || 'Estate & Facilities Office';
    let sentiment = classification?.sentiment || 'Neutral';
    let slaHours = classification?.slaHours || 48;

    const deadline = new Date(Date.now() + slaHours * 3600 * 1000).toLocaleString([], {
      dateStyle: 'short',
      timeStyle: 'short',
    });

    createHelpdeskTicket({
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber || '0827CS221045',
      subject,
      description,
      category: cat,
      priority,
      aiSentiment: sentiment,
      assignedDepartment: dept,
      slaDeadline: deadline,
    });

    setSubject('');
    setDescription('');
    setAiClassificationResult(null);
    setIsNewTicketOpen(false);

    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#38bdf8'],
      });
    } catch (e) {
      // ignore
    }
  };

  const handleResolve = (ticketId: string) => {
    resolveHelpdeskTicket(ticketId, resolutionNotes);
    setResolvingTicketId(null);
  };

  const filteredTickets = helpdeskTickets.filter(t => {
    const matchesCat = filterCategory === 'All' || t.category === filterCategory;
    const matchesSearch =
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assignedDepartment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-2">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                Smart Grievance Engine
              </span>
              <span className="text-xs text-sky-400 font-medium flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                Gemini 3.8 Automated Triage & SLA Routing
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white tracking-tight">
              Campus Helpdesk & Grievance Redressal
            </h1>
            <p className="text-sm text-slate-300 mt-1">
              Complaint &rarr; AI Classification &rarr; Department &rarr; SLA Resolution. Transparent tracking for students and administration.
            </p>
          </div>

          <button
            onClick={() => setIsNewTicketOpen(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            File New Campus Grievance
          </button>
        </div>
      </div>

      {/* SLA Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: 'Active Grievances', val: helpdeskTickets.filter(t => t.status !== 'resolved').length, color: 'text-amber-400' },
          { label: 'Resolved Tickets', val: helpdeskTickets.filter(t => t.status === 'resolved').length, color: 'text-emerald-400' },
          { label: 'Average Resolution SLA', val: '24.2 Hours', color: 'text-sky-400' },
          { label: 'AI Triage Accuracy', val: '98.5%', color: 'text-indigo-400' },
        ].map((metric, i) => (
          <div key={i} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
            <p className="text-xs text-slate-400">{metric.label}</p>
            <p className={`text-xl font-extrabold mt-1 font-mono ${metric.color}`}>{metric.val}</p>
          </div>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-4 rounded-2xl">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets, IDs, or departments..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {['All', 'IT & Wi-Fi', 'Examinations', 'Hostel', 'Academics', 'Finance'].map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.map(ticket => (
          <div
            key={ticket.id}
            className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-4 transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-900/40">
                    {ticket.ticketNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                    {ticket.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      ticket.priority === 'Urgent'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : ticket.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    Priority: {ticket.priority}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-1.5">{ticket.subject}</h3>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider self-start sm:self-auto ${
                  ticket.status === 'resolved'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : ticket.status === 'in_progress'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 animate-pulse'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {ticket.status === 'resolved' ? 'Resolved' : ticket.status === 'in_progress' ? 'In Progress' : 'Open / Dispatched'}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
              {ticket.description}
            </p>

            {/* AI Triage Details & SLA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <p className="text-slate-500 text-[10px]">Assigned Department</p>
                <p className="text-slate-200 font-semibold mt-0.5">{ticket.assignedDepartment}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">AI Sentiment Detected</p>
                <p className="text-indigo-300 font-semibold mt-0.5">{ticket.aiSentiment || 'Neutral'}</p>
              </div>
              <div>
                <p className="text-slate-500 text-[10px]">SLA Resolution Target</p>
                <p className="text-amber-400 font-semibold font-mono mt-0.5">{ticket.slaDeadline}</p>
              </div>
            </div>

            {/* Resolution notes if resolved */}
            {ticket.resolutionNotes && (
              <div className="bg-emerald-950/30 border border-emerald-800/40 p-3 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  Resolution Recorded ({ticket.resolvedAt || 'Completed'})
                </div>
                <p className="text-slate-300">{ticket.resolutionNotes}</p>
              </div>
            )}

            {/* Admin / Staff Action */}
            {currentRole === 'admin' && ticket.status !== 'resolved' && (
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setResolvingTicketId(ticket.id)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Resolve Grievance as Administrator
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* CREATE NEW GRIEVANCE MODAL */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-400" />
                Lodge Student Grievance / Complaint
              </h3>
              <button
                onClick={() => setIsNewTicketOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Subject / Short Summary:</label>
                <input
                  type="text"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Hostel Block B 3rd Floor Wi-Fi disconnect issue"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-slate-300 font-semibold">Detailed Description:</label>
                  <button
                    type="button"
                    onClick={runAIAnalysis}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    Auto-Classify with AI
                  </button>
                </div>
                <textarea
                  rows={4}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onBlur={runAIAnalysis}
                  placeholder="Describe your grievance clearly. Gemini AI will analyze urgency, department, and SLA..."
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                />
              </div>

              {/* AI Auto-Triage Feedback Card */}
              {isAnalyzingAI ? (
                <div className="bg-slate-950 p-3 rounded-xl border border-indigo-500/30 text-indigo-300 text-xs flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
                  Gemini AI classifying problem category and calculating department SLA...
                </div>
              ) : aiClassificationResult ? (
                <div className="bg-indigo-950/40 border border-indigo-800/50 p-3 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    AI Auto-Triage Prediction:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>Category: <strong className="text-white">{aiClassificationResult.category}</strong></div>
                    <div>Priority: <strong className="text-amber-400">{aiClassificationResult.priority}</strong></div>
                    <div>Department: <strong className="text-white">{aiClassificationResult.assignedDepartment}</strong></div>
                    <div>SLA Target: <strong className="text-emerald-400">{aiClassificationResult.slaHours} Hours</strong></div>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 text-white font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLVE TICKET MODAL (ADMIN) */}
      {resolvingTicketId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resolve Grievance
            </h3>
            <p className="text-xs text-slate-400">
              Provide resolution remarks for the student before marking this ticket resolved.
            </p>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={e => setResolutionNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setResolvingTicketId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleResolve(resolvingTicketId)}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
