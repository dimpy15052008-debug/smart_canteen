import React, { useState } from 'react';
import { PageHeader } from '../ui/PageHeader';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import {
  Calendar,
  Users,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  Share2
} from 'lucide-react';

interface CampusEvent {
  id: string;
  title: string;
  category: 'Hackathon' | 'Cultural' | 'Technical' | 'Sports' | 'Workshop';
  date: string;
  time: string;
  venue: string;
  organizer: string;
  spotsLeft: number;
  description: string;
  isRegistered?: boolean;
}

export const CampusLifeView: React.FC = () => {
  const [registeredIds, setRegisteredIds] = useState<string[]>(['ev-1']);

  const events: CampusEvent[] = [
    {
      id: 'ev-1',
      title: 'MPOnline Innovate 2026: Smart Campus Hackathon',
      category: 'Hackathon',
      date: 'Oct 10 - 12, 2026',
      time: '09:00 AM onwards',
      venue: 'Main Auditorium & Innovation Lab',
      organizer: 'Centre for Advanced Computing & MPOnline',
      spotsLeft: 8,
      description: 'The premier national digital university innovation challenge showcasing AI, smart governance, and next-generation student infrastructure.',
    },
    {
      id: 'ev-2',
      title: 'Google Cloud & Gemini Multimodal Workshop',
      category: 'Technical',
      date: 'Oct 18, 2026',
      time: '02:00 PM - 05:00 PM',
      venue: 'Tech Block Seminar Hall 2',
      organizer: 'Google Developer Student Club (GDSC)',
      spotsLeft: 24,
      description: 'Hands-on live deployment of generative agent workflows with Vertex AI, function calling, and real-time audio models.',
    },
    {
      id: 'ev-3',
      title: 'Annual Inter-College Robotics Challenge',
      category: 'Technical',
      date: 'Oct 25, 2026',
      time: '10:00 AM - 04:00 PM',
      venue: 'Robotics & Mechatronics Arena',
      organizer: 'Robotics Society & IEEE Student Branch',
      spotsLeft: 12,
      description: 'Autonomous rover navigation, line follower sprints, and drone swarm obstacle trials.',
    },
    {
      id: 'ev-4',
      title: 'Aurora University Cultural Fest: Acoustic Night',
      category: 'Cultural',
      date: 'Nov 02, 2026',
      time: '06:30 PM - 10:00 PM',
      venue: 'Campus Open Air Amphitheatre',
      organizer: 'Student Council Cultural Wing',
      spotsLeft: 150,
      description: 'Live student band performances, stand-up comedy, and night food court festivities.',
    },
  ];

  const handleToggleRegister = (id: string) => {
    if (registeredIds.includes(id)) {
      setRegisteredIds(registeredIds.filter((item) => item !== id));
    } else {
      setRegisteredIds([...registeredIds, id]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <PageHeader
        title="Campus Life & Innovation"
        subtitle="Events, hackathons, technical societies, and cultural activities across the university."
        badge={<Badge variant="ai">Active Season</Badge>}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {events.map((event) => {
          const isRegistered = registeredIds.includes(event.id);

          return (
            <Card
              key={event.id}
              surface="base"
              className="p-5 flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={event.category === 'Hackathon' ? 'ai' : 'primary'}>
                    {event.category}
                  </Badge>
                  <span className="text-xs font-mono text-slate-400">
                    {event.spotsLeft} spots remaining
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                  {event.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
                  {event.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mt-4 py-2.5 px-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>{event.time}</span>
                  </div>
                  <div className="col-span-2 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="truncate">{event.venue}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium truncate max-w-[200px]">
                  {event.organizer}
                </span>

                <Button
                  size="sm"
                  variant={isRegistered ? 'secondary' : 'primary'}
                  onClick={() => handleToggleRegister(event.id)}
                  leftIcon={isRegistered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : undefined}
                >
                  {isRegistered ? 'Registered' : 'RSVP Free'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
