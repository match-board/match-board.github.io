import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = document.documentElement.classList.contains('dark');
    setTheme(isDark ? 'dark' : 'light');
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);

    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    window.dispatchEvent(new CustomEvent('matchboard:theme-change', { detail: { theme: nextTheme } }));
  };

  // Avoid hydration mismatch before mount
  if (!mounted) {
    return (
      <button
        type="button"
        className="w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-slate-800 text-slate-400 opacity-60"
        aria-label="Toggle Theme"
      >
        <span className="w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
      aria-label="Toggle Theme"
      className="group relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-300
        bg-white/80 border-slate-200/90 text-[#287A74] hover:bg-[#FFF8B0]/40 hover:border-[#55A9A0] hover:shadow-luxury
        dark:bg-[#131A20]/90 dark:border-slate-800 dark:text-[#AEEED3] dark:hover:border-[#AEEED3]/50 dark:hover:shadow-glow-mint"
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 transition-transform duration-300 group-hover:rotate-45 text-[#AEEED3]" />
      ) : (
        <Moon className="w-5 h-5 transition-transform duration-300 group-hover:-rotate-12 text-[#287A74]" />
      )}
      <span className="sr-only">Toggle theme (currently {theme})</span>
    </button>
  );
};

export default ThemeToggle;
