// js/model.js — State object and economic math (loaded as plain script, no ES modules)

const STEP = 2;
const MIN  = 0;
const MAX  = 10;

// LM curve uses log(M/P) — produces a curved (hyperbolic) AD when parameterised over P
const LM_K = 4;

// AS curve parameters (Keynesian single-curve: flat → upward → asymptotic at Y^FE)
// P_AS(Y) = Pe · (AS_FLOOR + AS_K · Y / (Y^FE − Y + ε))
const AS_FLOOR = 0.5;   // AS starts at Pe · AS_FLOOR when Y = 0
const AS_K     = 0.056; // controls steepness (reaches chart top ~0.96 · Y^FE)

const state = {
  G:    5,  // Government spending           → shifts IS right ↑, AD right ↑
  T:    5,  // Taxes                         → shifts IS left ↑,  AD left ↑
  M:    5,  // Nominal money supply          → shifts LM right ↑, Mˢ right ↑, AD right ↑
  P:    5,  // Price level (user-chosen)     → shifts LM left ↑ (M/P falls), Mˢ left ↑
  Pe:   5,  // Expected price / cost level   → shifts AS up ↑
  Ybar: 5,  // Full-employment output (Y^FE) → shifts Y^FE line right ↑
  Yf:   5,  // Expected future income        → shifts IS right ↑ (boosts C today)
  MPKf: 5,  // Expected future profitability → shifts IS right ↑ (boosts I today)
  W:    5,  // Wealth                        → shifts IS right ↑ (boosts C today)
  A:    5,  // Productivity                  → raises productive capacity, shifts AS/Y^FE right ↑
  L:    5,  // Labor                         → raises productive capacity, shifts AS/Y^FE right ↑
  Ndes: 5,  // Desirable number of hours     → raises productive capacity, shifts AS/Y^FE right ↑
  K:    5,  // Capital stock                 → raises productive capacity, shifts AS/Y^FE right ↑
  Uopt: 5,  // Optimal capital utilization   → raises productive capacity, shifts AS/Y^FE right ↑
  EPf:  5,  // Expected future price level   → shifts AS up ↑
  IC:   5,  // Input costs                   → shifts AS up ↑
  CR:   5,  // Contract renegotiations       → shifts AS up ↑
};

// Fine-grained domain for smooth curves
const Y_DOMAIN = Array.from({ length: 101 }, (_, i) => i * 0.1); // 0.0 → 10.0

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Guard values that appear in log() or division
function safe(v) { return Math.max(v, 0.5); }

function potentialOutput(s) {
  const supplyShift =
    0.35 * (s.A - 5) +
    0.25 * (s.L - 5) +
    0.20 * (s.Ndes - 5) +
    0.30 * (s.K - 5) +
    0.20 * (s.Uopt - 5);

  return clamp(s.Ybar + supplyShift, 1, MAX);
}

function asCostLevel(s) {
  const costPush =
    0.35 * (s.EPf - 5) +
    0.35 * (s.IC - 5) +
    0.25 * (s.CR - 5);

  return safe(s.Pe + costPush);
}

// ── IS Curve intercept ────────────────────────────────────────────────────────
// Rises with G, Yf, MPKf, W; falls with T
// Constant chosen so default IS/LM equilibrium is at Y = 5, r = 3
function isIntercept(s) {
  return s.G - 0.6 * s.T + 0.5 * (s.Yf - 5) + 0.5 * (s.MPKf - 5) + 0.5 * (s.W - 5) + 5;
}

// ── IS Curve ─────────────────────────────────────────────────────────────────
// r = isIntercept(s) − 0.8·Y   (negatively sloped in Y-r space)
function getISCurve(s) {
  const int = isIntercept(s);
  return { x: Y_DOMAIN, y: Y_DOMAIN.map(y => clamp(int - 0.8 * y, MIN, MAX)) };
}

// ── LM Curve ─────────────────────────────────────────────────────────────────
// r = 0.6·Y − LM_K·log(M/P)
// Using log(M/P) rather than (M−P) gives a proper nonlinear real-money effect,
// which in turn produces a correctly curved (hyperbolic) AD when traced over P.
function getLMCurve(s) {
  const lmInt = LM_K * Math.log(safe(s.M) / safe(s.P));
  return { x: Y_DOMAIN, y: Y_DOMAIN.map(y => clamp(0.6 * y - lmInt, MIN, MAX)) };
}

// ── IS/LM Equilibrium ────────────────────────────────────────────────────────
// IS = LM: isInt − 0.8Y = 0.6Y − LM_K·log(M/P)
// → Y* = (isInt + LM_K·log(M/P)) / 1.4
function getEquilibrium(s) {
  const isInt  = isIntercept(s);
  const lmShift = LM_K * Math.log(safe(s.M) / safe(s.P));
  const Y = clamp((isInt + lmShift) / 1.4, MIN, MAX);
  const r = clamp(isInt - 0.8 * Y, MIN, MAX);
  return { Y, r };
}

