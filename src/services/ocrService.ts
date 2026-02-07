export interface OcrResult {
  date: string | null; // YYYY-MM-DD 형식
  location: string | null;
  amount: number | null;
  rawText: string;
}

interface ClovaOcrField {
  inferText: string;
  inferConfidence: number;
}

interface ClovaOcrImage {
  inferResult: string;
  message: string;
  fields?: ClovaOcrField[];
}

interface ClovaOcrResponse {
  version: string;
  requestId: string;
  timestamp: number;
  images: ClovaOcrImage[];
}

function getOcrConfig() {
  const invokeUrl = process.env.EXPO_PUBLIC_CLOVA_OCR_INVOKE_URL ?? '';
  const secret = process.env.EXPO_PUBLIC_CLOVA_OCR_SECRET ?? '';
  return { invokeUrl, secret };
}

/**
 * 이미지 파일을 base64로 인코딩 (fetch + FileReader 사용)
 */
async function imageToBase64(imageUri: string): Promise<string> {
  try {
    // fetch로 이미지 blob 가져오기
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    // blob을 base64로 변환
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        // data:image/jpeg;base64, 부분 제거하고 순수 base64만 반환
        const base64 = result.split(',')[1];
        if (base64) {
          resolve(base64);
        } else {
          reject(new Error('Base64 변환 실패'));
        }
      };
      reader.onerror = () => reject(new Error('파일 읽기 실패'));
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('[OCR] base64 변환 오류:', error);
    throw new Error('이미지 변환에 실패했습니다.');
  }
}

/**
 * 이미지 URI에서 포맷 추출
 */
function getImageFormat(imageUri: string): string {
  // URI에서 확장자 추출 (쿼리 파라미터 제거)
  const uriWithoutQuery = imageUri.split('?')[0];
  const extension = uriWithoutQuery.split('.').pop()?.toLowerCase() ?? '';
  
  if (extension === 'jpeg' || extension === 'jpg') return 'jpg';
  if (extension === 'png') return 'png';
  if (extension === 'pdf') return 'pdf';
  if (extension === 'tiff') return 'tiff';
  
  // 확장자가 없으면 jpg로 기본 설정 (대부분의 카메라 이미지)
  return 'jpg';
}

/**
 * 클로바 OCR API 호출
 */
export async function performOcr(imageUri: string): Promise<OcrResult> {
  const { invokeUrl, secret } = getOcrConfig();

  if (!invokeUrl || !secret) {
    throw new Error('OCR 설정이 올바르지 않습니다.');
  }

  const base64Image = await imageToBase64(imageUri);
  const format = getImageFormat(imageUri);

  const requestBody = {
    images: [
      {
        format,
        name: 'receipt',
        data: base64Image,
      },
    ],
    requestId: `receipt-${Date.now()}`,
    version: 'V2',
    timestamp: Date.now(),
  };

  console.log('[OCR] 요청 시작:', {
    imageUri,
    format,
    base64Length: base64Image.length,
    invokeUrl: invokeUrl.substring(0, 50) + '...',
  });

  const response = await fetch(invokeUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-OCR-SECRET': secret,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[OCR] 에러 응답:', {
      status: response.status,
      statusText: response.statusText,
      body: errorText,
    });
    throw new Error(`OCR 요청 실패: ${response.status} - ${errorText}`);
  }

  const data: ClovaOcrResponse = await response.json();
  console.log('[OCR] 응답 성공:', {
    imageCount: data.images?.length,
    inferResult: data.images?.[0]?.inferResult,
  });

  // OCR 결과에서 텍스트 추출
  const rawText = extractRawText(data);

  // 날짜, 장소, 금액 파싱
  const date = parseDate(rawText);
  const amount = parseAmount(rawText);
  const location = parseLocation(rawText);

  return {
    date,
    location,
    amount,
    rawText,
  };
}

/**
 * OCR 응답에서 전체 텍스트 추출
 */
function extractRawText(response: ClovaOcrResponse): string {
  if (!response.images || response.images.length === 0) {
    return '';
  }

  const image = response.images[0];
  if (!image.fields || image.fields.length === 0) {
    return '';
  }

  return image.fields.map((field) => field.inferText).join(' ');
}

/**
 * 날짜 파싱 (여러 형식 지원)
 * - 2024.01.15, 2024-01-15, 2024/01/15
 * - 24.01.15, 24-01-15, 24/01/15
 * - 2024년 1월 15일
 */
