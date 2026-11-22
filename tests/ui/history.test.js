import { createHistoryManager } from '../../src/ui/history.js';

function mockStorage() {
  const store = {};
  return {
    getItem: k => store[k] ?? null,
    setItem: (k, v) => { store[k] = v; },
    removeItem: k => { delete store[k]; },
  };
}

test('starts empty', () => {
  expect(createHistoryManager(mockStorage()).getAll()).toEqual([]);
});

test('add one entry', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '2+2', result: '4' });
  expect(h.getAll()).toEqual([{ expr: '2+2', result: '4' }]);
});

test('newest entry is first', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '1+1', result: '2' });
  h.add({ expr: '3+3', result: '6' });
  expect(h.getAll()[0].expr).toBe('3+3');
});

test('capped at 50 items', () => {
  const h = createHistoryManager(mockStorage());
  for (let i = 0; i < 55; i++) h.add({ expr: `${i}+1`, result: `${i + 1}` });
  expect(h.getAll().length).toBe(50);
});

test('clear empties history', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '1+1', result: '2' });
  h.clear();
  expect(h.getAll()).toEqual([]);
});

test('persists to storage', () => {
  const s = mockStorage();
  const h = createHistoryManager(s);
  h.add({ expr: '5*5', result: '25' });
  expect(s.getItem('calc_history')).toBeTruthy();
  // reload from same storage
  const h2 = createHistoryManager(s);
  expect(h2.getAll()[0].expr).toBe('5*5');
});

test('getAll returns a copy (not live reference)', () => {
  const h = createHistoryManager(mockStorage());
  h.add({ expr: '1+1', result: '2' });
  const list = h.getAll();
  list.push({ expr: 'injected', result: '0' });
  expect(h.getAll().length).toBe(1);
});
