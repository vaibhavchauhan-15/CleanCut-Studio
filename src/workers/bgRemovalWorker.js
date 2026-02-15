/**
 * Web Worker for background removal processing
 * Runs ONNX Runtime inference in a separate thread
 */

import * as ort from 'onnxruntime-web';

let session = null;
let isModelLoaded = false;

// Configure ONNX Runtime
ort.env.wasm.numThreads = 1;
ort.env.wasm.simd = true;

/**
 * Load ONNX model
 */
async function loadModel(modelPath) {
  try {
    postMessage({ type: 'progress', stage: 'Loading Model', progress: 10 });
    
    // Configure session options for WebGPU
    const sessionOptions = {
      executionProviders: [
        {
          name: 'webgpu',
          deviceType: 'gpu'
        },
        'wasm'
      ],
      graphOptimizationLevel: 'all'
    };
    
    session = await ort.InferenceSession.create(modelPath, sessionOptions);
    isModelLoaded = true;
    
    postMessage({ type: 'progress', stage: 'Loading Model', progress: 30 });
    postMessage({ type: 'modelLoaded' });
    
    return true;
  } catch (error) {
    console.error('Model loading error:', error);
    postMessage({ type: 'error', error: error.message });
    return false;
  }
}

/**
 * Run inference on image tensor
 */
async function runInference(tensorData, dims) {
  try {
    postMessage({ type: 'progress', stage: 'Inference', progress: 50 });
    
    if (!session) {
      throw new Error('Model not loaded');
    }
    
    // Create input tensor
    const tensor = new ort.Tensor('float32', tensorData, dims);
    
    // Run inference
    const feeds = { input: tensor };
    const results = await session.run(feeds);
    
    postMessage({ type: 'progress', stage: 'Postprocessing', progress: 75 });
    
    // Get output mask
    const outputTensor = results[Object.keys(results)[0]];
    const maskData = outputTensor.data;
    const [, , height, width] = outputTensor.dims;
    
    postMessage({ type: 'progress', stage: 'Generating Result', progress: 90 });
    
    return {
      mask: maskData,
      width,
      height
    };
  } catch (error) {
    console.error('Inference error:', error);
    postMessage({ type: 'error', error: error.message });
    throw error;
  }
}

// Message handler
self.onmessage = async function(e) {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'loadModel':
      await loadModel(payload.modelPath);
      break;
      
    case 'processImage':
      try {
        postMessage({ type: 'progress', stage: 'Preprocessing', progress: 35 });
        
        const result = await runInference(payload.tensorData, payload.dims);
        
        postMessage({ 
          type: 'complete', 
          result,
          progress: 100
        });
      } catch (error) {
        postMessage({ type: 'error', error: error.message });
      }
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
};

postMessage({ type: 'ready' });
