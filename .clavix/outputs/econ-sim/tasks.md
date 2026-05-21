# Implementation Plan

**Project**: econ-sim
**Generated**: 2026-05-17T00:00:00Z

## Technical Context & Standards

*Detected Stack & Patterns*
- **Architecture**: Flat single-page app — no framework, no build step
- **Framework**: Vanilla JavaScript (ES6 modules via `<script type="module">`)
- **Styling**: Plain CSS (no preprocessor, no utility framework)
- **State**: Single `state` object in `js/model.js`; any mutation triggers full redraw
- **Graphs**: Plotly.js loaded via CDN (`https://cdn.plot.ly/plotly-2.35.2.min.js`)
- **File Structure**:
  ```
  econSim/
  ├── index.html
  ├── css/styles.css
  ├── js/
  │   ├── model.js    ← state + economic math
  │   ├── charts.js   ← Plotly init & update functions
  │   └── app.js      ← entry point + DOM event handling
  └── README.md
  ```
- **Conventions**: No real numbers in UI — symbolic variable labels (e.g., `G₀`, `G₁`, `M₀`); step changes are ±1 integer on a 0–10 scale starting at 5

---

## Economic Model Reference

This app visualizes three interconnected models. Understanding the linkages is essential for correct implementation.

### Variables (exogenous, controlled by user)
| Variable | Symbol | Affects |
|----------|--------|---------|
| Government Spending | G | IS curve (shifts right ↑), AD (shifts right ↑) |
| Taxes | T | IS curve (shifts left ↑), AD (shifts left ↑) |
| Nominal Money Supply | M | LM curve (shifts right ↑), Money Supply line (shifts right ↑), AD (shifts right ↑) |
| Price Level | P | LM curve (shifts left ↑ — real money M/P falls), Money Supply line (shifts left ↑ — M/P falls), current position marker on AD curve |
| Expected Price Level | Pₑ | SRAS (shifts up ↑) |
| Potential Output | Ȳ | LRAS position (shifts right ↑) |

### Curve Equations (symbolic, slope constants are fixed)
- **IS**: `r = IS_int(G,T) - α·Y` — negative slope; intercept ↑ when G↑ or T↓
- **LM**: `r = -LM_int(M,P) + β·Y` — positive slope; intercept ↓ when M↑ or P↓ (real money = M/P)
- **Money Supply**: vertical line at `x = M/P` (normalized; shifts right when M↑ or P↓)
- **Money Demand**: `r = MD_int(Y_eq) - γ·(M/P)` — downward sloping; intercept set using IS/LM equilibrium Y*
- **AD**: locus of (Y, P) from IS/LM equilibria as P varies — downward sloping
- **SRAS**: `P = Pₑ + δ·(Y - Ȳ)` — upward sloping; shifts with Pₑ
- **LRAS**: vertical line at `x = Ȳ`

### Graph Axes
| Graph | X-axis | Y-axis |
|-------|--------|--------|
| IS/LM | Output (Y) | Interest Rate (r) |
| Money Market | Real Money (M/P) | Interest Rate (r) |
| AD/AS | Output (Y) | Price Level (P) |

---

## Phase 1: Project Scaffold

- [x] **Create index.html** (ref: Technical Requirements)
  Task ID: `phase-1-scaffold-01`
  > **Implementation**: Create `index.html` in project root.
  > **Details**: Include `<script src="https://cdn.plot.ly/plotly-2.35.2.min.js">` in `<head>`. Add `<link rel="stylesheet" href="css/styles.css">`. Create three `<div>` graph containers with IDs `chart-islm`, `chart-mm`, `chart-adas`. Add a `<div id="controls">` for variable buttons. Add three `<div class="formula">` areas with IDs `formula-islm`, `formula-mm`, `formula-adas` beneath each chart. Load `js/app.js` as `<script type="module">` at end of `<body>`.

- [x] **Create css/styles.css** (ref: Architecture & Design)
  Task ID: `phase-1-scaffold-02`
  > **Implementation**: Create `css/styles.css`.
  > **Details**: Use CSS Grid for the main layout: three equal-width columns for the three charts (`display: grid; grid-template-columns: repeat(3, 1fr)`). Add a full-width `#controls` panel below the charts. Style `.formula` areas with a monospace font for equation display. Keep visual style clean and minimal (white background, dark axes). Set chart container heights to ~400px.

- [x] **Create js/model.js stub** (ref: Architecture & Design)
  Task ID: `phase-1-scaffold-03`
  > **Implementation**: Create `js/model.js`.
  > **Details**: Export a `state` object with keys `G`, `T`, `M`, `P`, `Pe`, `Ybar`, all initialized to `5`. Export stub functions `getISCurve`, `getLMCurve`, `getEquilibrium`, `getMoneySupply`, `getMoneyDemand`, `getADCurve`, `getSRAS`, `getLRAS` — each returning `{ x: [], y: [] }` for now. Export `STEP = 1` and `MIN = 0`, `MAX = 10` constants.

