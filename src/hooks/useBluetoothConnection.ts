import { useState, useCallback } from 'react';
import { useDrivingStore } from '@/stores/drivingStore';

/**
 * 블루투스 연결 감지 훅
 * 
 * NOTE: 이 기능은 Development Build에서만 사용 가능합니다.
 * Expo Go에서는 블루투스 기능이 비활성화됩니다.
 * 
 * 블루투스 기능을 사용하려면:
 * 1. npm install react-native-ble-plx
 * 2. npx expo prebuild
 * 3. npx expo run:ios 또는 npx expo run:android
 */

type Device = any;

interface UseBluetoothConnectionOptions {
  autoScan?: boolean;
  scanInterval?: number;
  checkInterval?: number;
}

interface UseBluetoothConnectionReturn {
  isBleAvailable: boolean;
  isBluetoothEnabled: boolean;
  isScanning: boolean;
  connectedDevice: Device | null;
  nearbyDevices: Device[];
  error: string | null;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: Device) => Promise<void>;
  disconnectDevice: () => Promise<void>;
  setAsCarDevice: (device: Device) => void;
}

export function useBluetoothConnection(
  _options: UseBluetoothConnectionOptions = {}
): UseBluetoothConnectionReturn {
  const [error] = useState<string | null>(
    'Expo Go에서는 블루투스를 사용할 수 없습니다. Development Build를 사용해주세요.'
  );

  const setBluetoothConnected = useDrivingStore((state) => state.setBluetoothConnected);

  // Mock 함수들 (블루투스 사용 불가 시)
  const startScan = useCallback(async () => {
    console.log('블루투스 스캔 불가: Development Build가 필요합니다.');
  }, []);

  const stopScan = useCallback(() => {
    console.log('블루투스 스캔 중지 불가: Development Build가 필요합니다.');
  }, []);

  const connectToDevice = useCallback(async (_device: Device) => {
    console.log('블루투스 연결 불가: Development Build가 필요합니다.');
  }, []);

  const disconnectDevice = useCallback(async () => {
    console.log('블루투스 연결 해제 불가: Development Build가 필요합니다.');
  }, []);

  const setAsCarDevice = useCallback((_device: Device) => {
    console.log('차량 장치 설정 불가: Development Build가 필요합니다.');
  }, []);

  return {
    isBleAvailable: false,
    isBluetoothEnabled: false,
    isScanning: false,
    connectedDevice: null,
    nearbyDevices: [],
    error,
    startScan,
    stopScan,
    connectToDevice,
    disconnectDevice,
    setAsCarDevice,
  };
}
