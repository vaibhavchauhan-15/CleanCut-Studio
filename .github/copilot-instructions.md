# GitHub Copilot Instructions for CleanCut Studio

## Project Overview

CleanCut Studio is a **privacy-first, browser-based AI background removal tool** that runs 100% client-side with NO server uploads. The entire processing pipeline happens in the browser using the `@imgly/background-removal` library with WebGPU acceleration.

**Key Architecture Principle**: Everything is client-side. No backend, no image uploads, no tracking.

## Tech Stack

- **Frontend**: React 18 with Vite (fast builds, HMR)
- **Styling**: Tailwind CSS (utility-first)
- **Animations**: Framer Motion
- **AI Processing**: `@imgly/background-removal` v1.4.5 (runs in Web Workers)
- **State Management**: React Context API (`ImageContext`)
- **Type Safety**: JSDoc comments (no TypeScript)

## Critical Architecture Patterns

### 1. State Management: Centralized Context

All application state lives in `src/contexts/ImageContext.jsx`. This single context manages:
- View states (`VIEW_MODES`: upload → processing → editor → refine)
- Image data (original, processed, mask)
- Export settings (background, format)
- Processing progress and stage
- Zoom/pan state

**Pattern**: Custom hooks consume context via `useImageContext()` hook:

```javascript
// In any component/hook
import { useImageContext } from '../contexts/useImageContext';

const { originalImage, setProcessedImage, view } = useImageContext();
```

### 2. Custom Hooks Architecture

All business logic is extracted into custom hooks in `src/hooks/`:

- `useImageUpload` - File validation, loading, dimension calculation
- `useBackgroundRemoval` - Core AI processing with progress tracking
- `useImageExport` - Export with different backgrounds/formats
- `useZoomPan` - Canvas zoom and pan controls
- `useWebGPU` - GPU availability detection

**Pattern**: Hooks consume context and return action functions:

```javascript
const { handleFileUpload } = useImageUpload();
const { processImage } = useBackgroundRemoval();
```

### 3. Service Layer

Pure utility functions in `src/services/`:

- `imageProcessingService.js` - Image loading, blob/URL conversions
- `exportService.js` - Canvas rendering, background application, file download

**Important**: These are NOT React hooks. They're standalone async functions.

### 4. Background Removal Flow (Most Critical)

The AI processing happens in `src/utils/backgroundRemoval.js`:

```javascript
processImageWithProgress(imageDataURL, onProgress)
  → Generates SHA-256 cache key from blob
  → Checks LRU cache (MAX_CACHE_SIZE = 5)
  → Optimizes image size (max 2048px)
  → Adaptively selects model based on image dimensions:
     ≤1MP: 'small' model (fast)
     1-4MP: 'medium' model (balanced)
  → Calls @imgly/background-removal with Web Worker
  → Caches result
  → Returns processed data URL
```

**Adaptive Model Selection**: DO NOT hardcode model size. The `selectModel()` function auto-chooses based on image pixels for optimal speed/quality balance.

### 5. View State Machine

The app follows a strict view flow (defined in `src/config/constants.js`):

```
UPLOAD → PROCESSING → EDITOR → [optional: REFINE] → back to EDITOR
                                           ↓
                                      (download)
```

Views are mutually exclusive. Use `setView()` to transition between states.

## Component Patterns

### Event Handlers & Callbacks

All event handlers in components use `useCallback` for optimization:

```javascript
// In UploadCard.jsx
const handleDrop = useCallback((e) => {
  e.preventDefault();
  e.stopPropagation();
  setIsDragging(false);
  // ... handle file
}, []);
```

**Pattern**: Always prevent default and stop propagation for drag/drop events.

### Animation Pattern with Framer Motion

All page transitions and UI elements use Framer Motion:

```javascript
<motion.div 
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  {/* content */}
</motion.div>
```

**Pattern**: Stagger animations with increasing `delay` values (0.2s increments).

### Error Handling

