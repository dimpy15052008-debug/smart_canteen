import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { MotionConfig } from 'framer-motion';
import App from './App.tsx';
import './index.css';

/**
 * Pause all looping CSS animations while the browser tab is hidden.
 * This saves GPU/CPU and respects the "at most 3 loops visible" budget.
 */
const syncHiddenAttr = () => {
  document.documentElement.dataset.hidden = document.hidden ? 'true' : 'false';
};
syncHiddenAttr();
document.addEventListener('visibilitychange', syncHiddenAttr);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* reducedMotion="user" makes every framer animation obey the OS setting automatically */}
    <MotionConfig reducedMotion="user">
      <App />
    </MotionConfig>
  </StrictMode>,
);
