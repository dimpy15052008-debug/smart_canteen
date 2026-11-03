/**
 * RouteTransition — shared enter-only page transition for Faculty, Admin, Canteen.
 * (Student keeps its existing AnimatePresence mode="wait" in App.tsx.)
 *
 * Enter-only rationale:
 *  - mode="wait" pauses new route render until exit finishes — causes flicker
 *    with React Router <Outlet/> patterns where the new component mounts first.
 *  - Enter-only means the user sees content immediately and the fade confirms
 *    where they landed, without blocking interaction.
 *
 * Keys by the first 3 path segments so tab changes inside a page
 * (e.g. /faculty/attendance → /faculty/performance) get a fresh enter,
 * but query-param changes do not.
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { DUR, EASE_OUT } from '../../lib/motion';

export const RouteTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { pathname } = useLocation();
  const reduce = useReducedMotion();

  // Key by first 3 segments: /faculty/attendance/session → /faculty/attendance/session
  const key = pathname.split('/').slice(0, 4).join('/');

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: DUR.surface, ease: EASE_OUT }}
      style={{ width: '100%' }}
    >
      {children}
    </motion.div>
  );
};
