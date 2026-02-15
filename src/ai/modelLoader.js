/**
 * AI Model Loader and Manager
 * Handles model initialization and WebGPU detection
 */

import * as ort from 'onnxruntime-web';

class ModelLoader {
  constructor() {
    this.session = null;
    this.isLoaded = false;
    this.isWebGPUAvailable = false;
  }

  /**
   * Check WebGPU availability
   */
  async checkWebGPU() {
    try {
      if ('gpu' in navigator) {
        const adapter = await navigator.gpu?.requestAdapter();
        this.isWebGPUAvailable = !!adapter;
      }
    } catch (error) {
      console.warn('WebGPU not available:', error);
      this.isWebGPUAvailable = false;
    }
    return this.isWebGPUAvailable;
  }

  /**
   * Load U2-Net ONNX model
   * @param {string} modelPath - Path to ONNX model file
   * @param {Function} onProgress - Progress callback
   */
  async loadModel(modelPath, onProgress) {
    try {
      if (onProgress) onProgress(10, 'Checking WebGPU support');
      
      await this.checkWebGPU();
      
      if (onProgress) onProgress(20, 'Loading model');
      
      // Configure execution providers
      const executionProviders = this.isWebGPUAvailable 
        ? ['webgpu', 'wasm'] 
        : ['wasm'];
      
      const sessionOptions = {
        executionProviders,
        graphOptimizationLevel: 'all',
        executionMode: 'sequential',
        enableCpuMemArena: true,
        enableMemPattern: true
      };

      if (onProgress) onProgress(40, 'Initializing inference session');
      
      this.session = await ort.InferenceSession.create(modelPath, sessionOptions);
      this.isLoaded = true;
      
      if (onProgress) onProgress(60, 'Model loaded successfully');
      
      return {
        success: true,
        webGPU: this.isWebGPUAvailable
      };
    } catch (error) {
      console.error('Failed to load model:', error);
      throw new Error(`Model loading failed: ${error.message}`);
    }
  }

  /**
   * Run inference
   * @param {Float32Array} inputData - Input tensor data
   * @param {Array} dims - Tensor dimensions [batch, channels, height, width]
   */
  async inference(inputData, dims) {
    if (!this.isLoaded || !this.session) {
      throw new Error('Model not loaded');
    }

    try {
      // Create input tensor
      const inputTensor = new ort.Tensor('float32', inputData, dims);
      
      // Run inference
      const feeds = { input: inputTensor };
      const outputs = await this.session.run(feeds);
      
      // Get output tensor (first output)
      const outputName = this.session.outputNames[0];
      const outputTensor = outputs[outputName];
      
      return {
        data: outputTensor.data,
        dims: outputTensor.dims
      };
    } catch (error) {
      console.error('Inference failed:', error);
      throw new Error(`Inference failed: ${error.message}`);
    }
  }

  /**
   * Dispose model and free resources
   */
  async dispose() {
    if (this.session) {
      await this.session.close();
      this.session = null;
      this.isLoaded = false;
    }
  }
}

export default new ModelLoader();
