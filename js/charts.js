// js/charts.js — Plotly chart initialization and update (depends on model.js globals)

const _CFG = { displayModeBar: false, responsive: true };

const _LAYOUT_BASE = {
  margin: { t: 44, r: 16, b: 52, l: 54 },
  showlegend: true,
  legend: { x: 0.55, y: 1.0, font: { size: 11 }, bgcolor: 'rgba(255,255,255,0.85)', borderwidth: 0 },
  paper_bgcolor: '#ffffff',
  plot_bgcolor: '#f9fafb',
};

function _axis(title) {
  return {
    title: { text: title, font: { size: 12, color: '#374151' } },
    range: [0, 10],
    showgrid: true,
    gridcolor: '#e5e7eb',
    gridwidth: 1,
    zeroline: false,
    tickfont: { size: 11, color: '#6b7280' },
    linecolor: '#d1d5db',
    linewidth: 1,
    mirror: true,
  };
}

function initCharts() {
  Plotly.newPlot('chart-islm',  [], { ..._LAYOUT_BASE }, _CFG);
  Plotly.newPlot('chart-mm',    [], { ..._LAYOUT_BASE }, _CFG);
  Plotly.newPlot('chart-adas',  [], { ..._LAYOUT_BASE }, _CFG);
}

function updateCharts(s) {
  _drawISLM(s);
  _drawMM(s);
  _drawADAS(s);
}

// ── IS/LM ─────────────────────────────────────────────────────────────────────
function _drawISLM(s) {
  const is  = getISCurve(s);
  const lm  = getLMCurve(s);
  const eq  = getEquilibrium(s);

  const traces = [
    {
      x: is.x, y: is.y, name: 'IS',
      mode: 'lines', line: { color: '#2563eb', width: 2.5 },
      hovertemplate: 'Y=%{x:.1f}, r=%{y:.2f}<extra>IS</extra>',
    },
    {
      x: lm.x, y: lm.y, name: 'LM',
      mode: 'lines', line: { color: '#dc2626', width: 2.5 },
      hovertemplate: 'Y=%{x:.1f}, r=%{y:.2f}<extra>LM</extra>',
    },
    {
      x: [eq.Y], y: [eq.r], name: '(Y₀, r₀)',
      mode: 'markers', marker: { color: '#111827', size: 11, symbol: 'circle' },
      hovertemplate: 'Y* = %{x:.2f}<br>r* = %{y:.2f}<extra>Equilibrium</extra>',
    },
  ];

  Plotly.react('chart-islm', traces, {
    ..._LAYOUT_BASE,
    title: { text: 'IS / LM Model', font: { size: 14, color: '#111827' } },
    xaxis: _axis('Output  (Y)'),
    yaxis: _axis('Interest Rate  (r)'),
  }, _CFG);
}

// ── Money Market ──────────────────────────────────────────────────────────────
function _drawMM(s) {
  const ms = getMoneySupply(s);
  const md = getMoneyDemand(s);
  const eq = getEquilibrium(s);
  const mp = ms.x[0];

  const traces = [
    {
      x: ms.x, y: ms.y, name: 'Mˢ  (supply)',
      mode: 'lines', line: { color: '#16a34a', width: 2.5 },
      hovertemplate: 'M/P=%{x:.2f}<extra>Money Supply</extra>',
    },
    {
      x: md.x, y: md.y, name: 'Mᵈ  (demand)',
      mode: 'lines', line: { color: '#ea580c', width: 2.5 },
      hovertemplate: 'M/P=%{x:.1f}, r=%{y:.2f}<extra>Money Demand</extra>',
    },
    {
      x: [mp], y: [eq.r], name: 'Equilibrium',
      mode: 'markers', marker: { color: '#111827', size: 11, symbol: 'circle' },
      hovertemplate: 'M/P* = %{x:.2f}<br>r* = %{y:.2f}<extra>Equilibrium</extra>',
    },
  ];

  Plotly.react('chart-mm', traces, {
    ..._LAYOUT_BASE,
    title: { text: 'Money Market', font: { size: 14, color: '#111827' } },
    xaxis: _axis('Real Money  (M/P)'),
    yaxis: _axis('Interest Rate  (r)'),
  }, _CFG);
}

// ── AD / AS ───────────────────────────────────────────────────────────────────
function _drawADAS(s) {
  const ad     = getADCurve(s);
  const as_    = getASCurve(s);
  const yfe    = getYFE(s);
  const adasEq = getADASEquilibrium(s);
  const islmEq = getEquilibrium(s);  // IS/LM equilibrium at user-chosen P

  const traces = [
    {
      x: ad.x, y: ad.y, name: 'AD',
      mode: 'lines', line: { color: '#7c3aed', width: 2.5 },
      hovertemplate: 'Y=%{x:.1f}, P=%{y:.1f}<extra>AD</extra>',
    },
    {
      x: as_.x, y: as_.y, name: 'AS',
      mode: 'lines', line: { color: '#ea580c', width: 2.5 },
      hovertemplate: 'Y=%{x:.1f}, P=%{y:.2f}<extra>AS</extra>',
    },
    {
      x: yfe.x, y: yfe.y, name: 'Y^FE',
      mode: 'lines', line: { color: '#374151', width: 2, dash: 'dash' },
      hovertemplate: 'Ȳ = %{x:.1f}<extra>Full-Employment Output</extra>',
    },
    // Horizontal dashed line at user-chosen P — shows where IS/LM is operating
    {
      x: [0, 10], y: [s.P, s.P],
      mode: 'lines', line: { color: '#2563eb', width: 1.5, dash: 'dot' },
      showlegend: false, hoverinfo: 'skip',
    },
    // Blue diamond: IS/LM equilibrium Y at the user-chosen P (position on AD curve)
    {
      x: [islmEq.Y], y: [s.P], name: 'IS/LM at P',
      mode: 'markers', marker: { color: '#2563eb', size: 11, symbol: 'diamond' },
      hovertemplate: 'Y* = %{x:.2f}<br>P = %{y:.2f}<extra>IS/LM position on AD</extra>',
    },
    // Black circle: AD ∩ AS general equilibrium
    {
      x: [adasEq.Y], y: [adasEq.P], name: 'AD/AS Eq.',
      mode: 'markers', marker: { color: '#111827', size: 11, symbol: 'circle' },
      hovertemplate: 'Y* = %{x:.2f}<br>P* = %{y:.2f}<extra>AD/AS Equilibrium</extra>',
    },
  ];

  Plotly.react('chart-adas', traces, {
    ..._LAYOUT_BASE,
    title: { text: 'AD / AS Model', font: { size: 14, color: '#111827' } },
    xaxis: _axis('Output  (Y)'),
    yaxis: _axis('Price Level  (P)'),
  }, _CFG);
}
