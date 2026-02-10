import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type PairedCarDevice = {
  id: string;        // BLE device ID 또는 'classic-{name}'
  name: string;      // 디바이스 이름 (예: "My Car BT", "AirPods Pro")
  type: 'ble' | 'classic';  // BLE 또는 Classic Bluetooth
  pairedAt: number;  // 페어링 시각 (timestamp)
};

type BluetoothSettingsState = {
  /** 자동 운행 시작 기능 활성화 여부 */
  autoStartEnabled: boolean;
  /** 페어링된 차량 블루투스 디바이스 목록 */
  pairedDevices: PairedCarDevice[];
  /** 활성 페어링 디바이스 ID (이 디바이스 연결 시 자동 시작) */
  activeDeviceId: string | null;

  // 액션
  setAutoStartEnabled: (enabled: boolean) => void;
  addPairedDevice: (device: Omit<PairedCarDevice, 'pairedAt'>) => void;
  removePairedDevice: (deviceId: string) => void;
  setActiveDevice: (deviceId: string | null) => void;
  clearAll: () => void;
};

export const useBluetoothSettingsStore = create<BluetoothSettingsState>()(
  persist(
    (set, get) => ({
      autoStartEnabled: true,
      pairedDevices: [],
      activeDeviceId: null,

      setAutoStartEnabled: (enabled) => {
        set({ autoStartEnabled: enabled });
      },

      addPairedDevice: (device) => {
        const existing = get().pairedDevices.find((d) => d.id === device.id);
        if (existing) return;

        const newDevice: PairedCarDevice = {
          ...device,
          pairedAt: Date.now(),
        };

        set((state) => ({
          pairedDevices: [...state.pairedDevices, newDevice],
          // 첫 번째 디바이스면 자동으로 활성 디바이스로 설정
          activeDeviceId: state.activeDeviceId ?? newDevice.id,
        }));
      },

      removePairedDevice: (deviceId) => {
        set((state) => ({
          pairedDevices: state.pairedDevices.filter((d) => d.id !== deviceId),
          activeDeviceId:
            state.activeDeviceId === deviceId ? null : state.activeDeviceId,
        }));
      },

      setActiveDevice: (deviceId) => {
        set({ activeDeviceId: deviceId });
      },

      clearAll: () => {
        set({
          autoStartEnabled: true,
          pairedDevices: [],
          activeDeviceId: null,
        });
      },
    }),
    {
      name: 'caro-bluetooth-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
