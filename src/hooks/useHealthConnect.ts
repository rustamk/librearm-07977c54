import { useState, useEffect, useCallback } from 'react';
import {
  checkHealthConnectAvailability,
  checkHealthConnectPermissions,
  requestHealthConnectPermissions,
  writeBloodPressureToHealthConnect,
  openHealthConnectSettings,
  getHealthSyncEnabled,
  setHealthSyncEnabled,
  isAndroid,
  type HealthConnectStatus,
} from '@/lib/healthConnect';
import type { BloodPressureReading } from '@/lib/bluetooth';

export interface UseHealthConnectReturn {
  /** Health Connect availability status */
  status: HealthConnectStatus;
  /** Whether Health Connect is available and supported */
  isAvailable: boolean;
  /** Whether we're on Android platform */
  isAndroidPlatform: boolean;
  /** Whether the user has granted permissions */
  hasPermissions: boolean;
  /** Whether health sync is enabled by user preference */
  syncEnabled: boolean;
  /** Whether we're currently syncing */
  isSyncing: boolean;
  /** Last sync error message */
  syncError: string | null;
  /** Request permissions from user */
  requestPermissions: () => Promise<boolean>;
  /** Write a blood pressure reading to Health Connect */
  syncReading: (reading: BloodPressureReading) => Promise<boolean>;
  /** Open Health Connect settings */
  openSettings: () => Promise<void>;
  /** Toggle sync enabled preference */
  toggleSync: () => Promise<void>;
  /** Refresh status and permissions */
  refresh: () => Promise<void>;
}

export function useHealthConnect(): UseHealthConnectReturn {
  const [status, setStatus] = useState<HealthConnectStatus>('unknown');
  const [hasPermissions, setHasPermissions] = useState(false);
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [isAndroidPlatform] = useState(() => isAndroid());

  const isAvailable = status === 'available';

  const refresh = useCallback(async () => {
    if (!isAndroidPlatform) {
      setStatus('not_supported');
      return;
    }

    const availability = await checkHealthConnectAvailability();
    setStatus(availability);

    if (availability === 'available') {
      const permissions = await checkHealthConnectPermissions();
      setHasPermissions(permissions);
    }

    setSyncEnabled(getHealthSyncEnabled());
  }, [isAndroidPlatform]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const requestPermissions = useCallback(async (): Promise<boolean> => {
    setSyncError(null);
    const granted = await requestHealthConnectPermissions();
    setHasPermissions(granted);
    
    if (granted) {
      setHealthSyncEnabled(true);
      setSyncEnabled(true);
    }
    
    return granted;
  }, []);

  const syncReading = useCallback(async (reading: BloodPressureReading): Promise<boolean> => {
    if (!isAvailable || !hasPermissions || !syncEnabled) {
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const success = await writeBloodPressureToHealthConnect(reading);
      if (!success) {
        setSyncError('Failed to sync reading');
      }
      return success;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(message);
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isAvailable, hasPermissions, syncEnabled]);

  const openSettings = useCallback(async () => {
    await openHealthConnectSettings();
  }, []);

  const toggleSync = useCallback(async () => {
    if (!syncEnabled) {
      // Turning on - need permissions first
      if (!hasPermissions) {
        const granted = await requestPermissions();
        if (!granted) {
          return;
        }
      }
      setHealthSyncEnabled(true);
      setSyncEnabled(true);
    } else {
      // Turning off
      setHealthSyncEnabled(false);
      setSyncEnabled(false);
    }
  }, [syncEnabled, hasPermissions, requestPermissions]);

  return {
    status,
    isAvailable,
    isAndroidPlatform,
    hasPermissions,
    syncEnabled,
    isSyncing,
    syncError,
    requestPermissions,
    syncReading,
    openSettings,
    toggleSync,
    refresh,
  };
}
