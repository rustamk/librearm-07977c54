import { motion } from 'framer-motion';
import { AlertTriangle, Bluetooth, ExternalLink, Info } from 'lucide-react';
import { isWebBluetoothAvailable } from '@/lib/bluetooth';

export function BluetoothWarning() {
  const isAvailable = isWebBluetoothAvailable();

  return (
    <div className="space-y-3">
      {!isAvailable && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-warning/30 bg-warning/10 p-4"
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
      )}

      {/* Pairing instructions - always show */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Important: Pair Device First</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Before connecting, you must pair your QardioArm in your device's Bluetooth settings:</p>
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Turn on your QardioArm (press the button)</li>
                <li>Open <strong>Settings → Bluetooth</strong> on your phone/computer</li>
                <li>Find and pair "QardioArm" from available devices</li>
                <li>Return here and click "Connect to QardioArm"</li>
              </ol>
              <p className="pt-1 text-muted-foreground/80">
                <strong>If pairing fails:</strong> Hold the QardioArm button for 10+ seconds to reset, then try again.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}