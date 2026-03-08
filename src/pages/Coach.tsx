import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';

/** Walking stick figure for Spark screen header — same style as home, in place. */
function SparkHeaderFigure() {
  const stroke = 1.15;
  const headY = -9;
  const hipY = 5.5;
  const shoulderY = 0.5;
  return (
    <svg
      viewBox="-6 -14 24 32"
      className="w-8 h-8 flex-shrink-0 text-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      aria-hidden
    >
      <g className="spark-figure-bob">
        <circle cx="0" cy={headY} r="3" strokeWidth={stroke} />
        <line x1="0" y1={headY + 3.2} x2="0.8" y2={hipY} strokeWidth={stroke} />
        <g transform={`translate(0.8, ${shoulderY})`}>
          <line x1="0" y1="0" x2="-4" y2="4.5" strokeWidth={stroke} className="spark-figure-arm-swing" />
        </g>
        <g transform={`translate(0.8, ${hipY})`}>
          <line x1="0" y1="0" x2="-3.8" y2="10.5" strokeWidth={stroke} className="spark-figure-leg-left" />
        </g>
        <g transform={`translate(0.8, ${hipY})`}>
          <line x1="0" y1="0" x2="3.5" y2="10.5" strokeWidth={stroke} className="spark-figure-leg-right" />
        </g>
      </g>
    </svg>
  );
}

const SPARK_FIGURE_WIDTH_PX = 20;

/** Running stick figure ~20px, white, sprint pose — for loading/response card. */
function RunningStickFigure() {
  const stroke = 0.9;
  return (
    <svg
      viewBox="-5 -6 14 20"
      className="spark-run-figure text-white opacity-95"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="0" cy="-4" r="2.2" />
      <line x1="0" y1="-1.8" x2="0.5" y2="4" strokeWidth={stroke} />
      <g transform="translate(0.5, -0.5)">
        <line x1="0" y1="0" x2="-3" y2="2.5" strokeWidth={stroke} className="spark-run-arm-left" />
      </g>
      <g transform="translate(0.5, -0.5)">
        <line x1="0" y1="0" x2="3" y2="2.5" strokeWidth={stroke} className="spark-run-arm-right" />
      </g>
      <g transform="translate(0.5, 4)">
        <line x1="0" y1="0" x2="-2.5" y2="6" strokeWidth={stroke} className="spark-run-leg-left" />
      </g>
      <g transform="translate(0.5, 4)">
        <line x1="0" y1="0" x2="2.5" y2="6" strokeWidth={stroke} className="spark-run-leg-right" />
      </g>
    </svg>
  );
}

/** Tiny stick figure for input corner — impatient bounce. */
function InputBounceFigure() {
  const stroke = 0.7;
  return (
    <svg
      viewBox="-4 -5 10 14"
      className="w-4 h-4 text-muted-foreground spark-input-bounce"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      aria-hidden
    >
      <circle cx="0" cy="-2.5" r="1.5" />
      <line x1="0" y1="-1" x2="0" y2="2.5" strokeWidth={stroke} />
      <line x1="0" y1="2.5" x2="-2" y2="6" strokeWidth={stroke} />
      <line x1="0" y1="2.5" x2="2" y2="6" strokeWidth={stroke} />
    </svg>
  );
}

const SPARK_SYSTEM_PROMPT = `You are Spark — a stick figure who has somehow become the world's greatest habit coach. You are sarcastic, funny, and brutally honest, but underneath it all you genuinely care about the person you're talking to.

Your personality:
- Deeply sarcastic but never mean. Think: the friend who roasts you because they believe in you.
- You make jokes constantly but every joke has a point. The wisdom is always in there.
- You're self aware that you're a stick figure. Lean into it occasionally. 'I'm literally two lines and a circle and even I work out more than you.'
- You do not tolerate excuses but you never shame. You redirect with humor.
- You celebrate wins with genuine enthusiasm wrapped in sarcasm. 'Oh wow you did ONE habit today. Someone alert the media.'
- You reference neuroscience, psychology, and real research but explain it like a sarcastic friend, not a textbook.
- Short punchy responses. No long paragraphs. You talk like a person not an essay.
- Occasional all caps for emphasis. Like a real person texting.
- Never use emojis. You're too cool for emojis.
- If someone is struggling, you get real for a moment — drop the sarcasm just slightly — then bring it back. You never let them wallow.
- You remember you're talking to someone building real habits. The stakes are real even if your tone is light.

Examples of how you talk:
- 'Oh you missed a day? Groundbreaking. Nobody has ever done that before. Get up.'
- 'You want motivation? Here's motivation: you're going to die someday and you spent today on the couch. Go.'
- 'That's actually impressive. I didn't think you had it in you. I mean I did, but I wasn't going to SAY that.'
- 'Boredom is just your brain being lazy. Give it something to do. Like your habits. Which you have. Right there. In the app.'
- 'Rest day? Sure. Or — and hear me out — what if you did the thing.'

Keep responses under 4 sentences usually. Be Spark.`;

