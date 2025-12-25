import { useState, useCallback, useRef, useEffect } from 'react';
import {
  DeviceState,
  BloodPressureReading,
  BLOOD_PRESSURE_SERVICE,
  BLOOD_PRESSURE_MEASUREMENT_CHAR,
  VENDOR_CONTROL_UUID,
  START_MEASUREMENT_COMMAND,
  CANCEL_MEASUREMENT_COMMAND,
  parseBloodPressureMeasurement,
  classifyBloodPressure,
  isWebBluetoothAvailable,
  saveReading,
} from '@/lib/bluetooth';
import {
  isNativeApp,
  initializeBle,
  isBleAvailable,
  scanForDevices,
  stopScan,
  connectToDevice,
  disconnectDevice,
  subscribeToMeasurements,
  unsubscribeFromMeasurements,
  writeControlCommand,
  getConnectedDevice,
} from '@/lib/nativeBluetooth';
import type { BleDevice } from '@capacitor-community/bluetooth-le';

const CONNECTION_TIMEOUT = 30000; // 30 seconds
const MEASUREMENT_TIMEOUT = 120000; // 2 minutes for measurement

interface UseBluetoothOptions {
  onReadingComplete?: (reading: BloodPressureReading) => void;
}

export function useBluetooth(options: UseBluetoothOptions = {}) {
  const { onReadingComplete } = options;
  const [deviceState, setDeviceState] = useState<DeviceState>({
    isConnected: false,
    isConnecting: false,
    isScanning: false,
    isMeasuring: false,
    deviceName: null,
    error: null,
  });

  const [currentReading, setCurrentReading] = useState<BloodPressureReading | null>(null);
  const [inflationPressure, setInflationPressure] = useState<number>(0);
  const [isNative] = useState(() => isNativeApp());

  // Refs for Web Bluetooth
  const deviceRef = useRef<any>(null);
  const measurementCharRef = useRef<any>(null);
  const controlCharRef = useRef<any>(null);
  
  // Refs for Native BLE
  const nativeDeviceIdRef = useRef<string | null>(null);
  
  // Shared refs
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measurementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onReadingCompleteRef = useRef(onReadingComplete);

  useEffect(() => {
    onReadingCompleteRef.current = onReadingComplete;
  }, [onReadingComplete]);

  const clearError = useCallback(() => {
    setDeviceState(prev => ({ ...prev, error: null }));
  }, []);

  // Handle measurement data (shared between native and web)
  const handleMeasurementData = useCallback((reading: Partial<BloodPressureReading>) => {
    if (reading && reading.systolic && reading.diastolic && reading.diastolic > 0) {
      console.log('Valid reading received:', reading);
      
      if (measurementTimeoutRef.current) {
        clearTimeout(measurementTimeoutRef.current);
      }

      const fullReading: BloodPressureReading = {
        systolic: reading.systolic,
        diastolic: reading.diastolic,
        meanArterialPressure: reading.meanArterialPressure || Math.round((reading.systolic + 2 * reading.diastolic) / 3),
        heartRate: reading.heartRate || 0,
        timestamp: new Date(),
        status: reading.status || classifyBloodPressure(reading.systolic, reading.diastolic),
      };

      setCurrentReading(fullReading);
      saveReading(fullReading);
      
      if (onReadingCompleteRef.current) {
        onReadingCompleteRef.current(fullReading);
      }
      
      setDeviceState(prev => ({ ...prev, isMeasuring: false }));
      setInflationPressure(0);
    } else if (reading && reading.systolic) {
      console.log('Inflation pressure:', reading.systolic);
      setInflationPressure(reading.systolic);
    }
  }, []);

  // Disconnect function
  const disconnect = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (measurementTimeoutRef.current) clearTimeout(measurementTimeoutRef.current);

    if (isNative) {
      // Native BLE disconnect
      if (nativeDeviceIdRef.current) {
        await unsubscribeFromMeasurements(nativeDeviceIdRef.current);
        await disconnectDevice();
        nativeDeviceIdRef.current = null;
      }
    } else {
      // Web Bluetooth disconnect
      if (measurementCharRef.current) {
        try {
          await measurementCharRef.current.stopNotifications();
        } catch (e) {
          console.log('Error stopping notifications:', e);
        }
      }

      if (deviceRef.current?.gatt?.connected) {
        deviceRef.current.gatt.disconnect();
      }

      deviceRef.current = null;
      measurementCharRef.current = null;
      controlCharRef.current = null;
    }

    setDeviceState({
      isConnected: false,
      isConnecting: false,
      isScanning: false,
      isMeasuring: false,
      deviceName: null,
      error: null,
    });
    setCurrentReading(null);
    setInflationPressure(0);
  }, [isNative]);

  // Native BLE connect
  const connectNative = useCallback(async () => {
    setDeviceState(prev => ({
      ...prev,
      isScanning: true,
      isConnecting: false,
      error: null,
    }));

    try {
      const available = await isBleAvailable();
      if (!available) {
        setDeviceState(prev => ({
          ...prev,
          isScanning: false,
          error: 'Bluetooth is not available or not enabled. Please enable Bluetooth.',
        }));
        return;
      }

      let foundDevice: BleDevice | null = null;

      // Scan for devices
      await scanForDevices((device) => {
        if (!foundDevice) {
          foundDevice = device;
          console.log('Connecting to first found device:', device.name);
        }
      }, 10000);

      // Wait a bit for scan results
      await new Promise(resolve => setTimeout(resolve, 5000));
      await stopScan();

      if (!foundDevice) {
        setDeviceState(prev => ({
          ...prev,
          isScanning: false,
          error: 'No blood pressure device found. Make sure QardioArm is turned on and nearby.',
        }));
        return;
      }

      setDeviceState(prev => ({
        ...prev,
        isScanning: false,
        isConnecting: true,
        deviceName: foundDevice!.name || 'QardioArm',
      }));

      // Set connection timeout
      timeoutRef.current = setTimeout(() => {
        setDeviceState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Connection timed out. Please try again.',
        }));
        disconnect();
      }, CONNECTION_TIMEOUT);

      const connected = await connectToDevice(foundDevice.deviceId, () => {
        setDeviceState(prev => ({
          ...prev,
          isConnected: false,
          isMeasuring: false,
          error: 'Device disconnected',
        }));
      });

      if (!connected) {
        throw new Error('Failed to connect to device');
      }

      nativeDeviceIdRef.current = foundDevice.deviceId;

      // Subscribe to measurements
      await subscribeToMeasurements(foundDevice.deviceId, handleMeasurementData);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setDeviceState({
        isConnected: true,
        isConnecting: false,
        isScanning: false,
        isMeasuring: false,
        deviceName: foundDevice.name || 'QardioArm',
        error: null,
      });

    } catch (error: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      let errorMessage = 'Failed to connect to device';
      if (error.message) {
        errorMessage = error.message;
      }

      setDeviceState(prev => ({
        ...prev,
        isScanning: false,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [disconnect, handleMeasurementData]);

  // Web Bluetooth connect
  const connectWeb = useCallback(async () => {
    if (!isWebBluetoothAvailable()) {
      setDeviceState(prev => ({
        ...prev,
        error: 'Web Bluetooth is not available. Please use the native Android app or Chrome browser.',
      }));
      return;
    }

    setDeviceState(prev => ({
      ...prev,
      isScanning: true,
      isConnecting: false,
      error: null,
    }));

    try {
      const bluetooth = (navigator as any).bluetooth;
      const device = await bluetooth.requestDevice({
        filters: [
          { services: [BLOOD_PRESSURE_SERVICE] },
          { namePrefix: 'Qardio' },
          { namePrefix: 'QardioArm' },
        ],
        optionalServices: [BLOOD_PRESSURE_SERVICE],
      });

      deviceRef.current = device;

      setDeviceState(prev => ({
        ...prev,
        isScanning: false,
        isConnecting: true,
        deviceName: device.name || 'QardioArm',
      }));

      timeoutRef.current = setTimeout(() => {
        setDeviceState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Connection timed out. Please try again.',
        }));
        disconnect();
      }, CONNECTION_TIMEOUT);

      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      const service = await server.getPrimaryService(BLOOD_PRESSURE_SERVICE);
      const measurementChar = await service.getCharacteristic(BLOOD_PRESSURE_MEASUREMENT_CHAR);
      measurementCharRef.current = measurementChar;

      try {
        const controlChar = await service.getCharacteristic(VENDOR_CONTROL_UUID);
        controlCharRef.current = controlChar;
        console.log('Control characteristic found');
      } catch (e) {
        console.log('Control characteristic not found');
        controlCharRef.current = null;
      }

      await measurementChar.startNotifications();
      measurementChar.addEventListener('characteristicvaluechanged', (event: Event) => {
        const characteristic = event.target as any;
        const value = characteristic.value;
        if (!value) return;
        const reading = parseBloodPressureMeasurement(value);
        if (reading) {
          handleMeasurementData(reading);
        }
      });

      device.addEventListener('gattserverdisconnected', () => {
        setDeviceState(prev => ({
          ...prev,
          isConnected: false,
          isMeasuring: false,
          error: 'Device disconnected',
        }));
      });

      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      setDeviceState({
        isConnected: true,
        isConnecting: false,
        isScanning: false,
        isMeasuring: false,
        deviceName: device.name || 'QardioArm',
        error: null,
      });

    } catch (error: any) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      let errorMessage = 'Failed to connect to device';
      if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
        errorMessage = 'Connection cancelled by user';
      } else if (error.message?.includes('auth')) {
        errorMessage = 'Authentication failed. Please pair the device first.';
      } else if (error.message?.includes('not found')) {
        errorMessage = 'Device not found. Make sure QardioArm is turned on.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      setDeviceState(prev => ({
        ...prev,
        isScanning: false,
        isConnecting: false,
        error: errorMessage,
      }));
    }
  }, [disconnect, handleMeasurementData]);

  // Main connect function - chooses native or web
  const connect = useCallback(async () => {
    if (isNative) {
      await connectNative();
    } else {
      await connectWeb();
    }
  }, [isNative, connectNative, connectWeb]);

  // Start measurement
  const startMeasurement = useCallback(async () => {
    setDeviceState(prev => ({ ...prev, isMeasuring: true, error: null }));
    setCurrentReading(null);
    setInflationPressure(0);

    try {
      let success = false;

      if (isNative && nativeDeviceIdRef.current) {
        success = await writeControlCommand(nativeDeviceIdRef.current, START_MEASUREMENT_COMMAND);
      } else if (controlCharRef.current) {
        try {
          await controlCharRef.current.writeValue(START_MEASUREMENT_COMMAND);
          success = true;
        } catch {
          await controlCharRef.current.writeValueWithoutResponse(START_MEASUREMENT_COMMAND);
          success = true;
        }
      }

      if (!success) {
        throw new Error('Could not send start command');
      }

      console.log('Start measurement command sent');

      measurementTimeoutRef.current = setTimeout(() => {
        setDeviceState(prev => ({
          ...prev,
          isMeasuring: false,
          error: 'Measurement timed out. Please try again.',
        }));
        setInflationPressure(0);
      }, MEASUREMENT_TIMEOUT);

    } catch (error: any) {
      console.error('Failed to start measurement:', error);
      setDeviceState(prev => ({
        ...prev,
        isMeasuring: false,
        error: `Failed to start measurement: ${error.message || 'Unknown error'}`,
      }));
    }
  }, [isNative]);

  // Stop measurement
  const stopMeasurement = useCallback(async () => {
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current);
    }

    if (isNative && nativeDeviceIdRef.current) {
      await writeControlCommand(nativeDeviceIdRef.current, CANCEL_MEASUREMENT_COMMAND);
    } else if (controlCharRef.current) {
      try {
        await controlCharRef.current.writeValue(CANCEL_MEASUREMENT_COMMAND);
      } catch {
        try {
          await controlCharRef.current.writeValueWithoutResponse(CANCEL_MEASUREMENT_COMMAND);
        } catch (e) {
          console.log('Error sending cancel command:', e);
        }
      }
    }

    setDeviceState(prev => ({ ...prev, isMeasuring: false }));
    setInflationPressure(0);
  }, [isNative]);

  return {
    deviceState,
    currentReading,
    inflationPressure,
    connect,
    disconnect,
    startMeasurement,
    stopMeasurement,
    clearError,
    isNative,
  };
}
