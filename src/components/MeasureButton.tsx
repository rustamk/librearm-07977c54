import { motion } from 'framer-motion';
import { Play, Square } from 'lucide-react';

interface MeasureButtonProps {
  isConnected: boolean;
  isMeasuring: boolean;
  onStart: () => void;
  onStop: () => void;
}

export function MeasureButton({ isConnected, isMeasuring, onStart, onStop }: MeasureButtonProps) {
  if (!isConnected) {
    return null;
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={isMeasuring ? onStop : onStart}
      className={`flex w-full items-center justify-center gap-3 rounded-xl py-4 text-lg font-semibold transition-all ${
        isMeasuring
          ? 'bg-destructive text-destructive-foreground'
          : 'bg-gradient-primary text-primary-foreground shadow-button'
      }`}
    >
      {isMeasuring ? (
        <>
          <Square className="h-5 w-5 fill-current" />
          Stop Measurement
        </>
      ) : (
        <>
          <Play className="h-5 w-5 fill-current" />
          Start Measurement
        </>
      )}
    </motion.button>
  );
}