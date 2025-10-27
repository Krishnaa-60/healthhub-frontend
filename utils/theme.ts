type Theme = 'light' | 'dark';

export const getStoredTheme = (): Theme | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('theme') as Theme || null;
  }
  return null;
};

export const setStoredTheme = (theme: Theme): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
};

export const getSystemTheme = (): Theme => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const initializeTheme = (): Theme => {
  const storedTheme = getStoredTheme();
  const systemTheme = getSystemTheme();
  const theme = storedTheme || systemTheme;
  setStoredTheme(theme);
  return theme;
};
