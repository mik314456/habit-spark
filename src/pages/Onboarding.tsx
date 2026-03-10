import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import { HABIT_TEMPLATES, HABIT_CATEGORIES, HabitTemplate } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';

/** Premium shadow for onboarding CTAs (same orange as Spark = var(--accent-color)) */
const ONBOARDING_CTA_SHADOW = '0 2px 8px rgba(0,0,0,0.06), 0 8px 28px rgba(250, 160, 100, 0.22), inset 0 1px 0 rgba(255,255,255,0.15)';
const ONBOARDING_CTA_SHADOW_HOVER = '0 4px 12px rgba(0,0,0,0.08), 0 12px 36px rgba(250, 160, 100, 0.28), inset 0 1px 0 rgba(255,255,255,0.2)';

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
  const [customHabitTitle, setCustomHabitTitle] = useState('');

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
  const popularTemplateIds = ['1', '2', '3', '4', '5', '6'];

  const screens = [
    // Screen 0: Light, premium welcome — warm cream, editorial, Spark as hero
    <motion.div
      key="welcome"
      className="fixed inset-0 flex flex-col overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse 100% 80% at 50% -10%, rgba(255,252,248,0.6) 0%, transparent 50%), #fefdfb',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
        aria-hidden
      />

      <div className="relative z-10 flex-1 flex items-center justify-center px-5">
        <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="text-[12px] sm:text-[13px] uppercase tracking-[0.26em] font-medium mb-8"
            style={{ color: '#7a7a7a', fontWeight: 500 }}
          >
            Habit{' '}
            <span style={{ color: 'var(--accent-color)' }}>
              Spark
            </span>
          </motion.p>

          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.85, delay: 0.45, ease: [0.22, 0.6, 0.35, 1] }}
          >
            <motion.div
              className="relative"
              animate={{ y: [0, -5] }}
              transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }}
              style={{
                filter: 'drop-shadow(0 14px 44px rgba(0,0,0,0.07))',
              }}
            >
            <svg
              viewBox="-7 -22 14 44"
              className="w-[138px] h-[138px]"
              fill="none"
              stroke="#0d0d0d"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
                <circle cx="0" cy="-14" r="5" />
                <line x1="0" y1="-9" x2="0" y2="8" />
                {/* Left arm - relaxed, still */}
                <line x1="0" y1="0" x2="-5" y2="7" />
                {/* Right arm - single piece waving from shoulder (0,0), higher like a real wave */}
                <line x1="0" y1="0" x2="5" y2="-4">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    values="-10 0 0; 18 0 0; -10 0 0"
                    keyTimes="0;0.5;1"
                    dur="1.8s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  />
                </line>
                <line x1="0" y1="8" x2="-4" y2="20" />
                <line x1="0" y1="8" x2="4" y2="20" />
              </svg>
            </motion.div>
          </motion.div>

          <motion.div
            className="flex flex-col items-center mt-9"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.85, delay: 0.9, ease: [0.22, 0.6, 0.35, 1] }}
          >
            <p
              className="font-display text-center font-light"
              style={{
                fontSize: 'clamp(36px, 9vw, 52px)',
                fontWeight: 300,
                color: '#444',
                letterSpacing: '-0.03em',
                lineHeight: 1.1,
              }}
            >
              Show up.
            </p>
            <motion.p
              className="text-[13px] text-center px-2 mt-8"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.0, ease: [0.22, 0.6, 0.35, 1] }}
              style={{
                color: '#aaaaaa',
                lineHeight: 1.7,
                maxWidth: 280,
              }}
            >
              I’m Spark — the stickfigure haunting this habit tracker and keeping receipts when you don’t show up.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <motion.div
        className="fixed inset-x-0 bottom-0 flex justify-center px-5 z-20 pointer-events-auto pt-6"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 1.35 }}
      >
        <motion.button
          onClick={next}
          className="w-full max-w-[320px] h-[54px] rounded-[50px] text-[15px] font-medium text-white"
          style={{
            backgroundColor: 'var(--accent-color)',
            letterSpacing: '0.04em',
            boxShadow: ONBOARDING_CTA_SHADOW,
          }}
          whileHover={{ boxShadow: ONBOARDING_CTA_SHADOW_HOVER }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.12 }}
        >
          Get started
        </motion.button>
      </motion.div>
    </motion.div>,

    // Screen 1: Identity — refined to match welcome aesthetic
    <motion.div key="identity" className="flex flex-col h-full px-5 pt-10 pb-6">
      <button onClick={back} className="text-muted-foreground mb-6 self-start text-sm">
        ← Back
      </button>

      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[420px] mx-auto flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.26em] font-medium text-muted-foreground mb-4">
            Step 1 · Identity
          </p>

          <h1
            className="font-display text-left font-light"
            style={{
              fontSize: 'clamp(26px, 6.3vw, 30px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Who do you want to become?
          </h1>


          <div className="mt-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[color:var(--card-border-color)] bg-card flex items-center justify-center shadow-sm">
              <svg
                viewBox="-7 -22 14 44"
                className="w-[22px] h-[22px]"
                fill="none"
                stroke="#0d0d0d"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="0" cy="-14" r="4.2" />
                <line x1="0" y1="-9.5" x2="0" y2="6" />
                <line x1="0" y1="-1" x2="-4.5" y2="5" />
                <line x1="0" y1="-1" x2="4.5" y2="5" />
                <line x1="0" y1="6" x2="-3.5" y2="15" />
                <line x1="0" y1="6" x2="3.5" y2="15" />
              </svg>
            </div>
            <p className="text-[14px] text-muted-foreground italic font-body">
              Spark: “C’mon. Pick one version of you.”
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] shadow-sm px-4 py-3">
            <label className="block text-[12px] font-medium text-muted-foreground font-body mb-1.5">
              I want to be…
            </label>
            <input
              type="text"
              value={identity}
              onChange={e => setIdentity(e.target.value.slice(0, 60))}
              placeholder="e.g. a healthy person, a focused person"
              className="w-full bg-transparent p-0 pb-1 border-0 focus:outline-none focus:ring-0 text-[15px] font-body text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {identityChips.map(chip => (
              <button
                key={chip}
                onClick={() => setIdentity(chip)}
                className={`px-4 py-2 rounded-full text-[13px] font-body border transition-all ${
                  identity === chip
                    ? 'border-[color:var(--accent-color)] bg-[color:var(--accent-light-color)] text-[color:var(--accent-color)] dark:text-white'
                    : 'border-[color:var(--card-border-color)] bg-card text-muted-foreground hover:border-[color:var(--accent-color)]/60'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={next}
              disabled={!identity.trim()}
              className="w-full max-w-[320px] h-[54px] rounded-[50px] text-[15px] font-medium text-white mx-auto tracking-[0.04em] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent-color)',
                boxShadow: ONBOARDING_CTA_SHADOW,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </motion.div>,

    // Screen 2: Habit Picker — refined to match welcome + identity
    <motion.div key="picker" className="flex h-screen flex-col px-5 pt-10 pb-4">
      <button onClick={back} className="text-muted-foreground mb-6 self-start text-sm">
        ← Back
      </button>

      <div className="flex-1 overflow-y-auto">
        <div className="w-full max-w-[420px] mx-auto flex flex-col pb-6">
          <p className="text-[11px] uppercase tracking-[0.26em] font-medium text-muted-foreground mb-3">
            Step 2 · Habit
          </p>

          <h1
            className="font-display text-left font-light"
            style={{
              fontSize: 'clamp(24px, 5.8vw, 28px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Pick your first habit.
          </h1>


          <div className="mt-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[color:var(--card-border-color)] bg-card flex items-center justify-center shadow-sm">
              <svg
                viewBox="-7 -22 14 44"
                className="w-[22px] h-[22px]"
                fill="none"
                stroke="#0d0d0d"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="0" cy="-14" r="4.2" />
                <line x1="0" y1="-9.5" x2="0" y2="6" />
                <line x1="0" y1="-1" x2="-4.5" y2="5" />
                <line x1="0" y1="-1" x2="4.5" y2="5" />
                <line x1="0" y1="6" x2="-3.5" y2="15" />
                <line x1="0" y1="6" x2="3.5" y2="15" />
              </svg>
            </div>
            <p className="text-[14px] text-muted-foreground italic font-body">
              Spark: “One habit. Not twelve. We’re being realistic.”
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {/* Popular first */}
            <div>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3 font-body">
                Most popular
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {HABIT_TEMPLATES.filter(t => popularTemplateIds.includes(t.id)).map(t => {
                  const isSelected = selectedTemplate?.id === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setSelectedTemplate(t);
                        setHabitAction(t.smallVersion);
                        setHabitTime(t.defaultTime);
                        setHabitLocation(t.defaultLocation);
                        setCustomHabitTitle('');
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
                            className="w-5 h-5 shrink-0"
                            strokeWidth={1.5}
                            style={{ color: '#000000' }}
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

            {/* Rest by category */}
            {HABIT_CATEGORIES.map(cat => {
              const templates = HABIT_TEMPLATES.filter(
                t => t.category === cat && !popularTemplateIds.includes(t.id),
              );
              if (templates.length === 0) return null;
              return (
                <div key={cat} className="mb-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-3 font-body">
                    {cat}
                  </h3>
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
                            setCustomHabitTitle('');
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
                                className="w-5 h-5 shrink-0"
                                strokeWidth={1.5}
                                style={{ color: '#000000' }}
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

          <div className="mt-4 rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] shadow-sm px-4 py-3">
            <label className="block text-[12px] font-medium text-muted-foreground font-body mb-1.5">
              Or write your own habit
            </label>
            <input
              type="text"
              value={customHabitTitle}
              onChange={e => {
                const value = e.target.value.slice(0, 60);
                setCustomHabitTitle(value);
                if (value.trim()) {
                  const customTemplate = {
                    id: 'custom',
                    title: value,
                    suggestion: value,
                    smallVersion: value,
                    category: 'Custom',
                    defaultTime: habitTime,
                    defaultLocation: habitLocation || 'Anywhere',
                    icon: 'Custom',
                    color: '#f97316',
                  } as HabitTemplate;
                  setSelectedTemplate(customTemplate);
                  setHabitAction(value);
                } else {
                  setSelectedTemplate(null);
                  setHabitAction('');
                }
              }}
              placeholder="e.g. read 1 page, stretch for 2 minutes"
              className="w-full bg-transparent p-0 pb-1 border-0 focus:outline-none focus:ring-0 text-[15px] font-body text-foreground placeholder:text-muted-foreground/70"
            />
          </div>
          <div className="mt-6 pt-4 pb-2">
            <button
              onClick={next}
              disabled={
                !selectedTemplate ||
                (selectedTemplate && selectedTemplate.id === 'custom' && !customHabitTitle.trim())
              }
              className="w-full max-w-[320px] h-[54px] rounded-[50px] text-[15px] font-medium text-white mx-auto tracking-[0.04em] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent-color)',
                boxShadow: ONBOARDING_CTA_SHADOW,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </motion.div>,

    // Screen 3: Habit Sizing — "Make it tiny"
    <motion.div key="sizing" className="flex flex-col h-full px-5 pt-10 pb-6">
      <button onClick={back} className="text-muted-foreground mb-6 self-start text-sm">
        ← Back
      </button>

      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[420px] mx-auto flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.26em] font-medium text-muted-foreground mb-3">
            Step 3 · Tiny version
          </p>

          <h1
            className="font-display text-left font-light"
            style={{
              fontSize: 'clamp(24px, 5.8vw, 28px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            Make it tiny.
          </h1>


          <div className="mt-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[color:var(--card-border-color)] bg-card flex items-center justify-center shadow-sm">
              <svg
                viewBox="-7 -22 14 44"
                className="w-[22px] h-[22px]"
                fill="none"
                stroke="#0d0d0d"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="0" cy="-14" r="4.2" />
                <line x1="0" y1="-9.5" x2="0" y2="6" />
                <line x1="0" y1="-1" x2="-4.5" y2="5" />
                <line x1="0" y1="-1" x2="4.5" y2="5" />
                <line x1="0" y1="6" x2="-3.5" y2="15" />
                <line x1="0" y1="6" x2="3.5" y2="15" />
              </svg>
            </div>
            <p className="text-[14px] text-muted-foreground italic font-body">
              Spark: “If it feels too easy, perfect. You’ll actually do it.”
            </p>
          </div>

          <div className="mt-6 rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] shadow-sm px-4 py-3">
            <div className="flex items-center gap-3">
              {selectedTemplate && (
                (() => {
                  const Icon = getHabitIconByTitle(selectedTemplate.title);
                  return (
                    <Icon
                      className="w-5 h-5 shrink-0"
                      strokeWidth={1.5}
                      style={{ color: '#000000' }}
                    />
                  );
                })()
              )}
              <div className="flex flex-col">
                <span className="text-[12px] font-body uppercase tracking-[0.18em] text-muted-foreground">
                  Habit
                </span>
                <span className="font-body text-[15px] font-medium text-foreground">
                  {selectedTemplate?.title}
                </span>
              </div>
            </div>
            {selectedTemplate && (
              <p className="mt-3 text-[12px] text-muted-foreground/80 font-body">
                "{selectedTemplate.suggestion}" → "{selectedTemplate.smallVersion}"
              </p>
            )}
          </div>

          <div className="mt-5 rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] shadow-sm px-4 py-3">
            <label className="block text-[12px] font-medium text-muted-foreground font-body mb-1.5">
              2-minute version (edit if you like)
            </label>
            <input
              type="text"
              value={habitAction}
              onChange={e => setHabitAction(e.target.value)}
              placeholder={selectedTemplate?.smallVersion || 'e.g. read one page'}
              className="w-full bg-transparent p-0 pb-1 border-0 focus:outline-none focus:ring-0 text-[15px] font-body text-foreground placeholder:text-muted-foreground/70"
            />
          </div>

          <div className="mt-auto pt-8">
            <button
              onClick={next}
              disabled={!habitAction.trim()}
              className="w-full max-w-[320px] h-[54px] rounded-[50px] text-[15px] font-medium text-white mx-auto tracking-[0.04em] transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                backgroundColor: 'var(--accent-color)',
                boxShadow: ONBOARDING_CTA_SHADOW,
              }}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </motion.div>,

    // Screen 4: Implementation Intention — "When and where?"
    <motion.div key="intention" className="flex flex-col h-full px-5 pt-10 pb-6">
      <button onClick={back} className="text-muted-foreground mb-6 self-start text-sm">
        ← Back
      </button>

      <div className="flex-1 flex flex-col items-center">
        <div className="w-full max-w-[420px] mx-auto flex flex-col">
          <p className="text-[11px] uppercase tracking-[0.26em] font-medium text-muted-foreground mb-3">
            Step 4 · When & where
          </p>

          <h1
            className="font-display text-left font-light"
            style={{
              fontSize: 'clamp(24px, 5.8vw, 28px)',
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
            }}
          >
            When and where?
          </h1>


          <div className="mt-4 flex items-center gap-2">
            <div className="w-8 h-8 rounded-full border border-[color:var(--card-border-color)] bg-card flex items-center justify-center shadow-sm">
              <svg
                viewBox="-7 -22 14 44"
                className="w-[22px] h-[22px]"
                fill="none"
                stroke="#0d0d0d"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="0" cy="-14" r="4.2" />
                <line x1="0" y1="-9.5" x2="0" y2="6" />
                <line x1="0" y1="-1" x2="-4.5" y2="5" />
                <line x1="0" y1="-1" x2="4.5" y2="5" />
                <line x1="0" y1="6" x2="-3.5" y2="15" />
                <line x1="0" y1="6" x2="3.5" y2="15" />
              </svg>
            </div>
            <p className="text-[14px] text-muted-foreground italic font-body">
              Spark: “If it’s not on the calendar, it’s a wish.”
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div className="rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] shadow-sm px-4 py-3">
              <label className="block text-[12px] font-medium text-muted-foreground font-body mb-1.5">
                Time
              </label>
              <input
                type="time"
                value={habitTime}
                onChange={e => setHabitTime(e.target.value)}
                className="w-full bg-transparent p-0 pb-1 border-0 focus:outline-none focus:ring-0 text-[15px] font-body text-foreground"
              />
            </div>

            <div className="rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] shadow-sm px-4 py-3">
              <label className="block text-[12px] font-medium text-muted-foreground font-body mb-1.5">
                Location
              </label>
              <input
                type="text"
                value={habitLocation}
                onChange={e => setHabitLocation(e.target.value)}
                placeholder="e.g. at my desk, on the couch"
                className="w-full bg-transparent p-0 pb-1 border-0 focus:outline-none focus:ring-0 text-[15px] font-body text-foreground placeholder:text-muted-foreground/70"
              />
            </div>
          </div>

          <div className="mt-6 p-5 rounded-2xl bg-card/80 border border-[color:var(--card-border-color)] mb-auto">
            <p className="text-center font-display text-lg italic text-muted-foreground">
              I will{' '}
              <span className="text-[color:var(--accent-color)] font-semibold not-italic">{habitAction}</span>{' '}
              at <span className="text-[color:var(--accent-color)] font-semibold not-italic">{habitTime}</span>{' '}
              <span className="text-[color:var(--accent-color)] font-semibold not-italic">
                {habitLocation || 'in the same place every time'}
              </span>
            </p>
          </div>

          <div className="mt-auto pt-6">
            <button
              onClick={finish}
              className="w-full max-w-[320px] h-[54px] rounded-[50px] text-[15px] font-medium text-white mx-auto tracking-[0.04em] transition-transform active:scale-95"
              style={{
                backgroundColor: 'var(--accent-color)',
                boxShadow: ONBOARDING_CTA_SHADOW,
              }}
            >
              Start building
            </button>
          </div>
        </div>
      </div>
    </motion.div>,
  ];

  return (
    <div
      className="fixed inset-0 flex flex-col max-w-md mx-auto overflow-hidden"
      style={{ background: '#ffffff', colorScheme: 'light', color: '#000000' }}
    >
      {/* Progress dots — black/grey only, no orange */}
      <div className="flex gap-[6px] justify-center mt-5 px-6 z-10">
        {screens.map((_, i) => (
          <div
            key={i}
            className="h-[6px] w-[6px] rounded-full transition-all duration-300 shrink-0"
            style={{
              width: i === step ? 20 : 6,
              backgroundColor: i <= step ? '#000000' : '#cccccc',
            }}
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
