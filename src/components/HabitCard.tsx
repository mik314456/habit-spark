import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  Flame,
  MoreVertical,
  Dumbbell,
  Brain,
  BookOpen,
  Droplets,
  Heart,
  Moon,
  Pencil,
  Music,
  Phone,
  Apple,
  Bike,
} from 'lucide-react';
import { Habit, HabitColor, HABIT_COLOR_MAP } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';

const colorClasses: Record<
  HabitColor,
  { bg: string; border: string; fill: string; tint: string; tintSubtle: string; tintCompleted: string }
> = {
  amber: { bg: 'bg-habit-amber', border: 'border-l-habit-amber', fill: 'stroke-habit-amber', tint: 'bg-habit-amber/10', tintSubtle: 'bg-habit-amber/5', tintCompleted: 'bg-habit-amber/15' },
  sage: { bg: 'bg-habit-sage', border: 'border-l-habit-sage', fill: 'stroke-habit-sage', tint: 'bg-habit-sage/10', tintSubtle: 'bg-habit-sage/5', tintCompleted: 'bg-habit-sage/15' },
  coral: { bg: 'bg-habit-coral', border: 'border-l-habit-coral', fill: 'stroke-habit-coral', tint: 'bg-habit-coral/10', tintSubtle: 'bg-habit-coral/5', tintCompleted: 'bg-habit-coral/15' },
  sky: { bg: 'bg-habit-sky', border: 'border-l-habit-sky', fill: 'stroke-habit-sky', tint: 'bg-habit-sky/10', tintSubtle: 'bg-habit-sky/5', tintCompleted: 'bg-habit-sky/15' },
  violet: { bg: 'bg-habit-violet', border: 'border-l-habit-violet', fill: 'stroke-habit-violet', tint: 'bg-habit-violet/10', tintSubtle: 'bg-habit-violet/5', tintCompleted: 'bg-habit-violet/15' },
  rose: { bg: 'bg-habit-rose', border: 'border-l-habit-rose', fill: 'stroke-habit-rose', tint: 'bg-habit-rose/10', tintSubtle: 'bg-habit-rose/5', tintCompleted: 'bg-habit-rose/15' },
  teal: { bg: 'bg-habit-teal', border: 'border-l-habit-teal', fill: 'stroke-habit-teal', tint: 'bg-habit-teal/10', tintSubtle: 'bg-habit-teal/5', tintCompleted: 'bg-habit-teal/15' },
  slate: { bg: 'bg-habit-slate', border: 'border-l-habit-slate', fill: 'stroke-habit-slate', tint: 'bg-habit-slate/10', tintSubtle: 'bg-habit-slate/5', tintCompleted: 'bg-habit-slate/15' },
};

interface HabitCardProps {
  habit: Habit;
  streak: number;
  completed: boolean;
  skipped: boolean;
  showIdentityWhisper?: boolean;
  identityStatement?: string;
  onComplete: () => void;
  onSkip: () => void;
  onDelete: () => void;
  onOpenDetails: () => void;
}

