import TabBar from '@/components/TabBar';
import { motion } from 'framer-motion';

const lessons = [
  { id: '1', title: 'The Power of Small Habits', subtitle: 'Why tiny changes compound into lasting change', readTime: 3, category: 'Habits' },
  { id: '2', title: 'Identity-Based Habits', subtitle: 'Change who you are, not what you do', readTime: 4, category: 'Identity' },
  { id: '3', title: 'The 2-Minute Rule', subtitle: 'Make it so easy you can\'t say no', readTime: 2, category: 'Systems' },
  { id: '4', title: 'Habit Stacking', subtitle: 'Link new habits to existing ones', readTime: 3, category: 'Systems' },
  { id: '5', title: 'Never Miss Twice', subtitle: 'The most powerful rule for consistency', readTime: 3, category: 'Habits' },
];

export default function Learn() {
  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#080808' }}>
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl mb-2 font-semibold text-white">Learn</h1>
          <p className="text-white/60 text-sm mb-8">Daily lessons on building better habits</p>
        </motion.div>

        {/* Today's lesson */}
        <motion.div
          className="p-6 rounded-3xl gradient-warm text-primary-foreground mb-6 shadow-elevated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <span className="text-xs font-semibold opacity-70 uppercase tracking-wider">Today's Lesson</span>
          <h2 className="text-xl font-display mt-2 mb-1">{lessons[0].title}</h2>
          <p className="text-sm opacity-80">{lessons[0].subtitle}</p>
          <p className="text-xs mt-3 opacity-60">{lessons[0].readTime} min read</p>
        </motion.div>

        {/* Other lessons */}
        <h3 className="font-display text-lg mb-4 text-white">Recent Lessons</h3>
        <div className="space-y-3">
          {lessons.slice(1).map((lesson, i) => (
            <motion.div
              key={lesson.id}
              className="p-4 rounded-[20px] border flex items-center gap-4"
              style={{ backgroundColor: '#111111', borderColor: '#222222' }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm text-white/80 border border-white/20">
                {lesson.category[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">{lesson.title}</p>
                <p className="text-xs text-white/60">{lesson.readTime} min read</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <TabBar />
    </div>
  );
}
