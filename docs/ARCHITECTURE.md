# Autodesk Forma Extension — Architecture & Integration Guide

This document describes the technical architecture of the Autodesk Forma Embedded View extension starter (`aps-forma-extension-shadow-study`), its communication mechanics with the Autodesk Forma design canvas, and its extension points for integrating external APIs such as **FortyGuard**.

---

## 1. Overall Architecture

The extension is a modern Single Page Application (SPA) embedded inside Autodesk Forma as an `iframe` (specifically rendered within Forma's Right-Hand Side Analysis Panel).

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Autodesk Forma Web App                           │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │         3D Canvas Scene         │   │   Right-Hand Analysis Panel     │  │
│  │  - Terrain Mesh / Textures      │   │  ┌───────────────────────────┐  │  │
│  │  - Buildings / Elements         │   │  │ Embedded iframe           │  │  │
│  │  - Sun / Shadows Position       │   │  │ (Extension App)           │  │  │
│  │  - Camera / Viewport Capture    │   │  │                           │  │  │
│  └────────────────┬────────────────┘   │  │ - Preact 10 UI + Weave DS │  │  │
│                   │                    │  │ - Signals / Hooks State   │  │  │
│                   │ window.postMessage │  │ - Forma Embedded SDK      │  │  │
│                   │ (RPC Protocol)     │  │                           │  │  │
│                   └────────────────────┼─►│                           │  │  │
│                                        │  └─────────────┬─────────────┘  │  │
│                                        └────────────────┼────────────────┘  │
└─────────────────────────────────────────────────────────┼───────────────────┘
                                                          ▼
                                            ┌──────────────────────────┐
                                            │ FortyGuard APIs / Server │
                                            │ - Heatmaps (TCM/Urban)   │
                                            │ - Env Params (AQI/WetBulb│
                                            │ - Satellite / StreetView │
                                            │ - Heat Intelligence PDF  │
                                            └──────────────────────────┘
```

### Core Tech Stack:
- **Framework**: Preact 10 (lightweight React-compatible framework)
- **Bundler & Dev Server**: Vite 5 (fast ESM bundler running on port `8081`)
- **Language**: TypeScript 5
- **Design System**: Autodesk Forma Design System (`@weave/components` & base CSS tokens)
- **SDK**: `forma-embedded-view-sdk` (v0.87+)
- **Date/Time & Utilities**: Luxon, Lodash, JSZip, FileSaver, i18next

---

## 2. Extension Initialization Flow

1. **Host Discovery & Handshake**:
   - Forma loads the extension URL (e.g. `http://localhost:8081`) inside a sandboxed `iframe`.
   - The SDK import `import { Forma } from "forma-embedded-view-sdk/auto"` automatically executes the initialization handshake via `window.postMessage` to negotiate capabilities and establish communication with Forma's parent window.
2. **Locale & Language Negotiation**:
   - In `src/main.tsx`, the extension inspects URL search parameters (`?lang=...`).
   - It hooks into Forma's locale update stream using `Forma.onLocaleUpdate` (or fallback subscription `on-locale-update`).
   - Initializes `i18next` with the resolved locale.
3. **Mounting**:
   - Preact mounts the root `<App />` component into `#app` (`index.html`).

---

## 3. How the Current Shadow Study Works

The existing extension is a tool to visualize and export sunlight/shadow iterations across custom time intervals:

1. **Context Extraction**:
   - Queries `Forma.project.getTimezone()` to obtain the IANA timezone of the project location (critical for accurate sun position calculations).
   - Reads the current sun date/time with `Forma.sun.getDate()`.
2. **Animation Loop (`PreviewButton.tsx`)**:
   - Generates a sequence of timestamps between `startTime` and `endTime` at defined `interval` increments (e.g., every 30 mins) using Luxon.
   - For each step: calls `Forma.sun.setDate({ date })` and waits ~500ms to allow the 3D renderer in Forma to reposition shadows dynamically.
   - Resets back to the original sun time when complete.
3. **Snapshot & Export (`ExportButton.tsx`)**:
   - Loops through each sun timestamp and triggers `Forma.camera.capture({ width, height })`.
   - Captures viewport canvas bitmaps as base64 PNGs.
   - Packages them into a `.zip` archive via `JSZip` and downloads them via `file-saver`.
4. **Terrain & Element Styling (`GeometryColorSelector.tsx`)**:
   - Queries proposal hierarchy via `Forma.proposal.getRootUrn()` and `Forma.elements.get({ urn, recursive: true })`.
   - Generates an in-memory 2D HTML `<canvas>` to create ground textures and calls `Forma.terrain.groundTexture.add()`.
   - Updates building colors using `Forma.render.elementColors.set({ pathsToColor })`.

---

## 4. Key Files & Responsibility Matrix

| Responsibility | File Path | Key Functions / Descriptions |
|---|---|---|
| **Entry & Lifecycle** | [`src/main.tsx`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/main.tsx) | Initializes locale, registers SDK listener, mounts Preact root |
| **Root UI & Layout** | [`src/app.tsx`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/app.tsx) | Hosts panels, handles global state, coordinates analysis triggers |
| **Forma 3D Sun Control** | [`src/components/PreviewButton.tsx`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/components/PreviewButton.tsx) | `Forma.sun.setDate`, timezone alignment, sequential preview loop |
| **Forma Scene Export** | [`src/components/ExportButton.tsx`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/components/ExportButton.tsx) | `Forma.camera.capture`, zip packaging, client download |
| **Terrain & Material Sync** | [`src/components/GeometryColorSelector.tsx`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/components/GeometryColorSelector.tsx) | `Forma.terrain.groundTexture.add`, `Forma.render.elementColors.set`, element hierarchy traversal |
| **UI Selectors** | [`src/components/*.tsx`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/components/) | `DateSelector`, `TimeSelector`, `IntervalSelector`, `ResolutionSelector` using Autodesk Weave Web Components |
| **Styling & Design Tokens** | [`src/styles.css`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/styles.css), [`index.html`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/index.html) | Autodesk Weave CSS tokens, dark/light theme alignment, custom input controls |
| **Type Definitions** | [`src/lib/weave.d.ts`](file:///d:/ows/proj/hackathons/fortyguard/forty-forma/aps-forma-extension-shadow-study/src/lib/weave.d.ts) | TS declarations for `<weave-button>`, `<weave-select>`, `<weave-checkbox>` |

---

## 5. Communication with Forma (SDK Mechanics)

The extension communicates with Forma asynchronously using RPC over `window.postMessage`.
The SDK namespace `Forma.*` encapsulates all calls:

- **Geo & Scene Context**:
  - `Forma.project.getGeoLocation()`: Retrieves latitude/longitude coordinates and projection data of the current design site (essential for FortyGuard API payloads).
  - `Forma.project.getTimezone()`: Project timezone for temporal alignment.
  - `Forma.terrain.getBbox()`: Bounding box of terrain in project coordinate space.
- **Scene Overlays & 3D Painting**:
  - `Forma.terrain.groundTexture.add({ name, canvas, position, scale })`: Projects any dynamic 2D canvas (e.g. thermal heatmaps, NDVI overlays) directly onto the 3D terrain mesh.
  - `Forma.render.elementColors.set({ pathsToColor })`: Applies specific color palettes to 3D buildings based on heat risk or roof temperature scores.
- **Interactive Tools**:
  - `Forma.designTool.getPolygon()`: Allows users to draw or select Areas of Interest (AOI) directly in the 3D viewport and returns the polygon coordinate array.

---

## 6. Local Development & Deployment Flow

1. **Dev Server**:
   - Runs Vite on port `8081` with CORS enabled (`http://localhost:8081`).
   - Hot Module Replacement (HMR) allows real-time UI and logic updates inside the Forma panel without page refreshes.
2. **Forma Linking**:
   - In Forma Settings/Extensions, register a local extension with URL `http://localhost:8081` and placement set to `RIGHT_MENU_ANALYSIS_PANEL`.
3. **Production Build**:
   - `npm run build` generates optimized static assets in `/dist`.
   - CI/CD workflow (`.github/workflows/test-build-deploy.yml`) builds and deploys static assets to GitHub Pages or cloud hosting.
