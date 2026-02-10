import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { useDrivingStore } from '@/stores/drivingStore';
import { useBluetoothSettingsStore } from '@/stores/bluetoothSettingsStore';

// 네이티브 전용 모듈 - 웹에서는 import하지 않음
let BleManager: any = null;
let State: any = {};
let getConnectedBluetoothAudio: any = () => null;
let addBluetoothAudioListener: any = () => ({ remove: () => {} });
let isClassicBtAvailableNative: any = () => false;

if (Platform.OS !== 'web') {
  const blePlx = require('react-native-ble-plx');
  BleManager = blePlx.BleManager;
  State = blePlx.State;
  const btAudio = require('../../modules/bluetooth-audio');
  getConnectedBluetoothAudio = btAudio.getConnectedBluetoothAudio;
  addBluetoothAudioListener = btAudio.addBluetoothAudioListener;
  isClassicBtAvailableNative = btAudio.isClassicBtAvailable;
}

/**
 * 블루투스 연결 감지 훅 (BLE + Classic BT 오디오)
 *
 * - BLE: 디바이스 스캔 및 연결 감지
 * - Classic BT: 차량 오디오, 에어팟 등 오디오 라우트 변경 감지 (iOS)
 *
 * NOTE: Development Build에서만 동작합니다.
 */

// BleManager 싱글턴
let bleManagerInstance: any = null;

function getBleManager(): any {
  if (!BleManager) return null;
  if (!bleManagerInstance) {
    bleManagerInstance = new BleManager();
  }
  return bleManagerInstance;
}

export type BleDevice = {
  id: string;
  name: string | null;
  rssi: number | null;
};

export type ClassicAudioDevice = {
  id: string;
  name: string;
  portType: string;
};

interface UseBluetoothConnectionOptions {
  autoMonitor?: boolean;
  scanDuration?: number;
  checkInterval?: number;
}

interface UseBluetoothConnectionReturn {
  // BLE 상태
  isBleAvailable: boolean;
  isBluetoothEnabled: boolean;
  isScanning: boolean;
  connectedDevice: BleDevice | null;
  nearbyDevices: BleDevice[];

  // Classic BT 오디오 상태
  isClassicBtAvailable: boolean;
  classicAudioDevice: ClassicAudioDevice | null;

  // 공통
  error: string | null;
  isMonitoring: boolean;

  // BLE 액션
  startScan: () => Promise<void>;
  stopScan: () => void;
  connectToDevice: (device: BleDevice) => Promise<void>;
  disconnectDevice: () => Promise<void>;

  // 등록 액션
  setAsCarDevice: (device: BleDevice) => void;
  setClassicAsCarDevice: (device: ClassicAudioDevice) => void;

  // 모니터링 액션
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

const WEB_NOOP_RETURN: UseBluetoothConnectionReturn = {
  isBleAvailable: false,
  isBluetoothEnabled: false,
  isScanning: false,
  connectedDevice: null,
  nearbyDevices: [],
  isClassicBtAvailable: false,
  classicAudioDevice: null,
  error: null,
  isMonitoring: false,
  startScan: async () => {},
  stopScan: () => {},
  connectToDevice: async () => {},
  disconnectDevice: async () => {},
  setAsCarDevice: () => {},
  setClassicAsCarDevice: () => {},
  startMonitoring: () => {},
  stopMonitoring: () => {},
};

export function useBluetoothConnection(
  options: UseBluetoothConnectionOptions = {},
): UseBluetoothConnectionReturn {
  // 웹에서는 블루투스 기능 사용 불가 - 안전한 기본값 반환
  if (Platform.OS === 'web') return WEB_NOOP_RETURN;

  const {
    autoMonitor = true,
    scanDuration = 10000,
    checkInterval = 5000,
  } = options;

  // BLE 상태
  const [isBleAvailable, setIsBleAvailable] = useState(false);
  const [isBluetoothEnabled, setIsBluetoothEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevice, setConnectedDevice] = useState<BleDevice | null>(null);
  const [nearbyDevices, setNearbyDevices] = useState<BleDevice[]>([]);

  // Classic BT 오디오 상태
  const [classicAudioDevice, setClassicAudioDevice] = useState<ClassicAudioDevice | null>(null);

  // 공통
  const [error, setError] = useState<string | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);

