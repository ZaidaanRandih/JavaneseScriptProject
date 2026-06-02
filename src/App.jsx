import React, { useState, useEffect } from 'react';
import { BrainCircuit, AlertCircle } from 'lucide-react';
import CanvasBoard from './components/CanvasBoard';
import PredictionResult from './components/PredictionResult';
import { loadModel, runInference } from './utils/inference';

function App() {
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [modelStatus, setModelStatus] = useState('loading'); // 'loading', 'ready', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const initModel = async () => {
      const result = await loadModel();
      if (result.success) {
        setModelStatus('ready');
      } else {
        setModelStatus('error');
        setErrorMsg('Failed to load ONNX model. Please ensure model_aksara_aug.onnx is placed in the public/ directory.');
      }
    };
    initModel();
  }, []);

  const handleStrokeEnd = async (canvas) => {
    // Check if canvas is entirely white (empty)
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let isEmpty = true;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i+1] !== 255 || data[i+2] !== 255) {
        isEmpty = false;
        break;
      }
    }

    if (isEmpty) {
      setPrediction(null);
      setConfidence(0);
      return;
    }

    if (modelStatus !== 'ready') return;

    const result = await runInference(canvas);
    if (result) {
      setPrediction(result.character);
      setConfidence(result.confidence);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f3f4f6] font-sans selection:bg-red-500/30 relative">
      
      {/* Toast Notification for Error */}
      {modelStatus === 'error' && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-950/90 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl backdrop-blur-md shadow-[0_0_30px_rgba(244,67,54,0.3)] w-[90%] max-w-lg">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0" />
          <p className="text-sm font-medium leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20 flex flex-col gap-12 lg:gap-16">
        
        {/* Header */}
        <header className="text-center space-y-6">
          <div className="inline-flex items-center justify-center p-4 bg-white/5 rounded-2xl border border-white/10 mb-2 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-red-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            <BrainCircuit className="w-10 h-10 text-red-500 relative z-10" />
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            <span className="bg-gradient-to-r from-red-500 to-cyan-200 bg-clip-text text-transparent drop-shadow-sm">
              Aksara Jawa
            </span>{' '}
            AI Vision
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg md:text-xl font-light">
            Real-time Javanese script handwriting recognition powered by ONNX completely in your browser.
          </p>
        </header>

        {/* Content Layout */}
        <main className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Input */}
          <section className="flex flex-col gap-6">
            <div className="text-center md:text-left pl-2 hidden md:block">
              <h2 className="text-2xl font-bold text-gray-200 mb-2 tracking-wide">Input Canvas</h2>
              <p className="text-sm text-gray-500">Draw a single character within the box.</p>
            </div>
            <CanvasBoard onStrokeEnd={handleStrokeEnd} />
          </section>

          {/* Right Column: Output */}
          <section className="flex flex-col gap-6">
            <div className="text-center md:text-left pl-2 hidden md:block">
              <h2 className="text-2xl font-bold text-gray-200 mb-2 tracking-wide">Analysis Result</h2>
              <p className="text-sm text-gray-500">AI predictions and confidence score.</p>
            </div>
            <PredictionResult prediction={prediction} confidence={confidence} />
          </section>

        </main>
      </div>
    </div>
  );
}

export default App;
