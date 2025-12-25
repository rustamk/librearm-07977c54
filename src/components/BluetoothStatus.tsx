import { motion } from 'framer-motion';
import { Bluetooth, BluetoothConnected, BluetoothSearching, Loader2 } from 'lucide-react';
import { DeviceState } from '@/lib/bluetooth';

interface BluetoothStatusProps {
  deviceState: DeviceState;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function BluetoothStatus({ deviceState, onConnect, onDisconnect }: BluetoothStatusProps) {
  const { isConnected, isConnecting, isScanning, deviceName, error } = deviceState;

  const getStatusText = () => {
    if (error) return error;
    if (isConnected) return `Connected to ${deviceName}`;
    if (isConnecting) return `Connecting to ${deviceName}...`;
    if (isScanning) return 'Scanning for devices...';
    return 'Not connected';
  };

  const getStatusColor = () => {
    if (error) return 'text-destructive';
    if (isConnected) return 'text-success';
    if (isConnecting || isScanning) return 'text-bluetooth';
    return 'text-muted-foreground';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex flex-col items-center gap-4 py-6"
    >
      {/* Bluetooth Icon with animation */}
      <div className="relative">
        {(isScanning || isConnecting) && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-bluetooth/20"
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-bluetooth/20"
              animate={{ scale: [1, 2.5], opacity: [0.6, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut', delay: 0.5 }}
            />
          </>
        )}
        
        <motion.div
          className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full ${
            isConnected 
              ? 'bg-success/20' 
              : isScanning || isConnecting 
                ? 'bg-bluetooth/20' 
                : 'bg-muted'
          }`}
          animate={isConnecting ? { scale: [1, 1.05, 1] } : {}}
          transition={{ duration: 1, repeat: Infinity }}
        >
          {isScanning || isConnecting ? (
            <BluetoothSearching className="h-8 w-8 text-bluetooth" />
          ) : isConnected ? (
            <BluetoothConnected className="h-8 w-8 text-success" />
          ) : (
            <Bluetooth className="h-8 w-8 text-muted-foreground" />
          )}
        </motion.div>
      </div>

      {/* Status Text */}
      <p className={`text-sm font-medium ${getStatusColor()}`}>
        {getStatusText()}
      </p>

      {/* Connect/Disconnect Button */}
      {!isConnected && !isConnecting && !isScanning && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onConnect}
          className="mt-2 rounded-lg bg-gradient-primary px-6 py-3 font-semibold text-primary-foreground shadow-button transition-all hover:opacity-90"
        >
          Connect to QardioArm
        </motion.button>
      )}

      {(isConnecting || isScanning) && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDisconnect}
          className="mt-2 flex items-center gap-2 rounded-lg bg-muted px-6 py-3 font-medium text-muted-foreground transition-all hover:bg-muted/80"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Cancel
        </motion.button>
      )}

      {isConnected && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onDisconnect}
          className="mt-2 rounded-lg bg-muted px-6 py-3 font-medium text-muted-foreground transition-all hover:bg-destructive hover:text-destructive-foreground"
        >
          Disconnect
        </motion.button>
      )}
    </motion.div>
  );
}