import { BleClient, BleDevice, numberToUUID } from '@capacitor-community/bluetooth-le';
import {
  BLOOD_PRESSURE_SERVICE,
  BLOOD_PRESSURE_MEASUREMENT_CHAR,
  VENDOR_CONTROL_UUID,
  parseBloodPressureMeasurement,
  BloodPressureReading,
  classifyBloodPressure,
} from './bluetooth';

let isInitialized = false;
let connectedDevice: BleDevice | null = null;

/**
 * Check if running in native Capacitor environment
 */
export function isNativeApp(): boolean {
  return typeof (window as any).Capacitor !== 'undefined' && 
         (window as any).Capacitor.isNativePlatform?.() === true;
}

/**
 * Initialize BLE client
 */
export async function initializeBle(): Promise<boolean> {
  if (isInitialized) return true;
  
  try {
    await BleClient.initialize({ androidNeverForLocation: true });
    isInitialized = true;
    console.log('BLE initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize BLE:', error);
    return false;
  }
}

/**
 * Request BLE permissions (Android)
 */
export async function requestBlePermissions(): Promise<boolean> {
  try {
    // On Android 12+, we need BLUETOOTH_SCAN and BLUETOOTH_CONNECT
    await BleClient.requestLEScan({ services: [] }, () => {});
    await BleClient.stopLEScan();
    return true;
  } catch (error) {
    console.error('BLE permission request failed:', error);
    return false;
  }
}

/**
 * Check if BLE is available
 */
export async function isBleAvailable(): Promise<boolean> {
  if (!isNativeApp()) return false;
  
  try {
    const initialized = await initializeBle();
    if (!initialized) return false;
    
    const enabled = await BleClient.isEnabled();
    return enabled;
  } catch (error) {
    console.error('BLE availability check failed:', error);
    return false;
  }
}

/**
 * Scan for blood pressure devices
 */
export async function scanForDevices(
  onDeviceFound: (device: BleDevice) => void,
  timeoutMs: number = 10000
): Promise<void> {
  await initializeBle();
  
  const devices = new Set<string>();
  
  await BleClient.requestLEScan(
    {
      services: [BLOOD_PRESSURE_SERVICE],
      namePrefix: 'Qardio',
    },
    (result) => {
      if (result.device && !devices.has(result.device.deviceId)) {
        devices.add(result.device.deviceId);
        console.log('Found device:', result.device.name, result.device.deviceId);
        onDeviceFound(result.device);
      }
    }
  );

  // Stop scan after timeout
  setTimeout(async () => {
    try {
      await BleClient.stopLEScan();
    } catch (e) {
      console.log('Error stopping scan:', e);
    }
  }, timeoutMs);
}

/**
 * Stop scanning
 */
export async function stopScan(): Promise<void> {
  try {
    await BleClient.stopLEScan();
  } catch (e) {
    console.log('Error stopping scan:', e);
  }
}

/**
 * Connect to a BLE device
 */
export async function connectToDevice(
  deviceId: string,
  onDisconnect?: () => void
): Promise<boolean> {
  try {
    await initializeBle();
    
    await BleClient.connect(deviceId, (disconnectedDeviceId) => {
      console.log('Device disconnected:', disconnectedDeviceId);
      connectedDevice = null;
      onDisconnect?.();
    });
    
    connectedDevice = { deviceId, name: 'QardioArm' };
    console.log('Connected to device:', deviceId);
    return true;
  } catch (error) {
    console.error('Failed to connect:', error);
    return false;
  }
}

/**
 * Disconnect from device
 */
export async function disconnectDevice(): Promise<void> {
  if (connectedDevice) {
    try {
      await BleClient.disconnect(connectedDevice.deviceId);
    } catch (e) {
      console.log('Error disconnecting:', e);
    }
    connectedDevice = null;
  }
}

/**
 * Subscribe to blood pressure measurements
 */
export async function subscribeToMeasurements(
  deviceId: string,
  onMeasurement: (reading: Partial<BloodPressureReading>) => void
): Promise<void> {
  await BleClient.startNotifications(
    deviceId,
    BLOOD_PRESSURE_SERVICE,
    BLOOD_PRESSURE_MEASUREMENT_CHAR,
    (value) => {
      console.log('Received BLE data:', value.byteLength, 'bytes');
      const dataView = new DataView(value.buffer);
      const reading = parseBloodPressureMeasurement(dataView);
      if (reading) {
        onMeasurement(reading);
      }
    }
  );
}

/**
 * Unsubscribe from measurements
 */
export async function unsubscribeFromMeasurements(deviceId: string): Promise<void> {
  try {
    await BleClient.stopNotifications(
      deviceId,
      BLOOD_PRESSURE_SERVICE,
      BLOOD_PRESSURE_MEASUREMENT_CHAR
    );
  } catch (e) {
    console.log('Error stopping notifications:', e);
  }
}

/**
 * Write command to control characteristic
 */
export async function writeControlCommand(
  deviceId: string,
  command: Uint8Array
): Promise<boolean> {
  try {
    await BleClient.write(
      deviceId,
      BLOOD_PRESSURE_SERVICE,
      VENDOR_CONTROL_UUID,
      new DataView(command.buffer)
    );
    return true;
  } catch (error) {
    console.error('Failed to write command:', error);
    // Try writeWithoutResponse
    try {
      await BleClient.writeWithoutResponse(
        deviceId,
        BLOOD_PRESSURE_SERVICE,
        VENDOR_CONTROL_UUID,
        new DataView(command.buffer)
      );
      return true;
    } catch (e) {
      console.error('WriteWithoutResponse also failed:', e);
      return false;
    }
  }
}

/**
 * Get connected device
 */
export function getConnectedDevice(): BleDevice | null {
  return connectedDevice;
}
