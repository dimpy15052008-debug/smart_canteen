import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Header } from '../components/common/Header';
import { Sidebar } from '../components/common/Sidebar';
import { MobileBottomBar } from '../components/common/MobileBottomBar';
import { JudgeTourModal } from '../components/common/JudgeTourModal';
import { useMotionPreset } from '../hooks/useMotionPreset';

export const StudentLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { pageTransition } = useMotionPreset();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500 selection:text-white transition-colors duration-200">
      {/* Header Bar */}
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex pt-16 pb-16 md:pb-0">
        {/* Navigation Sidebar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageTransition as any}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileBottomBar onOpenSidebar={() => setSidebarOpen(true)} />

      {/* Guided Judge Tour Modal */}
      <JudgeTourModal />
    </div>
  );
};
