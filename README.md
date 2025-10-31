![Screenshot of homepage](./dist/assets/images/screenshot-homepage.jpg "Screenshot of homepage")

# Homepage

For this project I created an application that displays each section of a onepager on 100% of the viewport, so navigating on the page appears as though navigating through multiple pages with a smooth page transition. A standalone of the fullscreen class can be found here:

[Fullscreen Onepager](https://github.com/mirja-t/fullscreen-onepager)

## Features

-   JS App Fullscreen Onepager
-   Custom scrollbar
-   Hover animation with mouse follow
-   Interactive svg chart
-   clip-path transitions on section transition and card hover

## Live site

[Homepage](https://mirja-t.github.io/)

## Compiling

### Homepage

npm sass-prod:

### github.io

npm sass-prod: uncomment base --> @import 'fonts';

# GitHub Copilot Instructions

## Project Overview

This is a personal portfolio website built as a **fullscreen onepager** with smooth page transitions. The app displays each section at 100% viewport height, creating a page-like navigation experience. Key feature: custom JavaScript fullpage implementation with TypeScript, SCSS, and Vite tooling.

## Architecture Patterns

### Core App Structure

-   **Entry point**: `src/js/app.ts` - imports all modules and initializes components
-   **Main classes**: `Fullpage` class in `src/js/fullpage.js` handles viewport-based section navigation
-   **Canvas system**: `DrawCanvas` class in `src/js/drawCanvas.ts` manages interactive SVG chart with circle packing algorithm
-   **Page transitions**: Uses Swup library for smooth page transitions between routes

### TypeScript/JavaScript Mixing

-   Mix of `.ts` and `.js` files (legacy + modern)
-   `Fullpage` class is vanilla JS, newer components like `DrawCanvas` are TypeScript
-   Import pattern: TypeScript files import from `.js` extensions due to Vite bundling

### SCSS Architecture

-   **Entry**: `src/scss/app.scss` imports all component styles
-   **Structure**: Base styles, functions, mixins, then components
-   **Import order matters**: `fullpage.scss` must be imported after `footer.scss`
-   **Fonts**: Custom Camingo font imported via `camingo.scss`

### Theme System

-   **Theme switching**: Controlled by `$currentTheme` variable in `src/scss/base/_vars.scss`
-   **Available themes**: `default` (pink/yellow scheme) and `white` (modified color scheme)
-   **Theme configuration**: `$themeColorMap` defines color palettes for each theme
-   **Conditional styles**: Theme-specific SCSS files use `@if $currentTheme == white` guards
-   **JavaScript awareness**: `app.ts` tracks `currentTheme` for conditional component behavior

## Key Components

### Fullpage Navigation (`src/js/fullpage.js`)

```javascript
// Initialize fullpage with configuration
const fullpage = new Fullpage(fpwrapper, fp, nav, {
    breakpoint: 991, // Mobile breakpoint
    onSectionChange: [resetChart], // Callbacks on section change
});
```

### Interactive Canvas Chart (`src/js/drawCanvas.ts`)

-   Circle packing algorithm for tech stack visualization
-   Event-driven architecture with custom events
-   Usage: `const circleCanvas = new DrawCanvas(width, height, canvas, items, scale)`

### Swup Integration

-   Page transitions handled in `app.ts` event listeners
-   `swup:contentReplaced` - reinitialize components
-   `swup:transitionEnd` - setup parallax effects

## Build & Development

### Commands

-   `npm run dev` - Vite dev server
-   `npm run build` - TypeScript compilation + Vite build to `docs/` directory
-   `npm test` - Vitest test runner

### Build Output

-   **Production**: `docs/` directory (configured in `vite.config.ts` for GitHub Pages)
-   **Deployment**: GitHub Pages from `docs/` folder

### Testing Setup

-   **Framework**: Vitest with jsdom environment
-   **Example**: `src/js/drawCanvas.test.ts` tests circle packing algorithms
-   **Coverage**: Generated to `coverage/` directory

## File Patterns

### Component Initialization

Most components follow this pattern in `app.ts`:

```typescript
if (elementExists) {
    initializeComponent(elementExists, options);
}
```

### Event Handling

-   Custom events for component communication
-   Mouse follow animations use CSS custom properties
-   Scroll-based effects use intersection observers pattern

### Web Components

-   Custom elements like `LinkMousefollow` in `src/js/webcomponents/`
-   Defined in `app.ts`: `customElements.define('link-mousefollow', LinkMousefollow)`

## Development Guidelines

### Adding New Components

1. Create component file in `src/js/`
2. Import and initialize in `app.ts` `init()` function
3. Add corresponding SCSS in `src/scss/` and import in `app.scss`
4. Consider mobile breakpoint behavior (991px)

### Theme Development

-   **Switch themes**: Change `$currentTheme` in `src/scss/base/_vars.scss` (line 44)
-   **Add theme styles**: Create conditional blocks with `@if $currentTheme == themename`
-   **Theme-specific imports**: Uncomment theme imports in `app.scss` (lines 35-37)
-   **Color system**: Extend `$themeColorMap` for new themes with full color palette
-   **JavaScript integration**: Update `currentTheme` variable in `app.ts` for theme-aware components

### Modifying Fullpage Behavior

-   Edit `src/js/fullpage.js` for navigation logic
-   Section changes trigger callbacks defined in config
-   Responsive behavior switches at breakpoint

### Canvas/Chart Updates

-   Modify `src/js/drawCanvas.ts` for chart logic
-   Update `src/js/techstack.ts` for content data
-   Test changes with existing Vitest tests

## Critical Dependencies

-   **Swup**: Page transition library
-   **Vite**: Build tool and dev server
-   **TypeScript**: Configured with bundler module resolution
-   **SCSS**: Component-based styling architecture
