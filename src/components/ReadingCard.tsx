import { motion } from 'framer-motion';
import { Heart, Activity, TrendingUp, TrendingDown, Check } from 'lucide-react';
import { BloodPressureReading } from '@/lib/bluetooth';

interface ReadingCardProps {
  reading: BloodPressureReading | null;
  inflationPressure?: number;
  isMeasuring?: boolean;
}

const statusConfig = {
  normal: {
    label: 'Normal',
    gradient: 'from-success to-success/80',
    bgColor: 'bg-success/10',
    textColor: 'text-success',
  },
  elevated: {
    label: 'Elevated',
    gradient: 'from-warning to-warning/80',
    bgColor: 'bg-warning/10',
    textColor: 'text-warning',
  },
  high: {
    label: 'High',
    gradient: 'from-destructive to-destructive/80',
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
  },
  hypertensive: {
    label: 'Hypertensive Crisis',
    gradient: 'from-destructive to-destructive/60',
    bgColor: 'bg-destructive/10',
    textColor: 'text-destructive',
  },
};

export function ReadingCard({ reading, inflationPressure = 0, isMeasuring = false }: ReadingCardProps) {
  const config = reading ? statusConfig[reading.status] : null;

  if (!reading && !isMeasuring) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-card p-6 shadow-card"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No Reading Yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect your QardioArm and press the button on the device to start measuring
          </p>
        </div>
      </motion.div>
    );
  }

  if (isMeasuring && !reading) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl bg-card p-6 shadow-card"
      >
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="mb-4 rounded-full bg-primary/10 p-4"
          >
            <Activity className="h-8 w-8 text-primary" />
          </motion.div>
          <h3 className="text-lg font-semibold text-foreground">Measuring...</h3>
          {inflationPressure > 0 && (
            <motion.p
              key={inflationPressure}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 text-3xl font-bold text-primary"
            >
              {inflationPressure} mmHg
            </motion.p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            Please keep still and relax
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="overflow-hidden rounded-2xl bg-card shadow-card"
    >
      {/* Status Header */}
      {config && (
        <div className={`bg-gradient-to-r ${config.gradient} px-6 py-3`}>
          <p className="text-center text-sm font-semibold text-primary-foreground">
            {config.label}
          </p>
        </div>
      )}

      <div className="p-6">
        {/* Main Readings */}
        <div className="mb-6 grid grid-cols-2 gap-6">
          {/* Systolic */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Systolic</span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-1 text-4xl font-bold text-foreground"
            >
              {reading?.systolic}
            </motion.p>
            <p className="text-xs text-muted-foreground">mmHg</p>
          </div>

          {/* Diastolic */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              <span className="text-xs font-medium uppercase tracking-wide">Diastolic</span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-1 text-4xl font-bold text-foreground"
            >
              {reading?.diastolic}
            </motion.p>
            <p className="text-xs text-muted-foreground">mmHg</p>
          </div>
        </div>

        {/* Secondary Readings */}
        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          {/* Heart Rate */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="rounded-full bg-heart/10 p-2">
              <Heart className={`h-5 w-5 text-heart ${reading?.heartRate ? 'animate-pulse-heart' : ''}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Heart Rate</p>
              <p className="text-lg font-semibold text-foreground">
                {reading?.heartRate || '--'} <span className="text-xs font-normal text-muted-foreground">bpm</span>
              </p>
            </div>
          </div>

          {/* MAP */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">MAP</p>
              <p className="text-lg font-semibold text-foreground">
                {reading?.meanArterialPressure || '--'} <span className="text-xs font-normal text-muted-foreground">mmHg</span>
              </p>
            </div>
          </div>
        </div>

        {/* Timestamp and Sync Status */}
        {reading?.timestamp && (
          <div className="mt-4 flex flex-col items-center gap-1">
            <p className="text-xs text-muted-foreground">
              {new Date(reading.timestamp).toLocaleString()}
            </p>
            {reading.syncedToHealthConnect && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5"
              >
                <Check className="h-3 w-3 text-success" />
                <span className="text-xs font-medium text-success">Synced to Health Connect</span>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}