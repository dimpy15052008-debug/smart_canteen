import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Bot,
  ShieldCheck,
  Utensils,
  Menu
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MobileBottomBarProps {
  onOpenSidebar: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ onOpenSidebar }) => {
  const navItems = [
    { to: '/', label: 'Command', icon: LayoutDashboard },
    { to: '/campus-ai', label: 'CampusAI', icon: Bot, isAi: true },
    { to: '/attendance', label: 'Attendance', icon: ShieldCheck },
    { to: '/canteen', label: 'Canteen', icon: Utensils },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg"
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-150 min-w-[56px]',
                isActive
                  ? item.isAi
                    ? 'text-violet-600 dark:text-violet-400 font-bold'
                    : 'text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              )
            }
          >
            {({ isActive }) => (
              <>
                <div
                  className={cn(
                    'p-1 rounded-lg transition-transform',
                    isActive && (item.isAi ? 'bg-violet-50 dark:bg-violet-950/50 scale-105' : 'bg-indigo-50 dark:bg-indigo-950/50 scale-105')
                  )}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight font-medium">
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center py-1 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors min-w-[56px]"
        aria-label="Open Full Navigation Menu"
      >
        <div className="p-1">
          <Menu className="w-5 h-5" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight font-medium">
          More
        </span>
      </button>
    </nav>
  );
};
