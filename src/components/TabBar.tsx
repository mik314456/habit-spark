import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sun, BarChart2, Sparkles, Settings as SettingsIcon } from 'lucide-react';

const tabs = [
  { path: '/today', Icon: Sun, label: 'Today' },
  { path: '/progress', Icon: BarChart2, label: 'Progress' },
  { path: '/coach', Icon: Sparkles, label: 'Coach' },
  { path: '/settings', Icon: SettingsIcon, label: 'Settings' },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-xl border-t border-border z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center gap-0.5 py-3 relative"
            >
              {active && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary"
                />
              )}
              <tab.Icon className={`w-5 h-5 ${active ? 'text-foreground' : 'text-muted-foreground'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