  const monitorIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bleManager = useRef<BleManager | null>(null);

  const setBluetoothConnected = useDrivingStore((s) => s.setBluetoothConnected);

  const autoStartEnabled = useBluetoothSettingsStore((s) => s.autoStartEnabled);
  const activeDeviceId = useBluetoothSettingsStore((s) => s.activeDeviceId);
  const addPairedDevice = useBluetoothSettingsStore((s) => s.addPairedDevice);

  // === BLE 초기화 ===
  useEffect(() => {
    try {
      bleManager.current = getBleManager();
      setIsBleAvailable(true);
    } catch {
      setIsBleAvailable(false);
    }
  }, []);

  // BLE 블루투스 상태 모니터링
  useEffect(() => {
    if (!bleManager.current) return;

    const subscription = bleManager.current.onStateChange((state) => {
      const enabled = state === State.PoweredOn;
      setIsBluetoothEnabled(enabled);

      if (!enabled) {
        setConnectedDevice(null);
      }
    }, true);

    return () => subscription.remove();
  }, []);

  // === Classic BT 오디오 자동 시작 체크 ===
  const checkClassicBtAutoStart = useCallback(
    (deviceName: string) => {
      const { pairedDevices, activeDeviceId: activeId, autoStartEnabled: autoEnabled } =
        useBluetoothSettingsStore.getState();

      if (!autoEnabled || !activeId) return;

      // 활성 디바이스의 이름과 매칭 (BLE/Classic 타입 무관)
      const activeDevice = pairedDevices.find((d) => d.id === activeId);
      if (activeDevice && activeDevice.name === deviceName) {
        setBluetoothConnected(true, deviceName);
      }
    },
    [setBluetoothConnected],
  );

  // === Classic BT 오디오 감지 (이벤트 기반 + 폴링) ===
  useEffect(() => {
    // 현재 연결 상태 확인 함수
    const checkCurrentClassicBt = () => {
      if (!isClassicBtAvailableNative()) return;

      const current = getConnectedBluetoothAudio();
      if (current) {
        const device: ClassicAudioDevice = {
          id: `classic-${current.name}`,
          name: current.name,
          portType: current.portType,
        };
        setClassicAudioDevice(device);
        checkClassicBtAutoStart(current.name);
      } else if (classicAudioDeviceRef.current) {
        // 연결 해제 감지
        const { activeDeviceId: activeId } = useBluetoothSettingsStore.getState();
        const activeDevice = useBluetoothSettingsStore.getState().pairedDevices.find(
          (d) => d.id === activeId,
        );
        if (activeDevice && activeDevice.name === classicAudioDeviceRef.current.name) {
          setBluetoothConnected(false, null);
        }
        setClassicAudioDevice(null);
      }
    };

    // 즉시 확인
    checkCurrentClassicBt();

    // 이벤트 기반 감지
    let eventSub: { remove: () => void } | null = null;
    if (isClassicBtAvailableNative()) {
      eventSub = addBluetoothAudioListener((event) => {
        if (event.connected && event.deviceName) {
          const device: ClassicAudioDevice = {
            id: `classic-${event.deviceName}`,
            name: event.deviceName,
            portType: event.portType,
          };
          setClassicAudioDevice(device);
          checkClassicBtAutoStart(event.deviceName);
        } else {
          const { activeDeviceId: activeId } = useBluetoothSettingsStore.getState();
          const activeDevice = useBluetoothSettingsStore.getState().pairedDevices.find(
            (d) => d.id === activeId,
          );
          const prevDevice = classicAudioDeviceRef.current;
          if (prevDevice && activeDevice && activeDevice.name === prevDevice.name) {
            setBluetoothConnected(false, null);
          }
          setClassicAudioDevice(null);
        }
      });
    }

    // 폴링: 3초마다 Classic BT 연결 상태 확인 (이벤트 누락 대비)
    const pollInterval = setInterval(checkCurrentClassicBt, 3000);

    return () => {
      eventSub?.remove();
      clearInterval(pollInterval);
    };
  }, [setBluetoothConnected, checkClassicBtAutoStart]);

