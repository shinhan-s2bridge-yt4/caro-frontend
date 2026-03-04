# 🚗 CARO(카로)
> 타는 순간 쌓이고, 쓰는 순간 관리되는  
> 데이터 기반 운행 리워드 서비스

🏢 카택스 기업 연계 프로젝트   
🏆 신한 스퀘어브릿지 해커톤 혁신상 수상

**참여인원**: 3명 (FE 1, BE 1, Design 1)  
**프로젝트 기간**: 2026. 01. 05 - 2025. 02. 12 (6주)

## Project Highlights

- GPS + OCR 기반 자동 운행/지출 관리
- 블루투스 기반 운행 자동 감지 시스템 구현
- 백그라운드 GPS 안정 수집 설계
- 주행 거리(km)에 비례한 포인트 적립 시스템
- 리워드 기반 사용자 유지 전략 설계
- 기업 핵심 기술을 B2C 시장으로 확장한 서비스 모델 제안

## 프로젝트 소개
CARO는 GPS와 OCR 기술을 활용하여  
운행 데이터와 차량 지출을 자동으로 기록하고,  
이를 리워드로 연결하는 **B2C 운행 데이터 자산화 서비스**입니다.

기존 법인 차량 운행일지 자동화 서비스인  
**카택스의 핵심 기술(GPS, OCR)을 재해석하여  
일반 소비자 시장으로 확장**하는 것을 목표로 기획되었습니다.

## 프로젝트 목적
### 문제 정의
- 개인 사용자는 운행일지를 작성해야 할 의무가 없음
- 차량 데이터는 흩어져 있고 관리가 번거로움
- 수기 입력 기반 서비스는 사용 유지율이 낮음
- 즉각적인 보상이 없어 동기부여 부족

### 문제 재정의

> “왜 운행일지를 써야 하지?”  
> → “운행 데이터가 자동으로 쌓이고, 보상까지 된다면?”

### 해결 전략

- 자동 데이터 수집 (GPS + BLE)
- OCR 기반 입력 최소화
- 리워드 기반 사용자 동기 설계

## 경쟁 서비스 분석 및 차별점

### 마*클 (국내 차량 관리 1위 앱)
- 누적 차량 770만 대
- 월 평균 사용자 80만 명
- 차계부 기능 전 과정 수기 입력 기반

### 한계점
- 능동 입력이 많을수록 유지율 감소
- 반복적 입력 과정에서 사용자 이탈 발생

### 차별점

| 기존 차계부 | CARO |
|-------------|--------|
| 수기 입력 중심 | 자동 데이터 수집 |
| 기록 중심 | 기록 + 보상 |
| 관리 기능 | 데이터 자산화 구조 |
| 사용자 노력 기반 | 시스템 자동 수집 기반 |

CARO는 단순 기록 앱이 아닌  
**데이터를 수익 구조로 확장 가능한 플랫폼 모델**입니다.

## 기술 스택