async function callCoachApi(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;
  if (!apiKey) {
    throw new Error('Missing Anthropic API key. Set VITE_ANTHROPIC_API_KEY.');
  }

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Spark API error ${res.status}`);
  }

  const json = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = json.content?.find(c => c.type === 'text')?.text?.trim();
  if (!text) throw new Error('Spark API returned no text content.');
  return text;
}

const WORD_DELAY_MS = 55;

export default function Coach() {
  const { state, getHabitStreak } = useApp();
  const [followupQuestion, setFollowupQuestion] = useState('');
  const [followupAnswer, setFollowupAnswer] = useState<string | null>(null);
  const [displayedAnswer, setDisplayedAnswer] = useState('');
  const [followupLoading, setFollowupLoading] = useState(false);
  const [followupError, setFollowupError] = useState<string | null>(null);
  const [figureExiting, setFigureExiting] = useState(false);
  const [figureExited, setFigureExited] = useState(false);
  const [responseTimestamp, setResponseTimestamp] = useState<Date | null>(null);
  const wordIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const activeHabits = useMemo(
    () => state.habits.filter(h => !h.archived),
    [state.habits],
  );

  const habitsAndStreaks = useMemo(() => {
    if (activeHabits.length === 0) return 'none';
    return activeHabits
      .map(habit => `${habit.title} (streak ${getHabitStreak(habit.id)} days)`)
      .join('; ');
  }, [activeHabits, getHabitStreak]);

  const yesterdaysCompletions = useMemo(() => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = format(yesterday, 'yyyy-MM-dd');
    const completedIds = new Set(
      state.habitLogs.filter(l => l.date === yStr && l.completed).map(l => l.habitId),
    );
    if (completedIds.size === 0) return 'none';
    return activeHabits
      .filter(h => completedIds.has(h.id))
      .map(h => h.title)
      .join(', ');
  }, [activeHabits, state.habitLogs]);

  const showResponseCard = followupLoading || followupAnswer != null || followupError != null;
  const isStreamingWords = followupAnswer != null && displayedAnswer !== followupAnswer;
  const showRunningFigure = followupLoading || isStreamingWords || figureExiting;

  const totalWords = useMemo(
    () => (followupAnswer ? followupAnswer.trim().split(/\s+/).filter(Boolean).length : 0),
    [followupAnswer],
  );
  const currentWordCount = useMemo(
    () => displayedAnswer.trim().split(/\s+/).filter(Boolean).length,
    [displayedAnswer],
  );
  const sparkPosition = followupLoading
    ? 0
    : totalWords > 0
      ? Math.min(100, ((currentWordCount + 0.5) / totalWords) * 100)
      : 0;
  const sparkLeftStyle =
    figureExiting
      ? { left: '100%', transition: 'left 0.4s ease-out' }
      : {
          left: `calc(${sparkPosition}% - ${(SPARK_FIGURE_WIDTH_PX * sparkPosition) / 100}px)`,
          transition: 'left 0.06s linear',
        };

  const startWordReveal = useCallback(() => {
    if (!followupAnswer) return;
    const words = followupAnswer.split(/(\s+)/);
    wordIndexRef.current = 0;
    setDisplayedAnswer('');

    const tick = () => {
      if (wordIndexRef.current >= words.length) {
        setFigureExiting(true);
        return;
      }
      setDisplayedAnswer(prev => prev + words[wordIndexRef.current]);
      wordIndexRef.current += 1;
      timerRef.current = setTimeout(tick, WORD_DELAY_MS);
    };
    timerRef.current = setTimeout(tick, WORD_DELAY_MS);
  }, [followupAnswer]);

  useEffect(() => {
    if (!followupAnswer || displayedAnswer !== '') return;
    startWordReveal();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [followupAnswer, startWordReveal]);

  useEffect(() => {
    if (!figureExiting) return;
    const t = setTimeout(() => {
      setFigureExited(true);
      setFigureExiting(false);
    }, 520);
    return () => clearTimeout(t);
  }, [figureExiting]);

  const handleAskCoach = async () => {
    const question = followupQuestion.trim();
    if (!question) return;
    setFollowupLoading(true);
    setFollowupError(null);
    setFollowupAnswer(null);
    setDisplayedAnswer('');
    setFigureExited(false);
    setFigureExiting(false);
    setResponseTimestamp(new Date());
    try {
      const identity = state.identityStatement?.trim() || 'not set';
      const baseContext = `My identity goal: ${identity}. My habits and streaks: ${habitsAndStreaks}. Yesterday I completed: ${yesterdaysCompletions}.`;
      const userPrompt = `${baseContext} Follow-up question: ${question}`;
      const answer = await callCoachApi(SPARK_SYSTEM_PROMPT, userPrompt);
      setFollowupAnswer(answer);
    } catch (err) {
      setFollowupError(err instanceof Error ? err.message : 'Failed to get response from Spark.');
    } finally {
      setFollowupLoading(false);
    }
  };

  const hasTyped = followupQuestion.trim().length > 0;

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 mb-2">
          <SparkHeaderFigure />
          <h1 className="text-2xl">Spark</h1>
        </motion.div>
        <p className="text-muted-foreground text-sm mb-6">
          Hey, I&apos;m Spark. Let&apos;s build something great.
        </p>

        {/* Response card — only when we have sent a message (loading or answer) */}
        {showResponseCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-2xl border p-5"
            style={{ backgroundColor: '#111111', borderColor: '#1e1e1e' }}
          >
            {(followupLoading || followupAnswer || followupError) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] uppercase mb-3"
                style={{ color: '#444444', letterSpacing: '0.15em' }}
              >
                From Spark
              </motion.p>
            )}

            {/* Spark runs left→right; text trails behind him word by word */}
            {showRunningFigure && (
              <div className="spark-run-track min-h-[20px] h-8 flex items-center mb-2">
                <div
                  className="absolute top-0 flex items-center"
                  style={sparkLeftStyle}
                >
                  <RunningStickFigure />
                </div>
              </div>
            )}

            {followupAnswer && (
              <>
                <div className="text-sm text-foreground/95 font-body" style={{ lineHeight: 1.7 }}>
                  {figureExited ? (
                    followupAnswer
                  ) : (
                    <span>
                      {displayedAnswer}
                      <span className="animate-pulse">|</span>
                    </span>
                  )}
                </div>
                {figureExited && responseTimestamp && (
                  <p className="text-xs mt-3 text-muted-foreground">
                    {format(responseTimestamp, 'h:mm a')}
                  </p>
                )}
              </>
            )}

            {followupError && (
              <p className="text-sm text-destructive mt-2">{followupError}</p>
            )}
          </motion.div>
        )}

        {/* Ask Spark — input */}
        <div className="rounded-2xl border border-border p-4 space-y-3" style={{ backgroundColor: '#111111', borderColor: '#1e1e1e' }}>
          <div className="relative">
            <textarea
              rows={3}
              className="w-full rounded-xl bg-background border border-border px-3 py-2 pr-9 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
              placeholder="Ask Spark anything..."
              value={followupQuestion}
              onChange={e => setFollowupQuestion(e.target.value)}
            />
            {hasTyped && !followupLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute bottom-2 right-2 pointer-events-none"
              >
                <InputBounceFigure />
              </motion.div>
            )}
          </div>
          <button
            onClick={handleAskCoach}
            disabled={followupLoading || !followupQuestion.trim()}
            className="w-full py-2.5 rounded-2xl gradient-warm text-primary-foreground text-sm font-semibold shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {followupLoading ? 'Thinking…' : 'Ask Spark'}
          </button>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
