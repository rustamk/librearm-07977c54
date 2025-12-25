// QardioArm Bluetooth Low Energy Service UUIDs
export const BLOOD_PRESSURE_SERVICE = '00001810-0000-1000-8000-00805f9b34fb';
export const BLOOD_PRESSURE_MEASUREMENT_CHAR = '00002a35-0000-1000-8000-00805f9b34fb';
export const BLOOD_PRESSURE_FEATURE_CHAR = '00002a49-0000-1000-8000-00805f9b34fb';
export const VENDOR_CONTROL_UUID = '583cb5b3-875d-40ed-9098-c39eb0c1983d';

export interface BloodPressureReading {
  systolic: number;
  diastolic: number;
  meanArterialPressure: number;
  heartRate: number;
  timestamp: Date;
  status: 'normal' | 'elevated' | 'high' | 'hypertensive';
}

export interface DeviceState {
  isConnected: boolean;
  isConnecting: boolean;
  isScanning: boolean;
  isMeasuring: boolean;
  deviceName: string | null;
  error: string | null;
}

// Blood pressure classification based on AHA guidelines
export function classifyBloodPressure(systolic: number, diastolic: number): BloodPressureReading['status'] {
  if (systolic < 120 && diastolic < 80) return 'normal';
  if (systolic < 130 && diastolic < 80) return 'elevated';
  if (systolic < 140 || diastolic < 90) return 'high';
  return 'hypertensive';
}

// Parse blood pressure measurement from BLE characteristic value
export function parseBloodPressureMeasurement(dataView: DataView): Partial<BloodPressureReading> | null {
  try {
    const flags = dataView.getUint8(0);
    const hasTimestamp = (flags & 0x02) !== 0;
    const hasPulseRate = (flags & 0x04) !== 0;

    // Read systolic, diastolic, MAP (IEEE-11073 16-bit SFLOAT)
    let offset = 1;
    const systolic = parseSFLOAT(dataView, offset);
    offset += 2;
    const diastolic = parseSFLOAT(dataView, offset);
    offset += 2;
    const meanArterialPressure = parseSFLOAT(dataView, offset);
    offset += 2;

    // Skip timestamp if present
    if (hasTimestamp) {
      offset += 7; // Year (2) + Month + Day + Hour + Minute + Second
    }

    // Read pulse rate if present
    let heartRate = 0;
    if (hasPulseRate) {
      heartRate = parseSFLOAT(dataView, offset);
    }

    // Validate readings
    if (systolic <= 0 || diastolic <= 0 || systolic < diastolic) {
      return null;
    }

    return {
      systolic: Math.round(systolic),
      diastolic: Math.round(diastolic),
      meanArterialPressure: Math.round(meanArterialPressure),
      heartRate: Math.round(heartRate),
      status: classifyBloodPressure(systolic, diastolic),
    };
  } catch (error) {
    console.error('Failed to parse blood pressure measurement:', error);
    return null;
  }
}

// Parse IEEE-11073 16-bit SFLOAT
function parseSFLOAT(dataView: DataView, offset: number): number {
  const raw = dataView.getUint16(offset, true);
  const mantissa = raw & 0x0FFF;
  const exponent = (raw >> 12) & 0x0F;
  
  // Handle special values
  if (raw === 0x07FF) return NaN; // NaN
  if (raw === 0x0800) return NaN; // NRes
  if (raw === 0x07FE) return Infinity; // +INFINITY
  if (raw === 0x0802) return -Infinity; // -INFINITY

  // Convert to signed mantissa
  const signedMantissa = mantissa >= 0x0800 ? mantissa - 0x1000 : mantissa;
  const signedExponent = exponent >= 8 ? exponent - 16 : exponent;

  return signedMantissa * Math.pow(10, signedExponent);
}

// Check if Web Bluetooth is available
export function isWebBluetoothAvailable(): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as any;
  return 'bluetooth' in navigator && typeof nav.bluetooth?.requestDevice === 'function';
}

// Storage key for readings
export const READINGS_STORAGE_KEY = 'librearm_readings';

// Save reading to local storage
export function saveReading(reading: BloodPressureReading): void {
  const existing = getStoredReadings();
  existing.unshift(reading);
  // Keep last 100 readings
  const trimmed = existing.slice(0, 100);
  localStorage.setItem(READINGS_STORAGE_KEY, JSON.stringify(trimmed));
}

// Get stored readings
export function getStoredReadings(): BloodPressureReading[] {
  try {
    const stored = localStorage.getItem(READINGS_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((r: any) => ({
      ...r,
      timestamp: new Date(r.timestamp),
    }));
  } catch {
    return [];
  }
}

// Clear all stored readings
export function clearStoredReadings(): void {
  localStorage.removeItem(READINGS_STORAGE_KEY);
}