### Frontend
![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)
![Expo Router](https://img.shields.io/badge/Expo_Router-000020?style=for-the-badge&logo=expo&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NativeWind](https://img.shields.io/badge/NativeWind-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white)

### State & Data
![Zustand](https://img.shields.io/badge/Zustand-000000?style=for-the-badge)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge)

### Device & Native Features
![BLE](https://img.shields.io/badge/Bluetooth_LE-0082FC?style=for-the-badge)
![Expo Location](https://img.shields.io/badge/Expo_Location-000020?style=for-the-badge&logo=expo&logoColor=white)
![OCR](https://img.shields.io/badge/OCR-FF6F00?style=for-the-badge)
![App Groups](https://img.shields.io/badge/iOS_App_Groups-000000?style=for-the-badge&logo=apple&logoColor=white)

### UI / DX
![Storybook](https://img.shields.io/badge/Storybook-FF4785?style=for-the-badge&logo=storybook&logoColor=white)

### Infra
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

## 핵심 기능

- 운행 시작/종료 및 주행 기록 관리 (거리, 시간, 경로 데이터 기반)
- 출석 및 포인트 적립/조회, 미정산 포인트 확인
- 블루투스 연동 기반 운행 보조 설정
- 캘린더/카테고리 기반 차량 지출 등록 및 조회
- 영수증 OCR 연동 지출 입력 보조
- 리워드 스토어 상품 조회, 포인트 교환, 보유 쿠폰/사용 처리
- 차량 정보 등록/선택 및 사용자 인증 플로우

## 핵심 기능 상세 구현

### 1️⃣ 블루투스 자동 운행 감지
- 차량 블루투스 연결 시 자동 주행 시작
- 연결 해제 시 자동 저장
- BLE + Classic Bluetooth 모두 지원
- 차종 및 연식과 관계없이 대부분 차량에서 자동 감지 가능

### 2️⃣ GPS 백그라운드 트래킹 + 크래시 복구
- 포그라운드/백그라운드 상태와 무관하게 GPS 수집
- 앱 비정상 종료 대비
  - 좌표 20개마다 또는 60초마다 로컬 자동 저장
- 데이터 유실 최소화 및 안정성 확보

### 3️⃣ iOS 위젯 연동 (App Groups)
- 서로 다른 프로세스(App ↔ Widget) 간 데이터 공유
- iOS App Groups 기반 공유 저장소 활용
- 운행 거리 및 포인트 실시간 동기화

### 4️⃣ OCR 기반 영수증 인식
- 영수증 촬영 한 번으로
  - 날짜
  - 금액
  - 장소
  - 카테고리 자동 추출
- 수기 입력 최소화

### 5️⃣ 리워드 시스템
- 운행 거리(km)에 비례한 포인트 적립
- 출석 체크 보상 제공
- 적립 포인트로 모바일 교환권 구매 가능
- 운행 데이터가 곧 보상이 되는 구조 설계  

<div align="center"> 
  <table border="1" cellspacing="0" cellpadding="5" 
         style="border-collapse: collapse; width: 100%; text-align: center; vertical-align: middle;">
    <thead> 
      <tr> 
        <th style="text-align:center;">블루투스 연결 및 자동 운행</th> 
        <th style="text-align:center;">운행 기록 저장 및 상세</th> 
      </tr>
    </thead>
    <tbody>
      <tr> 
        <td style="text-align:center;"><img width="100%" src="./readme/gif/블루투스 연결 및 자동운행.gif"/></td> 
        <td style="text-align:center;"><img width="100%" src="./readme/gif/운행기록 저장 및 상세.gif"/></td> 
      </tr>
      <tr> 
        <th style="text-align:center;">IOS 위젯 설정</th> 
        <th style="text-align:center;">ocr 및 지출입력</th>
      </tr>
      <tr> 
      <td style="text-align:center;"><img width="100%" src="./readme/gif/위젯.gif"/></td> 
      <td style="text-align:center;"><img width="100%" src="./readme/gif/ocr 및 지출입력.gif"/></td> 
      </tr>
      <tr> 
        <th style="text-align:center;">출석체크 및 포인트 수령</th> 
        <th style="text-align:center;">스토어 쿠폰 교환</th> 
      </tr>
      <tr> 
      <td style="text-align:center;"><img width="100%" src="./readme/gif/출석체크 및 포인트 수령.gif"/></td> 
        <td style="text-align:center;"><img width="100%" src="./readme/gif/스토어 쿠폰 교환.gif"/></td> 
      </tr>
    </tbody>
  </table>
</div>

## 프로젝트 구조

```text
caro-frontend/
├─ app/                    # Expo Router 기반 화면/라우트
│  ├─ (auth)/              # 로그인/회원가입/차량 등록 온보딩
│  ├─ (car)/               # 차량 관련 화면
│  ├─ home.tsx             # 홈(주행/포인트/출석)
│  ├─ coin.tsx             # 지출 관리(캘린더/지출 내역)
│  ├─ store.tsx            # 리워드/포인트/쿠폰
│  └─ user.tsx             # 사용자 화면
├─ src/
│  ├─ components/          # 도메인별 UI 컴포넌트(home, coin, store, user 등)
│  ├─ hooks/               # 화면/기능 단위 커스텀 훅
│  ├─ services/            # API 통신 레이어(auth, reward, expense 등)
│  ├─ stores/              # 전역 상태(Zustand)
│  ├─ constants/           # 상수 정의
│  ├─ theme/               # 디자인 토큰/타이포그래피
│  ├─ types/               # 타입 정의
│  └─ utils/               # 날짜/네비게이션/공통 유틸
├─ modules/                # 로컬 네이티브 모듈
├─ storybook/              # 스토리북 설정
└─ assets/                 # 이미지/아이콘 등 정적 리소스
```

## 실행 방법

### 1) 요구 사항

- Node.js 18 이상 권장
- npm 사용 기준 (프로젝트에 `package-lock.json` 포함)

### 2) 의존성 설치

```bash
npm install
```

### 3) 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 아래 값을 설정합니다.

```env
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_KAKAO_MAP_KEY=
EXPO_PUBLIC_CLOVA_OCR_INVOKE_URL=
EXPO_PUBLIC_CLOVA_OCR_SECRET=
EXPO_PUBLIC_STORYBOOK_ENABLED=false
```

### 4) 개발 서버 실행

```bash
npm run start
```

플랫폼별 실행:

```bash
npm run ios
npm run android
npm run web
```

스토리북 실행:

```bash
npm run storybook
```