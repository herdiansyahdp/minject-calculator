/**
 * UI Controller — wires DOM buttons, keyboard, display, history panel, theme, and preview.
 * Imports pure logic modules; no business logic here.
 */

import { calculate } from '../calc/index.js';
import { createHistoryManager } from './history.js';
import { createThemeManager } from './theme.js';
import { canAppend } from './inputValidator.js';

// --- DOM References ---
const displayExpr        = document.getElementById('display-expr');
const displayResult      = document.getElementById('display-result');
const displayPreviewTag  = document.getElementById('display-preview-tag');
const historyList        = document.getElementById('history-list');
const historyBadge       = document.getElementById('history-badge');
const btnClearHist       = document.getElementById('btn-clear-history');
const themeBtnLight      = document.getElementById('theme-btn-light');
const themeBtnDark       = document.getElementById('theme-btn-dark');

// --- State ---
let expr = '';
let lastAnswer = '';
let isCommittedResult = false;
let lastWasError = false;

const historyManager = createHistoryManager(localStorage);
const themeManager   = createThemeManager();

// --- Theme Management ---
themeManager.init();
syncThemeUI();

function syncThemeUI() {
  const current = themeManager.getCurrent();
  const isDark = current === 'dark';

  themeBtnLight.classList.toggle('active', !isDark);
  themeBtnLight.setAttribute('aria-checked', String(!isDark));

  themeBtnDark.classList.toggle('active', isDark);
  themeBtnDark.setAttribute('aria-checked', String(isDark));
}

themeBtnLight.addEventListener('click', () => {
  themeManager.set('light');
  syncThemeUI();
});

themeBtnDark.addEventListener('click', () => {
  themeManager.set('dark');
  syncThemeUI();
});

// --- Display & Live Preview Helpers ---
function updateDisplay() {
  displayExpr.textContent = expr || '0';

  if (!expr) {
    displayResult.textContent = '';
    displayResult.classList.remove('error-state');
    displayPreviewTag.style.display = 'none';
    return;
  }

  // Live preview evaluation (silent on incomplete expressions)
  if (!isCommittedResult) {
    const { result, error } = calculate(expr);
    if (!error && result !== null) {
      displayResult.textContent = '= ' + result;
      displayResult.classList.remove('error-state');
      displayPreviewTag.style.display = 'block';
    } else {
      displayResult.textContent = '';
      displayPreviewTag.style.display = 'none';
    }
  }
}

function showCommittedResult(text, isError = false) {
  isCommittedResult = true;
  lastWasError = isError;
  displayPreviewTag.style.display = 'none';

  if (isError) {
    displayResult.textContent = text;
    displayResult.classList.add('error-state');
  } else {
    displayResult.textContent = '= ' + text;
    displayResult.classList.remove('error-state');
  }
}

// --- History Rendering ---
function renderHistory() {
  historyList.innerHTML = '';
  const items = historyManager.getAll();

  if (historyBadge) {
    historyBadge.textContent = items.length;
  }

  if (items.length === 0) {
    const emptyLi = document.createElement('li');
    emptyLi.className = 'history-empty-text';
    emptyLi.textContent = 'Belum ada riwayat perhitungan';
    historyList.appendChild(emptyLi);
    return;
  }

  for (const item of items) {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', `${item.expr} = ${item.result}`);

    const exprDiv = document.createElement('div');
    exprDiv.className = 'history-item-expr';
    exprDiv.textContent = item.expr;

    const resDiv = document.createElement('div');
    resDiv.className = 'history-item-res';
    resDiv.textContent = item.result;

    li.appendChild(exprDiv);
    li.appendChild(resDiv);

    // Click: insert result into input
    li.addEventListener('click', () => useHistoryItem(item.result));
    li.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        useHistoryItem(item.result);
      }
    });

    historyList.appendChild(li);
  }
}

function useHistoryItem(result) {
  expr = result;
  isCommittedResult = false;
  lastWasError = false;
  updateDisplay();
}

