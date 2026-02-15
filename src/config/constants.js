/**
 * Application Constants
 * Centralized configuration for the CleanCut Studio app
 */

// App Information
export const APP_INFO = {
  name: 'CleanCut Studio',
  version: '1.0.4',
  description: 'Private AI Background Remover',
};

// File Upload Configuration
export const UPLOAD_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  acceptedFormats: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  acceptedExtensions: '.png,.jpg,.jpeg,.webp',
};

// Processing Configuration
export const PROCESSING_CONFIG = {
  modelType: 'small', // 'small' or 'medium' - small is ~5-10x faster
  outputQuality: 0.8,
  enableWorker: true,
};

// Export Formats
export const EXPORT_FORMATS = {
  PNG: 'image/png',
  JPG: 'image/jpeg',
  WEBP: 'image/webp',
};

// Background Options
export const BACKGROUND_OPTIONS = [
  { id: 'transparent', label: 'Transparent', icon: 'blur_on' },
  { id: 'solid', label: 'Solid', icon: 'palette' },
  { id: 'gradient', label: 'Gradient', icon: 'gradient' },
  { id: 'blur', label: 'Blur', icon: 'image' },
  { id: 'custom', label: 'Custom', icon: 'add_photo_alternate' },
];

// Sample Images
export const SAMPLE_IMAGES = [
  {
    id: 'portrait',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800',
    alt: 'Sample portrait',
  },
  {
    id: 'product',
    url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    alt: 'Sample product',
  },
  {
    id: 'sneaker',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800',
    alt: 'Sample sneaker',
  },
];

// View Modes
export const VIEW_MODES = {
  UPLOAD: 'upload',
  PROCESSING: 'processing',
  EDITOR: 'editor',
  REFINE: 'refine',
};

// Zoom Configuration
export const ZOOM_CONFIG = {
  default: 85,
  min: 25,
  max: 400,
  step: 25,
};

// Processing Stages
export const PROCESSING_STAGES = {
  LOADING_MODEL: 'Loading Model',
  PREPROCESSING: 'Preprocessing',
  INFERENCE: 'Inference',
  POSTPROCESSING: 'Postprocessing',
  GENERATING_RESULT: 'Generating Result',
  COMPLETE: 'Complete',
};

// Links
export const LINKS = {
  github: 'https://github.com/vaibhavchauhan-15/CleanCut-Studio',
  privacy: '#',
  terms: '#',
  docs: '#',
};

// Features
export const FEATURES = [
  {
    icon: 'memory',
    title: 'WebGPU Accelerated',
    description:
      'Harness the full power of your local GPU hardware for instant AI inference. Experience speed that rivals cloud solutions without the latency.',
  },
  {
    icon: 'shield',
    title: '100% Client-Side',
    description:
      'Privacy is our priority. Your photos never touch a server. All processing happens locally in your browser session for maximum security.',
  },
  {
    icon: 'payments',
    title: 'Zero Cost Forever',
    description:
      'No subscriptions, no credits, no watermarks. Since we dont pay for server compute, you dont pay for the service. Completely free.',
  },
];