export default function HabitCard({
  habit,
  streak,
  completed,
  skipped,
  showIdentityWhisper,
  identityStatement,
  onComplete,
  onSkip,
  onDelete,
  onOpenDetails,
}: HabitCardProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const startTime = useRef<number>(0);
  const animFrame = useRef<number>(0);
  const [actionMenuOpen, setActionMenuOpen] = useState(false);

  const colors = colorClasses[habit.color];

  const explicitKey = habit.icon?.startsWith('lucide:') ? habit.icon.slice(7) : undefined;
  const explicitMap: Record<string, React.ComponentType<{ className?: string }>> = {
    dumbbell: Dumbbell,
    brain: Brain,
    book: BookOpen,
    droplets: Droplets,
    heart: Heart,
    moon: Moon,
    pencil: Pencil,
    music: Music,
    phone: Phone,
    apple: Apple,
    bike: Bike,
    flame: Flame,
  };
  const ExplicitIcon = explicitKey ? explicitMap[explicitKey] : undefined;
  const HabitIcon = ExplicitIcon ?? getHabitIconByTitle(habit.title);

  const startHold = useCallback(() => {
    if (skipped) return;
    setIsHolding(true);
    startTime.current = Date.now();

    const duration = completed ? 1500 : 1200;

    const animate = () => {
      const elapsed = Date.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      setHoldProgress(progress);

      if (progress >= 1) {
        // Complete!
        if (!completed) {
          setShowParticles(true);
          setJustCompleted(true);
          setTimeout(() => setShowParticles(false), 800);
          setTimeout(() => setJustCompleted(false), 400);
        }
        onComplete();
        setHoldProgress(0);
        setIsHolding(false);
        return;
      }

      animFrame.current = requestAnimationFrame(animate);
    };

    animFrame.current = requestAnimationFrame(animate);
  }, [completed, skipped, onComplete]);

  const endHold = useCallback(() => {
    if (!isHolding) return;
    setIsHolding(false);
    cancelAnimationFrame(animFrame.current);

    // Rewind
    const currentProgress = holdProgress;
    const rewindStart = Date.now();
    const rewindDuration = (currentProgress * 1200) / 2;

    const rewind = () => {
      const elapsed = Date.now() - rewindStart;
      const progress = Math.max(currentProgress - (elapsed / rewindDuration) * currentProgress, 0);
      setHoldProgress(progress);
      if (progress > 0) {
        requestAnimationFrame(rewind);
      }
    };
    requestAnimationFrame(rewind);
  }, [isHolding, holdProgress]);

  const circumference = 2 * Math.PI * 18;
  const fillAmount = completed && !isHolding ? 1 : holdProgress;

  return (
    <motion.div className="relative mb-3 animate-habit-card" layout>
      <motion.div
        className={`relative rounded-[14px] border border-border border-l-[3px] shadow-card overflow-hidden select-none ${completed ? colors.tintCompleted : colors.tintSubtle} ${colors.border}`}
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        {/* Hold-to-complete progress fill (habit color, left-to-right) */}
        <motion.div
          className={`absolute inset-0 rounded-[14px] origin-left pointer-events-none ${colors.tint}`}
          style={{
            transform: `scaleX(${fillAmount || 0})`,
            opacity: isHolding ? 0.7 : completed ? 0.4 : 0,
          }}
          transition={{
            transform: { duration: 0.15, ease: 'easeOut' },
            opacity: { duration: 0.2 },
          }}
        />
        <div className="relative z-10 flex items-center gap-4 p-4">
          {/* Icon + content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent-light-color)' }}
            >
              <HabitIcon className="w-4 h-4" style={{ color: 'var(--accent-color)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`font-body text-[15px] font-medium ${
                  completed ? 'line-through opacity-50' : ''
                } ${skipped ? 'opacity-50' : ''}`}
              >
                {habit.title}
              </p>
              <p className="font-body text-[12px] text-muted-foreground truncate">
                {habit.timeOfDay} · {habit.location}
              </p>
              {showIdentityWhisper && identityStatement?.trim() && (
                <p className="mt-0.5 text-[13px] text-muted-foreground/80 italic leading-snug font-display">
                  To become{' '}
                  <span className="font-medium not-italic text-foreground/90">
                    {identityStatement.trim()}
                  </span>
                  .
                </p>
              )}
            </div>
          </div>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          {streak > 0 && (
            <motion.div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-body font-medium bg-[color:var(--accent-color)] text-white"
              animate={justCompleted ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.2 }}
            >
              <Flame className="w-3.5 h-3.5" />
              {streak}
            </motion.div>
          )}

          {/* Checkmark on completion (right side) */}
          <div className="relative w-6 h-6 flex-shrink-0">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={false}
              animate={completed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
            >
              <Check className="w-4 h-4" style={{ color: 'var(--success-color)' }} />
            </motion.div>
          </div>

          {/* More menu */}
          <button
            type="button"
            className="ml-1 p-1 rounded-full hover:bg-muted text-muted-foreground"
            onPointerDown={e => e.stopPropagation()}
            onPointerUp={e => e.stopPropagation()}
            onPointerLeave={e => e.stopPropagation()}
            onClick={e => {
              e.stopPropagation();
              setActionMenuOpen(prev => !prev);
            }}
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Particles */}
        {showParticles && (
          <div className="absolute right-6 top-1/2 pointer-events-none">
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-1.5 h-1.5 rounded-full ${colors.bg}`}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i * 30 * Math.PI) / 180) * 30,
                  y: Math.sin((i * 30 * Math.PI) / 180) * 30,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            ))}
          </div>
        )}
        </div>
      </motion.div>

      {actionMenuOpen && (
        <div className="absolute right-4 top-2 z-40">
          <div className="rounded-2xl bg-popover shadow-elevated border border-border py-1 text-xs">
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left hover:bg-muted"
              onClick={() => {
                setActionMenuOpen(false);
                onOpenDetails();
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="block w-full px-3 py-1.5 text-left text-destructive hover:bg-destructive/10"
              onClick={() => {
                setActionMenuOpen(false);
                onDelete();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