- [x] **Create js/charts.js and js/app.js stubs** (ref: Architecture & Design)
  Task ID: `phase-1-scaffold-04`
  > **Implementation**: Create `js/charts.js` and `js/app.js`.
  > **Details**: `charts.js` — export stub functions `initCharts()` and `updateCharts(state)`. `app.js` — import `state` from `model.js`; import `initCharts`, `updateCharts` from `charts.js`; call `initCharts()` then `updateCharts(state)` on `DOMContentLoaded`.

- [x] **Create README.md** (ref: Technical Requirements)
  Task ID: `phase-1-scaffold-05`
  > **Implementation**: Create `README.md` in project root.
  > **Details**: Include: project description (one paragraph), "How to Run" (step 1: clone/download, step 2: open `index.html` in browser — no install required), "How to Use" (describe the three graphs and the variable controls), "Models Covered" (IS/LM, Money Market, AD/AS).

---

## Phase 2: Economic Math — js/model.js

- [x] **Implement IS and LM curve generators** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-2-math-01`
  > **Implementation**: Edit `js/model.js` — implement `getISCurve(state)` and `getLMCurve(state)`.
  > **Details**: Use Y values `[0, 1, 2, ..., 10]` as domain. **IS**: `r = (state.G - state.T * 0.6 + 7) - 0.8 * Y` (intercept rises with G, falls with T; slope constant). **LM**: `r = (0.6 * Y) - (state.M - state.P) * 0.8` (positive slope; intercept falls when M↑ or P↓, since real money = M/P is approximated as M−P on the normalized 0–10 scale). Both return `{ x: Y_values, y: r_values }`. Clamp r values to `[0, 10]` range.

- [x] **Implement IS/LM equilibrium solver** (ref: Must-Have Features — Real-Time Updates)
  Task ID: `phase-2-math-02`
  > **Implementation**: Edit `js/model.js` — implement `getEquilibrium(state)`.
  > **Details**: Solve IS = LM algebraically: set IS intercept − α·Y = LM intercept + β·Y → `Y* = (IS_int − LM_int) / (α + β)`, then `r* = IS_int − α·Y*`. Return `{ Y: Y_star, r: r_star }`. This equilibrium is used by the money market graph and to mark the IS/LM intersection point.

- [x] **Implement Money Market curve generators** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-2-math-03`
  > **Implementation**: Edit `js/model.js` — implement `getMoneySupply(state)` and `getMoneyDemand(state)`.
  > **Details**: **Money Supply**: vertical line at `x = state.M - (state.P - 5)` (normalized M/P: rises when M↑, falls when P↑) → `{ x: [mp, mp], y: [0, 10] }` where `mp = state.M - (state.P - 5)`. **Money Demand**: downward sloping in (M/P, r) space; intercept set using `Y*` from `getEquilibrium(state)`: `r = (Y_eq * 0.6) - 0.8 * x` over `x = [0..10]`. These two curves should intersect at `r*` from the IS/LM equilibrium, illustrating consistency between the two graphs.

- [x] **Implement AD curve generator** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-2-math-04`
  > **Implementation**: Edit `js/model.js` — implement `getADCurve(state)`.
  > **Details**: Parameterize over P values `[1, 2, ..., 9]`. For each P, compute a temporary state with an adjusted LM (real money supply = M/P, so LM intercept decreases as P rises): `LM_int_at_P = LM_int(state.M) - (P - 5) * 0.5`. Solve IS/LM at each P to get `Y*(P)`. Return `{ x: Y_star_values, y: P_values }`. This produces a downward-sloping AD curve.

- [x] **Implement SRAS and LRAS generators** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-2-math-05`
  > **Implementation**: Edit `js/model.js` — implement `getSRAS(state)` and `getLRAS(state)`.
  > **Details**: **LRAS**: vertical line at `x = state.Ybar` → `{ x: [state.Ybar, state.Ybar], y: [0, 10] }`. **SRAS**: upward sloping → `P = state.Pe + 0.8 * (Y - state.Ybar)` over `Y = [0..10]`; return `{ x: Y_values, y: P_values }`. SRAS shifts up when `Pe` rises and pivots around `Ybar`.

---

## Phase 3: Chart Rendering — js/charts.js

- [x] **Implement IS/LM chart** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-3-charts-01`
  > **Implementation**: Edit `js/charts.js` — implement IS/LM section of `initCharts()` and `updateCharts(state)`.
  > **Details**: Use `Plotly.newPlot('chart-islm', traces, layout)` on init. Traces: IS curve (blue line), LM curve (red line), equilibrium point (black dot marker using `getEquilibrium`). Layout: `xaxis: { title: 'Output (Y)', range: [0,10] }`, `yaxis: { title: 'Interest Rate (r)', range: [0,10] }`, title: `'IS/LM Model'`. On update, call `Plotly.react('chart-islm', newTraces, layout)`.

- [x] **Implement Money Market chart** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-3-charts-02`
  > **Implementation**: Edit `js/charts.js` — implement Money Market section of `initCharts()` and `updateCharts(state)`.
  > **Details**: Traces: Money Supply vertical line (green), Money Demand curve (orange), equilibrium point (black dot at intersection). Layout: `xaxis: { title: 'Real Money (M/P)', range: [0,10] }`, `yaxis: { title: 'Interest Rate (r)', range: [0,10] }`, title: `'Money Market'`. Use `Plotly.newPlot('chart-mm', ...)` and `Plotly.react('chart-mm', ...)`.

