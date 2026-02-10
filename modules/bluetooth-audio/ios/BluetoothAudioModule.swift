import ExpoModulesCore
import AVFoundation

public class BluetoothAudioModule: Module {
  private var routeChangeObserver: NSObjectProtocol?

  public func definition() -> ModuleDefinition {
    Name("BluetoothAudio")

    Events("onBluetoothAudioChange")

    Function("getConnectedBluetoothAudio") { () -> [String: String]? in
      return self.getCurrentBluetoothAudioDevice()
    }

    OnStartObserving {
      self.startListening()
    }

    OnStopObserving {
      self.stopListening()
    }
  }

  private func startListening() {
    routeChangeObserver = NotificationCenter.default.addObserver(
      forName: AVAudioSession.routeChangeNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.emitCurrentState()
    }

    // 현재 상태 즉시 전송
    emitCurrentState()
  }

  private func stopListening() {
    if let observer = routeChangeObserver {
      NotificationCenter.default.removeObserver(observer)
      routeChangeObserver = nil
    }
  }

  private func emitCurrentState() {
    let device = getCurrentBluetoothAudioDevice()
    sendEvent("onBluetoothAudioChange", [
      "connected": device != nil,
      "deviceName": device?["name"] ?? "",
      "portType": device?["portType"] ?? ""
    ])
  }

  /// 현재 블루투스 오디오 출력 디바이스 조회
  /// 에어팟, 차량 오디오(A2DP/HFP) 등 Classic BT 디바이스 감지
  private func getCurrentBluetoothAudioDevice() -> [String: String]? {
    let route = AVAudioSession.sharedInstance().currentRoute
    for output in route.outputs {
      switch output.portType {
      case .bluetoothA2DP, .bluetoothHFP, .bluetoothLE:
        return [
          "name": output.portName,
          "portType": output.portType.rawValue
        ]
      default:
        continue
      }
    }
    return nil
  }
}
