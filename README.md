# CleanCut Studio

![CleanCut Studio Banner](https://img.shields.io/badge/WebGPU-Accelerated-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![Version](https://img.shields.io/badge/version-1.0.4-orange)

**Remove Background in Seconds — 100% Private. Runs in Your Browser.**

CleanCut Studio is a privacy-first, browser-based AI background remover that runs entirely on your device using WebGPU acceleration. No uploads, no cloud processing, no tracking—just fast, professional-grade background removal.

## 🚀 Features

- **🔒 100% Private**: Your images never leave your device
- **⚡ WebGPU Accelerated**: Lightning-fast processing using your local GPU
- **🎨 Professional Quality**: Powered by U²-Net AI model for sharp edges
- **🖌️ Manual Refinement**: Fine-tune results with brush tools
- **🎭 Custom Backgrounds**: Transparent, solid, gradient, or blur backgrounds
- **💰 Zero Cost**: No subscriptions, no credits, no watermarks
- **📦 Open Source**: Fully transparent codebase

## 📋 Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Modern browser with WebGPU support (Chrome 113+, Edge 113+)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/cleancut-studio.git
cd cleancut-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
cleancut-studio/
├── src/
│   ├── components/
│   │   ├── UploadCard.jsx          # Image upload interface
│   │   ├── PreviewSplit.jsx        # Split comparison view
│   │   ├── ProcessingOverlay.jsx   # Loading animation
│   │   ├── DownloadPanel.jsx       # Export controls
│   │   └── RefineBrush.jsx         # Manual refinement tool
│   ├── workers/
│   │   └── bgRemovalWorker.js      # Web Worker for AI processing
│   ├── ai/
│   │   └── modelLoader.js          # ONNX model manager
│   ├── utils/
│   │   └── imageProcessing.js      # Image utilities
│   ├── App.jsx                     # Main application
│   ├── main.jsx                    # Entry point
│   └── index.css                   # Global styles
├── public/
│   └── models/                     # ONNX model files (to be added)
├── Design/                         # UI design files
├── index.html
├── vite.config.js
├── tailwind.config.js
└── package.json
```

## 🧠 AI Model Setup

CleanCut Studio uses the U²-Net model for background removal. You need to download the ONNX model file:

1. Download the U²-Net ONNX model from [ONNX Model Zoo](https://github.com/onnx/models)
2. Place the `.onnx` file in the `public/models/` directory
3. Update the model path in `src/ai/modelLoader.js` if needed

**Note**: The model file is not included in this repository due to size constraints.

## 🎯 Usage

### Basic Workflow

1. **Upload Image**: Drag & drop or click to upload (supports PNG, JPG, WEBP up to 10MB)
2. **Processing**: AI automatically removes the background (runs locally on your device)
3. **Preview**: Use the split slider to compare original vs. processed
4. **Refine**: Adjust feathering, smoothing, or use manual brush tools
5. **Background**: Choose transparent, solid color, gradient, or blur
6. **Download**: Export as PNG or JPG

### Keyboard Shortcuts

- `Space`: Pan canvas
- `Ctrl + Scroll`: Zoom
- `[` / `]`: Adjust brush size
- `B`: Restore brush
- `E`: Erase brush

## 🔧 Technical Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 18 + Vite | Fast, modern UI |
| Styling | Tailwind CSS | Utility-first styling |
| Animation | Framer Motion | Smooth transitions |
| AI Runtime | ONNX Runtime Web | Browser-based inference |
| Acceleration | WebGPU (WebGL fallback) | GPU acceleration |
| Processing | Web Workers | Non-blocking operations |

## ⚡ Performance

- **First Preview**: < 3 seconds (with WebGPU)
- **Model Size**: ~176MB (lazy loaded)
- **Max Resolution**: 1024px (auto-resized)
- **Browser Support**: Chrome 113+, Edge 113+, Safari 17+ (experimental)

## 🌐 Browser Compatibility

| Browser | WebGPU | WebGL | Status |
|---------|--------|-------|--------|
| Chrome 113+ | ✅ | ✅ | Full Support |
| Edge 113+ | ✅ | ✅ | Full Support |
| Safari 17+ | ⚠️ | ✅ | Experimental |
| Firefox | ❌ | ✅ | Limited (WebGL only) |

## 📦 Deployment

### Vercel (Recommended) 🚀

CleanCut Studio is optimized for Vercel deployment with zero configuration needed:

#### Method 1: GitHub Integration (Easiest)

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/new)
3. Click "Import Project" and select your GitHub repository
4. Vercel will auto-detect the Vite framework
5. Click "Deploy" - no configuration needed!

#### Method 2: Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

#### Method 3: Manual Deployment

```bash
# Build the project
npm run build

# Deploy the dist folder
vercel --prod ./dist
```

**Configuration**: The project includes a `vercel.json` file with optimized settings for:
- Cross-Origin headers for WebGPU/SharedArrayBuffer support
- SPA routing fallback
- Proper CORS configuration

**Custom Domain**: After deployment, you can add a custom domain in the Vercel dashboard under "Domains".

---

### Netlify

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables (none required)
```

**Note**: You may need to add custom headers for WebGPU support in `netlify.toml`:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    Cross-Origin-Opener-Policy = "same-origin"
    Cross-Origin-Embedder-Policy = "require-corp"
```

---

### Cloudflare Pages

```bash
# Build the project
npm run build

# Deploy to Cloudflare Pages
# Connect your GitHub repo or use Wrangler CLI
npx wrangler pages deploy dist
```

**Note**: Cloudflare Pages automatically handles static site hosting. No additional configuration required.

---

### Self-Hosting (Docker)

```dockerfile
# Dockerfile example
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

**Important**: Ensure your web server sends the required COOP/COEP headers for WebGPU support.

## 🔐 Privacy & Security

- **No Data Collection**: Zero telemetry or analytics
- **No Server Processing**: All AI runs in your browser
- **No Image Upload**: Files never leave your device
- **Open Source**: Full transparency

## 🚧 Roadmap

- [ ] Batch processing (multiple images)
- [ ] Background templates library
- [ ] Auto shadow generation
- [ ] Smart upscaling (Real-ESRGAN)
- [ ] PWA support (offline mode)
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [U²-Net](https://github.com/xuebinqin/U-2-Net) - Salient object detection model
- [ONNX Runtime](https://onnxruntime.ai/) - Cross-platform inference
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Contact & Support

- **Author**: Vaibhav
- **Portfolio**: [Your Portfolio URL]
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Issues**: [GitHub Issues](https://github.com/yourusername/cleancut-studio/issues)

## ⭐ Show Your Support

If you found this project helpful, please give it a ⭐ on GitHub!

---

**Built with ❤️ using WebGPU • ONNX Runtime • React**
