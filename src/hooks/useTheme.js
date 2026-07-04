import { useEffect, useCallback } from 'react';

const THEME_KEY = 'trustmatches_theme';

export function useTheme() {
  const getStored = () => {
    try { return localStorage.getItem(THEME_KEY) || 'dark'; } catch { return 'dark'; }
  };

  const applyTheme = useCallback((theme) => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.add('dark');
    }
  }, []);

  const setTheme = useCallback((theme) => {
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    applyTheme(theme);
  }, [applyTheme]);

  const toggleTheme = useCallback(() => {
    const current = getStored();
    setTheme(current === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

  useEffect(() => {
    applyTheme(getStored());
  }, [applyTheme]);

  return { theme: getStored(), setTheme, toggleTheme };
}