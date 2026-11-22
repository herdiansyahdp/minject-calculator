/**
 * History manager for calculation history.
 * Uses an injected storage interface (defaults to localStorage) for testability.
 *
 * @param {object} [storage=localStorage] - storage interface with getItem/setItem/removeItem
 * @returns {HistoryManager}
 */

const STORAGE_KEY = 'calc_history';
const MAX_ITEMS = 50;

export function createHistoryManager(storage = globalThis.localStorage) {
  let items = _load(storage);

  function _load(s) {
    try {
      return JSON.parse(s.getItem(STORAGE_KEY)) ?? [];
    } catch {
      return [];
    }
  }

  function _save() {
    storage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  return {
    /** Prepend entry; cap at MAX_ITEMS; persist. */
    add(entry) {
      items.unshift(entry);
      if (items.length > MAX_ITEMS) items = items.slice(0, MAX_ITEMS);
      _save();
    },

    /** Returns array newest-first. */
    getAll() {
      return items.slice();
    },

    /** Empty list and persist. */
    clear() {
      items = [];
      _save();
    },
  };
}
