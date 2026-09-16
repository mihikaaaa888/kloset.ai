# Kloset.ai

An AI-powered personal wardrobe and styling web app.

## Tech Stack

- **Vite** — build tool & dev server
- **React 18** + **TypeScript**
- **Tailwind CSS** — utility-first styling
- **React Router v6** — client-side routing
- **Zustand** — state management with localStorage persistence
- **Lucide React** — icons
- **Framer Motion** — animations (wired in later phases)

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later (includes npm)

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at **http://localhost:5173**

## Other Commands

```bash
npm run build      # Production build
npm run preview    # Preview production build locally
npm run type-check # TypeScript type checking only
```

## Project Structure

```
src/
  components/
    ui/         # Reusable UI primitives (Button, Card, Badge)
    layout/     # Layout components (Navigation)
  pages/        # Route-level page components
  store/        # Zustand stores (user, wardrobe, outfits)
  lib/          # Business logic (stylist engine — Phase 4)
  types/        # Shared TypeScript interfaces
  styles/       # Global CSS
```

## Data & Storage

All data is stored in browser **localStorage** for V1. The data models are structured so:
- User profiles, wardrobe items, and outfits can be migrated to a database
- Images can be migrated from base64 data URLs to cloud storage (S3/Cloudinary)
- The stylist engine (`src/lib/stylist.ts`) has a clean interface for swapping in an LLM API

## Build Phases

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Foundation, landing page, navigation |
| 2 | ✅ Complete | Onboarding flow (9 steps, persisted to localStorage) |
| 3 | ✅ Complete | Digital wardrobe — grid, filters, add/edit/delete, image upload |
| 4 | ✅ Complete | AI Stylist — mock engine, request form, outfit result |
| 5 | ✅ Complete | Saved outfits, profile, edit mode, scroll-to-top, polish |
