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
    const result = await HealthConnect.checkAvailability();
    switch (result.availability) {
      case 'Available':
        return 'available';
      case 'NotInstalled':
        return 'not_installed';
      case 'NotSupported':
        return 'not_supported';
      default:
        return 'unknown';
    }
  } catch (error) {
    console.log('Health Connect check failed:', error);
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
 * Request Health Connect permissions for blood pressure
 */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  try {
    const result = await HealthConnect.requestHealthPermissions({
      read: ['BloodPressure'],
      write: ['BloodPressure'],
    });
    
    // Check if all requested permissions were granted
    return result?.hasAllPermissions ?? false;
  } catch (error) {
    console.error('Failed to request Health Connect permissions:', error);
    return false;
  }
}

/**
 * Check if Health Connect permissions are granted
 */
export async function checkHealthConnectPermissions(): Promise<boolean> {
  try {
    const result = await HealthConnect.checkHealthPermissions({
      read: ['BloodPressure'],
      write: ['BloodPressure'],
    });
    
    // Check if write permission for BloodPressure is in granted permissions
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
 * Write a blood pressure reading to Health Connect
 */
export async function writeBloodPressureToHealthConnect(reading: BloodPressureReading): Promise<boolean> {
  try {
    const record: HealthRecord = {
      type: 'BloodPressure',
      time: reading.timestamp,
      systolic: { unit: 'millimetersOfMercury', value: reading.systolic },
      diastolic: { unit: 'millimetersOfMercury', value: reading.diastolic },
      bodyPosition: 'sitting_down',
      measurementLocation: 'left_upper_arm',
    };
    const result = await HealthConnect.insertRecords({ records: [record] });
    console.log('Blood pressure written to Health Connect:', result);
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
