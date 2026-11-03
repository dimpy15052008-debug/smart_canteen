import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import {
  Bell,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Camera,
  Utensils,
  BookOpen,
  Calendar,
  FileText,
  LifeBuoy
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const { notifications, markNotificationRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread' | 'attendance' | 'exam' | 'canteen'>('all');

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'attendance') return n.type === 'attendance';
    if (filter === 'exam') return n.type === 'exam';
    if (filter === 'canteen') return n.type === 'canteen';
    return true;
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'attendance':
        return <Camera className="w-4 h-4 text-emerald-600" />;
      case 'exam':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      case 'canteen':
        return <Utensils className="w-4 h-4 text-amber-600" />;
      case 'certificate':
        return <FileText className="w-4 h-4 text-sky-600" />;
      case 'helpdesk':
        return <LifeBuoy className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Notification Center"
        subtitle="Real-time academic alerts, exam notifications, bus telemetry, and canteen status."
        action={
          <Button
            size="sm"
            variant="outline"
            onClick={() => notifications.forEach((n) => markNotificationRead(n.id))}
          >
            Mark all as read
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto">
        {(['all', 'unread', 'attendance', 'exam', 'canteen'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors shrink-0 ${
              filter === tab
                ? 'bg-indigo-600 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-6 h-6" />}
          title="All caught up!"
          description="There are no notifications matching your current filter."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <Card
              key={item.id}
              surface="base"
              onClick={() => {
                markNotificationRead(item.id);
                if (item.actionLink) navigate(item.actionLink);
              }}
              className={`p-4 transition-all hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer ${
                !item.read ? 'border-l-4 border-l-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/10' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                    {getIconForType(item.type)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                      {item.message}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
                      <span>{item.timestamp}</span>
                      <span className="capitalize">• {item.type}</span>
                    </div>
                  </div>
                </div>

                {item.actionLink && (
                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 self-center" />
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
