# EconSim

An interactive macroeconomic model visualizer for exploring the IS/LM model, the Money Market, and the AD/AS model.

## How to Run

1. Clone or download this repository
2. Open `index.html` in any modern web browser (Chrome, Firefox, Edge, Safari)

No installation, no terminal, no dependencies. Just open the file.

> **Note:** Requires an internet connection on first load to fetch Plotly.js from CDN.

## How to Use

Three graphs are displayed side by side:

| Graph | What it shows |
|-------|--------------|
| **IS/LM Model** | Goods market (IS) and money market (LM) equilibrium in output–interest rate space |
| **Money Market** | Money supply and money demand equilibrium in real-money–interest rate space |
| **AD/AS Model** | Aggregate demand (AD), short-run aggregate supply (SRAS), and long-run aggregate supply (LRAS) in output–price space |

Use the **variable controls** at the bottom to shift curves:

| Variable | Symbol | Primary Effect |
|----------|--------|---------------|
| Government Spending | G | IS shifts right ↑ |
| Taxes | T | IS shifts left ↑ |
| Money Supply | M | LM shifts right ↑, Mˢ shifts right ↑ |
| Price Level | P | LM shifts left ↑, Mˢ shifts left ↑ |
| Expected Price Level | Pₑ | SRAS shifts up ↑ |
| Potential Output | Ȳ | LRAS shifts right ↑ |

- **▲ / ▼** — shift the variable up or down by one step
- **●** — reset the variable to its baseline value

### Reading the AD/AS Chart

The AD/AS chart shows two special markers:

- **Blue diamond** — where the IS/LM equilibrium output lands at the *current user-chosen P level* (your position on the AD curve)
- **Black circle** — the full AD/AS general equilibrium (AD ∩ SRAS)

Adjusting P moves the blue diamond along the AD curve, illustrating how changes in the price level affect IS/LM equilibrium — exactly the mechanism that gives the AD curve its negative slope.

## Models Covered

- **IS/LM** — simultaneous goods and money market equilibrium
- **Money Market** — money supply vs. money demand, consistent with LM equilibrium
- **AD/AS** — aggregate demand derived from IS/LM, short-run and long-run aggregate supply

All variables are symbolic (no calibrated real-world numbers). Curve positions reflect relative changes from a neutral baseline.
# econSim