- User-facing errors: `alert(error.message)` 
- Debug errors: `console.error('Context:', error)`
- No error boundaries implemented yet

## Configuration & Constants

**All magic numbers live in** `src/config/constants.js`:

```javascript
UPLOAD_CONFIG.maxFileSize = 10MB
PROCESSING_CONFIG.modelType = 'small' (overridden by adaptive selection)
ZOOM_CONFIG = { default: 85, min: 25, max: 400 }
```

When adding features, ALWAYS check if a constant exists before hardcoding values.

## Performance Optimizations (Critical)

### Recent Optimizations (Feb 2026)

1. **Adaptive Model Selection** - Auto-selects 'small' vs 'medium' based on image size (3-5x faster)
2. **Image Preprocessing** - Auto-resizes >2048px images before processing
3. **LRU Caching** - Caches last 5 processed images using SHA-256 keys
4. **Code Splitting** - Lazy loads non-critical components (Editor, Export, Refine)
5. **Bundle Optimization** - Removed unused ONNX code, custom workers replaced by @imgly library

### Lazy Loading Pattern

```javascript
// Critical components - load immediately
import Navigation from './components/layout/Navigation';

// Non-critical - lazy load
const PreviewSplit = lazy(() => import('./components/PreviewSplit'));

// Wrap in Suspense
<Suspense fallback={<LoadingFallback />}>
  <PreviewSplit />
</Suspense>
```

**Rule**: Only `Navigation` and `UploadCard` load eagerly. Everything else is lazy.

## File Structure Conventions

```
src/
  components/          # React components (JSX)
    layout/           # Navigation, Footer, Features (static layout)
    editor/           # ZoomControls, ViewModeToggle (editor-specific)
    export/           # BackgroundSelector, FormatSelector
  contexts/            # React Context providers
  hooks/              # Custom React hooks (use* prefix)
  services/           # Pure utility functions (NO React)
  utils/              # Business logic (backgroundRemoval)
  config/             # Constants and configuration
  workers/            # Web Workers (bgRemovalWorker.js - UNUSED, kept for reference)
  ai/                 # modelLoader.js (UNUSED - replaced by @imgly library)
```

## Development Commands

```bash
npm run dev        # Start Vite dev server (localhost:5173)
npm run build      # Production build → dist/
npm run preview    # Preview production build
npm run lint       # ESLint check
```

**Dev Server Headers**: Vite config includes COOP/COEP headers for SharedArrayBuffer support (Web Workers).

**ESLint Config**: 
- Prop-types disabled (no TypeScript)
- `no-unused-vars` set to 'warn'
- React 18.2 JSX runtime (no need to import React)
- Fast Refresh enabled for components only

## Deployment

### Vercel (Recommended)

The project is optimized for Vercel with zero-config deployment:

```bash
# Via Vercel CLI
npm install -g vercel
vercel --prod

# Or connect GitHub repo at vercel.com/new
```

**Configuration**: `vercel.json` includes:
- Cross-Origin headers (COOP/COEP) for WebGPU/SharedArrayBuffer
- SPA routing fallback to index.html
- Automatic framework detection (Vite)

**Build Settings**:
- Build Command: `npm run build`
- Output Directory: `dist`
- Node Version: 18+ (specified in package.json engines)

**Important**: The COOP/COEP headers are REQUIRED for WebGPU to function. Don't deploy to platforms that can't set custom headers.

### Production Build Verification

```bash
# Test build locally before deploying
npm run build
npm run preview  # Test at localhost:4173
```

Expected build output:
- Main bundle: ~130-140KB (react-vendor)
- Background removal: ~80KB (lazy loaded)
- ONNX runtime: ~400KB each (2 files, lazy loaded)
- Total initial load: <200KB

## Common Pitfalls & Solutions

### ❌ Don't: Hardcode model types
```javascript
removeBackground(blob, { model: 'medium' })  // Bad - ignores image size
```

### ✅ Do: Use adaptive selection
```javascript
removeBackground(blob, {})  // Good - auto-selects model
```

