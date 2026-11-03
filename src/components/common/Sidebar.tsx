import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SmartUniLogo } from './SmartUniLogo';
import {
  LayoutDashboard,
  Home,
  Bot,
  ShieldCheck,
  Camera,
  BookOpen,
  Calendar,
  CreditCard,
  FileText,
  Utensils,
  UtensilsCrossed,
  ShoppingBag,
  Package,
  Clock,
  Wallet,
  History,
  LifeBuoy,
  Bus,
  Sparkles,
  Bell,
  User,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

interface NavSubItemDef {
  to: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeTone?: 'primary' | 'ai' | 'warning' | 'success';
}

interface NavItemDef {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeTone?: 'primary' | 'ai' | 'warning' | 'success';
  roleFilter?: string[];
  subItems?: NavSubItemDef[];
}

interface NavGroupDef {
  id: string;
  title: string;
  items: NavItemDef[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { currentRole, canteenOrders, notifications } = useApp();
  const shouldReduceMotion = useReducedMotion();
  const location = useLocation();
  const navigate = useNavigate();

  // Smart Canteen sub-sections expanded state (auto-expanded when on /canteen)
  const [isCanteenOpen, setIsCanteenOpen] = useState<boolean>(() => location.pathname.startsWith('/canteen'));

  useEffect(() => {
    if (location.pathname.startsWith('/canteen')) {
      setIsCanteenOpen(true);
    }
  }, [location.pathname]);

  // Persist collapsed state
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('smartuni_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const updateSidebarVar = (collapsed: boolean) => {
    const isLg = window.innerWidth >= 1024;
    document.documentElement.style.setProperty(
      '--sidebar-w',
      isLg ? (collapsed ? '76px' : '240px') : '0px'
    );
  };

  useEffect(() => {
    try {
      localStorage.setItem('smartuni_sidebar_collapsed', String(isCollapsed));
    } catch {
      // ignore storage errors
    }
    updateSidebarVar(isCollapsed);
  }, [isCollapsed]);

  // Set initial value on mount and keep in sync with window resize
  useEffect(() => {
    updateSidebarVar(isCollapsed);
    const onResize = () => updateSidebarVar(isCollapsed);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCollapsed]);

  const activeOrdersCount = canteenOrders.filter(
    (o) => o.status !== 'completed' && o.status !== 'cancelled'
  ).length;

  // Live canteen state for sidebar badges
  const [canteenCartCount, setCanteenCartCount] = useState<number>(() => {
    try {
      const c = localStorage.getItem('canteen_cart_v2');
      if (c) {
        const parsed = JSON.parse(c);
        return Object.values(parsed).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0);
      }
    } catch {}
    return 0;
  });

  const [canteenActiveOrdersCount, setCanteenActiveOrdersCount] = useState<number>(() => {
    try {
      const o = localStorage.getItem('canteen_orders_v2');
      if (o) {
        const parsed = JSON.parse(o);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: any) => item.orderStatus !== 'Cancelled' && item.orderStatus !== 'Delivered').length;
        }
      }
    } catch {}
    return activeOrdersCount;
  });

  useEffect(() => {
    const handleCanteenUpdate = () => {
      try {
        const c = localStorage.getItem('canteen_cart_v2');
        if (c) {
          const parsed = JSON.parse(c);
          setCanteenCartCount(Object.values(parsed).reduce((acc: number, val: any) => acc + (Number(val) || 0), 0));
        } else {
          setCanteenCartCount(0);
        }
      } catch {}

      try {
        const o = localStorage.getItem('canteen_orders_v2');
        if (o) {
          const parsed = JSON.parse(o);
          if (Array.isArray(parsed)) {
            setCanteenActiveOrdersCount(parsed.filter((item: any) => item.orderStatus !== 'Cancelled' && item.orderStatus !== 'Delivered').length);
          }
        }
      } catch {}
    };

    window.addEventListener('storage', handleCanteenUpdate);
    window.addEventListener('canteen_state_changed', handleCanteenUpdate);
    return () => {
      window.removeEventListener('storage', handleCanteenUpdate);
      window.removeEventListener('canteen_state_changed', handleCanteenUpdate);
    };
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  const groups: NavGroupDef[] = [
    {
      id: 'command',
      title: 'Command',
      items: [
        { to: '/', label: 'Command Center', icon: LayoutDashboard },
        { to: '/campus-ai', label: 'CampusAI 3D', icon: Bot, badge: 'Voice/3D', badgeTone: 'ai' },
      ],
    },
    {
      id: 'learn',
      title: 'Learn',
      items: [
        { to: '/attendance', label: 'Attendance', icon: ShieldCheck },
        { to: '/attendance/verify', label: 'SmartAttend AI', icon: Camera, badge: 'Live', badgeTone: 'success' },
        { to: '/academics', label: 'Academics', icon: BookOpen },
        { to: '/exams', label: 'Exams & Schedule', icon: Calendar },
      ],
    },
    {
      id: 'services',
      title: 'Services',
      items: [
        { to: '/fees', label: 'Fees & Finance', icon: CreditCard },
        { to: '/certificates', label: 'Certificates & QR', icon: FileText },
        {
          to: '/canteen',
          label: 'Smart Canteen',
          icon: Utensils,
          badge: canteenActiveOrdersCount > 0 ? `${canteenActiveOrdersCount}` : undefined,
          badgeTone: 'warning',
          subItems: [
            { to: '/canteen?tab=dashboard', label: 'Dashboard', icon: Home },
            { to: '/canteen?tab=menu', label: 'Menu', icon: UtensilsCrossed },
            {
              to: '/canteen?tab=cart',
              label: 'Cart',
              icon: ShoppingBag,
              badge: canteenCartCount > 0 ? `${canteenCartCount}` : undefined,
              badgeTone: 'warning',
            },
            {
              to: '/canteen?tab=orders',
              label: 'My Orders',
              icon: Clock,
              badge: canteenActiveOrdersCount > 0 ? `${canteenActiveOrdersCount}` : undefined,
              badgeTone: 'warning',
            },
            { to: '/canteen?tab=wallet', label: 'Canteen Wallet', icon: Wallet },
            { to: '/canteen?tab=history', label: 'History', icon: History },
          ],
        },
        { to: '/helpdesk', label: 'AI Helpdesk', icon: LifeBuoy },
        { to: '/transport-hostel', label: 'Transport & Hostel', icon: Bus },
      ],
    },
    {
      id: 'life',
      title: 'Life & Profile',
      items: [
        { to: '/campus-life', label: 'Campus Life', icon: Sparkles },
        { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount}` : undefined, badgeTone: 'primary' },
        { to: '/profile', label: 'Profile & Settings', icon: User },
      ],
    },
  ];

  // Faculty and Admin special groups
  if (['faculty', 'admin'].includes(currentRole)) {
    groups.push({
      id: 'faculty_tools',
      title: 'Faculty',
      items: [
        { to: '/faculty', label: 'Faculty Roster', icon: Users, roleFilter: ['faculty', 'admin'] },
      ],
    });
  }

  if (currentRole === 'admin') {
    groups.push({
      id: 'admin_tools',
      title: 'Administration',
      items: [
        { to: '/admin', label: 'Admin Analytics', icon: BarChart3, roleFilter: ['admin'] },
      ],
    });
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs lg:hidden"
        />
      )}

      <motion.aside
        animate={{ width: isCollapsed ? 76 : 240 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 lg:top-16 bottom-0 left-0 z-50 lg:z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800/80 p-2.5 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-4 overflow-y-auto max-h-full pr-0.5">
          {/* Mobile Header Branding */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 lg:hidden">
            <SmartUniLogo variant="full" showTagline={true} className="h-8 sm:h-8.5 w-auto max-w-[200px]" />
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Expand / Collapse Toggle */}
          <div className="hidden lg:flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
            {!isCollapsed && (
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 px-2">
                Navigation
              </span>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-auto"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>

          {/* Navigation Groups */}
          <div className="space-y-4">
            {groups.map((group) => (
              <div key={group.id} className="space-y-1">
                {!isCollapsed && (
                  <p className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {group.title}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const Icon = item.icon;

                    // Expandable main section with sub-sections (e.g. Smart Canteen)
                    if (item.subItems && item.subItems.length > 0) {
                      const isMainActive = location.pathname.startsWith(item.to);

                      return (
                        <div key={item.to} className="space-y-0.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              if (isCollapsed) {
                                setIsCollapsed(false);
                                setIsCanteenOpen(true);
                                navigate(item.to);
                                return;
                              }
                              setIsCanteenOpen((prev) => !prev);
                              if (location.pathname !== item.to) {
                                navigate(item.to);
                              }
                            }}
                            title={isCollapsed ? item.label : undefined}
                            aria-expanded={isCanteenOpen}
                            className={cn(
                              'group relative flex items-center justify-between w-full gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-all duration-150 text-left select-none',
                              isMainActive
                                ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                            )}
                          >
                            {/* Active Route Pill Indicator */}
                            {isMainActive && (
                              <motion.span
                                layoutId="activeNavIndicator"
                                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                              />
                            )}

                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={cn(
                                  'w-4 h-4 shrink-0 transition-colors',
                                  isMainActive
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                                )}
                              />
                              {!isCollapsed && (
                                <span className="truncate">{item.label}</span>
                              )}
                            </div>

                            {!isCollapsed && (
                              <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                                {item.badge && (
                                  <span
                                    className={cn(
                                      'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold shrink-0',
                                      item.badgeTone === 'warning'
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                                <ChevronDown
                                  className={cn(
                                    'w-3.5 h-3.5 transition-transform duration-200',
                                    isCanteenOpen
                                      ? 'rotate-180 text-indigo-600 dark:text-indigo-400'
                                      : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                  )}
                                />
                              </div>
                            )}
                          </button>

                          {/* Smoothly Animated Sub-sections */}
                          <AnimatePresence initial={false}>
                            {isCanteenOpen && !isCollapsed && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{
                                  height: 'auto',
                                  opacity: 1,
                                  transition: {
                                    height: { duration: shouldReduceMotion ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: shouldReduceMotion ? 0.01 : 0.2, delay: shouldReduceMotion ? 0 : 0.03 },
                                  },
                                }}
                                exit={{
                                  height: 0,
                                  opacity: 0,
                                  transition: {
                                    height: { duration: shouldReduceMotion ? 0.01 : 0.2, ease: [0.16, 1, 0.3, 1] },
                                    opacity: { duration: shouldReduceMotion ? 0.01 : 0.15 },
                                  },
                                }}
                                className="overflow-hidden ml-3.5 pl-3 py-0.5 space-y-0.5 border-l border-slate-200 dark:border-slate-800"
                              >
                                {item.subItems.map((subItem) => {
                                  const SubIcon = subItem.icon;
                                  const searchParams = new URLSearchParams(location.search);
                                  const currentTab = searchParams.get('tab') || 'dashboard';
                                  const subItemTab = subItem.to.includes('?tab=')
                                    ? subItem.to.split('?tab=')[1]
                                    : 'dashboard';
                                  const isSubActive =
                                    location.pathname === '/canteen' &&
                                    (currentTab === subItemTab || (currentTab === 'my-orders' && subItemTab === 'orders'));

                                  return (
                                    <NavLink
                                      key={subItem.label}
                                      to={subItem.to}
                                      onClick={() => {
                                        if (window.innerWidth < 1024 && onClose) onClose();
                                      }}
                                      className={cn(
                                        'group relative flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-150',
                                        isSubActive
                                          ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/80 dark:bg-indigo-950/40 shadow-2xs'
                                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                                      )}
                                    >
                                      {SubIcon && (
                                        <SubIcon
                                          className={cn(
                                            'w-3.5 h-3.5 shrink-0 transition-colors',
                                            isSubActive
                                              ? 'text-indigo-600 dark:text-indigo-400'
                                              : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                                          )}
                                        />
                                      )}
                                      <span className="truncate flex-1">{subItem.label}</span>
                                      {subItem.badge && (
                                        <span
                                          className={cn(
                                            'text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1 shrink-0',
                                            subItem.badgeTone === 'warning'
                                              ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                              : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                          )}
                                        >
                                          {subItem.badge}
                                        </span>
                                      )}
                                    </NavLink>
                                  );
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    }

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/'}
                        onClick={() => {
                          if (window.innerWidth < 1024 && onClose) onClose();
                        }}
                        title={isCollapsed ? item.label : undefined}
                        className={({ isActive }) =>
                          cn(
                            'group relative flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all duration-150',
                            isActive
                              ? 'text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                          )
                        }
                      >
                        {({ isActive }) => (
                          <>
                            {/* Active Route Pill Indicator */}
                            {isActive && (
                              <motion.span
                                layoutId="activeNavIndicator"
                                className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-indigo-600 dark:bg-indigo-400"
                                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                              />
                            )}

                            <Icon
                              className={cn(
                                'w-4 h-4 shrink-0 transition-colors',
                                isActive
                                  ? 'text-indigo-600 dark:text-indigo-400'
                                  : 'text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                              )}
                            />

                            {!isCollapsed && (
                              <div className="flex-1 flex items-center justify-between truncate">
                                <span className="truncate">{item.label}</span>
                                {item.badge && (
                                  <span
                                    className={cn(
                                      'text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ml-1.5 shrink-0',
                                      item.badgeTone === 'ai'
                                        ? 'bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300'
                                        : item.badgeTone === 'warning'
                                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                        : item.badgeTone === 'success'
                                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                                    )}
                                  >
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Version Indicator */}
        <div className="hidden lg:flex items-center justify-center pt-2 border-t border-slate-100 dark:border-slate-800/80">
          {!isCollapsed && (
            <span className="text-[11px] text-slate-400 font-mono px-2">
              v2.6 Core
            </span>
          )}
        </div>
      </motion.aside>
    </>
  );
};
