# Mirja Tschakarov Portfolio Website

[Visit Portfolio](https://mirja-t.github.io/)

## 🚀 Tech Stack

- **Frontend Framework**: Vanilla TypeScript + JavaScript (ES2020)
- **Build Tool**: Vite 6.3.5 with ES modules
- **Styling**: Sass/SCSS with component architecture
- **Testing**: Vitest 3.1.3 with jsdom environment
- **Page Transitions**: Swup 3.0.4
- **TypeScript**: 5.8.3 with bundler module resolution
- **Deployment**: GitHub Pages via `docs/` directory

## ✨ Features

- **Fullscreen Onepager**: Custom JavaScript fullpage implementation
- **Smooth Transitions**: Custom clip-path animations and page transitions
- **Mouse Follow Effects**: Dynamic hover animations
- **Web Components**: Custom elements for reusable components
- **Responsive Design**: Mobile-first with 991px breakpoint

## 🛠️ Quick Start

### Prerequisites

- Node.js 16+
- npm

### Installation & Development

```bash
# Clone the repository
git clone <your-repo-url>
cd mirja-tschakarov.de

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
src/
├── js/
│   ├── app.ts              # Main entry point, component initialization
│   ├── fullpage.js         # Custom fullpage navigation (vanilla JS)
│   ├── drawCanvas.ts       # Interactive SVG chart with circle packing
│   ├── techstack.ts        # Tech stack data for chart
│   └── webcomponents/      # Custom web components
├── scss/
│   ├── app.scss           # Main SCSS entry point
│   ├── base/              # Variables, mixins, functions
│   ├── components/        # Individual component styles
│   └── themes/            # Theme-specific styles
├── html/                  # HTML templates
└── i18n/                 # Internationalization files

public/                   # Static assets (fonts, images)
docs/                    # Production build output (GitHub Pages)
```

## 🔧 Available Scripts

| Command           | Description                                    |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start Vite development server with hot reload  |
| `npm run build`   | TypeScript compilation + Vite production build |
| `npm run preview` | Preview production build locally               |
| `npm test`        | Run Vitest test suite                          |
| `sass:watch`      | Watch and compile SCSS (alternative to Vite)   |

## 🎨 Theme System

The project includes a flexible theme system controlled via SCSS variables:

```scss
// src/scss/base/_vars.scss
$currentTheme: "default"; // or 'white'
```

### Available Themes

- **Default**: Pink/yellow color scheme
- **White**: Modified light color scheme

### Adding New Themes

1. Update `$themeColorMap` in `src/scss/base/_vars.scss`
2. Add conditional styles with `@if $currentTheme == 'your-theme'`
3. Update `currentTheme` variable in `src/js/app.ts` for JS components

## 🏗️ Architecture Overview

### Core App Structure

- **Entry Point**: `src/js/app.ts` - Initializes all components and event listeners
- **Fullpage Navigation**: `src/js/fullpage.js` - Handles viewport-based section navigation
- **Page Transitions**: Swup integration for smooth route transitions
- **Web Components**: Custom elements in `src/js/webcomponents/`

### TypeScript Configuration

Modern TypeScript setup with bundler module resolution:

- **Target**: ES2020 with DOM support
- **Module System**: ESNext with Vite bundler mode
- **Import Extensions**: Allows `.ts` imports from `.js` files
- **Strict Mode**: Disabled for gradual migration from vanilla JS

### SCSS Architecture

Component-based styling with clear import hierarchy:

```scss
// src/scss/app.scss
@import "base/vars"; // Variables and themes first
@import "base/mixins"; // Then mixins and functions
@import "components/*"; // Component styles
```

**⚠️ Important**: `fullpage.scss` must be imported after `footer.scss` due to style dependencies.

## 🧪 Testing Setup

- **Framework**: Vitest with jsdom environment
- **Coverage**: Automatic coverage reports in `coverage/`
- **Example Tests**: `src/js/drawCanvas.test.ts` for chart algorithms

```bash
# Run tests with coverage
npm test

# Watch mode during development
npm test -- --watch
```

## 🚀 Deployment

The project is configured for **GitHub Pages** deployment:

1. **Build Command**: `npm run build`
2. **Output Directory**: `docs/` (configured in `vite.config.ts`)
3. **GitHub Pages**: Serve from `docs/` folder in main branch

## 🧩 Key Components

### Fullpage Navigation (`src/js/fullpage.js`)

Custom fullpage implementation with smooth section transitions:

```javascript
// Initialize fullpage with configuration
const fullpage = new Fullpage(fpwrapper, fp, nav, {
    breakpoint: 991, // Mobile breakpoint
    onSectionChange: [resetChart], // Callbacks on section change
});
```

**Features**:

- Viewport-based section navigation
- Mobile-responsive (switches behavior at 991px)
- Callback system for section changes
- Custom scrollbar integration

### Interactive Canvas Chart (`src/js/drawCanvas.ts`)

Circle packing algorithm for tech stack visualization:

```typescript
// Usage example
const circleCanvas = new DrawCanvas(width, height, canvas, items, scale);

// Event-driven updates
canvas.addEventListener("circlesReady", () => {
    // Chart is ready for interaction
});
```

**Features**:

- Dynamic circle packing layout
- Event-driven architecture
- Responsive scaling
- Interactive hover states

### Swup Page Transitions

Smooth page transitions with component reinitialization:

```typescript
// Event listeners in app.ts
document.addEventListener("swup:contentReplaced", () => {
    init(); // Reinitialize all components
});

document.addEventListener("swup:transitionEnd", () => {
    setupParallax(); // Setup scroll effects
});
```

### Web Components

Custom elements for reusable functionality:

```javascript
// Define custom elements
customElements.define("link-mousefollow", LinkMousefollow);
customElements.define("icon-tag", IconTag);

// Usage in HTML
<link-mousefollow href="/page">Link text</link-mousefollow>;
```

## 👩‍💻 Development Guidelines

### Adding New Components

1. **Create Component File**: Add to `src/js/`
2. **Import & Initialize**: Add to `src/js/app.ts` `init()` function
3. **Add Styles**: Create SCSS file and import in `src/scss/app.scss`
4. **Consider Breakpoints**: Account for mobile behavior (991px breakpoint)
5. **Add Tests**: Create corresponding `.test.ts` file if needed

#### Component Pattern Example

```typescript
// Component initialization pattern in app.ts
const myElement = document.querySelector(".my-component");
if (myElement) {
    initMyComponent(myElement, options);
}
```

### Fullpage Navigation Customization

**Modifying Navigation Logic**:

- Edit `src/js/fullpage.js` for core navigation behavior
- Section change callbacks defined in initialization config
- Responsive behavior controlled by `breakpoint` option

**Adding Section Callbacks**:

```javascript
const fullpage = new Fullpage(wrapper, sections, nav, {
    onSectionChange: [existingCallback, newCallback],
});
```

### Canvas & Chart Development

**Updating Chart Logic**:

- Modify `src/js/drawCanvas.ts` for visualization algorithms
- Update `src/js/techstack.ts` for data changes
- Test with existing Vitest tests in `src/js/drawCanvas.test.ts`

**Adding New Chart Types**:

1. Extend `DrawCanvas` class or create new chart class
2. Import and initialize in `app.ts`
3. Add corresponding styles to `src/scss/chart.scss`

### Performance Considerations

- **Intersection Observers**: Use for scroll-based animations
- **CSS Custom Properties**: For dynamic style updates
- **Event Delegation**: For handling multiple similar elements
- **Image Optimization**: All images should be optimized for web

### Browser Support

- **Target**: Modern browsers with ES2020 support
- **Fallbacks**: Consider mobile Safari and older Edge versions
- **Testing**: Test on mobile devices for touch interactions

## 📦 Dependencies

### Production Dependencies

- **[Swup](https://swup.js.org/)** `^3.0.4` - Page transition library

### Development Dependencies

- **[Vite](https://vitejs.dev/)** `^6.3.5` - Build tool and development server
- **[TypeScript](https://www.typescriptlang.org/)** `^5.8.3` - Type-safe JavaScript
- **[Sass](https://sass-lang.com/)** `^1.58.0` - CSS preprocessor
- **[Vitest](https://vitest.dev/)** `^3.1.3` - Unit testing framework
- **[jsdom](https://github.com/jsdom/jsdom)** `^26.1.0` - DOM environment for tests

## 📄 License

This project is private. All rights reserved.

## 🔗 Related Projects

- [Fullscreen Onepager](https://github.com/mirja-t/fullscreen-onepager) - Standalone fullscreen navigation component

---
