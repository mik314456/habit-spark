import {
  Dumbbell,
  Footprints,
  Droplets,
  Brain,
  BookOpen,
  PenLine,
  Salad,
  PersonStanding,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';

export function getHabitIconByTitle(title: string): LucideIcon {
  const t = title.toLowerCase();

  if (t.includes('exercise') || t.includes('work out') || t.includes('workout')) return Dumbbell;
  if (t.includes('walk')) return Footprints;
  if (t.includes('drink') && t.includes('water')) return Droplets;
  if (t.includes('meditate') || t.includes('calm') || t.includes('mind')) return Brain;
  if (t.includes('read')) return BookOpen;
  if (t.includes('journal') || t.includes('write')) return PenLine;
  if (t.includes('vegetable') || t.includes('salad') || t.includes('eat')) return Salad;
  if (t.includes('stretch')) return PersonStanding;

  return Sparkles;
}

