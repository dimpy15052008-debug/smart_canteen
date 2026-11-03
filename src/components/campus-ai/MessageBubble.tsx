/**
 * MessageBubble — single animated chat message.
 *
 * Features:
 *  • Spring entrance (y 12 → 0, scale .98 → 1)
 *  • Assistant message: copy button with pathLength checkmark, Listen & Animate
 *  • Suggested follow-up chips that send on tap
 *  • Rich action cards (attendance, fee, exam, ticket, certificate)
 *  • aria-live polite on assistant messages for screen readers
 */
import React, { memo, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Copy, Check, User, Zap, CheckCircle2 } from 'lucide-react';
import { MotionButton } from './MotionButton';
import { messageBubble, popIn } from './motion';

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

interface MessageBubbleProps {
  msg: ChatMessage;
  copiedMsgId: string | null;
  onCopy: (text: string, id: string) => void;
  onSpeak: (text: string) => void;
  onSendFollowUp: (prompt: string) => void;
  onNavigateFees: () => void;
  onNavigateAcademics: () => void;
}

export const MessageBubble = memo(function MessageBubble({
  msg,
  copiedMsgId,
  onCopy,
  onSpeak,
  onSendFollowUp,
  onNavigateFees,
  onNavigateAcademics,
}: MessageBubbleProps) {
  const isCopied = copiedMsgId === msg.id;
  const isAssistant = msg.sender === 'assistant';

  return (
    <motion.div
      variants={messageBubble}
      initial="hidden"
      animate="show"
      layout
      className={`flex gap-3 text-sm ${isAssistant ? 'justify-start' : 'justify-end'}`}
      aria-live={isAssistant ? 'polite' : undefined}
    >
      {/* Assistant avatar */}
      {isAssistant && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 border border-indigo-400/40 flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-md">
          🤖
        </div>
      )}

      <div
        className={`max-w-[88%] rounded-2xl p-4 shadow-sm transition-shadow ${
          isAssistant
            ? 'bg-slate-100/90 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-sm'
            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
        }`}
      >
        {/* Assistant header */}
        {isAssistant && (
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60 dark:border-slate-700/50 text-[11px] text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-700 dark:text-slate-300">CampusAI</span>
              {msg.emotionBadge && (
                <>
                  <span className="text-slate-400">·</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium truncate max-w-[160px]">
                    {msg.emotionBadge}
                  </span>
                </>
              )}
            </div>
            <span className="shrink-0">{msg.timestamp}</span>
          </div>
        )}

        {/* Message body */}
        <div className="leading-relaxed whitespace-pre-wrap text-sm">{msg.text}</div>

        {/* Rich action previews */}
        {msg.actionExecuted && (
          <div className="mt-3 pt-3 border-t border-slate-200/70 dark:border-slate-700/60 flex flex-col gap-2">
            {msg.actionExecuted.type === 'attendance_lookup' && (
              <div className="bg-white/90 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Course Breakdown:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">Overall 86.4%</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  {msg.actionExecuted.data.map((c: any) => (
                    <div key={c.code} className="flex justify-between items-center py-0.5">
                      <span className="text-slate-600 dark:text-slate-300">{c.code} - {c.name}</span>
                      <span className={c.status?.includes('RISK') ? 'text-rose-500 font-bold' : 'text-slate-600 dark:text-slate-300'}>
                        {c.attendance}
                      </span>
                    </div>
                  ))}
                </div>
                <MotionButton
                  onClick={onNavigateAcademics}
                  className="mt-1 w-full text-center text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/40"
                >
                  View Full Academic Timetable →
                </MotionButton>
              </div>
            )}

            {msg.actionExecuted.type === 'fee_lookup' && (
              <div className="bg-white/90 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Outstanding Balance</p>
                  <p className="text-lg font-bold text-amber-500 dark:text-amber-400">₹15,000</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Due 15 Oct 2026</p>
                </div>
                <MotionButton
                  onClick={onNavigateFees}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm"
                >
                  Pay Dues Now
                </MotionButton>
              </div>
            )}

            {msg.actionExecuted.type === 'exam_lookup' && (
              <div className="bg-white/90 dark:bg-slate-950/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs space-y-1">
                <p className="font-semibold text-indigo-600 dark:text-indigo-300">CS601: Distributed Systems Mid-Term</p>
                <p className="text-slate-600 dark:text-slate-300">Date: Monday, Oct 6th • 10:00 AM - 12:00 PM</p>
                <p className="text-slate-500 dark:text-slate-400">Hall: Tech Block 401 • Seat: B-24</p>
              </div>
            )}

            {msg.actionExecuted.type === 'ticket_created' && (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Grievance Ticket #{msg.actionExecuted.ticketNumber} Logged
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">Routed to department with 48h SLA.</p>
                </div>
              </div>
            )}

            {msg.actionExecuted.type === 'certificate_requested' && (
              <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-sky-500 dark:text-sky-400 shrink-0" />
                <div>
                  <p className="font-semibold text-sky-700 dark:text-sky-300">
                    Application #{msg.actionExecuted.requestId} Received
                  </p>
                  <p className="text-slate-600 dark:text-slate-300">Pending Dean's digital signature.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Follow-up chips */}
        {isAssistant && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/50 dark:border-slate-700/50 flex flex-wrap gap-1.5">
            <span className="text-[10px] text-slate-400 flex items-center gap-1 w-full">
              <Zap className="w-3 h-3 text-indigo-500" />
              Next questions:
            </span>
            {msg.suggestedFollowUps.map((fu, idx) => (
              <MotionButton
                key={idx}
                onClick={() => onSendFollowUp(fu)}
                className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 text-[11px] font-medium transition-all"
              >
                {fu} →
              </MotionButton>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="mt-2.5 pt-2 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[11px]">
          {isAssistant ? (
            <div className="flex items-center gap-3">
              <MotionButton
                onClick={() => onSpeak(msg.text)}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
                aria-label="Listen and animate"
              >
                <Volume2 className="w-3.5 h-3.5" />
                Listen & Animate
              </MotionButton>
              <MotionButton
                onClick={() => onCopy(msg.text, msg.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 transition-colors"
                aria-label={isCopied ? 'Copied!' : 'Copy response'}
                title={isCopied ? 'Copied!' : 'Copy response'}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isCopied ? (
                    <motion.span
                      key="copied"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="flex items-center gap-1 text-emerald-500"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copied</span>
                    </motion.span>
                  ) : (
                    <motion.span
                      key="copy"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.7 }}
                      className="flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[10px]">Copy</span>
                    </motion.span>
                  )}
                </AnimatePresence>
              </MotionButton>
            </div>
          ) : (
            <span className="text-[10px] text-indigo-200">{msg.timestamp}</span>
          )}
        </div>
      </div>

      {/* User avatar */}
      {!isAssistant && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-md">
          <User className="w-4 h-4" />
        </div>
      )}
    </motion.div>
  );
});