  // Classic 디바이스 ref (이벤트 콜백에서 최신 값 접근용)
  const classicAudioDeviceRef = useRef<ClassicAudioDevice | null>(null);
  useEffect(() => {
    classicAudioDeviceRef.current = classicAudioDevice;
  }, [classicAudioDevice]);

  // === Android 권한 ===
  const requestAndroidPermissions = useCallback(async (): Promise<boolean> => {
    if (Platform.OS !== 'android') return true;

    try {
      if (Platform.Version >= 31) {
        const results = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return Object.values(results).every(
          (r) => r === PermissionsAndroid.RESULTS.GRANTED,
        );
      } else {
        const result = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        return result === PermissionsAndroid.RESULTS.GRANTED;
      }
    } catch {
      return false;
    }
  }, []);

  // === BLE 스캔 ===
  const startScan = useCallback(async () => {
    if (!bleManager.current || !isBleAvailable) {
      setError('BLE를 사용할 수 없습니다.');
      return;
    }
    if (isScanning) return;

    if (Platform.OS === 'android') {
      const granted = await requestAndroidPermissions();
      if (!granted) {
        setError('블루투스 권한이 필요합니다.');
        return;
      }
    }

    setIsScanning(true);
    setNearbyDevices([]);
    setError(null);

    const discoveredIds = new Set<string>();

    bleManager.current.startDeviceScan(null, null, (scanError, device) => {
      if (scanError) {
        setError(scanError.message);
        setIsScanning(false);
        return;
      }

      if (device && device.name && !discoveredIds.has(device.id)) {
        discoveredIds.add(device.id);
        setNearbyDevices((prev) => [
          ...prev,
          { id: device.id, name: device.name, rssi: device.rssi },
        ]);
      }
    });

    scanTimeoutRef.current = setTimeout(() => {
      bleManager.current?.stopDeviceScan();
      setIsScanning(false);
    }, scanDuration);
  }, [isBleAvailable, isScanning, scanDuration, requestAndroidPermissions]);

