# Quraan - القرآن الكريم

An interactive Angular web application for exploring, listening to, searching, and testing knowledge of the Holy Quran. Designed with full Arabic (RTL) support.

## Features

- **Home** - Main dashboard with Quran page images and navigation
- **Listen** - Audio player for Quranic recitations with reader selection
- **Search** - Full-text search across Quranic verses
- **Similarities** - Explore similar and related verses
- **Alsajadat** - Browse prostration (سجدة) verses
- **Test** - Interactive knowledge testing on Quranic content
- **Favorites** - Bookmark and manage favorite verses

## Tech Stack

- **Framework:** Angular 16
- **UI Libraries:** Angular Material, PrimeNG, Tailwind CSS
- **Audio:** ngx-audio-player
- **Carousel:** ngx-owl-carousel-o
- **Styling:** SCSS + Tailwind CSS + Animate.css
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js (v16+)
- Angular CLI

### Installation

```bash
npm install
```

### Development Server

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

### Build

```bash
ng build
```

Build artifacts are stored in the `dist/` directory.

### Running Tests

```bash
ng test
```

## Project Structure

```
src/
├── app/
│   ├── core/                  # Constants, services, interceptors
│   ├── shared/                # Reusable components (search, print, readers)
│   └── dashboard/
│       ├── home/              # Home page with Quran images
│       ├── listen/            # Audio listening module
│       ├── search/            # Search module
│       ├── similarities/      # Similar verses module
│       ├── alsajadat/         # Prostration verses module
│       ├── test/              # Knowledge test module
│       ├── favorite/          # Favorites module
│       └── layout/            # Header, footer, layout shell
├── assets/
│   ├── fonts/                 # Uthmanic Hafs font & icon fonts
│   ├── images/                # Quran page images & UI assets
│   ├── jsonData/              # Quran data (JSON)
│   └── scss/                  # Global styles
└── environments/              # Environment configs
```
