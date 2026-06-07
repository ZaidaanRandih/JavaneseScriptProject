import React, { useState } from 'react';

// Komponen Card sekarang akan mengambil lebar penuh (w-full)
const ResultCard = ({ title, prediction, confidence, highlight }) => {
  const confidencePercentage = (confidence * 100).toFixed(2);
  
  return (
    <div className={`w-full flex-1 flex flex-col items-center justify-center p-8 rounded-xl border ${highlight ? 'border-red-500/30 bg-red-500/5' : 'border-white/10 bg-black/40'} relative overflow-hidden z-10 transition-all duration-500`}>
      <h3 className="text-gray-400 text-sm tracking-widest uppercase mb-6 text-center">{title}</h3>
      
      <div className={`text-7xl md:text-8xl font-bold mb-8 ${highlight ? 'bg-gradient-to-r from-red-500 to-cyan-200 bg-clip-text text-transparent drop-shadow-lg' : 'text-gray-200'}`}>
        {prediction}
      </div>
      
      <div className="w-full max-w-xs">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs text-gray-400 uppercase tracking-wider">Confidence</span>
          <span className="text-sm font-bold text-gray-100">{confidencePercentage}%</span>
        </div>
        <div className="h-3 w-full bg-black/60 rounded-full overflow-hidden border border-white/5">
          <div 
            className={`h-full ${highlight ? 'bg-gradient-to-r from-red-500 to-cyan-400' : 'bg-gray-400'}`}
            style={{ width: `${Math.min(100, Math.max(0, confidencePercentage))}%`, transition: 'width 0.5s ease-out' }}
          ></div>
        </div>
      </div>
    </div>
  );
};

const PredictionResult = ({ results }) => {
  // State untuk melacak tab mana yang sedang aktif
  const [activeTab, setActiveTab] = useState('murni');

  if (!results || !results.murni || !results.aug) {
    return (
      <div className="h-full min-h-[350px] flex items-center justify-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-8 shadow-xl">
        <p className="text-gray-400 text-center text-lg animate-pulse">
          Gambarlah satu aksara di kanvas untuk melihat hasil prediksi.
        </p>
      </div>
    );
  }

  // Menentukan data mana yang dikirim ke Card berdasarkan tab yang dipilih
  const isAug = activeTab === 'aug';
  const activeData = isAug ? results.aug : results.murni;

  return (
    <div className="h-full min-h-[350px] flex flex-col items-center bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl relative overflow-hidden">
      
      {/* Decorative background glow */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full blur-[80px] pointer-events-none transition-colors duration-500 ${isAug ? 'bg-red-500/10' : 'bg-gray-500/5'}`}></div>

      {/* TABS KONTROL */}
      <div className="flex w-full max-w-sm mb-6 bg-black/40 rounded-lg p-1.5 border border-white/10 z-20">
        <button
          onClick={() => setActiveTab('murni')}
          className={`flex-1 py-2.5 px-4 rounded-md text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 ${
            !isAug 
              ? 'bg-white/10 text-white shadow-md border-b-2 border-gray-400' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          MURNI
        </button>
        <button
          onClick={() => setActiveTab('aug')}
          className={`flex-1 py-2.5 px-4 rounded-md text-xs md:text-sm font-semibold tracking-wide transition-all duration-300 ${
            isAug 
              ? 'bg-red-500/10 text-red-200 shadow-md border-b-2 border-red-500' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          AUGMENTED
        </button>
      </div>

      {/* KARTU HASIL YANG DITAMPILKAN BERDASARKAN TAB */}
      <div className="w-full flex-1 flex">
        <ResultCard 
          title={isAug ? "Model Dengan Augmentasi" : "Model Tanpa Augmentasi"} 
          prediction={activeData.prediction} 
          confidence={activeData.confidence} 
          highlight={isAug} 
        />
      </div>

    </div>
  );
};

export default PredictionResult;