# Status Dashboard

A real-time telemetry dashboard for monitoring autonomous AI agent activity. Built with React, TypeScript, and Vite, the app polls a live JSON endpoint for status data and renders it through a polished, dark-themed glassmorphism UI with animated backgrounds and auto-refresh.

**Live demo:** [https://victorstack-ai.github.io/status-dashboard/](https://victorstack-ai.github.io/status-dashboard/)

## Features

- **Live polling** -- fetches agent status every 15 seconds with cache-busting to bypass CDN caching
- **Current status card** -- displays the active job name, state (Running / Success / Failed / Sleeping), description, and relative timestamp
- **Recent activity feed** -- shows the last five completed tasks in a compact grid
- **State-aware styling** -- color-coded left-border accent and badge for each operational state
- **Glassmorphism UI** -- backdrop-blur panels, animated gradient orbs, and a pulsing "LIVE" indicator
- **Responsive layout** -- single-column reflow on screens narrower than 640 px
- **Zero-infrastructure data source** -- reads a single `status.json` from a public GitHub repo; no backend or database required

## Tech Stack

| Layer        | Technology                     |
| ------------ | ------------------------------ |
| Framework    | React 19                       |
| Language     | TypeScript 5.9                 |
| Build tool   | Vite 7                         |
| Styling      | Plain CSS (Inter font, CSS vars) |
| Deployment   | GitHub Pages via `gh-pages`    |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
git clone https://github.com/victorstack-ai/status-dashboard.git
cd status-dashboard
npm install
```

### Development

```bash
npm run dev
```

Vite will start a local dev server (default `http://localhost:5173/status-dashboard/`).

### Production Build

```bash
npm run build
npm run preview   # preview the production build locally
```

## Configuration

### Pointing to a different telemetry source

The dashboard fetches data from a single URL defined at the top of `src/App.tsx`:

```ts
const TELEMETRY_URL =
  'https://raw.githubusercontent.com/victorstack-ai/agent-telemetry/main/status.json'
```

Replace this URL with any publicly accessible JSON endpoint that returns the following shape:

```json
{
  "current_job": "string",
  "state": "Running | Success | Failed | Sleeping",
  "description": "string",
  "last_updated_utc": "ISO 8601 timestamp",
  "history": [
    {
      "job": "string",
      "state": "string",
      "description": "string",
      "timestamp": "ISO 8601 timestamp"
    }
  ]
}
```

### Changing the base path

The Vite config sets `base: '/status-dashboard/'` to match the GitHub Pages deployment path. Update `vite.config.ts` if you deploy under a different path or at a custom domain root (`base: '/'`).

## Deployment

The project is configured for GitHub Pages using the `gh-pages` npm package.

```bash
npm run deploy
```

This runs the build step automatically (`predeploy` script) and publishes the `dist/` directory to the `gh-pages` branch.

## License

This project is licensed under the [MIT License](LICENSE).
