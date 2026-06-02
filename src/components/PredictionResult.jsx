import React from 'react';

const PredictionResult = ({ prediction, confidence }) => {
  if (!prediction) {
    return (
      <div className="h-full min-h-[350px] flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
        <p className="text-gray-400 text-center text-lg animate-pulse">
          Draw a character on the canvas to see predictions.
        </p>
      </div>
    );
  }

  const confidencePercentage = (confidence * 100).toFixed(2);

  return (
    <div className="h-full min-h-[350px] flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl gap-8 relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-red-500/20 rounded-full blur-[60px] pointer-events-none"></div>

      <div className="text-center z-10">
        <h3 className="text-gray-400 text-sm tracking-widest uppercase mb-2">Predicted Character</h3>
        <div className="text-7xl md:text-8xl font-bold bg-gradient-to-r from-red-500 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg">
          {prediction}
        </div>
      </div>

      <div className="w-full max-w-xs z-10">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm text-gray-400 uppercase tracking-wider">Confidence</span>
          <span className="text-xl font-bold text-gray-100">{confidencePercentage}%</span>
        </div>
        <div className="h-4 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
          <div 
            className="h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(244,67,54,0.6)]"
            style={{ width: `${Math.min(100, Math.max(0, confidencePercentage))}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default PredictionResult;
