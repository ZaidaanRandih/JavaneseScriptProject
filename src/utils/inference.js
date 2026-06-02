import * as ort from 'onnxruntime-web';

const JAVANESE_CHARS = [
  'Ha', 'Na', 'Ca', 'Ra', 'Ka', 
  'Da', 'Ta', 'Sa', 'Wa', 'La', 
  'Pa', 'Dha', 'Ja', 'Ya', 'Nya', 
  'Ma', 'Ga', 'Ba', 'Tha', 'Nga'
];

let session = null;

export const loadModel = async () => {
  try {
    session = await ort.InferenceSession.create('/model_aksara_aug.onnx', { executionProviders: ['wasm'] });
    return { success: true };
  } catch (error) {
    console.error('Failed to load ONNX model:', error);
    return { success: false, error: error.message };
  }
};

export const runInference = async (visibleCanvas) => {
  if (!session) {
    return null;
  }

  // 1. Create hidden offscreen canvas 224x224
  const offscreen = document.createElement('canvas');
  offscreen.width = 224;
  offscreen.height = 224;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });

  // Fill with white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 224, 224);

  // 2. Draw visible canvas to 224x224
  ctx.drawImage(visibleCanvas, 0, 0, 224, 224);

  // 3. Get ImageData (RGBA)
  const imageData = ctx.getImageData(0, 0, 224, 224);
  const data = imageData.data;

  // 4. Create Float32Array
  const tensorArray = new Float32Array(3 * 224 * 224);

  // 5. Loop through pixels
  for (let i = 0; i < 224 * 224; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    
    // Grayscale calculation
    let gray = (r + g + b) / 3.0 / 255.0;
    
    // Inversion (Lambda 1.0 - x)
    gray = 1.0 - gray;

    // Populate channels (RGB)
    tensorArray[i] = gray;                       // R
    tensorArray[224 * 224 + i] = gray;           // G
    tensorArray[2 * 224 * 224 + i] = gray;       // B
  }

  // 6. Create tensor
  const inputTensor = new ort.Tensor('float32', tensorArray, [1, 3, 224, 224]);

  try {
    // 7. Prediction
    // Find input name
    const inputName = session.inputNames[0];
    const feeds = { [inputName]: inputTensor };
    const results = await session.run(feeds);
    
    const outputNames = session.outputNames;
    const outputTensor = results[outputNames[0]];
    const outputData = outputTensor.data;

    // Softmax
    const expData = new Float32Array(outputData.length);
    let maxLogit = -Infinity;
    for(let i=0; i<outputData.length; i++) {
        if(outputData[i] > maxLogit) maxLogit = outputData[i];
    }
    let sumExp = 0;
    for(let i=0; i<outputData.length; i++) {
        expData[i] = Math.exp(outputData[i] - maxLogit);
        sumExp += expData[i];
    }
    for(let i=0; i<outputData.length; i++) {
        expData[i] = expData[i] / sumExp;
    }

    // ArgMax
    let maxProb = -Infinity;
    let maxIndex = -1;
    for (let i = 0; i < expData.length; i++) {
      if (expData[i] > maxProb) {
        maxProb = expData[i];
        maxIndex = i;
      }
    }

    return {
      character: JAVANESE_CHARS[maxIndex],
      confidence: maxProb,
    };
  } catch (error) {
    console.error('Inference error:', error);
    return null;
  }
};
