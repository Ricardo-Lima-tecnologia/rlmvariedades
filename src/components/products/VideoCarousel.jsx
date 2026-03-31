import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VideoCarousel({ frames }) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  if (!frames || frames.length === 0) return null;

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentFrame(prev => (prev + 1) % frames.length);
    }, 100); // 30 frames em 3 segundos

    return () => clearInterval(interval);
  }, [isAutoPlay, frames.length]);

  const goToPrevious = () => {
    setIsAutoPlay(false);
    setCurrentFrame(prev => (prev - 1 + frames.length) % frames.length);
  };

  const goToNext = () => {
    setIsAutoPlay(false);
    setCurrentFrame(prev => (prev + 1) % frames.length);
  };

  return (
    <div className="relative bg-white rounded-lg overflow-hidden border">
      {/* Video/Carousel */}
      <motion.div
        className="relative w-full aspect-square bg-secondary/50 flex items-center justify-center"
        onMouseEnter={() => setIsAutoPlay(false)}
        onMouseLeave={() => setIsAutoPlay(true)}
      >
        <motion.img
          key={currentFrame}
          src={frames[currentFrame]}
          alt={`Frame ${currentFrame + 1}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.05 }}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = frames[0]; // Fallback ao primeiro frame
          }}
        />

        {/* Controles */}
        <button
          onClick={goToPrevious}
          className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
          aria-label="Frame anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={goToNext}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full z-10"
          aria-label="Próximo frame"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => setIsAutoPlay(!isAutoPlay)}
          className="absolute bottom-3 left-3 bg-black/50 hover:bg-black/70 text-white text-xs px-3 py-1.5 rounded-full z-10"
        >
          {isAutoPlay ? '⏸ Pausar' : '▶ Reproduzir'}
        </button>

        {/* Indicador de frame */}
        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded">
          {currentFrame + 1}/{frames.length}
        </div>
      </motion.div>

      {/* Progresso */}
      <div className="h-1 bg-secondary">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${((currentFrame + 1) / frames.length) * 100}%` }}
          transition={{ duration: 0.05 }}
        />
      </div>
    </div>
  );
}