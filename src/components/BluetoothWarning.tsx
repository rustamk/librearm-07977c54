import { motion } from 'framer-motion';
import { AlertTriangle, Bluetooth, ExternalLink } from 'lucide-react';
import { isWebBluetoothAvailable } from '@/lib/bluetooth';

export function BluetoothWarning() {
  if (isWebBluetoothAvailable()) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mb-4 rounded-xl border border-warning/30 bg-warning/10 p-4"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-warning" />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-warning">Bluetooth Not Available</p>
          <p className="text-xs text-muted-foreground">
            Web Bluetooth is required to connect to your QardioArm device. 
            Please use Chrome on Android for full Bluetooth support.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a
              href="https://caniuse.com/web-bluetooth"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary underline"
            >
              Browser compatibility
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}