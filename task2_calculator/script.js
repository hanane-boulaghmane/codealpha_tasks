/* ============================
   STATE
   ============================ */
let current   = '0';   // number currently shown on display
let stored    = null;  // first operand saved when operator is pressed
let operator  = null;  // current pending operator: + − × ÷
let justCalc  = false; // true right after = or operator press
let expression = '';   // expression string shown above display
let history   = [];    // array of past calculations
let histOpen  = false; // history panel open/closed


/* ============================
   DOM REFERENCES
   ============================ */
const mainDisplay  = document.getElementById('mainDisplay');
const expressionEl = document.getElementById('expression');
const historyList  = document.getElementById('historyList');
const toggleBtn    = document.getElementById('toggleHistory');


/* ============================
   DISPLAY HELPERS
   ============================ */

/**
 * Update the main display.
 * @param {string|number} val   - value to show
 * @param {boolean}       flash - briefly highlight in accent color
 */
function updateDisplay(val, flash = false) {
  const s = String(val);

  // Remove dynamic size / accent classes
  mainDisplay.classList.remove('small', 'xsmall', 'accent');

  // Responsive font size
  if (s.length > 12) mainDisplay.classList.add('xsmall');
  else if (s.length > 8) mainDisplay.classList.add('small');

  // Flash accent on equals result
  if (flash) {
    mainDisplay.classList.add('accent');
    setTimeout(() => mainDisplay.classList.remove('accent'), 600);
  }

  mainDisplay.textContent = s;
}

/**
 * Format a number cleanly — strips floating-point noise.
 * @param {number} n
 * @returns {string}
 */
function formatNum(n) {
  if (!isFinite(n) || isNaN(n)) return 'Error';
  return String(parseFloat(n.toPrecision(12)));
}


/* ============================
   CORE CALCULATOR LOGIC
   ============================ */

/**
 * Append a digit to the current number.
 * @param {string} digit
 */
function appendNum(digit) {
  if (justCalc) {
    // Start fresh after = or operator
    current  = digit;
    expression = '';
    justCalc = false;
  } else if (current === '0' && digit !== '.') {
    current = digit;
  } else if (current.length < 15) {
    current += digit;
  }
  updateDisplay(current);
}

/**
 * Append a decimal point (only if not already present).
 */
function appendDot() {
  if (justCalc) {
    current  = '0.';
    justCalc = false;
  } else if (!current.includes('.')) {
    current += '.';
  }
  updateDisplay(current);
}

/**
 * Set the pending operator.
 * If an operator was already pending, evaluate the chain first.
 * @param {string} op  - one of: + − × ÷
 */
function setOp(op) {
  if (operator && !justCalc) {
    // Chain: evaluate before setting the new operator
    calculate(true);
  }
  stored     = parseFloat(current);
  operator   = op;
  expression = current + ' ' + op;
  expressionEl.textContent = expression;
  justCalc   = true;
}

/**
 * Perform the calculation.
 * @param {boolean} chained - true when called mid-chain (not from = button)
 */
function calculate(chained = false) {
  if (operator === null || stored === null) return;

  const a = stored;
  const b = parseFloat(current);
  const fullExpr = expression + ' ' + current;
  let result;

  switch (operator) {
    case '+': result = a + b;              break;
    case '−': result = a - b;              break;
    case '×': result = a * b;              break;
    case '÷': result = b !== 0 ? a / b : NaN; break;
    default:  return;
  }

  const fmt = isFinite(result) && !isNaN(result) ? formatNum(result) : 'Error';

  if (!chained) {
    // Final result from = button
    expressionEl.textContent = fullExpr + ' =';
    addToHistory(fullExpr, fmt);
    operator = null;
    stored   = null;
  }

  current  = fmt;
  justCalc = true;
  updateDisplay(fmt, !chained);
}

/**
 * Clear everything and reset to initial state.
 */
function clearAll() {
  current    = '0';
  stored     = null;
  operator   = null;
  justCalc   = false;
  expression = '';
  expressionEl.textContent = '';
  updateDisplay('0');
}

/**
 * Toggle the sign of the current number.
 */
function toggleSign() {
  if (current === '0' || current === 'Error') return;
  current = current.startsWith('-') ? current.slice(1) : '-' + current;
  updateDisplay(current);
}

/**
 * Convert current number to percentage (÷ 100).
 */
function percentage() {
  const val = parseFloat(current);
  if (isNaN(val)) return;
  current = formatNum(val / 100);
  updateDisplay(current);
}


/* ============================
   HISTORY
   ============================ */

/**
 * Add a completed calculation to history.
 * @param {string} expr   - full expression string e.g. "5 + 3"
 * @param {string} result - result string e.g. "8"
 */
function addToHistory(expr, result) {
  history.unshift({ expr, result });
  if (history.length > 20) history.pop(); // keep last 20 entries
  if (histOpen) renderHistory();
}

/**
 * Render history entries into the panel.
 */
function renderHistory() {
  historyList.innerHTML = '';

  if (!history.length) {
    const empty = document.createElement('p');
    empty.className = 'history-empty';
    empty.textContent = 'No history yet';
    historyList.appendChild(empty);
    return;
  }

  history.forEach(entry => {
    const el = document.createElement('div');
    el.className = 'history-entry';
    el.innerHTML = entry.expr + ' = <span>' + entry.result + '</span>';

    // Click a history entry to reuse its result
    el.addEventListener('click', () => {
      current  = entry.result;
      justCalc = true;
      updateDisplay(current);
    });

    historyList.appendChild(el);
  });
}

/**
 * Toggle the history panel open/closed.
 */
function toggleHistory() {
  histOpen = !histOpen;
  historyList.classList.toggle('open', histOpen);
  toggleBtn.textContent = histOpen ? 'hide ↑' : 'show ↓';
  if (histOpen) renderHistory();
}


/* ============================
   EVENT LISTENERS — BUTTONS
   ============================ */

// Number buttons (0–9)
document.querySelectorAll('.btn[data-num]').forEach(btn => {
  btn.addEventListener('click', () => appendNum(btn.dataset.num));
});

// Operator buttons (÷ × − +)
document.querySelectorAll('.btn[data-op]').forEach(btn => {
  btn.addEventListener('click', () => setOp(btn.dataset.op));
});

// Special buttons
document.getElementById('btnAC').addEventListener('click',      clearAll);
document.getElementById('btnSign').addEventListener('click',    toggleSign);
document.getElementById('btnPercent').addEventListener('click', percentage);
document.getElementById('btnDot').addEventListener('click',     appendDot);
document.getElementById('btnEq').addEventListener('click',      () => calculate(false));
document.getElementById('toggleHistory').addEventListener('click', toggleHistory);


/* ============================
   KEYBOARD SUPPORT
   ============================ */
document.addEventListener('keydown', e => {
  if (e.key >= '0' && e.key <= '9') {
    appendNum(e.key);
  } else if (e.key === '.') {
    appendDot();
  } else if (e.key === '+') {
    setOp('+');
  } else if (e.key === '-') {
    setOp('−');
  } else if (e.key === '*') {
    setOp('×');
  } else if (e.key === '/') {
    e.preventDefault(); // prevent browser quick-find
    setOp('÷');
  } else if (e.key === 'Enter' || e.key === '=') {
    calculate(false);
  } else if (e.key === 'Escape') {
    clearAll();
  } else if (e.key === 'Backspace') {
    if (current.length > 1 && current !== 'Error') {
      current = current.slice(0, -1);
    } else {
      current = '0';
    }
    updateDisplay(current);
  } else if (e.key === '%') {
    percentage();
  }
});
