/**
 * Theme manager — dark/light mode with localStorage persistence.
 * Applies `data-theme` attribute to <html> element.
 *
 * Key in localStorage: 'calc_theme'
 */

const STORAGE_KEY = 'calc_theme';

export function createThemeManager() {
  let current = 'light';

  return {
    /** Read saved preference or system preference, then apply. */
    init() {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') {
        current = saved;
      } else {
        current = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', current);
    },

    /** Flip theme, save, re-apply. */
    toggle() {
      current = current === 'dark' ? 'light' : 'dark';
      localStorage.setItem(STORAGE_KEY, current);
      document.documentElement.setAttribute('data-theme', current);
    },

    getCurrent() {
      return current;
    },
  };
}
