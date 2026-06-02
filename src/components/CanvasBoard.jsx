import React, { useRef, useEffect, useState } from 'react';

const CanvasBoard = ({ onStrokeEnd }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Fill white background initially
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);
    if (onStrokeEnd && canvasRef.current) {
      onStrokeEnd(canvasRef.current);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    if (onStrokeEnd) {
      onStrokeEnd(canvas); // Trigger clear prediction
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl inline-block shadow-xl">
        <canvas
          ref={canvasRef}
          width={400}
          height={400}
          className="bg-white rounded-lg cursor-crosshair touch-none max-w-full h-auto aspect-square"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <button
        onClick={clearCanvas}
        className="px-8 py-3 border border-red-500/50 text-red-500 rounded-lg hover:-translate-y-0.5 hover:shadow-[0_0_15px_rgba(244,67,54,0.2)] hover:bg-red-500/10 transition-all font-medium tracking-wide w-full md:w-auto min-w-[200px]"
      >
        Clear Canvas
      </button>
    </div>
  );
};

export default CanvasBoard;
