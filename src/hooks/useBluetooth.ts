import { useState, useCallback, useRef } from 'react';
import {
  DeviceState,
  BloodPressureReading,
  BLOOD_PRESSURE_SERVICE,
  BLOOD_PRESSURE_MEASUREMENT_CHAR,
  parseBloodPressureMeasurement,
  classifyBloodPressure,
  isWebBluetoothAvailable,
  saveReading,
} from '@/lib/bluetooth';

const CONNECTION_TIMEOUT = 30000; // 30 seconds

export function useBluetooth() {
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
  const characteristicRef = useRef<any>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearError = useCallback(() => {
    setDeviceState(prev => ({ ...prev, error: null }));
  }, []);

  const disconnect = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (characteristicRef.current) {
      try {
        await characteristicRef.current.stopNotifications();
      } catch (e) {
        console.log('Error stopping notifications:', e);
      }
    }

    if (deviceRef.current?.gatt?.connected) {
      deviceRef.current.gatt.disconnect();
    }

    deviceRef.current = null;
    characteristicRef.current = null;

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

  const handleMeasurement = useCallback((event: Event) => {
    const characteristic = event.target as any;
    const value = characteristic.value;
    
    if (!value) return;

    const reading = parseBloodPressureMeasurement(value);
    
    if (reading && reading.systolic && reading.diastolic) {
      // Valid complete reading
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
      setDeviceState(prev => ({ ...prev, isMeasuring: false }));
      setInflationPressure(0);
    } else if (value.byteLength >= 3) {
      // Possibly inflation pressure update
      try {
        const pressure = value.getUint8(1) | (value.getUint8(2) << 8);
        if (pressure > 0 && pressure < 300) {
          setInflationPressure(pressure);
        }
      } catch (e) {
        console.log('Error reading inflation pressure');
      }
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
      const characteristic = await service.getCharacteristic(BLOOD_PRESSURE_MEASUREMENT_CHAR);
      characteristicRef.current = characteristic;

      // Start notifications
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleMeasurement);

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

  const startMeasurement = useCallback(() => {
    setDeviceState(prev => ({ ...prev, isMeasuring: true }));
    setCurrentReading(null);
    setInflationPressure(0);
    // The actual measurement is triggered by the QardioArm device button
    // We just update the UI state to show we're ready
  }, []);

  const stopMeasurement = useCallback(() => {
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