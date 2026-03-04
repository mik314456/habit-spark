import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { Habit, HabitColor, HABIT_COLOR_MAP } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import { playChime, playTick } from '@/lib/feedback';

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
  soundEnabled: boolean;
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
  soundEnabled,
  onComplete,
  onSkip,
  onDelete,
  onOpenDetails,
}: HabitCardProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const holdTimer = useRef<number | null>(null);
  const startTime = useRef<number>(0);
  const animFrame = useRef<number>(0);
  const [swipeX, setSwipeX] = useState(0);

  const colors = colorClasses[habit.color];
  const HabitIcon = getHabitIconByTitle(habit.title);

  const startHold = useCallback(() => {
    if (skipped) return;
    if (!completed && soundEnabled) {
      void playTick();
    }
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
          if (soundEnabled) {
            void playChime();
          }
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
  }, [completed, skipped, onComplete, soundEnabled]);

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

  return (
    <motion.div
      className="relative mb-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
    >
      {/* Swipe actions behind */}
      <div className="absolute inset-0 flex items-stretch rounded-2xl overflow-hidden">
        <div className="flex-1" />
        <button onClick={onSkip} className="w-20 bg-muted flex items-center justify-center text-muted-foreground text-sm font-medium">
          Skip
        </button>
        <button onClick={onDelete} className="w-20 bg-destructive flex items-center justify-center text-destructive-foreground text-sm font-medium">
          Delete
        </button>
      </div>

      {/* Main card */}
      <motion.div
        className={`relative flex items-center gap-4 p-4 rounded-2xl border-l-4 transition-colors duration-300 select-none ${colors.border} ${
          completed ? colors.tint : skipped ? 'bg-muted/50' : 'bg-card'
        } shadow-card`}
        style={{ x: swipeX }}
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => {
          if (info.offset.x < -100) {
            setSwipeX(-160);
          } else {
            setSwipeX(0);
          }
        }}
      >
        {/* Icon + content (tap to open details) */}
        <button
          type="button"
          onClick={onOpenDetails}
          className="flex items-center gap-3 flex-1 min-w-0 text-left"
        >
          <HabitIcon
            className="w-6 h-6 flex-shrink-0"
            style={{ color: `hsl(${HABIT_COLOR_MAP[habit.color]})` }}
          />
          <div className="flex-1 min-w-0">
            <p className={`font-medium text-sm ${completed ? 'line-through opacity-60' : ''} ${skipped ? 'opacity-50' : ''}`}>
              {habit.title}
            </p>
            <p className="text-xs text-muted-foreground truncate">{habit.action}</p>
          </div>
        </button>

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

        {/* Completion circle (long-press interaction) */}
        <div
          className="relative w-11 h-11 flex-shrink-0"
          onPointerDown={startHold}
          onPointerUp={endHold}
          onPointerLeave={endHold}
        >
          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 44 44">
            <circle cx="22" cy="22" r="18" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <circle
              cx="22"
              cy="22"
              r="18"
              fill="none"
              className={colors.fill}
              strokeWidth="3"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - (completed && !isHolding ? 1 : holdProgress))}
              strokeLinecap="round"
              style={{ transition: isHolding ? 'none' : 'stroke-dashoffset 0.3s ease-out' }}
            />
          </svg>
          {completed && !isHolding && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M3 8L7 12L13 4"
                  stroke={`hsl(${HABIT_COLOR_MAP[habit.color]})`}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          )}
          {skipped && (
            <div className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground font-medium">
              —
            </div>
          )}
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
      </motion.div>
    </motion.div>
  );
}
