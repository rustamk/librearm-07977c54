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

  // Using any for Web Bluetooth types as they're not in standard TypeScript lib
  const deviceRef = useRef<any>(null);
  const measurementCharRef = useRef<any>(null);
  const controlCharRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const measurementTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearError = useCallback(() => {
    setDeviceState(prev => ({ ...prev, error: null }));
  }, []);

  const disconnect = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current);
    }

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
  }, []);

  // Store the callback in a ref so it doesn't cause re-renders
  const onReadingCompleteRef = useRef(onReadingComplete);
  useEffect(() => {
    onReadingCompleteRef.current = onReadingComplete;
  }, [onReadingComplete]);

  const handleMeasurement = useCallback((event: Event) => {
    const characteristic = event.target as any;
    const value = characteristic.value;
    
    if (!value) return;

    console.log('Received measurement data, length:', value.byteLength);

    const reading = parseBloodPressureMeasurement(value);
    
    if (reading && reading.systolic && reading.diastolic && reading.diastolic > 0) {
      // Valid complete reading (diastolic > 0 means measurement is done)
      console.log('Valid reading received:', reading);
      
      // Clear measurement timeout
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
      
      // Call the callback for Health Connect sync
      if (onReadingCompleteRef.current) {
        onReadingCompleteRef.current(fullReading);
      }
      
      setDeviceState(prev => ({ ...prev, isMeasuring: false }));
      setInflationPressure(0);
    } else if (reading && reading.systolic) {
      // Intermediate reading during inflation - show cuff pressure
      console.log('Inflation pressure:', reading.systolic);
      setInflationPressure(reading.systolic);
    }
  }, []);

  const connect = useCallback(async () => {
    if (!isWebBluetoothAvailable()) {
      setDeviceState(prev => ({
        ...prev,
        error: 'Web Bluetooth is not available. Please use Chrome on Android or a compatible browser.',
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
      // Request device with Blood Pressure service
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

      // Set connection timeout
      timeoutRef.current = setTimeout(() => {
        setDeviceState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Connection timed out. Please try again.',
        }));
        disconnect();
      }, CONNECTION_TIMEOUT);

      // Connect to GATT server
      const server = await device.gatt?.connect();
      if (!server) throw new Error('Failed to connect to GATT server');

      // Get Blood Pressure service
      const service = await server.getPrimaryService(BLOOD_PRESSURE_SERVICE);
      
      // Get Blood Pressure Measurement characteristic
      const measurementChar = await service.getCharacteristic(BLOOD_PRESSURE_MEASUREMENT_CHAR);
      measurementCharRef.current = measurementChar;

      // Try to get the vendor control characteristic
      try {
        const controlChar = await service.getCharacteristic(VENDOR_CONTROL_UUID);
        controlCharRef.current = controlChar;
        console.log('Control characteristic found - can trigger measurements from app');
      } catch (e) {
        console.log('Control characteristic not found - device may need physical button');
        controlCharRef.current = null;
      }

      // Start notifications for measurement characteristic
      await measurementChar.startNotifications();
      measurementChar.addEventListener('characteristicvaluechanged', handleMeasurement);

      // Handle disconnect
      device.addEventListener('gattserverdisconnected', () => {
        setDeviceState(prev => ({
          ...prev,
          isConnected: false,
          isMeasuring: false,
          error: 'Device disconnected',
        }));
      });

      // Clear timeout and update state
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setDeviceState({
        isConnected: true,
        isConnecting: false,
        isScanning: false,
        isMeasuring: false,
        deviceName: device.name || 'QardioArm',
        error: null,
      });

    } catch (error: any) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      let errorMessage = 'Failed to connect to device';
      
      if (error.message?.includes('cancelled') || error.message?.includes('cancel')) {
        errorMessage = 'Connection cancelled by user';
      } else if (error.message?.includes('auth') || error.message?.includes('Authentication')) {
        errorMessage = 'Authentication failed. Please pair the device in your Bluetooth settings first, then try again.';
      } else if (error.message?.includes('not found') || error.message?.includes('No device')) {
        errorMessage = 'Device not found. Make sure QardioArm is turned on and nearby.';
      } else if (error.message?.includes('denied') || error.message?.includes('permission')) {
        errorMessage = 'Bluetooth permission denied. Please allow Bluetooth access.';
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
  }, [disconnect, handleMeasurement]);

  const startMeasurement = useCallback(async () => {
    if (!controlCharRef.current) {
      setDeviceState(prev => ({
        ...prev,
        error: 'Control characteristic not available. Cannot start measurement.',
      }));
      return;
    }

    setDeviceState(prev => ({ ...prev, isMeasuring: true, error: null }));
    setCurrentReading(null);
    setInflationPressure(0);

    try {
      // Send start command to QardioArm
      console.log('Sending start measurement command...');
      await controlCharRef.current.writeValue(START_MEASUREMENT_COMMAND);
      console.log('Start command sent successfully');

      // Set measurement timeout (2 minutes)
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
      
      // Try writeWithoutResponse as fallback
      try {
        console.log('Trying writeWithoutResponse...');
        await controlCharRef.current.writeValueWithoutResponse(START_MEASUREMENT_COMMAND);
        console.log('Start command sent via writeWithoutResponse');
        
        // Set measurement timeout
        measurementTimeoutRef.current = setTimeout(() => {
          setDeviceState(prev => ({
            ...prev,
            isMeasuring: false,
            error: 'Measurement timed out. Please try again.',
          }));
          setInflationPressure(0);
        }, MEASUREMENT_TIMEOUT);
        
      } catch (fallbackError: any) {
        console.error('Fallback also failed:', fallbackError);
        setDeviceState(prev => ({
          ...prev,
          isMeasuring: false,
          error: `Failed to start measurement: ${error.message || 'Unknown error'}`,
        }));
      }
    }
  }, []);

  const stopMeasurement = useCallback(async () => {
    if (measurementTimeoutRef.current) {
      clearTimeout(measurementTimeoutRef.current);
    }

    if (controlCharRef.current) {
      try {
        console.log('Sending cancel measurement command...');
        await controlCharRef.current.writeValue(CANCEL_MEASUREMENT_COMMAND);
        console.log('Cancel command sent successfully');
      } catch (error) {
        // Try writeWithoutResponse as fallback
        try {
          await controlCharRef.current.writeValueWithoutResponse(CANCEL_MEASUREMENT_COMMAND);
        } catch (e) {
          console.log('Error sending cancel command:', e);
        }
      }
    }

    setDeviceState(prev => ({ ...prev, isMeasuring: false }));
    setInflationPressure(0);
  }, []);

  return {
    deviceState,
    currentReading,
    inflationPressure,
    connect,
    disconnect,
    startMeasurement,
    stopMeasurement,
    clearError,
  };
}