function parseDate(text: string): string | null {
  // YYYY.MM.DD, YYYY-MM-DD, YYYY/MM/DD 형식
  const fullDateRegex = /(\d{4})[.\-/](\d{1,2})[.\-/](\d{1,2})/;
  const fullMatch = text.match(fullDateRegex);
  if (fullMatch) {
    const [, year, month, day] = fullMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // YY.MM.DD, YY-MM-DD, YY/MM/DD 형식
  const shortDateRegex = /(\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/;
  const shortMatch = text.match(shortDateRegex);
  if (shortMatch) {
    const [, yy, month, day] = shortMatch;
    const year = parseInt(yy, 10) >= 50 ? `19${yy}` : `20${yy}`;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  // 한글 형식: 2024년 1월 15일
  const koreanDateRegex = /(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/;
  const koreanMatch = text.match(koreanDateRegex);
  if (koreanMatch) {
    const [, year, month, day] = koreanMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return null;
}

/**
 * 금액 파싱
 * - 숫자,숫자원 형식 (예: 50,000원, 50000원)
 * - 합계, 총액, 결제금액 등의 키워드 근처 금액 우선
 */
function parseAmount(text: string): number | null {
  // 합계/총액/결제금액 근처의 금액 우선 탐색
  const totalKeywords = ['합계', '총액', '결제금액', '결제', '총', '계', '금액', '승인금액', '판매금액'];
  
  for (const keyword of totalKeywords) {
    // 키워드 뒤에 오는 금액
    const afterKeywordRegex = new RegExp(`${keyword}[\\s:]*([\\d,]+)\\s*원?`, 'i');
    const afterMatch = text.match(afterKeywordRegex);
    if (afterMatch) {
      const amountStr = afterMatch[1].replace(/,/g, '');
      const amount = parseInt(amountStr, 10);
      if (!Number.isNaN(amount) && amount > 0) {
        return amount;
      }
    }
  }

  // 키워드가 없으면 가장 큰 금액 찾기 (영수증 총액일 가능성 높음)
  const amountRegex = /([\d,]+)\s*원/g;
  let match;
  let maxAmount = 0;

  while ((match = amountRegex.exec(text)) !== null) {
    const amountStr = match[1].replace(/,/g, '');
    const amount = parseInt(amountStr, 10);
    if (!Number.isNaN(amount) && amount > maxAmount) {
      maxAmount = amount;
    }
  }

  return maxAmount > 0 ? maxAmount : null;
}

/**
 * 장소/상호명 파싱
 * - 주유소, 주차장, 정비소 등 관련 키워드
 * - 상호명 패턴 인식
 */
function parseLocation(text: string): string | null {
  // 주유소 관련 키워드
  const gasStationKeywords = [
    /([가-힣]+주유소)/,
    /([가-힣]+셀프)/,
    /(GS칼텍스[가-힣]*)/,
    /(SK에너지[가-힣]*)/,
    /(S-OIL[가-힣]*)/i,
    /(에쓰오일[가-힣]*)/,
    /(현대오일뱅크[가-힣]*)/,
    /(알뜰주유소[가-힣]*)/,
  ];

  // 주차장 관련 키워드
  const parkingKeywords = [
    /([가-힣]+주차장)/,
    /([가-힣]+파킹)/,
    /(파킹[가-힣]*)/,
  ];

  // 정비소 관련 키워드
  const maintenanceKeywords = [
    /([가-힣]+정비)/,
    /([가-힣]+카센터)/,
    /([가-힣]+오토)/,
    /([가-힣]+자동차)/,
    /(스피드메이트[가-힣]*)/,
  ];

  // 통행료 관련
  const tollKeywords = [
    /(한국도로공사)/,
    /([가-힣]+톨게이트)/,
    /([가-힣]+IC)/,
  ];

  const allPatterns = [
    ...gasStationKeywords,
    ...parkingKeywords,
    ...maintenanceKeywords,
    ...tollKeywords,
  ];

  for (const pattern of allPatterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].trim();
    }
  }

  // 일반 상호명 패턴: (주), (유) 등이 포함된 이름
  const businessNameRegex = /\(주\)\s*([가-힣a-zA-Z0-9]+)|([가-힣]{2,10})\s*\(주\)/;
  const businessMatch = text.match(businessNameRegex);
  if (businessMatch) {
    return (businessMatch[1] || businessMatch[2])?.trim() ?? null;
  }

  return null;
}
