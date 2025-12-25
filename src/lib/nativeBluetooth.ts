import {
  BLOOD_PRESSURE_SERVICE,
  BLOOD_PRESSURE_MEASUREMENT_CHAR,
  VENDOR_CONTROL_UUID,
  parseBloodPressureMeasurement,
  BloodPressureReading,
} from './bluetooth';

// Dynamic import for Capacitor BLE plugin (only available in native environment)
let BleClient: any = null;

// Type for BLE device
export interface BleDevice {
  deviceId: string;
  name?: string;
}

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
 * Load the BLE plugin dynamically
 */
async function loadBlePlugin(): Promise<boolean> {
  if (BleClient) return true;
  if (!isNativeApp()) return false;
  
  try {
    const module = await import('@capacitor-community/bluetooth-le');
    BleClient = module.BleClient;
    return true;
  } catch (error) {
    console.error('Failed to load BLE plugin:', error);
    return false;
  }
}

/**
 * Initialize BLE client
 */
export async function initializeBle(): Promise<boolean> {
  if (isInitialized) return true;
  if (!isNativeApp()) return false;
  
  const loaded = await loadBlePlugin();
  if (!loaded) return false;
  
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
  if (!BleClient) return false;
  
  try {
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
    if (!initialized || !BleClient) return false;
    
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
  const initialized = await initializeBle();
  if (!initialized || !BleClient) {
    throw new Error('BLE not available');
  }
  
  const devices = new Set<string>();
  
  await BleClient.requestLEScan(
    {
      services: [BLOOD_PRESSURE_SERVICE],
      namePrefix: 'Qardio',
    },
    (result: any) => {
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
  if (!BleClient) return;
  
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
    const initialized = await initializeBle();
    if (!initialized || !BleClient) return false;
    
    await BleClient.connect(deviceId, (disconnectedDeviceId: string) => {
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
  if (connectedDevice && BleClient) {
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
  if (!BleClient) throw new Error('BLE not available');
  
  await BleClient.startNotifications(
    deviceId,
    BLOOD_PRESSURE_SERVICE,
    BLOOD_PRESSURE_MEASUREMENT_CHAR,
    (value: DataView) => {
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
  if (!BleClient) return;
  
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
  if (!BleClient) return false;
  
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
