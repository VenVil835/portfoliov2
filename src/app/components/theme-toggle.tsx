'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/theme-context';

export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="cursor-pointer p-2 rounded-full bg-slate-800 dark:bg-slate-800 light:bg-slate-200 hover:bg-slate-700 dark:hover:bg-slate-700 light:hover:bg-slate-300 transition-all duration-300 transform hover:scale-110"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-yellow-400 transition-transform duration-300 rotate-0 hover:rotate-180" />
            ) : (
                <Moon className="w-5 h-5 text-indigo-600 transition-transform duration-300 rotate-0 hover:-rotate-180" />
            )}
        </button>
    );
}
