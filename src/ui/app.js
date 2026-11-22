/**
 * UI Controller — wires DOM buttons, keyboard, display, history panel.
 * Imports all logic modules; no business logic here.
 */

import { calculate } from '../calc/index.js';
import { createHistoryManager } from './history.js';
import { createThemeManager } from './theme.js';
import { canAppend } from './inputValidator.js';

// --- DOM refs ---
const displayExpr   = document.getElementById('display-expr');
const displayResult = document.getElementById('display-result');
const historyList   = document.getElementById('history-list');
const btnClearHist  = document.getElementById('btn-clear-history');
const btnTheme      = document.getElementById('btn-theme');

// --- State ---
let expr = '';
let lastWasError = false;

const historyManager = createHistoryManager(localStorage);
const themeManager   = createThemeManager();
themeManager.init();
updateThemeButton();

// --- Render helpers ---
function updateDisplay() {
  displayExpr.textContent = expr || '0';
  displayResult.textContent = '';
}

function showResult(text, isError = false) {
  displayResult.textContent = text;
  displayResult.setAttribute('aria-live', 'polite');
  lastWasError = isError;
}

function renderHistory() {
  historyList.innerHTML = '';
  for (const item of historyManager.getAll()) {
    const li = document.createElement('li');
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `${item.expr} = ${item.result}`);

    const exprSpan = document.createElement('span');
    exprSpan.className = 'hist-expr';
    exprSpan.textContent = item.expr;

    const resSpan = document.createElement('span');
    resSpan.className = 'hist-result';
    resSpan.textContent = '= ' + item.result;

    li.appendChild(exprSpan);
    li.appendChild(resSpan);

    // Click: insert result into input
    li.addEventListener('click', () => useHistoryItem(item.result));
    li.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') useHistoryItem(item.result); });

    historyList.appendChild(li);
  }
}

function useHistoryItem(result) {
  expr = result;
  updateDisplay();
}

function updateThemeButton() {
  const isDark = themeManager.getCurrent() === 'dark';
  btnTheme.textContent = isDark ? '☀️' : '🌙';
  btnTheme.setAttribute('aria-label', isDark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap');
}

// --- Actions ---
function appendChar(char) {
  if (lastWasError) {
    // after error, clear result display but keep expr editable
    displayResult.textContent = '';
    lastWasError = false;
  }
  if (!canAppend(expr, char)) return;
  expr += char;
  updateDisplay();
}

function doBackspace() {
  expr = expr.slice(0, -1);
  lastWasError = false;
  updateDisplay();
}

function doClear() {
  expr = '';
  lastWasError = false;
  updateDisplay();
  displayResult.textContent = '';
}

function doCalculate() {
  if (!expr) return;
  const { result, error } = calculate(expr);
  if (error) {
    showResult('⚠ ' + error, true);
  } else {
    showResult('= ' + result);
    historyManager.add({ expr, result });
    renderHistory();
    // keep expr on screen; user can continue editing or clear
  }
}

// --- Button wiring ---
document.querySelectorAll('[data-action]').forEach(btn => {
  btn.addEventListener('click', () => {
    const action = btn.dataset.action;
    switch (action) {
      case 'digit':
      case 'op':
      case 'paren':
      case 'dot':
        appendChar(btn.dataset.value);
        break;
      case 'clear':     doClear();     break;
      case 'backspace': doBackspace(); break;
      case 'equals':    doCalculate(); break;
    }
  });
});

btnClearHist.addEventListener('click', () => {
  historyManager.clear();
  renderHistory();
});

btnTheme.addEventListener('click', () => {
  themeManager.toggle();
  updateThemeButton();
});

// --- Keyboard ---
const KEY_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.':'.', '+':'+', '-':'-', '*':'*', '/':'/',
  '^':'^', '(':' (', ')':')',
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key === 'Enter' || e.key === '=') { e.preventDefault(); doCalculate(); return; }
  if (e.key === 'Escape')     { doClear();     return; }
  if (e.key === 'Backspace')  { doBackspace(); return; }

  const mapped = KEY_MAP[e.key];
  if (mapped !== undefined) appendChar(mapped.trim() || e.key);
});

// --- Initial render ---
updateDisplay();
renderHistory();
