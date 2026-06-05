import * as ort from 'onnxruntime-web';

const JAVANESE_CHARS = [
  "ba", "ca", "da", "dha", "ga", 
  "ha", "ja", "ka", "la", "ma", 
  "na", "nga", "nya", "pa", "ra", 
  "sa", "ta", "tha", "wa", "ya"
];

let sessionMurni = null;
let sessionAug = null;

export const loadModel = async () => {
  try {
    const [murniRes, augRes] = await Promise.all([
        ort.InferenceSession.create('/model_aksara_murni.onnx', { executionProviders: ['wasm'] }),
        ort.InferenceSession.create('/model_aksara_aug.onnx', { executionProviders: ['wasm'] })
    ]);
    
    sessionMurni = murniRes;
    sessionAug = augRes;
    
    return { success: true };
  } catch (error) {
    console.error('Failed to load ONNX models:', error);
    return { success: false, error: error.message };
  }
};

const runSession = async (session, inputTensor) => {
    const inputName = session.inputNames[0];
    const feeds = { [inputName]: inputTensor };
    const results = await session.run(feeds);
    
    const outputNames = session.outputNames;
    const outputTensor = results[outputNames[0]];
    const outputData = outputTensor.data;

    // Softmax untuk Confidence Score
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
    
    let bestIndex = 0;
    let bestProb = 0;
    for(let i=0; i<outputData.length; i++) {
        const prob = expData[i] / sumExp;
        if(prob > bestProb) {
            bestProb = prob;
            bestIndex = i;
        }
    }

    return {
        prediction: JAVANESE_CHARS[bestIndex],
        confidence: bestProb
    };
}

export const runInference = async (visibleCanvas) => {
  if (!sessionMurni || !sessionAug) return null;

  const offscreen = document.createElement('canvas');
  offscreen.width = 224;
  offscreen.height = 224;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 224, 224);
  ctx.drawImage(visibleCanvas, 0, 0, 224, 224);

  const imageData = ctx.getImageData(0, 0, 224, 224);
  const data = imageData.data;
  
  const tensorArray = new Float32Array(3 * 224 * 224);

  for (let i = 0; i < 224 * 224; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];

    let gray = (r + g + b) / 3.0 / 255.0;
    gray = 1.0 - gray;

    tensorArray[i] = gray;                       
    tensorArray[224 * 224 + i] = gray;           
    tensorArray[2 * 224 * 224 + i] = gray;       
  }

  const inputTensor = new ort.Tensor('float32', tensorArray, [1, 3, 224, 224]);

  try {
    // Jalankan model satu per satu agar engine WASM tidak tabrakan
    const hasilMurni = await runSession(sessionMurni, inputTensor);
    const hasilAug = await runSession(sessionAug, inputTensor);

    return {
        murni: hasilMurni,
        aug: hasilAug
    };

  } catch (error) {
    console.error("Gagal melakukan inferensi:", error);
    return null;
  }
};