  const stopScan = useCallback(() => {
    if (!bleManager.current) return;
    bleManager.current.stopDeviceScan();
    setIsScanning(false);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
      scanTimeoutRef.current = null;
    }
  }, []);

  // === BLE 연결 ===
  const connectToDevice = useCallback(
    async (device: BleDevice) => {
      if (!bleManager.current) return;

      try {
        setError(null);
        const connected = await bleManager.current.connectToDevice(
          device.id,
          { timeout: 10000 },
        );

        const bleDevice: BleDevice = {
          id: connected.id,
          name: connected.name ?? device.name,
          rssi: connected.rssi,
        };

        setConnectedDevice(bleDevice);
        setBluetoothConnected(true, bleDevice.name);

        bleManager.current.onDeviceDisconnected(connected.id, () => {
          setConnectedDevice(null);
          setBluetoothConnected(false, null);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : '연결 실패');
      }
    },
    [setBluetoothConnected],
  );

  const disconnectDevice = useCallback(async () => {
    if (!bleManager.current || !connectedDevice) return;

    try {
      await bleManager.current.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setBluetoothConnected(false, null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '연결 해제 실패');
    }
  }, [connectedDevice, setBluetoothConnected]);

  // === 디바이스 등록 ===
  const setAsCarDevice = useCallback(
    (device: BleDevice) => {
      addPairedDevice({
        id: device.id,
        name: device.name || '알 수 없는 디바이스',
        type: 'ble',
      });
    },
    [addPairedDevice],
  );

  const setClassicAsCarDevice = useCallback(
    (device: ClassicAudioDevice) => {
      addPairedDevice({
        id: device.id,
        name: device.name,
        type: 'classic',
      });
    },
    [addPairedDevice],
  );

  // === BLE 자동 모니터링 ===
  const checkForPairedDevice = useCallback(async () => {
    if (!bleManager.current || !activeDeviceId || !autoStartEnabled) return;
    if (!isBluetoothEnabled) return;

    // Classic BT 디바이스는 이벤트 기반이므로 여기서는 BLE만 체크
    const { pairedDevices } = useBluetoothSettingsStore.getState();
    const activePaired = pairedDevices.find((d) => d.id === activeDeviceId);
    if (!activePaired || activePaired.type !== 'ble') return;

    try {
      const devices = await bleManager.current.connectedDevices([]);
      const pairedDevice = devices.find((d) => d.id === activeDeviceId);

      if (pairedDevice && !connectedDevice) {
        const bleDevice: BleDevice = {
          id: pairedDevice.id,
          name: pairedDevice.name,
          rssi: pairedDevice.rssi,
        };
        setConnectedDevice(bleDevice);
        setBluetoothConnected(true, bleDevice.name);

        bleManager.current.onDeviceDisconnected(pairedDevice.id, () => {
          setConnectedDevice(null);
          setBluetoothConnected(false, null);
        });
      } else if (!pairedDevice && connectedDevice?.id === activeDeviceId) {
        setConnectedDevice(null);
        setBluetoothConnected(false, null);
      }
    } catch {
      // 다음 체크에서 재시도
    }
  }, [activeDeviceId, autoStartEnabled, isBluetoothEnabled, connectedDevice, setBluetoothConnected]);

  const startMonitoring = useCallback(() => {
    if (monitorIntervalRef.current) return;
    setIsMonitoring(true);
    checkForPairedDevice();
    monitorIntervalRef.current = setInterval(checkForPairedDevice, checkInterval);
  }, [checkForPairedDevice, checkInterval]);

  const stopMonitoring = useCallback(() => {
    if (monitorIntervalRef.current) {
      clearInterval(monitorIntervalRef.current);
      monitorIntervalRef.current = null;
    }
    setIsMonitoring(false);
  }, []);

  // BLE 자동 모니터링
  useEffect(() => {
    if (autoMonitor && autoStartEnabled && activeDeviceId && isBleAvailable && isBluetoothEnabled) {
      // BLE 타입 디바이스인 경우만 BLE 모니터링
      const { pairedDevices } = useBluetoothSettingsStore.getState();
      const activePaired = pairedDevices.find((d) => d.id === activeDeviceId);
      if (activePaired?.type === 'ble') {
        startMonitoring();
      } else {
        setIsMonitoring(true); // Classic BT는 이벤트 기반이라 flag만 설정
      }
    } else if (!autoStartEnabled || !activeDeviceId) {
      stopMonitoring();
      setIsMonitoring(false);
    }

    return () => stopMonitoring();
  }, [autoMonitor, autoStartEnabled, activeDeviceId, isBleAvailable, isBluetoothEnabled, startMonitoring, stopMonitoring]);

  // 정리
  useEffect(() => {
    return () => {
      if (scanTimeoutRef.current) clearTimeout(scanTimeoutRef.current);
      if (monitorIntervalRef.current) clearInterval(monitorIntervalRef.current);
    };
  }, []);

  return {
    isBleAvailable,
    isBluetoothEnabled,
    isScanning,
    connectedDevice,
    nearbyDevices,
    isClassicBtAvailable: isClassicBtAvailableNative(),
    classicAudioDevice,
    error,
    isMonitoring,
    startScan,
    stopScan,
    connectToDevice,
    disconnectDevice,
    setAsCarDevice,
    setClassicAsCarDevice,
    startMonitoring,
    stopMonitoring,
  };
}
