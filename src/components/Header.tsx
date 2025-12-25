import { motion } from 'framer-motion';
import { Heart, Activity } from 'lucide-react';

export function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-2 pt-8 pb-4"
    >
      {/* App Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
        className="relative"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary shadow-button">
          <Activity className="h-9 w-9 text-primary-foreground" />
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-heart shadow-md"
        >
          <Heart className="h-3.5 w-3.5 fill-primary-foreground text-primary-foreground" />
        </motion.div>
      </motion.div>

      {/* App Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <h1 className="text-2xl font-bold text-foreground">
          Libre<span className="text-gradient-primary">Arm</span>
        </h1>
        <p className="text-sm text-muted-foreground">Blood Pressure Monitor</p>
      </motion.div>
    </motion.header>
  );
}