// --- Calculator Actions ---
function appendChar(char) {
  if (lastWasError) {
    expr = '';
    lastWasError = false;
  }
  isCommittedResult = false;

  if (!canAppend(expr, char)) return;

  // Clean spacing around binary operators
  const isBinaryOp = ['+', '*', '/', '×', '÷', '^'].includes(char);
  if (isBinaryOp && expr.length > 0) {
    const symbol = char === '*' ? '×' : (char === '/' ? '÷' : char);
    expr = expr.trimEnd() + ' ' + symbol + ' ';
  } else if (char === '-' && expr.length > 0 && !expr.trimEnd().endsWith('(') && !['+','-','*','/','×','÷','^'].includes(expr.trimEnd().slice(-1))) {
    expr = expr.trimEnd() + ' - ';
  } else {
    expr += char;
  }

  updateDisplay();
}

function doBackspace() {
  if (lastWasError) {
    doClear();
    return;
  }
  isCommittedResult = false;

  // Trim trailing space if operator had spacing
  if (expr.endsWith(' ')) {
    expr = expr.trimEnd();
  }
  expr = expr.slice(0, -1).trimEnd();
  updateDisplay();
}

function doClear() {
  expr = '';
  isCommittedResult = false;
  lastWasError = false;
  updateDisplay();
}

function doCalculate() {
  if (!expr) return;
  const { result, error } = calculate(expr);
  if (error) {
    showCommittedResult('⚠ ' + error, true);
  } else {
    showCommittedResult(result, false);
    lastAnswer = result;
    historyManager.add({ expr, result });
    renderHistory();
  }
}

function doAns() {
  // Use last answer if available, or newest item from history
  const ansToUse = lastAnswer || (historyManager.getAll()[0]?.result ?? '');
  if (!ansToUse) return;

  if (lastWasError) {
    expr = '';
    lastWasError = false;
  }
  isCommittedResult = false;

  // If last char is a digit, add multiply first
  const last = expr.trim().slice(-1);
  if (last && (last >= '0' && last <= '9')) {
    expr = expr.trimEnd() + ' × ' + ansToUse;
  } else {
    expr += ansToUse;
  }
  updateDisplay();
}

// --- Visual feedback for button click / keypress ---
function triggerButtonFeedback(btn) {
  if (!btn) return;
  btn.classList.add('btn-active');
  setTimeout(() => btn.classList.remove('btn-active'), 120);
}

// --- Button Wiring ---
document.querySelectorAll('.keypad-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    triggerButtonFeedback(btn);
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
      case 'ans':       doAns();       break;
    }
  });
});

btnClearHist.addEventListener('click', () => {
  historyManager.clear();
  renderHistory();
});

// --- Sample Expressions Wiring ---
document.querySelectorAll('[data-sample]').forEach(btn => {
  btn.addEventListener('click', () => {
    const sample = btn.dataset.sample;
    expr = sample;
    isCommittedResult = false;
    lastWasError = false;
    updateDisplay();
  });
});

// --- Keyboard Handling ---
const KEY_MAP = {
  '0':'0','1':'1','2':'2','3':'3','4':'4',
  '5':'5','6':'6','7':'7','8':'8','9':'9',
  '.':'.', '+':'+', '-':'-', '*':'×', '/':'÷',
  'x':'×', 'X':'×', '^':'^', '(':'(', ')':')',
  'r':'√', 'R':'√',
};

document.addEventListener('keydown', e => {
  if (e.ctrlKey || e.altKey || e.metaKey) return;

  if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    const btn = document.querySelector('[data-action="equals"]');
    triggerButtonFeedback(btn);
    doCalculate();
    return;
  }

  if (e.key === 'Escape') {
    const btn = document.querySelector('[data-action="clear"]');
    triggerButtonFeedback(btn);
    doClear();
    return;
  }

  if (e.key === 'Backspace') {
    const btn = document.querySelector('[data-action="backspace"]');
    triggerButtonFeedback(btn);
    doBackspace();
    return;
  }

  const mapped = KEY_MAP[e.key];
  if (mapped !== undefined) {
    // Find matching button to animate
    const btn = document.querySelector(`[data-value="${mapped}"]`);
    triggerButtonFeedback(btn);
    appendChar(mapped);
  }
});

// --- Initial Render ---
updateDisplay();
renderHistory();
