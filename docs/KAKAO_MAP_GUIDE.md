# 카카오맵 연동 가이드

## 목차

1. [개요](#개요)
2. [사전 준비 – 카카오 개발자 콘솔 설정](#사전-준비--카카오-개발자-콘솔-설정)
3. [프로젝트 환경 변수 설정](#프로젝트-환경-변수-설정)
4. [아키텍처 – 플랫폼별 렌더링 방식](#아키텍처--플랫폼별-렌더링-방식)
5. [파일 구조](#파일-구조)
6. [웹 플랫폼 동작 원리](#웹-플랫폼-동작-원리)
7. [네이티브(iOS/Android) 플랫폼 동작 원리](#네이티브iosandroid-플랫폼-동작-원리)
8. [주소 → 좌표 변환 (Geocoding)](#주소--좌표-변환-geocoding)
9. [커스텀 마커 (SVG 핀)](#커스텀-마커-svg-핀)
10. [트러블슈팅](#트러블슈팅)
11. [배포 시 주의사항](#배포-시-주의사항)

---

## 개요

운행기록 상세 화면(`app/car-detail.tsx`)에서 **카카오맵 JavaScript SDK**를 사용하여 출발지/도착지를 지도에 핀으로 표시합니다.

- **출발지 핀**: 파란색 (`#4880ED`, primary[50])
- **도착지 핀**: 빨간색 (`#FF8585`, red[40])
- 주소(텍스트)를 카카오 Geocoder API로 좌표(위도/경도)로 변환한 뒤 마커를 찍습니다.
- 두 마커가 모두 보이도록 지도 범위(bounds)를 자동 조절합니다.

---

## 사전 준비 – 카카오 개발자 콘솔 설정

### 1단계: 앱 생성

1. [카카오 개발자 콘솔](https://developers.kakao.com/)에 로그인
2. **내 애플리케이션** → **애플리케이션 추가하기** 클릭
3. 앱 이름 입력 후 생성

### 2단계: JavaScript 키 확인

1. 생성된 앱 선택 → **앱 키** 페이지로 이동
2. **JavaScript 키**를 복사
   - ⚠️ **반드시 "JavaScript 키"를 사용해야 합니다** (REST API 키, 네이티브 앱 키 아님)
   - 키 형식 예시: `3ba49bb9610d71a763df5bac69c372d3` (32자리 hex)

### 3단계: JavaScript SDK 도메인 등록

1. 앱 선택 → **플랫폼** → **Web** 섹션
2. **JavaScript SDK 도메인** 에 다음을 추가:

```
http://localhost:8081
http://localhost:8082
```

> 💡 Expo 개발 서버가 사용하는 포트입니다. 포트가 다르면 해당 포트를 등록하세요.

### 4단계: 카카오맵 API 활성화 (중요!)

1. 앱 선택 → **제품 설정** → **카카오맵**
2. **활성화 설정**을 **ON**으로 변경

> ⚠️ 이 단계를 빠뜨리면 JavaScript 키가 올바르더라도 SDK 로드 시 **403 Forbidden** 에러가 발생합니다.

---

## 프로젝트 환경 변수 설정

`.env` 파일에 카카오 JavaScript 키를 추가합니다:

```env
EXPO_PUBLIC_KAKAO_MAP_KEY=여기에_JavaScript_키_붙여넣기
```

**예시:**

```env
EXPO_PUBLIC_KAKAO_MAP_KEY=3ba49bb9610d71a763df5bac69c372d3
```

코드에서는 다음과 같이 접근합니다:

```typescript
const kakaoKey = process.env.EXPO_PUBLIC_KAKAO_MAP_KEY || '';
```

> ⚠️ `.env` 파일 수정 후에는 **개발 서버를 재시작**해야 변경사항이 반영됩니다.

---

## 아키텍처 – 플랫폼별 렌더링 방식

카카오맵 JavaScript SDK는 브라우저 환경에서만 동작하므로, React Native에서는 **WebView**를 통해 렌더링합니다. 플랫폼에 따라 다른 방식을 사용합니다:

```
┌─────────────────────────────────────────────────────┐
│                   KakaoMapView                       │
│              (app/car-detail.tsx)                     │
├──────────────────────┬──────────────────────────────┤
│    Platform.OS       │    Platform.OS                │
│    === 'web'         │    === 'ios' / 'android'      │
├──────────────────────┼──────────────────────────────┤
│                      │                               │
│  <iframe>            │  <WebView>                    │
│  src="/kakao-map.html│  source={{ html, baseUrl }}   │
│  ?key=...&start=...  │                               │
│  &end=..."           │  인라인 HTML에 SDK 포함        │
│                      │  baseUrl로 origin 설정         │
│  public/ 폴더에서     │                               │
│  정적 파일 서빙       │                               │
│                      │                               │
│  Origin:             │  Origin(가상):                 │
│  http://localhost:8081│  http://localhost:8081        │
│  (실제 서버 주소)     │  (baseUrl로 설정)              │
│                      │                               │
└──────────────────────┴──────────────────────────────┘
```

### 왜 플랫폼별로 다른 방식을 사용하는가?

**웹 (`iframe` + 정적 HTML 파일)**
- 카카오 SDK는 요청의 `Referer` 헤더를 체크하여 등록된 도메인인지 검증합니다.
- `public/kakao-map.html` 파일은 Expo 개발 서버가 `http://localhost:8081/kakao-map.html`로 서빙합니다.
- iframe의 origin이 `http://localhost:8081`이 되어 카카오 SDK 도메인 검증을 통과합니다.
- ❌ 인라인 HTML(`srcDoc`)을 사용하면 origin이 `null`/`about:srcdoc`이 되어 SDK가 차단됩니다.

**네이티브 (`WebView` + 인라인 HTML + `baseUrl`)**
- 폰에서 `localhost:8081`은 접근 불가 (localhost = 폰 자체)
- 대신 `react-native-webview`의 `source={{ html, baseUrl }}` 옵션을 사용합니다.
- `baseUrl: 'http://localhost:8081'`을 설정하면 실제로 그 URL에 접속하는 것이 아니라, WebView가 **"이 페이지의 origin은 localhost:8081이다"**라고 인식합니다.
- iOS의 `WKWebView.loadHTMLString:baseURL:`과 Android의 `WebView.loadDataWithBaseURL()`이 이를 지원합니다.

---

## 파일 구조

```
caro-frontend/
├── .env                          ← EXPO_PUBLIC_KAKAO_MAP_KEY 설정
├── public/
│   └── kakao-map.html            ← 웹용 카카오맵 HTML (정적 파일)
└── app/
    ├── car.tsx                   ← 운행기록 목록 (카드 클릭 → car-detail로 이동)
    └── car-detail.tsx            ← 운행기록 상세 (카카오맵 포함)
```

### `app/car-detail.tsx` 내부 컴포넌트 구조

```
CarDetailScreen
  └── KakaoMapView              ← 플랫폼 분기 컴포넌트
        ├── (web)    → iframe src="/kakao-map.html?key=...&start=...&end=..."
        └── (native) → WebView source={{ html: buildNativeMapHtml(...), baseUrl }}
```

---

## 웹 플랫폼 동작 원리

### `public/kakao-map.html`

Expo 개발 서버의 `public/` 폴더에 위치한 정적 HTML 파일입니다. 브라우저에서 `http://localhost:8081/kakao-map.html`로 직접 접근 가능합니다.

**동작 흐름:**

```
1. iframe이 /kakao-map.html?key=API키&start=출발주소&end=도착주소 로드

2. HTML 내부 JavaScript가 URL 쿼리 파라미터 파싱
   → params.get('key'), params.get('start'), params.get('end')

3. <script> 태그를 동적 생성하여 카카오맵 SDK 로드
   → https://dapi.kakao.com/v2/maps/sdk.js?appkey=API키&libraries=services&autoload=false

4. SDK 로드 완료 (onload) → kakao.maps.load() 호출

5. 지도 생성 → new kakao.maps.Map(container, options)

6. Geocoder로 주소 → 좌표 변환 → 마커 배치

7. 두 마커 기준으로 지도 범위(bounds) 자동 조절
```

**코드 (car-detail.tsx – 웹 분기):**

```tsx
if (Platform.OS === 'web') {
  const mapUrl =
    `/kakao-map.html?key=${encodeURIComponent(kakaoKey)}` +
    `&start=${encodeURIComponent(startAddress)}` +
    `&end=${encodeURIComponent(endAddress)}`;

  return (
    <View style={{ width: '100%', height: 300, borderRadius: 20, overflow: 'hidden' }}>
      <iframe
        src={mapUrl}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="geolocation"
      />
    </View>
  );
}
```

---

## 네이티브(iOS/Android) 플랫폼 동작 원리

### `buildNativeMapHtml()` 함수

카카오맵 SDK를 포함한 완전한 HTML 문자열을 생성합니다. 출발지/도착지 주소는 **템플릿 리터럴**로 HTML에 직접 삽입됩니다.

**동작 흐름:**

```
1. buildNativeMapHtml(kakaoKey, startAddr, endAddr) 호출
   → 인라인 HTML 문자열 반환

2. WebView에 전달:
   source={{ html: 생성된HTML, baseUrl: 'http://localhost:8081' }}

3. WebView가 HTML을 렌더링할 때:
   - baseUrl 덕분에 origin이 http://localhost:8081로 설정됨
   - <script> 태그가 카카오 SDK를 외부에서 로드
   - 카카오 서버가 Referer 확인 → localhost:8081 → 등록된 도메인 → 허용

4. 이후 흐름은 웹과 동일 (Geocoding → 마커 배치 → bounds 조절)
```

**코드 (car-detail.tsx – 네이티브 분기):**

```tsx
const WebView = require('react-native-webview').default;
const html = buildNativeMapHtml(kakaoKey, escapedStart, escapedEnd);

return (
  <WebView
    source={{ html, baseUrl: 'http://localhost:8081' }}
    scrollEnabled={false}
    javaScriptEnabled
    originWhitelist={['*']}
    allowUniversalAccessFromFileURLs    // Android: 파일 URL에서 외부 리소스 접근 허용
    mixedContentMode="always"           // Android: HTTP/HTTPS 혼합 콘텐츠 허용
    domStorageEnabled                   // DOM Storage 활성화
  />
);
```

**주요 WebView 옵션 설명:**

| 옵션 | 설명 |
|------|------|
| `baseUrl` | WebView의 가상 origin 설정. 카카오 SDK 도메인 검증 통과용 |
| `allowUniversalAccessFromFileURLs` | Android에서 로컬 HTML이 외부 스크립트를 로드할 수 있게 허용 |
| `mixedContentMode="always"` | Android에서 HTTP/HTTPS 혼합 콘텐츠 허용 |
| `originWhitelist={['*']}` | 모든 origin 허용 |
| `domStorageEnabled` | localStorage/sessionStorage 사용 허용 |

---

## 주소 → 좌표 변환 (Geocoding)

카카오맵 SDK의 `services` 라이브러리에 포함된 **Geocoder**를 사용합니다.

```javascript
var geocoder = new kakao.maps.services.Geocoder();

geocoder.addressSearch('경상북도 경주시 광중길 73-6', function(result, status) {
  if (status === kakao.maps.services.Status.OK) {
    var lat = result[0].y;  // 위도
    var lng = result[0].x;  // 경도
    var coords = new kakao.maps.LatLng(lat, lng);
    // → 이 좌표로 마커 생성
  }
});
```

- SDK URL에 `&libraries=services`를 추가해야 Geocoder를 사용할 수 있습니다.
- 한국 주소만 지원합니다 (도로명주소, 지번주소 모두 가능).
- 검색 결과가 없으면 `status`가 `ZERO_RESULT`를 반환합니다.

---

## 커스텀 마커 (SVG 핀)

기본 카카오맵 마커 대신 **커스텀 SVG 핀**을 사용합니다.

```javascript
function makeSvgMarker(color) {
  var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="44" viewBox="0 0 32 44">'
    + '<path d="M16 0C7.163 0 0 7.163 0 16c0 12 16 28 16 28s16-16 16-28C32 7.163 24.837 0 16 0z" fill="' + color + '"/>'
    + '<circle cx="16" cy="16" r="7" fill="white"/>'
    + '</svg>';

  return new kakao.maps.MarkerImage(
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg),
    new kakao.maps.Size(32, 44),           // 마커 이미지 크기
    { offset: new kakao.maps.Point(16, 44) }  // 핀 꼭짓점이 좌표에 위치하도록 오프셋
  );
}
```

- SVG를 `data:image/svg+xml` URI로 변환하여 `MarkerImage`에 전달합니다.
- `offset`의 `(16, 44)`는 핀의 뾰족한 아래쪽 끝이 정확한 좌표 위치에 오도록 합니다.

**현재 색상 설정:**
- 출발지: `#4880ED` (primary[50], 파란색)
- 도착지: `#FF8585` (red[40], 빨간색)

색상을 변경하려면 `buildNativeMapHtml()` 함수와 `public/kakao-map.html` 파일 두 곳의 `placePin()` / `pm()` 호출부에서 색상 코드를 수정하면 됩니다.

---

## 트러블슈팅

### SDK 로드 실패 (403 Forbidden)

**증상:** 지도가 안 뜨고 "카카오맵 SDK 로드 실패" 표시

**원인 & 해결:**

| 확인 사항 | 해결 방법 |
|-----------|-----------|
| JavaScript 키가 맞는지 | 카카오 개발자 콘솔 → 앱 키 → **JavaScript 키** 확인 (REST API 키 아님) |
| 도메인 등록이 되었는지 | 플랫폼 → Web → **JavaScript SDK 도메인**에 `http://localhost:8081` 등록 |
| 카카오맵 API 활성화 | 제품 설정 → 카카오맵 → **활성화** ON |
| .env 반영 안 됨 | `.env` 수정 후 **개발 서버 재시작** (`Ctrl+C` 후 `npx expo start` 다시) |

### 웹에서 origin이 null / about:srcdoc

**증상:** 브라우저 콘솔에 `Origin: null` 표시

**원인:** `iframe`의 `srcDoc` 속성이나 인라인 HTML을 사용하면 origin이 null이 됩니다.

**해결:** `public/kakao-map.html` 파일을 만들고 `iframe`의 `src` 속성으로 로드하면 origin이 `http://localhost:8081`이 됩니다.

### 네이티브에서 "서버에 연결할 수 없습니다" (NSURLErrorDomain -1004)

**증상:** 폰에서 지도 영역에 연결 에러 표시

**원인:** WebView가 `http://localhost:8081/...` URL로 접근하려 하지만, 폰에서 localhost는 폰 자체를 가리킴

**해결:** `source={{ uri }}` 대신 `source={{ html, baseUrl }}` 방식 사용. 인라인 HTML은 네트워크 요청 없이 렌더링되고, baseUrl은 origin 설정 용도로만 사용됩니다.

### 주소 검색(Geocoding) 실패

**증상:** 지도는 뜨지만 핀이 안 찍힘

**원인 & 해결:**

| 원인 | 해결 |
|------|------|
| SDK URL에 `libraries=services` 누락 | SDK 로드 URL에 `&libraries=services` 포함 확인 |
| 주소 형식 문제 | "서울특별시 중구 충무로 2가" 같은 정확한 한국 주소 필요 |
| 특수문자 이스케이프 | 주소에 `'` (따옴표)가 있으면 `\\'`로 이스케이프 처리 |

---

## 배포 시 주의사항

### 1. 도메인 등록 변경

개발 환경에서는 `http://localhost:8081`을 등록하지만, **배포 후에는 실제 도메인을 등록**해야 합니다.

카카오 개발자 콘솔 → 플랫폼 → Web → JavaScript SDK 도메인:

```
https://your-domain.com
```

### 2. 네이티브 앱의 baseUrl 변경

배포용 앱에서는 `baseUrl`을 실제 서비스 도메인으로 변경해야 합니다:

```tsx
// 개발
source={{ html, baseUrl: 'http://localhost:8081' }}

// 배포
source={{ html, baseUrl: 'https://your-domain.com' }}
```

> 💡 `Constants.expoConfig?.extra?.baseUrl` 같은 설정을 활용하여 환경별로 자동 분기할 수 있습니다.

### 3. public/ 폴더

`public/kakao-map.html`은 Expo의 정적 파일 서빙 기능을 사용합니다.
- **개발**: Metro 개발 서버가 자동으로 서빙
- **웹 빌드**: `npx expo export:web` 시 `dist/` 폴더에 포함됨
- **네이티브 빌드**: 네이티브에서는 인라인 HTML을 사용하므로 이 파일은 웹 전용

---

## 데이터 흐름 요약

```
[운행기록 목록 (car.tsx)]
    │
    │  카드 클릭
    │  router.push({ pathname: '/car-detail', params: { ... } })
    │
    ▼
[운행기록 상세 (car-detail.tsx)]
    │
    │  useLocalSearchParams()로 데이터 수신
    │  startLocation, endLocation (주소 문자열)
    │
    ▼
[KakaoMapView 컴포넌트]
    │
    ├── Platform.OS === 'web'
    │   └── <iframe src="/kakao-map.html?key=...&start=주소&end=주소">
    │         └── kakao-map.html 내부:
    │             1. SDK 로드
    │             2. geocoder.addressSearch(주소) → 좌표
    │             3. new kakao.maps.Marker({ position: 좌표 })
    │             4. map.setBounds(bounds)
    │
    └── Platform.OS === 'ios' / 'android'
        └── <WebView source={{ html: buildNativeMapHtml(...), baseUrl }}>
              └── 인라인 HTML 내부:
                  (위와 동일한 흐름)
```
