import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Plus,
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
  Flame,
} from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { HABIT_TEMPLATES, HABIT_CATEGORIES, HabitTemplate, type HabitColor } from '@/lib/habitData';
import { getHabitIconByTitle } from '@/lib/habitIcons';

function habitColorStyle(color: HabitColor) {
  const varName = `--habit-${color}`;
  return {
    backgroundColor: `hsl(var(${varName}))`,
    boxShadow: `0 0 28px 6px hsl(var(${varName}) / 0.4)`,
  };
}

function habitIconColor(color: HabitColor) {
  return { color: `hsl(var(--habit-${color}))` };
}

function toSentenceCase(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

interface AddHabitModalProps {
  onClose: () => void;
}

export default function AddHabitModal({ onClose }: AddHabitModalProps) {
  const { addHabit, state } = useApp();
  const [step, setStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<HabitTemplate | null>(null);
  const [isCustom, setIsCustom] = useState(false);
  const [habitAction, setHabitAction] = useState('');
  const [habitTime, setHabitTime] = useState('07:00');
  const [habitLocation, setHabitLocation] = useState('');
  const [habitWhy, setHabitWhy] = useState('');
  const [customName, setCustomName] = useState('');
  const [customIcon, setCustomIcon] = useState<'dumbbell' | 'brain' | 'book' | 'droplets' | 'heart' | 'moon' | 'pencil' | 'music' | 'phone' | 'apple' | 'bike' | 'flame'>('dumbbell');
  const [customIdentity, setCustomIdentity] = useState(state.identityStatement ?? '');

  const selectTemplate = (t: HabitTemplate) => {
    setIsCustom(false);
    setSelectedTemplate(t);
    setHabitAction(t.smallVersion);
    setHabitTime(t.defaultTime);
    setHabitLocation(t.defaultLocation);
    setHabitWhy(t.why);
  };

  const goToSetup = () => {
    if (selectedTemplate) setStep(1);
  };

  const startCustom = () => {
    setIsCustom(true);
    setSelectedTemplate(null);
    setStep(1);
    setHabitAction('');
    setHabitTime('07:00');
    setHabitLocation('');
    setHabitWhy('');
    setCustomName('');
    setCustomIcon('dumbbell');
    setCustomIdentity(state.identityStatement ?? '');
  };

  const finish = () => {
    if (isCustom) {
      if (!customName.trim()) return;
      const trimmedLocation = habitLocation.trim();
      const trimmedIdentity = customIdentity.trim();
      addHabit({
        title: customName.trim(),
        action: customName.trim(),
        icon: `lucide:${customIcon}`,
        color: 'sky',
        timeOfDay: habitTime,
        location: trimmedLocation || '',
        why: trimmedIdentity || undefined,
        smartReminderEnabled: true,
        reminderTime: habitTime,
      });
      onClose();
      return;
    }

    if (!selectedTemplate) return;
    const trimmedLocation = habitLocation.trim();
    const trimmedWhy = habitWhy.trim();
    addHabit({
      title: selectedTemplate.title,
      action: habitAction || selectedTemplate.smallVersion,
      icon: selectedTemplate.icon,
      color: selectedTemplate.color,
      timeOfDay: habitTime,
      location: trimmedLocation || selectedTemplate.defaultLocation,
      why: trimmedWhy || selectedTemplate.why || undefined,
      smartReminderEnabled: true,
      reminderTime: habitTime,
    });
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm flex items-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-md mx-auto bg-card rounded-t-3xl max-h-[85vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-display">
            {step === 0 ? 'Add a habit' : isCustom ? 'Create your habit' : 'Set it up'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        {step === 0 ? (
          <div className="p-5 pb-6">
            {HABIT_CATEGORIES.map(cat => {
              const templates = HABIT_TEMPLATES.filter(t => t.category === cat);
              if (templates.length === 0) return null;
              return (
                <div key={cat} className="mt-8 first:mt-4">
                  <h3 className="text-sm font-medium text-foreground mb-3 font-body text-left">
                    {toSentenceCase(cat)}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {templates.map(t => {
                      const Icon = getHabitIconByTitle(t.title);
                      const isSelected = selectedTemplate?.id === t.id;
                      return (
                        <motion.button
                          key={t.id}
                          type="button"
                          onClick={() => selectTemplate(t)}
                          className={`relative flex flex-col items-center justify-center rounded-[16px] border w-[150px] h-[130px] mx-auto focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                            isSelected
                              ? ''
                              : 'bg-card border-border text-foreground dark:bg-[#1a1a1a] dark:border-white/10 dark:text-white'
                          }`}
                          animate={{
                            scale: isSelected ? 1.03 : 1,
                          }}
                          transition={{ duration: 0.2 }}
                          style={
                            isSelected
                              ? {
                                  ...habitColorStyle(t.color),
                                  borderColor: 'transparent',
                                }
                              : undefined
                          }
                        >
                          <span
                            className="flex items-center justify-center mb-2"
                            style={isSelected ? { color: '#fff' } : habitIconColor(t.color)}
                          >
                            <Icon className="w-8 h-8" strokeWidth={1.8} />
                          </span>
                          <span
                            className={`text-center text-[13px] px-1 leading-tight ${
                              isSelected ? 'text-white font-bold' : 'font-medium'
                            }`}
                          >
                            {t.title}
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              onClick={startCustom}
              className="mt-6 w-full flex flex-col items-center justify-center gap-2 py-5 rounded-[16px] border-2 border-dashed border-border text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors font-body text-sm font-medium bg-card dark:bg-[#1a1a1a] dark:border-white/20 dark:text-white/80 dark:hover:border-white/30 dark:hover:text-white/90"
            >
              <Plus className="w-6 h-6" />
              <span>Create your own habit</span>
            </button>

            <button
              type="button"
              onClick={goToSetup}
              disabled={!selectedTemplate}
              className="mt-6 w-full py-3.5 rounded-2xl font-body font-semibold text-[15px] transition-all disabled:opacity-40 disabled:pointer-events-none bg-primary text-primary-foreground hover:opacity-95"
            >
              Continue
            </button>
          </div>
        ) : isCustom ? (
          <div className="p-5 space-y-5">
            <div className="flex items-center justify-between">
              <button
                type="button"
                className="text-sm text-muted-foreground"
                onClick={() => {
                  setIsCustom(false);
                  setStep(0);
                }}
              >
                ← Back
              </button>
            </div>

            {/* Icon picker */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Icon</p>
              <div className="grid grid-cols-4 gap-2">
                {([
                  { key: 'dumbbell', Icon: Dumbbell },
                  { key: 'brain', Icon: Brain },
                  { key: 'book', Icon: BookOpen },
                  { key: 'droplets', Icon: Droplets },
                  { key: 'heart', Icon: Heart },
                  { key: 'moon', Icon: Moon },
                  { key: 'pencil', Icon: Pencil },
                  { key: 'music', Icon: Music },
                  { key: 'phone', Icon: Phone },
                  { key: 'apple', Icon: Apple },
                  { key: 'bike', Icon: Bike },
                  { key: 'flame', Icon: Flame },
                ] as const).map(({ key, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCustomIcon(key)}
                    className={`flex items-center justify-center rounded-xl border px-2 py-2 text-xs ${
                      customIcon === key
                        ? 'border-[color:var(--accent-color)] bg-[color:var(--accent-light-color)] text-[color:var(--accent-color)]'
                        : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </button>
                ))}
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Habit name</label>
              <input
                type="text"
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="e.g. Evening walk"
                className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Time & Location */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Time</label>
                <input
                  type="time"
                  value={habitTime}
                  onChange={e => setHabitTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Location</label>
                <input
                  type="text"
                  value={habitLocation}
                  onChange={e => setHabitLocation(e.target.value)}
                  placeholder="e.g. at the gym"
                  className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            {/* Identity */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Identity</label>
              <input
                type="text"
                value={customIdentity}
                onChange={e => setCustomIdentity(e.target.value)}
                placeholder="e.g. a healthy person"
                className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setIsCustom(false);
                  setStep(0);
                }}
                className="flex-1 py-3 rounded-2xl bg-muted text-muted-foreground font-medium"
              >
                Back
              </button>
              <button
                onClick={finish}
                className="flex-1 py-3 rounded-2xl gradient-warm text-primary-foreground font-semibold shadow-elevated"
              >
                Add Habit
              </button>
            </div>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl">{selectedTemplate?.title}</span>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">2-minute version</label>
              <input
                type="text"
                value={habitAction}
                onChange={e => setHabitAction(e.target.value)}
                className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Time</label>
                <input
                  type="time"
                  value={habitTime}
                  onChange={e => setHabitTime(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Location</label>
                <input
                  type="text"
                  value={habitLocation}
                  onChange={e => setHabitLocation(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1 block font-body">Why</label>
              <input
                type="text"
                value={habitWhy}
                onChange={e => setHabitWhy(e.target.value)}
                placeholder={
                  state.identityStatement?.trim()
                    ? `e.g. To become ${state.identityStatement.trim()}`
                    : 'e.g. To feel healthier'
                }
                className="w-full p-3 rounded-xl bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
              <p className="text-center text-sm">
                I will <strong className="text-primary">{habitAction}</strong> at{' '}
                <strong className="text-primary">{habitTime}</strong>{' '}
                <strong className="text-primary">{habitLocation}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="flex-1 py-3 rounded-2xl bg-muted text-muted-foreground font-medium">
                Back
              </button>
              <button onClick={finish} className="flex-1 py-3 rounded-2xl gradient-warm text-primary-foreground font-semibold shadow-elevated">
                Add Habit
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
