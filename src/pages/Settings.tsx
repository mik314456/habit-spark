import { useApp } from '@/contexts/AppContext';
import TabBar from '@/components/TabBar';
import { motion } from 'framer-motion';

export default function Settings() {
  const { state, resetApp } = useApp();

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="max-w-md mx-auto px-5 pt-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl mb-8">Settings</h1>
        </motion.div>

        <div className="space-y-3">
          {/* Identity */}
          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Your Identity</p>
            <p className="font-medium">{state.identityStatement || 'Not set'}</p>
          </div>

          {/* Stats */}
          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Active Habits</p>
            <p className="font-medium">{state.habits.filter(h => !h.archived).length}</p>
          </div>

          <div className="p-4 rounded-2xl bg-card shadow-card">
            <p className="text-xs text-muted-foreground mb-1 font-body">Total Completions</p>
            <p className="font-medium">{state.habitLogs.filter(l => l.completed).length}</p>
          </div>

          {/* Reset */}
          <div className="pt-8">
            <button
              onClick={() => {
                if (window.confirm('This will reset all your data. Are you sure?')) {
                  resetApp();
                  window.location.href = '/';
                }
              }}
              className="w-full py-3 rounded-2xl bg-destructive/10 text-destructive font-medium text-sm"
            >
              Reset All Data
            </button>
          </div>
        </div>
      </div>
      <TabBar />
    </div>
  );
}
