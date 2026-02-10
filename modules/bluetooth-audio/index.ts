import { requireNativeModule, EventEmitter } from 'expo-modules-core';

export type BluetoothAudioDevice = {
  name: string;
  portType: string;
};

export type BluetoothAudioChangeEvent = {
  connected: boolean;
  deviceName: string;
  portType: string;
};

// 네이티브 모듈 안전하게 로드 (Android/Expo Go에서는 null)
let nativeModule: any = null;
let emitter: any = null;

try {
  nativeModule = requireNativeModule('BluetoothAudio');
  emitter = new EventEmitter(nativeModule);
} catch {
  // Module not available
}

/**
 * 현재 연결된 블루투스 오디오 디바이스 조회
 * (에어팟, 차량 오디오 등 Classic BT)
 */
export function getConnectedBluetoothAudio(): BluetoothAudioDevice | null {
  if (!nativeModule) return null;
  try {
    return nativeModule.getConnectedBluetoothAudio();
  } catch {
    return null;
  }
}

/**
 * 블루투스 오디오 연결 변경 이벤트 리스너
 */
export function addBluetoothAudioListener(
  listener: (event: BluetoothAudioChangeEvent) => void,
): { remove: () => void } {
  if (!emitter) return { remove: () => {} };
  return emitter.addListener('onBluetoothAudioChange', listener);
}

/**
 * Classic BT 오디오 감지 기능 사용 가능 여부
 */
export function isClassicBtAvailable(): boolean {
  return nativeModule != null;
}
