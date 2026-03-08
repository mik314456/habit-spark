import { useLocation, useNavigate } from 'react-router-dom';
import { Sun, BarChart2, Settings as SettingsIcon } from 'lucide-react';

/** Stick figure icon for Spark tab: head, body, two legs in walking pose. */
function SparkTabIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <circle cx="12" cy="5" r="2.5" />
      <line x1="12" y1="7.5" x2="12" y2="13" />
      <line x1="12" y1="13" x2="9" y2="20" />
      <line x1="12" y1="13" x2="15" y2="19" />
    </svg>
  );
}

const tabs = [
  { path: '/today', Icon: Sun, label: 'Today' },
  { path: '/progress', Icon: BarChart2, label: 'Progress' },
  { path: '/coach', Icon: SparkTabIcon, label: 'Spark' },
  { path: '/settings', Icon: SettingsIcon, label: 'Settings' },
];

export default function TabBar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="max-w-md mx-auto flex">
        {tabs.map(tab => {
          const active = location.pathname === tab.path;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex-1 flex flex-col items-center gap-0.5 py-3"
            >
              <tab.Icon
                className={`w-5 h-5 ${
                  active ? 'text-[color:var(--accent-color)]' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-[10px] font-body ${
                  active ? 'text-[color:var(--accent-color)]' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
