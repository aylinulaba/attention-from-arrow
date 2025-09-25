# Attention from Arrow (Three.js + React + Vite)

This is an interaction for “attention from arrow”. It renders a grid of arrows that rotate to point at your pointer on a z=0 plane.

## Tech
- React 18 + Vite
- Three.js InstancedMesh (fast)
- `BufferGeometryUtils.mergeGeometries` for a single arrow mesh

## Quick Start
```bash
npm i
npm run dev
```
Then open the local URL printed by Vite.

## Build
```bash
npm run build
npm run preview
```

## File Structure
```
/src
  ├─ main.jsx            # Vite entry
  ├─ App.jsx             # Mounts the demo component
  ├─ styles.css          # Minimal styles
  └─ AttentionFromArrow.jsx  # The demo
index.html
package.json
vite.config.js
```

## Tweaks
- Density: change `GRID` (default **24**) and `SPACING` (default **3.4**).
- Size/Fit: camera auto-fits to the grid span with padding; tune `pad` if you need more or less margin.
- Performance: reduce `GRID` for older devices.

## Notes
- The arrow geometry is oriented toward **+Y**; orientation uses `Math.atan2(...) - Math.PI/2` to point at the cursor.
- Tested on desktop (mouse/trackpad). Mobile may render but won’t feel great with this many instances.
