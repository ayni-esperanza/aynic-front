import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>((set) => {
  // Obtener tema inicial
  const getInitialTheme = (): Theme => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) return savedTheme;

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }

    return 'light';
  };

  const initialTheme = getInitialTheme();

  // Aplicar tema inicial
  const root = window.document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(initialTheme);

  return {
    theme: initialTheme,
    toggleTheme: () =>
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(newTheme);
        localStorage.setItem('theme', newTheme);
        return { theme: newTheme };
      }),
    setTheme: (theme: Theme) =>
      set(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
        localStorage.setItem('theme', theme);
        return { theme };
      }),
  };
});