// ── Money Supply ─────────────────────────────────────────────────────────────
// Vertical line at x = 5·(M/P)  — normalised so default (M=P=5) → x = 5
// Shifts right when M↑ or P↓ (more real money); left when P↑ or M↓
function getMoneySupply(s) {
  const mp = clamp(5 * safe(s.M) / safe(s.P), MIN, MAX);
  return { x: [mp, mp], y: [MIN, MAX] };
}

// ── Money Demand ─────────────────────────────────────────────────────────────
// Downward sloping; anchored to IS/LM equilibrium so both charts show the same r*
// r = r* + 0.8·(mp − x)  — passes through (mp, r*) by construction
function getMoneyDemand(s) {
  const { r: rEq } = getEquilibrium(s);
  const mp = 5 * safe(s.M) / safe(s.P);
  return {
    x: Y_DOMAIN,
    y: Y_DOMAIN.map(x => clamp(rEq + 0.8 * (mp - x), MIN, MAX)),
  };
}

// ── AD Curve (curved / hyperbolic) ───────────────────────────────────────────
// Derived from IS-LM parameterised over P.
// Because LM uses log(M/P), AD is NOT linear — it curves like a rectangular hyperbola.
//
// From IS = LM at varying P:
//   Y(P) = (isInt + LM_K·log(M/P)) / 1.4
//
// Equivalently, express P as a function of Y:
//   P_AD(Y) = M · exp((isInt − 1.4·Y) / LM_K)
//
// → Exponentially decreasing in Y; concave shape in (Y, P) space.
//
// Returns {x: Y_values, y: P_values} for plotting.
function getADCurve(s) {
  const isInt = isIntercept(s);
  const safeM = safe(s.M);
  return {
    x: Y_DOMAIN,
    y: Y_DOMAIN.map(Y => clamp(safeM * Math.exp((isInt - 1.4 * Y) / LM_K), MIN, MAX)),
  };
}

// ── AS Curve (Keynesian single curve, three zones) ────────────────────────────
// P_AS(Y) = Pₑ · (AS_FLOOR + AS_K · Y / (Y^FE − Y + ε))
//
// Zone 1 — Keynesian (flat):   Y well below Y^FE → denominator large → P ≈ Pₑ·AS_FLOOR
// Zone 2 — Intermediate:       Y approaches Y^FE → P rises noticeably
// Zone 3 — Classical (steep):  Y → Y^FE          → denominator → 0 → P → ∞
//
// Shifts up when Pₑ↑ (cost-push); asymptote moves right when Ȳ↑
function getASCurve(s) {
  const yfe  = potentialOutput(s);
  const cost = asCostLevel(s);
  // Only plot up to 99% of Y^FE (beyond that AS goes off-chart)
  const Y_AS = Array.from({ length: 200 }, (_, i) => i * yfe * 0.99 / 199);
  return {
    x: Y_AS,
    y: Y_AS.map(Y => clamp(cost * (AS_FLOOR + AS_K * Y / (yfe - Y + 0.01)), MIN, MAX)),
  };
}

// ── Y^FE Line ─────────────────────────────────────────────────────────────────
// Full-employment output — vertical reference line at Y = Ȳ
function getYFE(s) {
  const yfe = potentialOutput(s);
  return { x: [yfe, yfe], y: [MIN, MAX] };
}

// ── AD/AS Equilibrium (numerical) ────────────────────────────────────────────
// Solves P_AD(Y) = P_AS(Y) by grid search over Y ∈ [0, 0.99·Y^FE].
// Returns the (Y, P) pair where the two curves intersect.
function getADASEquilibrium(s) {
  const isInt = isIntercept(s);
  const safeM = safe(s.M);
  const yfe   = potentialOutput(s);
  const cost  = asCostLevel(s);

  let bestY    = yfe * 0.5;
  let bestDiff = Infinity;

  for (let i = 1; i < 990; i++) {
    const Y    = i * yfe * 0.99 / 999;
    const P_AD = safeM * Math.exp((isInt - 1.4 * Y) / LM_K);
    const P_AS = cost * (AS_FLOOR + AS_K * Y / (yfe - Y + 0.01));

    if (P_AS > MAX + 2) break; // AS gone off-chart — no intersection possible further right

    const diff = Math.abs(P_AD - P_AS);
    if (diff < bestDiff) { bestDiff = diff; bestY = Y; }
  }

  const P_eq = cost * (AS_FLOOR + AS_K * bestY / (yfe - bestY + 0.01));
  return { Y: clamp(bestY, MIN, MAX), P: clamp(P_eq, MIN, MAX) };
}
