import { HealthConnect, type Record as HealthRecord } from 'capacitor-health-connect';
import type { BloodPressureReading } from './bluetooth';

export type HealthConnectStatus = 'available' | 'not_installed' | 'not_supported' | 'unknown';

// Storage key for health sync preference
const HEALTH_SYNC_ENABLED_KEY = 'librearm_health_sync_enabled';

/**
 * Check if Health Connect is available on this device
 */
export async function checkHealthConnectAvailability(): Promise<HealthConnectStatus> {
  try {
    console.log('Checking Health Connect availability...');
    const result = await HealthConnect.checkAvailability();
    console.log('Health Connect availability result:', JSON.stringify(result));
    
    const availability = result.availability;
    switch (availability) {
      case 'Available':
        return 'available';
      case 'NotInstalled':
        return 'not_installed';
      case 'NotSupported':
        return 'not_supported';
      default:
        console.log('Unknown availability status:', availability);
        return 'unknown';
    }
  } catch (error) {
    console.error('Health Connect check failed:', error);
    return 'unknown';
  }
}

/**
 * Check if we're running on Android (native or mobile web)
 */
export function isAndroid(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android');
}

/**
 * Request Health Connect permissions for blood pressure and heart rate
 */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  try {
    console.log('Requesting Health Connect permissions...');
    const result = await HealthConnect.requestHealthPermissions({
      read: ['BloodPressure', 'HeartRateSeries'],
      write: ['BloodPressure', 'HeartRateSeries'],
    });
    
    console.log('Health Connect permission result:', JSON.stringify(result));
    
    // Check if all requested permissions were granted
    return result?.grantedPermissions?.length > 0 || result?.hasAllPermissions === true;
  } catch (error) {
    console.error('Failed to request Health Connect permissions:', error);
    // Show more details about the error
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return false;
  }
}

/**
 * Check if Health Connect permissions are granted
 */
export async function checkHealthConnectPermissions(): Promise<boolean> {
  try {
    const result = await HealthConnect.checkHealthPermissions({
      read: ['BloodPressure', 'HeartRateSeries'],
      write: ['BloodPressure', 'HeartRateSeries'],
    });
    
    // Check if write permissions are granted
    const hasWrite = result?.grantedPermissions?.includes('android.permission.health.WRITE_BLOOD_PRESSURE') ?? 
                     result?.hasAllPermissions ?? false;
    return hasWrite;
  } catch (error) {
    console.error('Failed to check Health Connect permissions:', error);
    return false;
  }
}

/**
 * Open Health Connect settings
 */
export async function openHealthConnectSettings(): Promise<void> {
  try {
    await HealthConnect.openHealthConnectSetting();
  } catch (error) {
    console.error('Failed to open Health Connect settings:', error);
  }
}

/**
 * Write a blood pressure reading with heart rate to Health Connect
 */
export async function writeBloodPressureToHealthConnect(reading: BloodPressureReading): Promise<boolean> {
  try {
    const records: HealthRecord[] = [];
    
    // Blood pressure record
    const bpRecord: HealthRecord = {
      type: 'BloodPressure',
      time: reading.timestamp,
      systolic: { unit: 'millimetersOfMercury', value: reading.systolic },
      diastolic: { unit: 'millimetersOfMercury', value: reading.diastolic },
      bodyPosition: 'sitting_down',
      measurementLocation: 'left_upper_arm',
    };
    records.push(bpRecord);

    // Heart rate record (if available)
    if (reading.heartRate && reading.heartRate > 0) {
      const hrRecord: HealthRecord = {
        type: 'HeartRateSeries',
        startTime: reading.timestamp,
        endTime: new Date(reading.timestamp.getTime() + 1000), // 1 second duration
        samples: [
          {
            time: reading.timestamp,
            beatsPerMinute: reading.heartRate,
          },
        ],
      };
      records.push(hrRecord);
    }

    const result = await HealthConnect.insertRecords({ records });
    console.log('Blood pressure and heart rate written to Health Connect:', result);
    return true;
  } catch (error) {
    console.error('Failed to write to Health Connect:', error);
    return false;
  }
}

/**
 * Get health sync preference from localStorage
 */
export function getHealthSyncEnabled(): boolean {
  try {
    return localStorage.getItem(HEALTH_SYNC_ENABLED_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Set health sync preference in localStorage
 */
export function setHealthSyncEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(HEALTH_SYNC_ENABLED_KEY, enabled ? 'true' : 'false');
  } catch {
    // Ignore storage errors
  }
}