- [x] **Implement AD/AS chart** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-3-charts-03`
  > **Implementation**: Edit `js/charts.js` — implement AD/AS section of `initCharts()` and `updateCharts(state)`.
  > **Details**: Traces: AD curve (purple), SRAS curve (orange), LRAS vertical line (black dashed), and a **current-P marker** — a horizontal dashed line at `y = state.P` with a dot at `(Y_eq, state.P)` showing where the user's chosen P lands on the AD curve. This marker is the key pedagogical link: it shows that IS/LM equilibrium (at the chosen P) corresponds to a specific point on AD. Equilibrium marker (AD ∩ SRAS) is also shown as a separate dot. Layout: `xaxis: { title: 'Output (Y)', range: [0,10] }`, `yaxis: { title: 'Price Level (P)', range: [0,10] }`, title: `'AD/AS Model'`. Use `Plotly.newPlot('chart-adas', ...)` and `Plotly.react('chart-adas', ...)`.

---

## Phase 4: Variable Controls & Event Handling

- [x] **Build control panel HTML** (ref: Must-Have Features — Variable Controls)
  Task ID: `phase-4-controls-01`
  > **Implementation**: Edit `index.html` — populate `<div id="controls">`.
  > **Details**: For each variable (G, T, M, P, Pₑ, Ȳ), create a control group: a label showing the variable symbol (use HTML subscripts/superscripts), three buttons labeled `▲ Up`, `● Same`, `▼ Down`. Give each button a `data-var` and `data-action` attribute (e.g., `data-var="G" data-action="up"`). The "Same" button resets that variable to `5`. Show current symbolic state below buttons (e.g., `G₀`, `G₁`, `G₂` or simply `G [+1]`).

- [x] **Wire event listeners in js/app.js** (ref: Must-Have Features — Real-Time Updates)
  Task ID: `phase-4-controls-02`
  > **Implementation**: Edit `js/app.js` — add button event handling.
  > **Details**: Attach a single delegated `click` listener to `#controls`. On click, read `data-var` and `data-action` from the clicked button. `up`: increment `state[var]` by `STEP`, clamp to `MAX`. `down`: decrement by `STEP`, clamp to `MIN`. `same`: reset `state[var]` to `5`. After any mutation, call `updateCharts(state)` and `updateFormulas(state)`.

---

## Phase 5: Formula Display

- [x] **Implement formula rendering** (ref: Must-Have Features — Formula Display)
  Task ID: `phase-5-formulas-01`
  > **Implementation**: Edit `js/app.js` — implement `updateFormulas(state)` and call it on init and after each state change. Edit `index.html` to confirm formula divs are present.
  > **Details**: For each model, display the symbolic equations for every curve in its `formula-*` div using `innerHTML`. Use Unicode subscripts and superscripts (no MathJax needed). **IS/LM formulas**: `Y = C(Y−T) + I(r) + G` and `M/P = L(r,Y)`. **Money Market**: `Mˢ = M̄/P` and `Mᵈ = L(r,Y)`. **AD/AS**: `AD: derived from IS/LM` and `SRAS: P = Pₑ + α(Y−Ȳ)` and `LRAS: Y = Ȳ`. These are static display strings — they do not change with state, only curve positions change.

---

## Phase 6: Polish & Annotation

- [x] **Add curve labels and equilibrium annotations to all charts** (ref: Must-Have Features — Model Graphs)
  Task ID: `phase-6-polish-01`
  > **Implementation**: Edit `js/charts.js` — add `name` property to all Plotly traces and enable the legend. Add text annotations for equilibrium values.
  > **Details**: Each trace should have a `name` for the Plotly legend (e.g., `'IS Curve'`, `'LM Curve'`, `'Equilibrium'`). Add a Plotly annotation at the equilibrium point on all three graphs showing `(Y*, r*)` or `(Y*, P*)` symbolically (e.g., `'(Y₀, r₀)'`). Set `showlegend: true` in all layouts.

- [x] **Final CSS polish** (ref: Must-Have Features — usability)
  Task ID: `phase-6-polish-02`
  > **Implementation**: Edit `css/styles.css`.
  > **Details**: Add hover styles to buttons (`cursor: pointer`, subtle background shift). Style control groups with clear variable labels using bold and larger font. Add a page title/header (`<h1>EconSim</h1>`) in `index.html`. Ensure formula areas have visible separation from charts (border-top or padding). Confirm the three-column layout looks clean with consistent chart sizing.

---

*Generated by Clavix /clavix:plan*
