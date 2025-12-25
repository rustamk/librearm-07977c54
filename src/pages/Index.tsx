import { useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { BluetoothStatus } from '@/components/BluetoothStatus';
import { BluetoothWarning } from '@/components/BluetoothWarning';
import { ReadingCard } from '@/components/ReadingCard';
import { ReadingHistory } from '@/components/ReadingHistory';
import { MeasureButton } from '@/components/MeasureButton';
import { HealthConnectCard } from '@/components/HealthConnectCard';
import { useBluetooth } from '@/hooks/useBluetooth';
import { useHealthConnect } from '@/hooks/useHealthConnect';
import { Helmet } from 'react-helmet-async';
import { toast } from 'sonner';
import type { BloodPressureReading } from '@/lib/bluetooth';

const Index = () => {
  const { syncReading, syncEnabled, isAvailable, hasPermissions } = useHealthConnect();

  // Callback for when a reading completes - auto-sync to Health Connect
  const handleReadingComplete = useCallback(async (reading: BloodPressureReading) => {
    if (isAvailable && hasPermissions && syncEnabled) {
      const success = await syncReading(reading);
      if (success) {
        toast.success('Synced to Health Connect', {
          description: `${reading.systolic}/${reading.diastolic} mmHg`,
          duration: 3000,
        });
      }
    }
  }, [syncReading, syncEnabled, isAvailable, hasPermissions]);

  const {
    deviceState,
    currentReading,
    inflationPressure,
    connect,
    disconnect,
    startMeasurement,
    stopMeasurement,
  } = useBluetooth({ onReadingComplete: handleReadingComplete });

  return (
    <>
      <Helmet>
        <title>LibreArm - Blood Pressure Monitor for QardioArm</title>
        <meta name="description" content="Open source Android app for QardioArm blood pressure monitor. Measure systolic, diastolic, and heart rate. No cloud, no accounts - 100% private." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#0d9488" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Helmet>

      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        
        <main className="flex-1 px-4 pb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mx-auto max-w-md space-y-6"
          >
            {/* Bluetooth Warning */}
            <BluetoothWarning />

            {/* Bluetooth Connection Status */}
            <BluetoothStatus
              deviceState={deviceState}
              onConnect={connect}
              onDisconnect={disconnect}
            />

            {/* Current Reading Card */}
            <ReadingCard
              reading={currentReading}
              inflationPressure={inflationPressure}
              isMeasuring={deviceState.isMeasuring}
            />

            {/* Measure Button */}
            <MeasureButton
              isConnected={deviceState.isConnected}
              isMeasuring={deviceState.isMeasuring}
              onStart={startMeasurement}
              onStop={stopMeasurement}
            />

            {/* Health Connect Sync */}
            <HealthConnectCard />

            {/* Reading History */}
            <ReadingHistory />

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid gap-3"
            >
              <div className="rounded-xl bg-card p-4 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">How to Measure</h3>
                <ol className="mt-2 space-y-1 text-xs text-muted-foreground">
                  <li>1. Connect to your QardioArm device above</li>
                  <li>2. Wrap the cuff around your upper arm</li>
                  <li>3. Tap "Start Measurement" below to begin</li>
                  <li>4. Remain still until the measurement completes</li>
                </ol>
              </div>

              <div className="rounded-xl bg-card p-4 shadow-card">
                <h3 className="text-sm font-semibold text-foreground">Blood Pressure Categories</h3>
                <div className="mt-2 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-muted-foreground">Normal: &lt;120/80 mmHg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-warning" />
                    <span className="text-muted-foreground">Elevated: 120-129/&lt;80 mmHg</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">High: ≥130/80 mmHg</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default Index;