import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, ChevronUp, Heart, Trash2, Check } from 'lucide-react';
import { BloodPressureReading, getStoredReadings, clearStoredReadings } from '@/lib/bluetooth';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const statusColors = {
  normal: 'bg-success',
  elevated: 'bg-warning',
  high: 'bg-destructive',
  hypertensive: 'bg-destructive',
};

export function ReadingHistory() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [readings, setReadings] = useState<BloodPressureReading[]>(getStoredReadings);

  const refreshReadings = () => {
    setReadings(getStoredReadings());
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear all reading history?')) {
      clearStoredReadings();
      setReadings([]);
    }
  };

  return (
    <div className="rounded-2xl bg-card shadow-card">
      {/* Header */}
      <button
        onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) refreshReadings();
        }}
        className="flex w-full items-center justify-between p-4 transition-colors hover:bg-muted/30"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-primary/10 p-2">
            <History className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-foreground">Reading History</h3>
            <p className="text-xs text-muted-foreground">{readings.length} readings saved</p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-border">
              {readings.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-muted-foreground">No readings saved yet</p>
                </div>
              ) : (
                <>
                  <div className="max-h-64 overflow-y-auto">
                    {readings.slice(0, 20).map((reading, index) => (
                      <motion.div
                        key={reading.timestamp.toString() + index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center gap-3 border-b border-border/50 px-4 py-3 last:border-0"
                      >
                        {/* Status indicator */}
                        <div className={`h-2 w-2 rounded-full ${statusColors[reading.status]}`} />
                        
                        {/* BP Reading */}
                        <div className="flex-1">
                          <div className="flex items-baseline gap-1">
                            <span className="text-lg font-semibold text-foreground">
                              {reading.systolic}/{reading.diastolic}
                            </span>
                            <span className="text-xs text-muted-foreground">mmHg</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {new Date(reading.timestamp).toLocaleDateString()} at{' '}
                            {new Date(reading.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>

                        {/* Heart Rate */}
                        {reading.heartRate > 0 && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Heart className="h-3 w-3 text-heart" />
                            <span className="text-sm">{reading.heartRate}</span>
                          </div>
                        )}

                        {/* Sync Status */}
                        {reading.syncedToHealthConnect && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/20">
                                  <Check className="h-3 w-3 text-success" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Synced to Health Connect</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  {readings.length > 0 && (
                    <div className="border-t border-border p-3">
                      <button
                        onClick={handleClearHistory}
                        className="flex w-full items-center justify-center gap-2 rounded-lg py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        Clear History
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}