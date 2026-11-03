/**
 * ChatList — the scrollable message list.
 *
 * Features:
 *  • AnimatePresence on all messages (spring entrance)
 *  • Animated thinking indicator (3 bouncing dots)
 *  • Auto-scroll to latest (smooth)
 *  • "Jump to latest" floating button when user scrolls up
 *  • EmptyState shown when only the intro message exists
 */
import React, { memo, useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { EmptyState } from './EmptyState';
import { popIn } from './motion';

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

interface ChatListProps {
  messages: ChatMessage[];
  isThinking: boolean;
  copiedMsgId: string | null;
  userName: string;
  onCopy: (text: string, id: string) => void;
  onSpeak: (text: string) => void;
  onSend: (prompt: string) => void;
  onNavigateFees: () => void;
  onNavigateAcademics: () => void;
}

export const ChatList = memo(function ChatList({
  messages,
  isThinking,
  copiedMsgId,
  userName,
  onCopy,
  onSpeak,
  onSend,
  onNavigateFees,
  onNavigateAcademics,
}: ChatListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const endRef    = useRef<HTMLDivElement>(null);
  const [showJump, setShowJump] = useState(false);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    if (!showJump) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isThinking, showJump]);

  // Show "jump to latest" when scrolled up
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowJump(distFromBottom > 120);
  }, []);

  const jumpToBottom = useCallback(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowJump(false);
  }, []);

  const isEmpty = messages.length <= 1;

  return (
    <div className="relative flex-1 min-h-0">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto pr-1 py-4 space-y-4"
      >
        {/* Empty state */}
        <AnimatePresence>
          {isEmpty && (
            <EmptyState onSend={onSend} userName={userName} />
          )}
        </AnimatePresence>

        {/* Messages */}
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              copiedMsgId={copiedMsgId}
              onCopy={onCopy}
              onSpeak={onSpeak}
              onSendFollowUp={onSend}
              onNavigateFees={onNavigateFees}
              onNavigateAcademics={onNavigateAcademics}
            />
          ))}
        </AnimatePresence>

        {/* Thinking indicator */}
        <AnimatePresence>
          {isThinking && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex gap-3 text-sm items-center"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0">
                🤖
              </div>
              <div className="bg-slate-100/90 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-3 border border-slate-200/80 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5" aria-label="CampusAI is thinking">
                  {[0, 0.18, 0.36].map(delay => (
                    <motion.span
                      key={delay}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay }}
                      className="w-2 h-2 rounded-full bg-indigo-500 block"
                    />
                  ))}
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                  CampusAI is analyzing…
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={endRef} />
      </div>

      {/* Jump to latest button */}
      <AnimatePresence>
        {showJump && (
          <motion.button
            variants={popIn}
            initial="hidden"
            animate="show"
            exit="exit"
            onClick={jumpToBottom}
            className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-colors"
            aria-label="Jump to latest message"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            Latest
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
