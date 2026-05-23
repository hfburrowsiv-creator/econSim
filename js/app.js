// js/app.js — Entry point: event handling and display updates (depends on model.js, charts.js)

const VAR_SYMBOLS = {
  G:    'G',
  T:    'T',
  M:    'M',
  P:    'P',
  Pe:   'Pₑ',
  Ybar: 'Ȳ',
  Yf:   'Yᶠ',
  MPKf: 'MPKᶠ',
  W:    'W',
  A:    'A',
  L:    'L',
  Ndes: 'N*',
  K:    'K',
  Uopt: 'uK*',
  EPf:  "E(P')",
  IC:   'IC',
  CR:   'CR',
};

function getStateLabel(key) {
  const offset = state[key] - 5;
  const sym = VAR_SYMBOLS[key] || key;
  if (offset === 0) return sym + '₀';           // G₀ (baseline)
  if (offset > 0)   return sym + '₀ +' + offset; // G₀ +1
  return sym + '₀ −' + Math.abs(offset);    // G₀ −1
}

function updateDisplay() {
  document.querySelectorAll('[data-display]').forEach(el => {
    const key = el.dataset.display;
    const offset = state[key] - 5;
    el.textContent = getStateLabel(key);
    el.className = 'var-state' +
      (offset > 0 ? ' raised' : offset < 0 ? ' lowered' : '');
  });
}

function setVariable(key, action) {
  if (!Object.prototype.hasOwnProperty.call(state, key)) {
    console.warn(`Unknown variable: ${key}`);
    return false;
  }

  if      (action === 'up')   state[key] = Math.min(state[key] + STEP, MAX);
  else if (action === 'down') state[key] = Math.max(state[key] - STEP, MIN);
  else if (action === 'same') state[key] = 5;
  else return false;

  return true;
}

document.addEventListener('DOMContentLoaded', () => {
  initCharts();
  updateCharts(state);
  updateDisplay();

  document.getElementById('controls').addEventListener('click', e => {
    const btn = e.target.closest('[data-var]');
    if (!btn) return;

    const key    = btn.dataset.var;
    const action = btn.dataset.action;

    if (!setVariable(key, action)) return;

    updateCharts(state);
    updateDisplay();
  });
});
