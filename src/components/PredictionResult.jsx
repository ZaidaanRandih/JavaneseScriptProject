import React from 'react';

const ResultCard = ({ title, prediction, confidence, highlight }) => {
  const confidencePercentage = (confidence * 100).toFixed(2);
  
  return (
    <div className={`flex-1 flex flex-col items-center justify-center p-6 rounded-xl border ${highlight ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-black/40'} relative overflow-hidden z-10 transition-all`}>
      <h3 className="text-gray-400 text-xs md:text-sm tracking-widest uppercase mb-4 text-center">{title}</h3>
      
      <div className={`text-6xl md:text-7xl font-bold mb-6 ${highlight ? 'bg-gradient-to-r from-red-500 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg' : 'text-gray-200'}`}>
        {prediction}
      </div>
      
      <div className="w-full">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Confidence</span>
          <span className="text-sm font-bold text-gray-100">{confidencePercentage}%</span>
        </div>
        <div className="h-2 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full ${highlight ? 'bg-gradient-to-r from-red-500 to-cyan-400' : 'bg-gray-400'}`}
            style={{ width: `${Math.min(100, Math.max(0, confidencePercentage))}%`, transition: 'width 0.3s ease-in-out' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const PredictionResult = ({ results }) => {
  // Mengecek apakah properti 'results' sudah terisi data dari kedua model
  if (!results || !results.murni || !results.aug) {
    return (
      <div className="h-full min-h-[350px] flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
        <p className="text-gray-400 text-center text-lg animate-pulse">
          Draw a character on the canvas to see predictions.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full min-h-[350px] flex flex-col items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      <div className="w-full flex flex-col md:flex-row gap-4 h-full">
        <ResultCard 
          title="Unaugmented Model" 
          prediction={results.murni.prediction} 
          confidence={results.murni.confidence} 
          highlight={false} 
        />
        
        <ResultCard 
          title="Augmented Model" 
          prediction={results.aug.prediction} 
          confidence={results.aug.confidence} 
          highlight={true} 
        />
      </div>
    </div>
  );
};

export default PredictionResult;