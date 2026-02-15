# AI Models Directory

This directory should contain the ONNX model files for background removal.

## Required Models

### U²-Net Model

Download the U²-Net ONNX model and place it here:

**Model Name**: `u2net.onnx`

**Sources**:
1. Convert from PyTorch: https://github.com/xuebinqin/U-2-Net
2. ONNX Model Zoo: https://github.com/onnx/models
3. Pre-converted models: https://huggingface.co/models

**Model Specifications**:
- Input: RGB image [1, 3, H, W]
- Output: Segmentation mask [1, 1, H, W]
- Format: ONNX
- Size: ~176 MB

## Converting PyTorch to ONNX

If you need to convert the model yourself:

```python
import torch
from model import U2NET

# Load PyTorch model
model = U2NET(3, 1)
model.load_state_dict(torch.load('u2net.pth'))
model.eval()

# Create dummy input
dummy_input = torch.randn(1, 3, 320, 320)

# Export to ONNX
torch.onnx.export(
    model,
    dummy_input,
    "u2net.onnx",
    input_names=['input'],
    output_names=['output'],
    dynamic_axes={
        'input': {0: 'batch', 2: 'height', 3: 'width'},
        'output': {0: 'batch', 2: 'height', 3: 'width'}
    }
)
```

## Alternative Models

You can also use:
- **MODNet**: Lighter weight, faster inference
- **BackgroundMattev2**: Higher quality for portraits
- **RMBG-v1.4**: Recent open-source option

## Usage in Code

Update the model path in `src/ai/modelLoader.js`:

```javascript
const MODEL_PATH = '/models/u2net.onnx';
```

## Important Notes

⚠️ **Model files are not included in version control** due to their large size.

📦 For production deployment, ensure the model file is:
1. Optimized for web (quantized if possible)
2. Properly cached (set correct cache headers)
3. Served via CDN for faster loading

## Model Performance

| Model | Size | Speed (WebGPU) | Quality |
|-------|------|----------------|---------|
| U²-Net | 176 MB | ~2-3s | High |
| MODNet | 24 MB | ~1s | Medium |
| RMBG-v1.4 | 176 MB | ~2s | High |

---

Place your `.onnx` model file in this directory and update the configuration accordingly.
