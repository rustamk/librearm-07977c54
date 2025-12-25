import { motion } from 'framer-motion';
import { AlertTriangle, Info, Bluetooth } from 'lucide-react';
import { isWebBluetoothAvailable } from '@/lib/bluetooth';
import { isNativeApp } from '@/lib/nativeBluetooth';

export function BluetoothWarning() {
  const isNative = isNativeApp();
  const isWebBtAvailable = isWebBluetoothAvailable();
  
  // In native app, Bluetooth is always available via the plugin
  const isAvailable = isNative || isWebBtAvailable;

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
                For Bluetooth connectivity, please use the native Android app or Chrome browser on desktop.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Native app info */}
      {isNative && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-success/20 bg-success/5 p-4"
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <Bluetooth className="h-5 w-5 text-success" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-success">Native Bluetooth Ready</p>
              <p className="text-xs text-muted-foreground">
                Bluetooth Low Energy is available. Make sure your QardioArm is powered on and nearby.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Pairing instructions */}
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
            <p className="text-sm font-medium text-primary">How to Connect</p>
            <div className="text-xs text-muted-foreground space-y-1">
              <ol className="list-decimal list-inside space-y-0.5 ml-1">
                <li>Power on your QardioArm (hold button until it beeps)</li>
                <li>Make sure Bluetooth is enabled on your device</li>
                <li>Click "Connect to QardioArm" below</li>
                <li>Select your QardioArm from the device list</li>
              </ol>
              {isNative && (
                <p className="pt-1 text-muted-foreground/80">
                  <strong>Tip:</strong> Grant Bluetooth permissions when prompted for the best experience.
                </p>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
