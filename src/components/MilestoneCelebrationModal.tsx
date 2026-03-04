import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2 } from 'lucide-react';
import { Habit } from '@/lib/habitData';
import confetti from 'canvas-confetti';

interface MilestoneCelebrationModalProps {
  open: boolean;
  habit: Habit | null;
  milestone: number | null;
  onClose: () => void;
}

export default function MilestoneCelebrationModal({
  open,
  habit,
  milestone,
  onClose,
}: MilestoneCelebrationModalProps) {
  if (!open || !habit || milestone == null) return null;

  useEffect(() => {
    if (!open || !habit || milestone == null) return;
    const duration = 1800;
    const end = Date.now() + duration;

    const colors = ['#f97316', '#22c55e', '#3b82f6', '#a855f7'];

    const frame = () => {
      confetti({
        particleCount: 50,
        angle: 90,
        spread: 80,
        origin: { x: 0.5, y: 0.3 },
        colors,
        scalar: 0.8,
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, [open, habit, milestone]);

  const handleShare = async () => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1200;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#0f172a');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Card
    const cardWidth = width - 160;
    const cardHeight = height - 320;
    const cardX = (width - cardWidth) / 2;
    const cardY = (height - cardHeight) / 2;
    ctx.fillStyle = '#020617';
    roundRect(ctx, cardX, cardY, cardWidth, cardHeight, 40);

    // Streak number
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 160px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${milestone}`, width / 2, cardY + cardHeight * 0.35);

    // Label
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '32px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillText('day streak', width / 2, cardY + cardHeight * 0.48);

    // Habit name
    ctx.font = '28px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#9ca3af';
    ctx.fillText(habit.title, width / 2, cardY + cardHeight * 0.6);

    // Branding
    ctx.font = '24px system-ui, -apple-system, BlinkMacSystemFont, sans-serif';
    ctx.fillStyle = '#6b7280';
    ctx.fillText('Made with Habit Spark', width / 2, cardY + cardHeight * 0.8);

    canvas.toBlob(blob => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `habit-spark-${habit.title}-${milestone}-day-streak.png`;
      link.click();
      URL.revokeObjectURL(url);
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center px-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-md bg-card rounded-3xl p-6 overflow-hidden shadow-2xl border border-border"
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Confetti */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              {Array.from({ length: 40 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1.5 h-3 rounded-full"
                  style={{
                    background:
                      i % 3 === 0 ? '#f97316' : i % 3 === 1 ? '#22c55e' : '#3b82f6',
                    left: '50%',
                    top: '50%',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
                  animate={{
                    x: (Math.random() - 0.5) * 320,
                    y: (Math.random() - 0.5) * 480,
                    opacity: 0,
                    rotate: Math.random() * 360,
                    scale: 0.6,
                  }}
                  transition={{ duration: 1.1, ease: 'easeOut', delay: i * 0.01 }}
                />
              ))}
            </div>

            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground z-10"
            >
              <X size={20} />
            </button>

            <div className="relative z-10 flex flex-col items-center text-center gap-4 pt-4 pb-2">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-body">
                Milestone unlocked
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-display">{milestone}</span>
                <span className="text-base text-muted-foreground">day streak</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                You&apos;ve kept <span className="font-medium text-foreground">{habit.title}</span>{' '}
                going for {milestone} days. Tiny steps, compounding into something big.
              </p>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <button
                onClick={handleShare}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl gradient-warm text-primary-foreground font-semibold shadow-elevated"
              >
                <Share2 size={18} />
                <span>Share this streak</span>
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-muted text-muted-foreground font-medium"
              >
                Keep going
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
}

