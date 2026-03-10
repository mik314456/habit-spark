import {
  Dumbbell,
  Footprints,
  Droplets,
  Brain,
  BookOpen,
  PenLine,
  Salad,
  Activity,
  Phone,
  MessageCircle,
  Monitor,
  CalendarCheck,
  Moon,
  Heart,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export function getHabitIconByTitle(title: string): LucideIcon {
  const t = title.toLowerCase();

  if (t.includes('drink') && t.includes('water')) return Droplets;
  if (t.includes('meditate') || t.includes('calm') || t.includes('mind')) return Brain;
  if (t.includes('read')) return BookOpen;
  if (t.includes('exercise') || t.includes('work out') || t.includes('workout')) return Dumbbell;
  if (t.includes('journal') || t.includes('write')) return PenLine;
  if (t.includes('walk')) return Footprints;
  if (t.includes('stretch')) return Activity;
  if (t.includes('call someone') || t.includes('call a')) return Phone;
  if (t.includes('check-in') || t.includes('check in') || t.includes('how are you') || t.includes('reach out')) return MessageCircle;
  if (t.includes('deep work') || t.includes('focused work')) return Monitor;
  if (t.includes('plan tomorrow') || t.includes('plan my')) return CalendarCheck;
  if (t.includes('vegetable') || t.includes('salad') || t.includes('eat')) return Salad;
  if (t.includes('sleep')) return Moon;
  if (t.includes('gratitude')) return Heart;

  return Sparkles;
}

