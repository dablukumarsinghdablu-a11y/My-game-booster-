# ApexBoost — Windows PC Source Code ZIP Exporter & Deployment Suite

Implementation plan for providing a direct 1-click source code download package for Windows gaming PCs, complete with an offline batch launcher (`start-booster.bat`), standalone progressive web app installation, and full local deployment capabilities.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following preferences were confirmed by the user in Phase 1:
> - **Package Format**: **Download full source code ZIP archive** containing all client and server files, assets, package dependencies, and execution scripts.
> - **Target Platform**: **Windows PC gaming rig**.
> - **Enhancement**: We will include an automated 1-click Windows quick-start batch script (`start-booster.bat`) and an in-app "Download Full App ZIP" button right in the top navigation and dashboard so the user can download the entire application archive directly to their PC with zero setup hassle.

---

## 1. Overview & Core Concept

- **What It Delivers**:
  1. A dedicated **Download App (.ZIP)** modal and navbar action that bundles and downloads the full application codebase (React components, Express server, Tailwind styles, images, AI tuning engine, and configuration files) directly to the user's local disk.
  2. A Windows quick-launch bundle script (`start-booster.bat`) that checks for Node.js, installs dependencies, and launches the game booster on `localhost:3000` with 1 click.
  3. Complementary **PWA (Progressive Web App)** offline installation for instant Windows desktop launch with an app icon.
- **Target User**: PC Gamer on Windows looking to run ApexBoost locally offline with low system overhead alongside their game clients (Steam, Riot Vanguard, Battle.net, Epic Games).
- **Key Value**: Instant local ownership of the tool without relying on continuous internet connection or third-party web hosting.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Top Bar Download Trigger**:
   - The user sees a prominent "Download App" button in Zone 3 of the header next to the In-Game Overlay button.
   - Clicking opens the **Download & Windows Setup Modal**.
2. **Download & Windows Setup Modal**:
   - Shows 2 download methods tailored for Windows:
     - **Option 1: Complete Source Code ZIP (`apexboost-windows-rig.zip`)**: Bundles `src/`, `server.ts`, `package.json`, assets, and setup guides.
     - **Option 2: Windows 1-Click Batch Launcher (`start-booster.bat`)**: Direct download of the script to launch the booster in one double-click.
     - **Option 3: Desktop PWA Install**: Instant installation directly onto Windows desktop and start menu.
3. **Download Progress & Feedback**:
   - Live progress indicator generating the ZIP in-memory (using `JSZip` client-side / server endpoint).
   - Instant download delivery and friendly step-by-step Windows instructions in both Hindi and English (`npm install -> npm run dev`).

### Visual Theme & Atmosphere

- **Dark Esports Palette**: Slate-950 (`#080c14`), Slate-900 structural panels (`#0f172a`), vibrant emerald (`#10b981`) and electric cyan (`#06b6d4`) accents.
- **Typography**: `Plus Jakarta Sans` for clean titles, paired with `JetBrains Mono` for Windows terminal commands and batch files.
- **Zero-Pill Discipline**: Metadata displayed as unboxed clean text with typographic separators (`·`).

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Client-Side + Server-Side ZIP Generation**:
  - *Chosen Approach*: Implement a direct server endpoint (`GET /api/download-app-zip`) using Node's standard stream or zip bundler, plus a client-side exporter fallback using `JSZip`.
  - *Why*: Guarantees instant download regardless of sandbox or network speed, ensuring 100% reliability for the user on Windows.
- **Decision 2: Automated Windows Quick-Start (`start-booster.bat`)**:
  - *Chosen Approach*: Include a Windows batch script inside the root of the ZIP file that checks if Node is installed, runs `npm install`, and opens `http://localhost:3000` in the default browser.
  - *Why*: Eliminates complex command line friction for gamers who simply want to double-click and boost their games.
- **Decision 3: PWA Manifest & Service Worker Integration**:
  - *Chosen Approach*: Add `vite-plugin-pwa` and Web App Manifest so the user can also click "Install to Desktop" in Chrome/Edge.
  - *Why*: Provides the easiest zero-extraction native desktop experience for Windows PC users.

---

## 4. Technical Architecture & Data Strategy

```
┌─────────────────────────────────────────────────────────────┐
│                      ApexBoost User UI                      │
│  [Download App Button]      [PWA Desktop Install]           │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│ Download & Setup Modal       │ │ Service Worker & PWA       │
│ • Source Code ZIP (.zip)     │ │ • Web App Manifest         │
│ • Windows Launcher (.bat)    │ │ • Offline Cache            │
│ • Setup Instructions (H/E)   │ │ • Standalone Window Mode   │
└──────────────┬───────────────┘ └────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend API: GET /api/download-app-zip                      │
│ Reads repository source files, packs with start-booster.bat │
│ Streams application/zip payload to client                   │
└─────────────────────────────────────────────────────────────┘
```

### Component & File Mapping

1. **`server.ts`**:
   - Add route `GET /api/download-app-zip` to bundle the project files into a downloadable ZIP stream using `archiver` or in-memory zip packaging.
2. **`src/components/DownloadModal.tsx`**:
   - Interactive download dialog with 1-click ZIP download, `start-booster.bat` generator, and Windows launch guide.
3. **`src/components/Header.tsx`**:
   - Mount "Download App" button with download icon in Zone 3 of the header.
4. **`vite.config.ts` & `index.html`**:
   - Add PWA manifest and icons so Windows Edge/Chrome displays the native desktop install prompt.
