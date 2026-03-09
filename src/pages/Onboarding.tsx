import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { HABIT_TEMPLATES, HABIT_CATEGORIES, HabitTemplate } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
  }),
};

export default function Onboarding() {
  const { completeOnboarding, addHabit } = useApp();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);

  // State
  const [identity, setIdentity] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [habitAction, setHabitAction] = useState('');
  const [habitTime, setHabitTime] = useState('07:00');
  const [habitLocation, setHabitLocation] = useState('');

  const next = () => {
    setDirection(1);
    setStep(s => s + 1);
  };

  const back = () => {
    setDirection(-1);
    setStep(s => s - 1);
  };

  const finish = () => {
    if (selectedTemplate) {
      addHabit({
        title: selectedTemplate.title,
        action: habitAction || selectedTemplate.smallVersion,
        icon: selectedTemplate.icon,
        color: selectedTemplate.color,
        timeOfDay: habitTime,
        location: habitLocation || selectedTemplate.defaultLocation,
        why: identity.trim() ? `To become ${identity.trim()}` : '',
        smartReminderEnabled: true,
        reminderTime: habitTime,
      });
    }
    completeOnboarding(identity);
  };

  const identityChips = ['A healthy person', 'A focused person', 'A creative person', 'A calm person', 'A strong person'];

  const screens = [
    // Screen 0: Light, premium welcome — warm cream, editorial, Spark as hero
    <motion.div
      key="welcome"
      className="fixed inset-0 flex flex-col overflow-hidden bg-white"
      style={{ backgroundColor: '#ffffff' }}
    >
      {/* Barely perceptible grain — warm not sterile */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex-1 flex flex-col items-center px-6 pt-[80px]">
        {/* 1. HABIT SPARK */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-[10px] uppercase font-normal"
          style={{ letterSpacing: '0.25em', color: '#cccccc', fontWeight: 400 }}
        >
          HABIT SPARK
        </motion.p>

        {/* 2. Spark — 120px, hero */}
        <motion.div
          className="relative flex items-center justify-center mt-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: [0, 0, 0.2, 1] }}
        >
          <motion.div
            className="relative"
            animate={{ y: [0, -6] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
          >
            <svg
              viewBox="-7 -22 14 44"
              className="w-[120px] h-[120px]"
              fill="none"
              stroke="#000000"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="0" cy="-14" r="5" />
              <line x1="0" y1="-9" x2="0" y2="8" />
              <line x1="0" y1="0" x2="-5" y2="7" />
              <line x1="0" y1="0" x2="5" y2="7" />
              <line x1="0" y1="8" x2="-4" y2="20" />
              <line x1="0" y1="8" x2="4" y2="20" />
            </svg>
          </motion.div>
        </motion.div>

        {/* 3. Show up. */}
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8, ease: [0, 0, 0.2, 1] }}
          className="text-center font-light mt-6"
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 64,
            fontWeight: 300,
            color: '#000000',
            letterSpacing: '-0.03em',
          }}
        >
          Show up.
        </motion.h1>
      </div>

      {/* Button */}
      <motion.div
        className="fixed left-0 right-0 flex justify-center px-6"
        style={{ bottom: 52 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
      >
        <motion.button
          onClick={next}
          className="w-full max-w-[340px] h-[52px] rounded-[50px] text-[15px] text-white"
          style={{
            backgroundColor: '#000000',
            color: '#ffffff',
            letterSpacing: '0.02em',
            fontWeight: 500,
          }}
          whileTap={{ scale: 0.97 }}
          transition={{ duration: 0.1 }}
        >
          Get started
        </motion.button>
      </motion.div>
    </motion.div>,

    // Screen 1: Identity
    <motion.div key="identity" className="flex flex-col h-full px-6 py-12">
      <button onClick={back} className="text-muted-foreground mb-8 self-start text-sm">← Back</button>
      <h1 className="font-body font-semibold text-[2.1rem] leading-snug mb-3 text-foreground">
        Who do you want to become?
      </h1>
      <p className="text-muted-foreground mb-8 font-body text-sm">
        Your identity shapes your habits. Start with who you want to be.
      </p>
      <input
        type="text"
        value={identity}
        onChange={e => setIdentity(e.target.value.slice(0, 60))}
        placeholder="e.g. A healthy person"
        className="w-full p-4 rounded-xl bg-card border border-border text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-color)]/20 mb-4"
      />
      <div className="flex flex-wrap gap-2 mb-auto">
        {identityChips.map(chip => (
          <button
            key={chip}
            onClick={() => setIdentity(chip)}
            className={`px-4 py-2 rounded-full text-[13px] font-body border transition-all ${
              identity === chip
                ? 'border-[color:var(--accent-color)] bg-[color:var(--accent-light-color)] text-[color:var(--accent-color)] dark:text-white'
                : 'border-[color:var(--card-border-color)] text-muted-foreground hover:border-[color:var(--accent-color)]/60'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={!identity.trim()}
        className="w-full py-4 rounded-full bg-[color:var(--accent-color)] font-body font-medium text-[15px] tracking-wide text-white shadow-card transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </motion.div>,

    // Screen 2: Habit Picker
    <motion.div key="picker" className="flex h-screen flex-col px-6 pt-12">
      <button onClick={back} className="text-muted-foreground mb-6 self-start text-sm">← Back</button>
      <h1 className="font-body font-semibold text-[2rem] leading-snug mb-2 text-foreground">
        Pick your first habit
      </h1>
      <p className="text-muted-foreground mb-6 text-sm font-body">
        Start with one. You can always add more later.
      </p>
      <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-4">
        {HABIT_CATEGORIES.map(cat => {
          const templates = HABIT_TEMPLATES.filter(t => t.category === cat);
          if (templates.length === 0) return null;
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-body">{cat}</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map(t => {
                  const isSelected = selectedTemplate?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplate(t);
                        setHabitAction(t.smallVersion);
                        setHabitTime(t.defaultTime);
                        setHabitLocation(t.defaultLocation);
                      }}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                        isSelected
                          ? 'border-[color:var(--accent-color)] bg-[color:var(--accent-light-color)] shadow-card dark:text-white'
                          : 'border-[color:var(--card-border-color)] bg-card shadow-card hover:border-[color:var(--accent-color)]/60'
                      }`}
                    >
                      {(() => {
                        const Icon = getHabitIconByTitle(t.title);
                        return (
                          <Icon
                            className={`w-6 h-6 ${
                              isSelected ? 'text-[color:var(--accent-color)] dark:text-white' : 'text-muted-foreground'
                            }`}
                          />
                        );
                      })()}
                      <span
                        className={`text-sm font-body font-medium ${
                          isSelected ? 'text-[color:var(--accent-color)] dark:text-white' : ''
                        }`}
                      >
                        {t.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-shrink-0 py-4 bg-background">
        <button
          onClick={next}
          disabled={!selectedTemplate}
          className="w-full py-4 rounded-full bg-[color:var(--accent-color)] font-body font-medium text-[15px] tracking-wide text-white shadow-card transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </motion.div>,

    // Screen 3: Habit Sizing
    <motion.div key="sizing" className="flex flex-col h-full px-6 py-12">
      <button onClick={back} className="text-muted-foreground mb-8 self-start text-sm">← Back</button>
      <h1 className="font-body font-semibold text-[2rem] leading-snug mb-3 text-foreground">
        Make it tiny
      </h1>
      <p className="text-muted-foreground mb-2 font-body text-sm">What's the 2-minute version?</p>
      <p className="text-[13px] text-muted-foreground/80 mb-8 font-body">
        "{selectedTemplate?.suggestion}" → "{selectedTemplate?.smallVersion}"
      </p>
      <div className="flex items-center gap-3 mb-4">
        {selectedTemplate && (
          (() => {
            const Icon = getHabitIconByTitle(selectedTemplate.title);
            return <Icon className="w-7 h-7 text-muted-foreground" />;
          })()
        )}
        <span className="font-body text-xl font-medium">{selectedTemplate?.title}</span>
      </div>
      <input
        type="text"
        value={habitAction}
        onChange={e => setHabitAction(e.target.value)}
        className="w-full p-4 rounded-xl bg-card border border-border text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-color)]/20 mb-auto"
      />
      <button
        onClick={next}
        disabled={!habitAction.trim()}
        className="w-full py-4 rounded-full bg-[color:var(--accent-color)] font-body font-medium text-[15px] tracking-wide text-white shadow-card transition-transform active:scale-95 disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>,

    // Screen 4: Implementation Intention
    <motion.div key="intention" className="flex flex-col h-full px-6 py-12">
      <button onClick={back} className="text-muted-foreground mb-8 self-start text-sm">← Back</button>
      <h1 className="font-body font-semibold text-[2rem] leading-snug mb-3 text-foreground">
        When and where?
      </h1>
      <p className="text-muted-foreground mb-8 font-body text-sm">
        Make it specific. When will you do this?
      </p>

      <label className="text-sm font-medium text-muted-foreground mb-2 font-body">Time</label>
      <input
        type="time"
        value={habitTime}
        onChange={e => setHabitTime(e.target.value)}
        className="w-full p-4 rounded-xl bg-card border border-border text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-color)]/20 mb-6"
      />

      <label className="text-sm font-medium text-muted-foreground mb-2 font-body">Location</label>
      <input
        type="text"
        value={habitLocation}
        onChange={e => setHabitLocation(e.target.value)}
        placeholder="e.g. at my desk"
        className="w-full p-4 rounded-xl bg-card border border-border text-[15px] font-body focus:outline-none focus:ring-2 focus:ring-[color:var(--accent-color)]/20 mb-6"
      />

      <div className="p-5 rounded-2xl bg-[color:var(--accent-light-color)] border border-[color:var(--card-border-color)] mb-auto">
        <p className="text-center font-display text-lg italic text-foreground">
          I will{' '}
          <span className="text-[color:var(--accent-color)] font-semibold not-italic">{habitAction}</span>{' '}
          at <span className="text-[color:var(--accent-color)] font-semibold not-italic">{habitTime}</span>{' '}
          <span className="text-[color:var(--accent-color)] font-semibold not-italic">{habitLocation}</span>
        </p>
      </div>

      <button
        onClick={finish}
        className="w-full py-4 rounded-full bg-[color:var(--accent-color)] font-body font-medium text-[15px] tracking-wide text-white shadow-card transition-transform active:scale-95"
      >
        Start Building
      </button>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 bg-background flex flex-col max-w-md mx-auto overflow-hidden">
      {/* Progress dots */}
      <div className="flex gap-2 justify-center pt-4 px-6 z-10">
        {screens.map((_, i) => (
          <div
            key={i}
            className={`h-1 rounded-full transition-all duration-300 ${
              i <= step ? 'bg-primary w-8' : 'bg-muted w-4'
            }`}
          />
        ))}
      </div>

      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={step}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 relative"
        >
          {screens[step]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
