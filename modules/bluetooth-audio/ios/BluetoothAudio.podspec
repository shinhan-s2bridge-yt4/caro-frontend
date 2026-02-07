require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name           = 'BluetoothAudio'
  s.version        = package['version']
  s.summary        = 'Classic Bluetooth audio connection detection for CARO'
  s.description    = 'Detects Classic Bluetooth audio device connections via AVAudioSession'
  s.author         = 'CARO'
  s.homepage       = 'https://github.com/caro/bluetooth-audio'
  s.platforms      = { :ios => '15.1' }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.source_files = '**/*.{h,m,mm,swift,hpp,cpp}'
end
