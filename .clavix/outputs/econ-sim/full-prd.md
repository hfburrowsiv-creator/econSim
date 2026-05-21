# Product Requirements Document: EconSim

## Problem & Goal
MBA students lack hands-on tools for building intuition about how macroeconomic variables interact across models. Build an interactive, locally-run web app that lets users adjust individual variables and instantly see the resulting shifts across the IS/LM model, the money market, and the AD/AS model simultaneously.

## Requirements

### Must-Have Features
1. **Model Graphs** — Three graphs displayed simultaneously: IS/LM, Money Market, and AD/AS
2. **Variable Controls** — Up/Down/Same toggle buttons for each adjustable variable, with fixed step sizes per variable
3. **Real-Time Updates** — All graphs update instantly when any variable is changed
4. **Formula Display** — The equation for each curve is shown alongside its graph, using symbolic variables with subscript notation (e.g., Y₀, r₀, G, T, M/P)
5. **Symbolic Variables** — No real numbers; all values expressed as symbolic variables with subscript notation

### Technical Requirements
- Single-page web application (HTML + CSS + JavaScript)
- Plotly.js for interactive graph rendering (loaded via CDN or bundled locally)
- No build step, no package manager, no backend
- Runs by opening `index.html` in any modern web browser
- Distributable via GitHub — clone or download ZIP, then open file

### Architecture & Design
- Single HTML file or minimal flat file structure (`index.html` + optional CSS/JS files)
- All interactivity handled client-side in vanilla JavaScript
- Graphs rendered and updated via Plotly.js
- Variable state managed in a simple JS object; any change triggers a full graph redraw

## Out of Scope
- User accounts or session persistence
- Mobile/responsive support
- Graph or data export
- Additional macro models (Phillips Curve, Mundell-Fleming, etc.)
- Real numerical data or calibrated parameter values
- Any feature not explicitly listed above

---

*Generated with Clavix Planning Mode*
*Generated: 2026-05-17T00:00:00Z*
