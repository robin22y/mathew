# Borrbox

A one-page, offline-first, dark-mode PWA to track things people borrow or lend, including money.

## Features

- Track borrowed items and money
- Dark mode UI with premium feel
- Offline-first (localStorage)
- PWA installable
- WhatsApp reminders
- Export/Import data

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Project Structure

```
src/
  components/     # React components
  hooks/          # Custom hooks (useBorrboxStore, useInstallPrompt)
  types.ts        # TypeScript types
  utils/          # Utility functions
  App.tsx         # Main app component
  main.tsx        # Entry point
  index.css       # Global styles
```

## Data Storage

All data is stored in localStorage under the key `borrbox-items`.

## PWA

Basic PWA setup with manifest and service worker stub. Install prompt appears when available.

**Note:** For full PWA functionality, add icon files (`icon-192.png` and `icon-512.png`) to the `public/` directory. The app will work without them, but installed PWAs won't have custom icons.

