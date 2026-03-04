import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { HABIT_TEMPLATES, HABIT_CATEGORIES, HabitTemplate } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';
import welcomeIllustration from '@/assets/welcome-illustration.png';

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
    // Screen 0: Welcome
    <motion.div key="welcome" className="flex flex-col items-center justify-between h-full px-6 py-12">
      <div />
      <div className="flex flex-col items-center gap-6">
        <img src={welcomeIllustration} alt="Growing plants" className="w-64 h-64 object-contain" />
        <h1 className="text-3xl text-center leading-tight">Small habits.<br />Remarkable results.</h1>
        <p className="text-muted-foreground text-center max-w-xs">
          Build the life you want, one tiny habit at a time.
        </p>
      </div>
      <button
        onClick={next}
        className="w-full py-4 rounded-2xl gradient-warm font-semibold text-primary-foreground text-lg shadow-elevated transition-transform active:scale-95"
      >
        Get Started
      </button>
    </motion.div>,

    // Screen 1: Identity
    <motion.div key="identity" className="flex flex-col h-full px-6 py-12">
      <button onClick={back} className="text-muted-foreground mb-8 self-start text-sm">← Back</button>
      <h1 className="text-3xl mb-3">Who do you want to become?</h1>
      <p className="text-muted-foreground mb-8">Your identity shapes your habits. Start with who you want to be.</p>
      <input
        type="text"
        value={identity}
        onChange={e => setIdentity(e.target.value.slice(0, 60))}
        placeholder="e.g. A healthy person"
        className="w-full p-4 rounded-xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 mb-4"
      />
      <div className="flex flex-wrap gap-2 mb-auto">
        {identityChips.map(chip => (
          <button
            key={chip}
            onClick={() => setIdentity(chip)}
            className={`px-4 py-2 rounded-full text-sm transition-all ${
              identity === chip
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>
      <button
        onClick={next}
        disabled={!identity.trim()}
        className="w-full py-4 rounded-2xl gradient-warm font-semibold text-primary-foreground text-lg shadow-elevated transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </motion.div>,

    // Screen 2: Habit Picker
    <motion.div key="picker" className="flex h-screen flex-col px-6 pt-12">
      <button onClick={back} className="text-muted-foreground mb-6 self-start text-sm">← Back</button>
      <h1 className="text-2xl mb-2">Pick your first habit</h1>
      <p className="text-muted-foreground mb-6 text-sm">Start with one. You can always add more later.</p>
      <div className="flex-1 overflow-y-auto -mx-6 px-6 pb-4">
        {HABIT_CATEGORIES.map(cat => {
          const templates = HABIT_TEMPLATES.filter(t => t.category === cat);
          if (templates.length === 0) return null;
          return (
            <div key={cat} className="mb-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 font-body">{cat}</h3>
              <div className="grid grid-cols-2 gap-3">
                {templates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTemplate(t);
                      setHabitAction(t.smallVersion);
                      setHabitTime(t.defaultTime);
                      setHabitLocation(t.defaultLocation);
                    }}
                    className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      selectedTemplate?.id === t.id
                        ? 'border-primary bg-primary/5 shadow-card'
                        : 'border-transparent bg-card shadow-card hover:border-border'
                    }`}
                  >
                    {(() => {
                      const Icon = getHabitIconByTitle(t.title);
                      return <Icon className="w-6 h-6 text-muted-foreground" />;
                    })()}
                    <span className="text-sm font-medium">{t.title}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex-shrink-0 py-4 bg-background">
        <button
          onClick={next}
          disabled={!selectedTemplate}
          className="w-full py-4 rounded-2xl gradient-warm font-semibold text-primary-foreground text-lg shadow-elevated transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </motion.div>,

    // Screen 3: Habit Sizing
    <motion.div key="sizing" className="flex flex-col h-full px-6 py-12">
      <button onClick={back} className="text-muted-foreground mb-8 self-start text-sm">← Back</button>
      <h1 className="text-2xl mb-3">Make it tiny</h1>
      <p className="text-muted-foreground mb-2">What's the 2-minute version?</p>
      <p className="text-sm text-muted-foreground/70 mb-8 italic">
        "{selectedTemplate?.suggestion}" → "{selectedTemplate?.smallVersion}"
      </p>
      <div className="flex items-center gap-3 mb-4">
        {selectedTemplate && (
          (() => {
            const Icon = getHabitIconByTitle(selectedTemplate.title);
            return <Icon className="w-7 h-7 text-muted-foreground" />;
          })()
        )}
        <span className="font-display text-xl">{selectedTemplate?.title}</span>
      </div>
      <input
        type="text"
        value={habitAction}
        onChange={e => setHabitAction(e.target.value)}
        className="w-full p-4 rounded-xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 mb-auto"
      />
      <button
        onClick={next}
        disabled={!habitAction.trim()}
        className="w-full py-4 rounded-2xl gradient-warm font-semibold text-primary-foreground text-lg shadow-elevated transition-transform active:scale-95 disabled:opacity-40"
      >
        Continue
      </button>
    </motion.div>,

    // Screen 4: Implementation Intention
    <motion.div key="intention" className="flex flex-col h-full px-6 py-12">
      <button onClick={back} className="text-muted-foreground mb-8 self-start text-sm">← Back</button>
      <h1 className="text-2xl mb-3">When and where?</h1>
      <p className="text-muted-foreground mb-8">Make it specific. When will you do this?</p>

      <label className="text-sm font-medium text-muted-foreground mb-2 font-body">Time</label>
      <input
        type="time"
        value={habitTime}
        onChange={e => setHabitTime(e.target.value)}
        className="w-full p-4 rounded-xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
      />

      <label className="text-sm font-medium text-muted-foreground mb-2 font-body">Location</label>
      <input
        type="text"
        value={habitLocation}
        onChange={e => setHabitLocation(e.target.value)}
        placeholder="e.g. at my desk"
        className="w-full p-4 rounded-xl bg-card border border-border text-lg focus:outline-none focus:ring-2 focus:ring-primary/30 mb-6"
      />

      <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 mb-auto">
        <p className="text-center font-display text-lg">
          I will <span className="text-primary font-bold">{habitAction}</span>{' '}
          at <span className="text-primary font-bold">{habitTime}</span>{' '}
          <span className="text-primary font-bold">{habitLocation}</span>
        </p>
      </div>

      <button
        onClick={finish}
        className="w-full py-4 rounded-2xl gradient-warm font-semibold text-primary-foreground text-lg shadow-elevated transition-transform active:scale-95"
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