### ❌ Don't: Process full-res images
```javascript
await removeBackground(hugeBlob)  // Bad - slow for >4MP images
```

### ✅ Do: Preprocess with optimizeImageSize
```javascript
const optimized = await optimizeImageSize(blob, 2048);
await removeBackground(optimized);
```

### ❌ Don't: Create services as hooks
```javascript
export const useImageLoader = () => { /* utility function */ }  // Bad
```

### ✅ Do: Use plain functions for utilities
```javascript
export const loadImage = (src) => { /* utility */ }  // Good
```

### ❌ Don't: Access context directly in services
```javascript
// In exportService.js
import { useImageContext } from '../contexts/useImageContext';  // Error!
```

### ✅ Do: Pass data from hooks to services
```javascript
// In useImageExport hook
const { processedImage } = useImageContext();
await exportService.exportImage({ processedImage, ... });
```

## Testing & Debugging

**No test suite exists yet.** Manual testing workflow:

1. Upload various image sizes (500px, 1024px, 2048px, 4000px)
2. Test all background options (transparent, solid, gradient, blur, custom)
3. Verify caching (reprocess same image = instant)
4. Check all export formats (PNG, JPG, WEBP)
5. Test WebGPU fallback (disable GPU in DevTools → Performance)

**Performance Profiling**:
- Chrome DevTools → Performance tab
- Look for Web Worker activity
- Check `backgroundRemoval.js` console logs for timing

## Browser Requirements

- **Chrome/Edge 113+**: Full WebGPU support (recommended)
- **Safari 17+**: Experimental WebGPU, WebGL fallback
- **Firefox**: WebGL only (slower)

## Integration Points

**External Dependencies**:
- `@imgly/background-removal` - Core AI library (auto-downloads models ~5MB)
- `framer-motion` - Animation library
- `onnxruntime-web` - LEGACY, unused but still in package.json (can be removed)

**No external APIs**. No analytics. No tracking. 100% offline-capable after first model download.

**Model Downloads**: The @imgly/background-removal library auto-downloads models (~5MB) on first use from CDN. Models are cached in browser.

## When Adding Features

1. Check `src/config/constants.js` for existing config
2. Add state to `ImageContext` if needed across components
3. Create custom hook in `src/hooks/` for new workflows
4. Use services for pure utility functions
5. Update `VIEW_MODES` if adding new screens
6. Lazy load new components unless critical path
7. Use `useCallback` for event handlers to prevent re-renders
8. Test build size impact with `npm run build`

## Style Guidelines

- **JSDoc comments** on all exported functions
- **No TypeScript** (using JSDoc for hints, prop-types disabled in ESLint)
- **Tailwind classes only** - no custom CSS except `index.css` globals
  - Custom theme in `tailwind.config.js`: `primary`, `accent`, `background-light/dark`, `slate-card`
  - Dark mode support via `darkMode: 'class'`
- **Framer Motion** for all animations - no CSS transitions
- **Performance**: Wrap callbacks in `useCallback` in hooks and components with event handlers
- **Error handling**: User-facing errors via `alert()`, console errors for debugging
- **Descriptive variable names** - `processedImage`, not `img2`

## Key Files to Reference

- **Architecture**: `src/App.jsx` (main component structure)
- **State**: `src/contexts/ImageContext.jsx` (single source of truth)
- **AI Processing**: `src/utils/backgroundRemoval.js` (critical path with caching)
- **Config**: `src/config/constants.js` (all configurable values)
- **Build**: `vite.config.js` (bundle splitting, headers, production optimization)
- **Deployment**: `vercel.json` (COOP/COEP headers, routing)
- **Docs**: `README.md` (user-facing documentation)
- **Hooks Index**: `src/hooks/index.js` (all custom hooks exported)

---

**Philosophy**: Simplicity, privacy, speed. Prefer React patterns over complex state machines. Optimize for 1-4MP images (typical use case). Keep bundle size small with lazy loading.
