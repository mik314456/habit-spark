import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Check, Flame, MoreVertical } from 'lucide-react';
import { Habit, HabitColor, HABIT_COLOR_MAP } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';

const colorClasses: Record<HabitColor, { bg: string; border: string; fill: string; tint: string }> = {
  amber: { bg: 'bg-habit-amber', border: 'border-l-habit-amber', fill: 'stroke-habit-amber', tint: 'bg-habit-amber/10' },
  sage: { bg: 'bg-habit-sage', border: 'border-l-habit-sage', fill: 'stroke-habit-sage', tint: 'bg-habit-sage/10' },
  coral: { bg: 'bg-habit-coral', border: 'border-l-habit-coral', fill: 'stroke-habit-coral', tint: 'bg-habit-coral/10' },
  sky: { bg: 'bg-habit-sky', border: 'border-l-habit-sky', fill: 'stroke-habit-sky', tint: 'bg-habit-sky/10' },
  violet: { bg: 'bg-habit-violet', border: 'border-l-habit-violet', fill: 'stroke-habit-violet', tint: 'bg-habit-violet/10' },
  rose: { bg: 'bg-habit-rose', border: 'border-l-habit-rose', fill: 'stroke-habit-rose', tint: 'bg-habit-rose/10' },
  teal: { bg: 'bg-habit-teal', border: 'border-l-habit-teal', fill: 'stroke-habit-teal', tint: 'bg-habit-teal/10' },
  slate: { bg: 'bg-habit-slate', border: 'border-l-habit-slate', fill: 'stroke-habit-slate', tint: 'bg-habit-slate/10' },
};

interface HabitCardProps {
  habit: Habit;
  streak: number;
  completed: boolean;
  skipped: boolean;
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
  const HabitIcon = getHabitIconByTitle(habit.title);

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
    <motion.div
      className="relative mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      <motion.div
        className="relative rounded-2xl bg-card shadow-card overflow-hidden select-none"
        onPointerDown={startHold}
        onPointerUp={endHold}
        onPointerLeave={endHold}
      >
        {/* Horizontal fill overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl origin-left pointer-events-none"
          style={{
            backgroundColor: `hsl(${HABIT_COLOR_MAP[habit.color]})`,
            transform: `scaleX(${fillAmount || 0})`,
            opacity: completed ? (justCompleted ? 0.7 : 0.22) : isHolding ? 0.3 : 0,
          }}
          transition={{
            transform: { duration: 0.3, ease: 'easeInOut' },
            opacity: { duration: 0.3, ease: 'easeInOut' },
          }}
        />

        <div className="relative z-10 flex items-center gap-4 p-4">
          {/* Icon + content */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0`}
            style={{ backgroundColor: `hsl(${HABIT_COLOR_MAP[habit.color]})` }}
          >
            <HabitIcon className="w-4 h-4 text-primary-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm ${completed ? 'line-through opacity-60' : ''} ${skipped ? 'opacity-50' : ''}`}>
              {habit.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {habit.timeOfDay} · {habit.location}
            </p>
          </div>
          </div>

        <div className="flex items-center gap-2">
          {/* Streak badge */}
          {streak > 0 && (
            <motion.div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                completed ? `${colors.bg} text-primary-foreground` : 'bg-muted text-muted-foreground'
              }`}
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
              <Check className="w-4 h-4" style={{ color: `hsl(${HABIT_COLOR_MAP[habit.color]})` }} />
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
