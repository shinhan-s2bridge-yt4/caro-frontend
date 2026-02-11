import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import { Toast } from '@/components/common/Toast/Toast';
import CouponTab from '@/components/common/Category/CouponTab';
import { MainButton } from '@/components/common/Button/MainButton';
import CategoryTab from '@/components/common/Category/CategoryTab';
import type { CategoryKey } from '@/constants/categories';
import TextInput from '@/components/common/Input/TextInput';
import NumberInput from '@/components/common/Input/NumberInput';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useProfileStore } from '@/stores/profileStore';
import { useMyCarStore } from '@/stores/myCarStore';
import type { Expense, ExpenseCategory } from '@/types/expense';
import type { PrimaryCar } from '@/types/profile';

import { performOcr } from '@/services/ocrService';

import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';
import DownIcon from '@/assets/icons/DownIcon.svg';
import UpIcon from '@/assets/icons/UpIcon.svg';
import GraphIcon from '@/assets/icons/graphIcon.svg';
import UpGraphIcon from '@/assets/icons/upgraph.svg';
import RGraphIcon from '@/assets/icons/rgraph.svg';
import GGraphIcon from '@/assets/icons/ggraph.svg';
import LeftIcon from '@/assets/icons/LeftIcon.svg';
import RightIcon from '@/assets/icons/RightIcon.svg';
import GRightIcon from '@/assets/icons/GRightIcon.svg';
import XIcon from '@/assets/icons/x_icon.svg';
import CameraIcon from '@/assets/icons/camera.svg';
import BCarIcon from '@/assets/icons/bcar.svg';
import GCarIcon from '@/assets/icons/gcar.svg';
import WCheckIcon from '@/assets/icons/wcheck.svg';
import WCarIcon from '@/assets/icons/wcar.svg';
import PencilIcon from '@/assets/icons/pencil.svg';
import BPlusIcon from '@/assets/icons/bplus.svg';
import OilingIcon from '@/assets/icons/oiling.svg';
import ParkingIcon from '@/assets/icons/parking.svg';
import InsuranceIcon from '@/assets/icons/insurance.svg';
import TollIcon from '@/assets/icons/toll.svg';
import MaintenanceIcon from '@/assets/icons/maintenance.svg';
import CarwashIcon from '@/assets/icons/carwash.svg';
import ExpendablesIcon from '@/assets/icons/expendables.svg';


const SCREEN_MAX_WIDTH = 375;
const CALENDAR_HORIZONTAL_PADDING = 20; // 캘린더 컨테이너 좌우 패딩
const DATE_WHEEL_ITEM_HEIGHT = 44;
const DATE_WHEEL_HEIGHT = 220;
const DATE_WHEEL_PADDING = (DATE_WHEEL_HEIGHT - DATE_WHEEL_ITEM_HEIGHT) / 2;
const DATE_PICKER_YEARS: number[] = [2024, 2025, 2026, 2027, 2028];

type ExpenseLevel = 0 | 1 | 2 | 3;

type CalendarCell = {
  key: string;
  day?: number;
  amountLabel?: string;
  level?: ExpenseLevel;
  amountColor?: string;
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

type ExpenseItem = {
  id: string;
  category: Exclude<CategoryKey, 'ALL'>;
  title: string;
  note?: string;
  date: string; // YYYY-MM-DD
  amount: number; // won
  carInfo?: string; // e.g. "렉서스 ES300h"
};

const KST_WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

function getKstTodayParts() {
  const now = new Date();
  const kstMs = now.getTime() + now.getTimezoneOffset() * 60_000 + KST_OFFSET_MS;
  const d = new Date(kstMs);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1, // 1-12
    day: d.getUTCDate(),
  };
}

function formatKoreanDateLabel(year: number, month: number, day: number) {
  const dow = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const weekday = KST_WEEKDAYS[dow] ?? '일';
  return `${year}년 ${month}월 ${day}일 (${weekday})`;
}

// API category를 UI CategoryKey로 변환
function mapApiCategoryToUi(category: ExpenseCategory): Exclude<CategoryKey, 'ALL'> {
  const map: Record<ExpenseCategory, Exclude<CategoryKey, 'ALL'>> = {
    FUEL: 'FUEL',
    MAINTENANCE: 'REPAIR',
    PARKING: 'PARKING',
    TOLL: 'TOLL',
    CAR_WASH: 'CAR_WASH',
    INSURANCE: 'INSURANCE',
    ACCESSORY: 'ACCESSORY',
  };
  return map[category];
}

// UI CategoryKey를 API category로 변환
function mapUiCategoryToApi(category: CategoryKey): ExpenseCategory | undefined {
  if (category === 'ALL') return undefined;
  const map: Record<Exclude<CategoryKey, 'ALL'>, ExpenseCategory> = {
    FUEL: 'FUEL',
    REPAIR: 'MAINTENANCE',
    PARKING: 'PARKING',
    TOLL: 'TOLL',
    CAR_WASH: 'CAR_WASH',
    INSURANCE: 'INSURANCE',
    ACCESSORY: 'ACCESSORY',
  };
  return map[category];
}

// "2026년 2월 6일 (금)" → "2026-02-06" 변환
function parseKoreanDateToIso(koreanDate: string): string {
  const match = koreanDate.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (!match) return '';
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

export default function CoinScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const calendarCellSize = Math.floor((screenWidth - CALENDAR_HORIZONTAL_PADDING * 2) / 7);
  const accessToken = useAuthStore((s) => s.accessToken);
  const { primaryCar } = useProfileStore();
  const { cars: myCars, isLoading: isCarsLoading, loadMyCars } = useMyCarStore();
  const {
    expenses,
    totalCount,
    isLoading,
    error,
    fetchExpenses,
    createExpense,
    isCreating,
    createError,
    updateExpense,
    isUpdating,
    categories,
    fetchCategories,
    summary,
    isSummaryLoading,
    fetchSummary,
  } = useExpenseStore();

  const tabs = useMemo(
    () => [
      { id: 'calendar', label: '캘린더' },
      { id: 'expense', label: '지출' },
    ],
    [],
  );

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]?.id ?? 'calendar');
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [isDaySelected, setIsDaySelected] = useState<boolean>(false);
  const [isMonthlySummaryExpanded, setIsMonthlySummaryExpanded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('ALL');
  const [calendarSelectedCategory, setCalendarSelectedCategory] = useState<CategoryKey>('ALL');
  const [isExpenseListExpanded, setIsExpenseListExpanded] = useState<boolean>(false);
  const [isCalendarExpenseListExpanded, setIsCalendarExpenseListExpanded] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [initialKst] = useState(() => getKstTodayParts());

  const [currentYear, setCurrentYear] = useState<number>(initialKst.year);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(initialKst.month - 1); // 0=1월

  const [addDate, setAddDate] = useState<string>(() =>
    formatKoreanDateLabel(initialKst.year, initialKst.month, initialKst.day),
  );
  const [addAmount, setAddAmount] = useState<string>('');
  const [addPlace, setAddPlace] = useState<string>('');
  const [addMemo, setAddMemo] = useState<string>('');
  const [addCategory, setAddCategory] = useState<ExpenseCategory>('FUEL');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [restoreAddExpenseAfterDatePicker, setRestoreAddExpenseAfterDatePicker] =
    useState<boolean>(false);
  const [pickedYear, setPickedYear] = useState<number>(initialKst.year);
  const [pickedMonth, setPickedMonth] = useState<number>(initialKst.month); // 1-12
  const [pickedDay, setPickedDay] = useState<number>(initialKst.day);
  const [isOcrLoading, setIsOcrLoading] = useState<boolean>(false);
  const [isCarSelectOpen, setIsCarSelectOpen] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<PrimaryCar | null>(null);
  const [isExpenseToastVisible, setIsExpenseToastVisible] = useState<boolean>(false);
  const [detailExpense, setDetailExpense] = useState<Expense | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState<boolean>(false);
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null); // 수정 모드일 때 해당 지출 ID

  const yearListRef = useRef<FlatList<number> | null>(null);
  const monthListRef = useRef<FlatList<number> | null>(null);
  const dayListRef = useRef<FlatList<number> | null>(null);

  const isAddEnabled = useMemo(() => {
    return addDate.trim().length > 0 && addAmount.trim().length > 0;
  }, [addAmount, addDate]);

  const dayCountInPickedMonth = useMemo(() => {
    return new Date(pickedYear, pickedMonth, 0).getDate();
  }, [pickedMonth, pickedYear]);

  const pickedWeekdayLabel = useMemo(() => {
    const d = new Date(pickedYear, pickedMonth - 1, pickedDay);
    return KST_WEEKDAYS[d.getDay()];
  }, [pickedDay, pickedMonth, pickedYear]);

  const pickedDateLabel = useMemo(() => {
    return `${pickedYear}년 ${pickedMonth}월 ${pickedDay}일 (${pickedWeekdayLabel})`;
  }, [pickedDay, pickedMonth, pickedWeekdayLabel, pickedYear]);

  const closeDatePicker = () => {
    setIsDatePickerOpen(false);
    if (restoreAddExpenseAfterDatePicker) {
      setRestoreAddExpenseAfterDatePicker(false);
      requestAnimationFrame(() => setIsAddExpenseOpen(true));
    }
  };

  const openDatePicker = () => {
    // iOS에서 modal 2개가 겹치면 뒤로 깔리는 케이스가 있어,
    // 지출 추가 모달이 열려있으면 잠깐 닫고 날짜 선택 모달만 띄움
    const wasAddOpen = isAddExpenseOpen;
    if (wasAddOpen) setIsAddExpenseOpen(false);
    setRestoreAddExpenseAfterDatePicker(wasAddOpen);

    const m = addDate.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    let nextYear = pickedYear;
    let nextMonth = pickedMonth;
    let nextDay = pickedDay;
    if (m) {
      const y = Number(m[1]);
      const mo = Number(m[2]);
      const da = Number(m[3]);
      if (!Number.isNaN(y)) nextYear = y;
      if (!Number.isNaN(mo)) nextMonth = Math.min(12, Math.max(1, mo));
      if (!Number.isNaN(da)) nextDay = Math.min(31, Math.max(1, da));
    }

    setPickedYear(nextYear);
    setPickedMonth(nextMonth);
    setPickedDay(nextDay);

    setIsDatePickerOpen(true);
    requestAnimationFrame(() => {
      const yearIdx = DATE_PICKER_YEARS.findIndex((y) => y === nextYear);
      if (yearIdx >= 0) yearListRef.current?.scrollToIndex({ index: yearIdx, animated: false });
      monthListRef.current?.scrollToIndex({ index: nextMonth - 1, animated: false });
      dayListRef.current?.scrollToIndex({ index: Math.max(0, nextDay - 1), animated: false });
    });
  };

  const resetAddExpenseForm = () => {
    const kst = getKstTodayParts();
    setAddDate(formatKoreanDateLabel(kst.year, kst.month, kst.day));
    setAddAmount('');
    setAddPlace('');
    setAddMemo('');
    setAddCategory('FUEL');
    setPickedYear(kst.year);
    setPickedMonth(kst.month);
    setPickedDay(kst.day);
  };

  // OCR 결과를 폼에 적용
  const applyOcrResult = (ocrResult: {
    date: string | null;
    location: string | null;
    amount: number | null;
    suggestedCategory: import('@/services/ocrService').OcrSuggestedCategory;
  }) => {
    // 날짜 적용 (YYYY-MM-DD → 한글 형식)
    if (ocrResult.date) {
      const [year, month, day] = ocrResult.date.split('-').map(Number);
      if (year && month && day) {
        const label = formatKoreanDateLabel(year, month, day);
        setAddDate(label);
        setPickedYear(year);
        setPickedMonth(month);
        setPickedDay(day);
      }
    }

    // 금액 적용
    if (ocrResult.amount) {
      setAddAmount(ocrResult.amount.toLocaleString('ko-KR'));
    }

    // 장소 적용
    if (ocrResult.location) {
      setAddPlace(ocrResult.location);
    }

    // 추천 카테고리 적용
    if (ocrResult.suggestedCategory) {
      setAddCategory(ocrResult.suggestedCategory);
    }
  };

  // OCR 실행 공통 로직
  const processOcr = async (imageUri: string) => {
    setIsOcrLoading(true);
    try {
      const ocrResult = await performOcr(imageUri);
      applyOcrResult(ocrResult);

      // 인식된 항목 안내
      const recognized: string[] = [];
      if (ocrResult.date) recognized.push('날짜');
      if (ocrResult.location) recognized.push('장소');
      if (ocrResult.amount) recognized.push('금액');
      if (ocrResult.suggestedCategory) recognized.push('카테고리');

      if (recognized.length > 0) {
        Alert.alert('OCR 완료', `${recognized.join(', ')}이(가) 자동 입력되었습니다.\n확인 후 수정해주세요.`);
      } else {
        Alert.alert('OCR 완료', '영수증에서 정보를 찾지 못했습니다.\n직접 입력해주세요.');
      }
    } catch (err) {
      console.error('OCR 오류:', err);
      Alert.alert('OCR 오류', '영수증 인식에 실패했습니다.\n직접 입력해주세요.');
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleReceiptCameraPress = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('권한 필요', '카메라 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      await processOcr(result.assets[0].uri);
    } catch (err) {
      console.error('카메라 오류:', err);
      Alert.alert('오류', '카메라를 실행할 수 없습니다.');
    }
  };

  const handleReceiptLibraryPress = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('권한 필요', '갤러리 접근 권한이 필요합니다.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
        selectionLimit: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      await processOcr(result.assets[0].uri);
    } catch (err) {
      console.error('갤러리 오류:', err);
      Alert.alert('오류', '갤러리를 열 수 없습니다.');
    }
  };

  const handleReceiptPress = () => {
    Alert.alert('영수증 추가', '가져올 방법을 선택해주세요.', [
      { text: '촬영하기', onPress: () => void handleReceiptCameraPress() },
      { text: '갤러리', onPress: () => void handleReceiptLibraryPress() },
      { text: '취소', style: 'cancel' },
    ]);
  };

  // 금액에 따른 색상 및 라벨 결정
  const getExpenseLevelInfo = (amount: number): { amountLabel: string; level: ExpenseLevel; color: string } => {
    let amountLabel: string;
    if (amount >= 10000) {
      const manWon = Math.floor(amount / 10000);
      amountLabel = `${manWon}만`;
    } else if (amount >= 1000) {
      const cheonWon = Math.floor(amount / 1000);
      amountLabel = `${cheonWon}천`;
    } else {
      amountLabel = `${amount}`;
    }
    
    if (amount <= 10000) {
      return { amountLabel, level: 1, color: colors.primary[20] };
    } else if (amount <= 50000) {
      return { amountLabel, level: 1, color: colors.primary[40] };
    } else if (amount <= 100000) {
      return { amountLabel, level: 2, color: colors.primary[60] };
    } else {
      return { amountLabel, level: 3, color: colors.primary[80] };
    }
  };

  // 실제 지출 데이터 기반으로 날짜별 합계 계산
  const expenseByDay = useMemo(() => {
    const mm = String(currentMonthIndex + 1).padStart(2, '0');
    const prefix = `${currentYear}-${mm}`;
    
    const dayTotals = new Map<number, number>();
    
    // 해당 달의 지출을 날짜별로 합산
    expenses.forEach((expense) => {
      if (expense.expenseDate.startsWith(prefix)) {
        const day = parseInt(expense.expenseDate.split('-')[2], 10);
        const current = dayTotals.get(day) || 0;
        dayTotals.set(day, current + expense.amount);
      }
    });
    
    // 합산된 금액으로 레벨 정보 생성
    const result = new Map<number, { amountLabel: string; level: ExpenseLevel; color: string }>();
    dayTotals.forEach((total, day) => {
      if (total > 0) {
        result.set(day, getExpenseLevelInfo(total));
      }
    });
    
    return result;
  }, [currentYear, currentMonthIndex, expenses]);

  // 지출 탭일 때 API 호출
  useEffect(() => {
    if (selectedTab === 'expense' && accessToken) {
      const apiCategory = mapUiCategoryToApi(selectedCategory);
      fetchExpenses({
        accessToken,
        category: apiCategory,
      });
    }
  }, [selectedTab, selectedCategory, accessToken]);

  // 캘린더 탭일 때 API 호출 (현재 보고 있는 월의 데이터를 가져옴)
  useEffect(() => {
    if (selectedTab === 'calendar' && accessToken) {
      const apiCategory = mapUiCategoryToApi(calendarSelectedCategory);
      const mm = String(currentMonthIndex + 1).padStart(2, '0');
      const yearMonth = `${currentYear}-${mm}`;
      fetchExpenses({
        accessToken,
        category: apiCategory,
        yearMonth,
        size: 100,
      });
    }
  }, [selectedTab, calendarSelectedCategory, accessToken, currentYear, currentMonthIndex]);

  // 지출 요약 API 호출: 지출 탭이면 전체 기간, 캘린더 탭이면 월별
  useEffect(() => {
    if (accessToken) {
      if (selectedTab === 'expense') {
        // 지출 탭: yearMonth 없이 전체 기간 누적 조회
        fetchSummary({ accessToken });
      } else {
        // 캘린더 탭: 월별 조회
        const mm = String(currentMonthIndex + 1).padStart(2, '0');
        const yearMonth = `${currentYear}-${mm}`;
        fetchSummary({ accessToken, yearMonth });
      }
    }
  }, [accessToken, selectedTab, currentYear, currentMonthIndex, fetchSummary]);

  // 카테고리 목록 조회 (최초 1회)
  useEffect(() => {
    if (accessToken && categories.length === 0) {
      fetchCategories({ accessToken });
    }
  }, [accessToken, categories.length, fetchCategories]);

  // 카테고리 로드 후 첫 번째 카테고리를 기본 선택
  useEffect(() => {
    if (categories.length > 0 && !categories.find(c => c.category === addCategory)) {
      setAddCategory(categories[0].category);
    }
  }, [categories, addCategory]);

  // 요약 데이터에서 파생된 값들
  const summaryMonthLabel = useMemo(() => {
    if (selectedTab === 'expense') return '누적';
    return `${currentMonthIndex + 1}월`;
  }, [selectedTab, currentMonthIndex]);

  // 지출 탭 누적 기간 라벨 (펼쳤을 때 표시)
  const summaryPeriodLabel = useMemo(() => {
    if (!summary?.period?.startDate) return null;
    const [y, m] = summary.period.startDate.split('-');
    return `${y}년 ${String(Number(m))}월부터 사용한 금액이에요.`;
  }, [summary]);

  const summaryTotalAmountLabel = useMemo(() => {
    if (!summary) return '0원';
    return `${summary.totalAmount.amount.toLocaleString('ko-KR')}원`;
  }, [summary]);

  const summaryDifferenceLabel = useMemo(() => {
    if (!summary?.totalAmount?.comparison) return null;
    const diff = summary.totalAmount.comparison.difference;
    if (diff === 0) return '전월과 동일해요';
    const absDiff = Math.abs(diff).toLocaleString('ko-KR');
    return diff < 0 ? `${absDiff}원 줄어들었어요` : `${absDiff}원 늘어났어요`;
  }, [summary]);

  const summaryCategoryItems = useMemo(() => {
    if (!summary) return [];
    return summary.categories.map((c) => ({
      label: c.categoryLabel,
      value: `${c.amount.toLocaleString('ko-KR')}원`,
    }));
  }, [summary]);

  const calendarHeaderLabel = useMemo(() => {
    return `${currentYear}년 ${currentMonthIndex + 1}월`;
  }, [currentMonthIndex, currentYear]);

  const goPrevMonth = () => {
    setCurrentMonthIndex((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
    setSelectedDay(1);
    setIsDaySelected(false);
  };

  const goNextMonth = () => {
    setCurrentMonthIndex((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
    setSelectedDay(1);
    setIsDaySelected(false);
  };

  // API 데이터를 UI 형식으로 변환
  const expenseItems = useMemo<ExpenseItem[]>(() => {
    return expenses.map((expense) => {
      const car = expense.memberCar;
      const carParts = [car?.brandName, car?.modelName, car?.variant].filter(Boolean);
      const carInfo = carParts.length > 0 ? carParts.join(' ') : undefined;
      return {
        id: String(expense.id),
        category: mapApiCategoryToUi(expense.category),
        title: expense.location || expense.categoryLabel,
        note: expense.memo || undefined,
        date: expense.expenseDate,
        amount: expense.amount,
        carInfo,
      };
    });
  }, [expenses]);

  const displayedExpenseItems = useMemo(() => {
    return isExpenseListExpanded
      ? expenseItems
      : expenseItems.slice(0, 5);
  }, [expenseItems, isExpenseListExpanded]);

  // 캘린더 탭용: 월 전체 또는 선택한 날짜의 지출 필터링
  const selectedDateString = useMemo(() => {
    const mm = String(currentMonthIndex + 1).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  }, [currentYear, currentMonthIndex, selectedDay]);

  const selectedDateLabel = useMemo(() => {
    const mm = String(currentMonthIndex + 1).padStart(2, '0');
    const dd = String(selectedDay).padStart(2, '0');
    return `${currentYear}.${mm}.${dd}`;
  }, [currentYear, currentMonthIndex, selectedDay]);

  // 해당 달의 모든 지출
  const calendarMonthExpenseItems = useMemo<ExpenseItem[]>(() => {
    const mm = String(currentMonthIndex + 1).padStart(2, '0');
    const prefix = `${currentYear}-${mm}`;
    return expenseItems.filter((item) => item.date.startsWith(prefix));
  }, [expenseItems, currentYear, currentMonthIndex]);

  // 선택한 날짜의 지출
  const calendarDayExpenseItems = useMemo<ExpenseItem[]>(() => {
    return expenseItems.filter((item) => item.date === selectedDateString);
  }, [expenseItems, selectedDateString]);

  // 날짜 선택 여부에 따라 표시할 항목 결정
  const calendarExpenseItems = isDaySelected ? calendarDayExpenseItems : calendarMonthExpenseItems;

  const displayedCalendarExpenseItems = useMemo(() => {
    return isCalendarExpenseListExpanded
      ? calendarExpenseItems
      : calendarExpenseItems.slice(0, 5);
  }, [calendarExpenseItems, isCalendarExpenseListExpanded]);

  // API 카테고리를 CategoryTab 형식으로 변환
  const apiCategoryItems = useMemo(() => {
    if (categories.length === 0) return undefined; // 로딩 전에는 기본값 사용
    return [
      { key: 'ALL' as CategoryKey, label: '전체' },
      ...categories.map(c => ({
        key: mapApiCategoryToUi(c.category) as CategoryKey,
        label: c.categoryLabel,
      })),
    ];
  }, [categories]);

  const calendarSelectedCategoryLabel = useMemo(() => {
    if (calendarSelectedCategory === 'ALL') return '전체';
    const found = categories.find(c => mapApiCategoryToUi(c.category) === calendarSelectedCategory);
    if (found) return found.categoryLabel;
    return calendarSelectedCategory;
  }, [calendarSelectedCategory, categories]);

  const openAddExpenseWithDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    const label = formatKoreanDateLabel(year, month, day);
    setAddDate(label);
    setPickedYear(year);
    setPickedMonth(month);
    setPickedDay(day);
    openCarSelect();
  };

  const selectedCategoryLabel = useMemo(() => {
    const map: Record<CategoryKey, string> = {
      ALL: '전체',
      FUEL: '주유비',
      PARKING: '주차비',
      REPAIR: '정비·수리비',
      TOLL: '통행료',
      CAR_WASH: '세차비',
      INSURANCE: '보험료',
      ACCESSORY: '자동차 용품비',
    };
    return map[selectedCategory];
  }, [selectedCategory]);

  const calendarCells = useMemo<CalendarCell[]>(() => {
    const firstDate = new Date(currentYear, currentMonthIndex, 1);
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    const firstDayOfWeek = firstDate.getDay(); // 0=일 ... 6=토
    const cells: CalendarCell[] = [];

    for (let i = 0; i < firstDayOfWeek; i += 1) {
      cells.push({ key: `empty-${i}` });
    }

    for (let d = 1; d <= daysInMonth; d += 1) {
      const meta = expenseByDay.get(d);
      cells.push({
        key: `day-${d}`,
        day: d,
        amountLabel: meta?.amountLabel,
        level: meta?.level ?? 0,
        amountColor: meta?.color,
      });
    }

    // 7열 그리드 마지막 줄 정렬용
    while (cells.length % 7 !== 0) {
      cells.push({ key: `pad-${cells.length}` });
    }

    return cells;
  }, [currentMonthIndex, currentYear, expenseByDay]);

  // 차량 선택 모달 열기 (차량 목록 로드 포함)
  const openCarSelect = () => {
    if (accessToken) {
      loadMyCars(accessToken);
    }
    setIsCarSelectOpen(true);
  };

  // 차량 선택 후 지출 추가 폼으로 이동
  const handleCarSelected = (car: PrimaryCar) => {
    setSelectedCar(car);
    setIsCarSelectOpen(false);
    requestAnimationFrame(() => setIsAddExpenseOpen(true));
  };

  // 지출 상세 모달 열기
  const handleExpensePress = (itemId: string) => {
    const expense = expenses.find((e) => String(e.id) === itemId);
    if (expense) {
      setDetailExpense(expense);
      setIsDetailModalVisible(true);
    }
  };

  // 지출 추가 폼에서 차량 변경하기
  const handleChangeCarFromForm = () => {
    setIsAddExpenseOpen(false);
    if (accessToken) {
      loadMyCars(accessToken);
    }
    requestAnimationFrame(() => setIsCarSelectOpen(true));
  };

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.background.default }}
    >
      {/* 지출 상세 모달 */}
      <Modal
        visible={isDetailModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'center', alignItems: 'center' }}>
          <View
            style={{
              width: 355,
              backgroundColor: colors.coolNeutral[10],
              borderRadius: 20,
              padding: 20,
              gap: 20,
            }}
          >
            {detailExpense && (() => {
              const car = detailExpense.memberCar;
              const carLabel = [car?.brandName, car?.modelName, car?.variant].filter(Boolean).join(' ');
              const matchedCar = myCars.find((c) => c.id === car?.id);
              const regNumber = matchedCar?.registrationNumber;
              const dateFormatted = detailExpense.expenseDate.replace(/-/g, '. ');

              return (
                <>
                  {/* 헤더 + 구분선 */}
                  <View style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.primary[50],
                          }}
                        >
                          {dateFormatted}
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          지출내역
                        </Text>
                      </View>
                      <Pressable
                        onPress={() => {
                          if (!detailExpense) return;
                          // 상세 모달 닫기
                          setIsDetailModalVisible(false);
                          // 폼에 기존 데이터 채워넣기
                          const exp = detailExpense;
                          const [y, m, d] = exp.expenseDate.split('-').map(Number);
                          setAddDate(formatKoreanDateLabel(y, m, d));
                          setPickedYear(y);
                          setPickedMonth(m);
                          setPickedDay(d);
                          setAddAmount(exp.amount.toLocaleString('ko-KR'));
                          setAddPlace(exp.location || '');
                          setAddMemo(exp.memo || '');
                          setAddCategory(exp.category);
                          setEditingExpenseId(exp.id);
                          // 차량 매칭
                          const matched = myCars.find((c) => c.id === exp.memberCar?.id);
                          if (matched) {
                            setSelectedCar(matched);
                          }
                          // 수정 폼 열기
                          requestAnimationFrame(() => setIsAddExpenseOpen(true));
                        }}
                        accessibilityRole="button"
                        accessibilityLabel="edit-expense"
                        hitSlop={8}
                      >
                        <PencilIcon width={22} height={22} />
                      </Pressable>
                    </View>

                    {/* 구분선 */}
                    <View style={{ height: 22, borderBottomWidth: 1, borderColor: colors.coolNeutral[30] }} />
                  </View> 

                  {/* 차량 정보 바 */}
                  {carLabel && (
                    <View
                      style={{
                        backgroundColor: colors.primary[10],
                        borderRadius: 12,
                        paddingVertical: 8,
                        paddingHorizontal: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 12,
                      }}
                    >
                      <BCarIcon width={20} height={20} />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Semibold,
                          color: colors.primary[50],
                        }}
                      >
                        {carLabel}
                      </Text>
                      {regNumber && (
                        <>
                          <View
                            style={{
                              width: 1.4,
                              height: 17,
                              backgroundColor: colors.primary[50],
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: colors.primary[50],
                            }}
                          >
                            {regNumber}
                          </Text>
                        </>
                      )}
                    </View>
                  )}

                  {/* 상세 정보 + 굵은 구분선 */}
                  <View>
                    <View style={{ gap: 8 }}>
                      {/* 메모 + 구분선 */}
                      <View>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[80],
                            }}
                          >
                            메모
                          </Text>
                          <Text
                            numberOfLines={2}
                            style={{
                              flex: 1,
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[50],
                              textAlign: 'right',
                            }}
                          >
                            {detailExpense.memo || '-'}
                          </Text>
                        </View>
                        <View style={{ height: 20, borderBottomWidth: 1, borderColor: colors.coolNeutral[30] }} />
                      </View>

                      {/* 장소 */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 16 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          장소
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            flex: 1,
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Semibold,
                            color: colors.coolNeutral[50],
                            textAlign: 'right',
                          }}
                        >
                          {detailExpense.location || '-'}
                        </Text>
                      </View>

                      {/* 카테고리 */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          카테고리
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Semibold,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          {detailExpense.categoryLabel}
                        </Text>
                      </View>

                      {/* 가격 */}
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          가격
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Semibold,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          {detailExpense.amount.toLocaleString('ko-KR')}원
                        </Text>
                      </View>
                    </View>

                  </View>

                  {/* 굵은 구분선 + 전체금액 */}
                  <View style={{ gap: 12 }}>
                    <View style={{ height: 2, backgroundColor: colors.coolNeutral[80] }} />
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h2Bold,
                          color: colors.coolNeutral[70],
                        }}
                      >
                        전체금액
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h2Bold,
                          color: colors.primary[50],
                        }}
                      >
                        {detailExpense.amount.toLocaleString('ko-KR')} 원
                      </Text>
                    </View>
                  </View>

                  {/* 버튼 */}
                  <View style={{ flexDirection: 'row', gap: 12, marginTop: 6 }}>
                    <Pressable
                      onPress={() => setIsDetailModalVisible(false)}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: colors.coolNeutral[20],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="detail-cancel"
                    >
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body1Bold,
                          color: colors.coolNeutral[40],
                        }}
                      >
                        취소
                      </Text>
                    </Pressable>

                    <Pressable
                      onPress={() => setIsDetailModalVisible(false)}
                      style={{
                        flex: 1,
                        height: 48,
                        borderRadius: 12,
                        backgroundColor: colors.primary[50],
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      accessibilityRole="button"
                      accessibilityLabel="detail-confirm"
                    >
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body1Bold,
                          color: colors.coolNeutral[10],
                        }}
                      >
                        확인
                      </Text>
                    </Pressable>
                  </View>
                </>
              );
            })()}
          </View>
        </View>
      </Modal>

      {/* 보유한 차량 선택 모달 */}
      <Modal
        visible={isCarSelectOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsCarSelectOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)' }}>
          <Pressable
            onPress={() => setIsCarSelectOpen(false)}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            accessibilityRole="button"
            accessibilityLabel="dismiss-car-select"
          />

          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View
              style={{
                width: '100%',
                backgroundColor: colors.coolNeutral[10],
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingTop: 28,
                paddingBottom: 40,
                paddingHorizontal: 20,
              }}
            >
              {/* 헤더 */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body1Semibold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  보유한 차량 선택
                </Text>

                <Pressable
                  onPress={() => setIsCarSelectOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="close-car-select"
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <XIcon width={24} height={24} />
                </Pressable>
              </View>

              {/* 차량 목록 */}
              {isCarsLoading ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color={colors.primary[50]} />
                </View>
              ) : myCars.length === 0 ? (
                <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body2Medium,
                      color: colors.coolNeutral[50],
                    }}
                  >
                    등록된 차량이 없습니다.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {myCars.map((car) => {
                    const isSelected = selectedCar?.id === car.id;
                    return (
                      <Pressable
                        key={car.id}
                        onPress={() => handleCarSelected(car)}
                        accessibilityRole="button"
                        accessibilityLabel={`select-car-${car.id}`}
                        style={{
                          width: '100%',
                          height: 56,
                          borderRadius: borderRadius.lg,
                          backgroundColor: isSelected ? colors.primary[50] : colors.background.default,
                          paddingLeft: 12,
                          paddingRight: 20,
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                          {isSelected ? (
                            <WCarIcon width={20} height={20} />
                          ) : (
                            <GCarIcon width={20} height={20} />
                          )}

                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: isSelected ? colors.primary[10] : colors.coolNeutral[40],
                            }}
                          >
                            {car.brandName} {car.modelName} {car.variant}
                          </Text>

                          <View
                            style={{
                              width: 1.4,
                              height: 17,
                              backgroundColor: isSelected ? colors.primary[10] : colors.coolNeutral[40],
                            }}
                          />

                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: isSelected ? colors.primary[10] : colors.coolNeutral[40],
                            }}
                          >
                            {car.registrationNumber}
                          </Text>
                        </View>

                        {isSelected && (
                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: borderRadius.full,
                              backgroundColor: colors.primary[50],
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <WCheckIcon width={24} height={24} />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={isAddExpenseOpen}
        transparent
        animationType="fade"
        onRequestClose={() => { setIsAddExpenseOpen(false); setEditingExpenseId(null); }}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)' }}>
          {/* backdrop */}
          <Pressable
            onPress={() => { setIsAddExpenseOpen(false); setEditingExpenseId(null); }}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            accessibilityRole="button"
            accessibilityLabel="dismiss-add-expense"
          />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1, justifyContent: 'flex-end' }}
          >
            <View
              style={{
                width: '100%',
                height: '60%',
                backgroundColor: colors.coolNeutral[10],
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingVertical: 32,
                paddingHorizontal: 20,
              }}
            >
              {/* 헤더 */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body1Semibold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  {editingExpenseId ? '지출 수정' : '지출 추가'}
                </Text>

                <Pressable
                  onPress={() => {
                    setIsAddExpenseOpen(false);
                    resetAddExpenseForm();
                    setEditingExpenseId(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="close-add-expense"
                  style={{ alignItems: 'center', justifyContent: 'center' }}
                >
                  <XIcon width={24} height={24} />
                </Pressable>
              </View>

              <ScrollView
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{
                  paddingTop: 12,
                }}
              >
                <View style={{ gap: 20 }}>
                  <View style={{ gap: 16 }}>
                    {/* OCR 카드 */}
                    <Pressable
                      onPress={handleReceiptPress}
                      disabled={isOcrLoading}
                      accessibilityRole="button"
                      accessibilityLabel="receipt-ocr"
                      style={{
                        width: '100%',
                        borderRadius: borderRadius.lg,
                        backgroundColor: colors.background.default,
                        alignItems: 'center',
                        justifyContent: 'center',
                        paddingVertical: 20,
                        paddingHorizontal: 10,
                        gap: 10,
                        opacity: isOcrLoading ? 0.6 : 1,
                      }}
                    >
                      {isOcrLoading ? (
                        <>
                          <ActivityIndicator size="small" color={colors.primary[50]} />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: colors.primary[50],
                            }}
                          >
                            영수증 분석 중...
                          </Text>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[40],
                            }}
                          >
                            잠시만 기다려주세요
                          </Text>
                        </>
                      ) : (
                        <>
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <CameraIcon width={24} height={24} />
                          </View>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Semibold,
                              color: colors.primary[50],
                            }}
                          >
                            영수증 촬영하기
                          </Text>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[40],
                            }}
                          >
                            OCR로 자동입력
                          </Text>
                        </>
                      )}
                    </Pressable>

                    {/* 또는 직접 입력 */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                      <View style={{ flex: 1, height: 1, backgroundColor: colors.coolNeutral[30] }} />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Medium,
                          color: colors.coolNeutral[40],
                        }}
                      >
                        또는 직접 입력
                      </Text>
                      <View style={{ flex: 1, height: 1, backgroundColor: colors.coolNeutral[30] }} />
                    </View>
                  </View>

                  <View style={{ gap: 20 }}>
                    <View style={{ width: '100%', gap: 20 }}>
                      {/* 선택한 차량 */}
                      <View style={{ width: '100%', gap: 12 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          선택한 차량
                        </Text>

                        <Pressable
                          onPress={handleChangeCarFromForm}
                          accessibilityRole="button"
                          accessibilityLabel="change-car"
                          style={{
                            width: '100%',
                            height: 48,
                            borderRadius: borderRadius.md,
                            backgroundColor: colors.primary[10],
                            paddingHorizontal: 16,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
                            <BCarIcon width={20} height={20} />

                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Semibold,
                                color: colors.primary[50],
                              }}
                            >
                              {selectedCar ? `${selectedCar.brandName} ${selectedCar.modelName} ${selectedCar.variant}` : '차량 없음'}
                            </Text>

                            <View
                              style={{
                                width: 1.4,
                                height: 17,
                                backgroundColor: colors.primary[50],
                              }}
                            />

                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Semibold,
                                color: colors.primary[50],
                              }}
                            >
                              {selectedCar?.registrationNumber ?? '-'}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: borderRadius.full,
                              backgroundColor: colors.primary[50],
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <WCheckIcon width={24} height={24} />
                          </View>
                        </Pressable>
                      </View>

                      <View style={{ width: '100%', gap: 12 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[80],
                          }}
                        >
                          날짜
                        </Text>
                        <Pressable
                          onPress={openDatePicker}
                          accessibilityRole="button"
                          accessibilityLabel="open-date-picker"
                          style={{
                            width: '100%',
                            height: 48,
                            borderRadius: borderRadius.md,
                            borderWidth: 1.2,
                            borderColor: colors.coolNeutral[20],
                            backgroundColor: colors.coolNeutral[10],
                            justifyContent: 'center',
                            paddingLeft: 12,
                            paddingRight: 20,
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Regular,
                              color: addDate ? colors.coolNeutral[70] : colors.coolNeutral[30],
                            }}
                          >
                            {addDate || '날짜를 입력해주세요.'}
                          </Text>
                        </Pressable>
                      </View>

                      <View style={{ width: '100%', gap: 12 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Semibold,
                        color: colors.coolNeutral[80],
                      }}
                    >
                      카테고리
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: 'row', gap: 8 }}>
                        {categories.map((c) => {
                          const selected = addCategory === c.category;
                          return (
                            <Pressable
                              key={c.category}
                              onPress={() => setAddCategory(c.category)}
                              style={{
                                height: 36,
                                paddingHorizontal: 12,
                                borderRadius: borderRadius.md,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: selected
                                  ? colors.primary[50]
                                  : colors.background.default,
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body2Semibold,
                                  color: selected ? colors.coolNeutral[10] : colors.coolNeutral[40],
                                }}
                              >
                                {c.categoryLabel}
                              </Text>
                            </Pressable>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </View>

                  <NumberInput
                    label="금액"
                    value={addAmount}
                    placeholder="숫자만 입력해주세요."
                    onChangeText={setAddAmount}
                    onClear={() => setAddAmount('')}
                  />

                  <TextInput
                    label="장소"
                    value={addPlace}
                    placeholder="장소를 입력해주세요."
                    onChangeText={setAddPlace}
                    onClear={() => setAddPlace('')}
                  />

                  <TextInput
                    label="메모"
                    value={addMemo}
                    placeholder="메모를 자유롭게 입력해주세요."
                    onChangeText={setAddMemo}
                    onClear={() => setAddMemo('')}
                  />
                    </View>

                    {/* 하단 버튼 */}
                    <Pressable
                      disabled={!isAddEnabled || isCreating || isUpdating || !selectedCar}
                      onPress={async () => {
                        if (!isAddEnabled || !accessToken || !selectedCar) return;

                        const expenseDate = parseKoreanDateToIso(addDate);

                        if (!expenseDate) {
                          Alert.alert('오류', '날짜가 올바르지 않습니다.');
                          return;
                        }

                        if (editingExpenseId) {
                          // 수정 모드
                          if (isUpdating) return;
                          const updateData = {
                            expenseDate,
                            amount: parseInt(addAmount.replace(/,/g, ''), 10) || 0,
                            category: addCategory,
                            location: addPlace,
                            memo: addMemo,
                          };

                          const success = await updateExpense({
                            expenseId: editingExpenseId,
                            request: updateData,
                            accessToken,
                          });

                          if (success) {
                            setIsAddExpenseOpen(false);
                            resetAddExpenseForm();
                            setEditingExpenseId(null);
                            // 지출 목록 + 요약 새로고침
                            const mm = String(currentMonthIndex + 1).padStart(2, '0');
                            const yearMonth = `${currentYear}-${mm}`;
                            fetchExpenses({ accessToken, yearMonth, size: 100 });
                            if (selectedTab === 'expense') {
                              fetchSummary({ accessToken });
                            } else {
                              fetchSummary({ accessToken, yearMonth });
                            }
                          } else {
                            const errorMsg = useExpenseStore.getState().updateError || '지출 내역 수정에 실패했습니다.';
                            Alert.alert('오류', errorMsg);
                          }
                        } else {
                          // 추가 모드
                          if (isCreating) return;
                          const requestData = {
                            memberCarId: selectedCar.id,
                            expenseDate,
                            amount: parseInt(addAmount.replace(/,/g, ''), 10) || 0,
                            category: addCategory,
                            location: addPlace,
                            memo: addMemo,
                          };

                          console.log('createExpense request:', requestData);

                          const success = await createExpense({
                            request: requestData,
                            accessToken,
                          });

                          if (success) {
                            setIsAddExpenseOpen(false);
                            resetAddExpenseForm();
                            // 지출 목록 + 요약 새로고침
                            const mm = String(currentMonthIndex + 1).padStart(2, '0');
                            const yearMonth = `${currentYear}-${mm}`;
                            fetchExpenses({ accessToken, yearMonth, size: 100 });
                            if (selectedTab === 'expense') {
                              fetchSummary({ accessToken });
                            } else {
                              fetchSummary({ accessToken, yearMonth });
                            }
                            setIsExpenseToastVisible(true);
                          } else {
                            const errorMsg = useExpenseStore.getState().createError || '지출 내역 추가에 실패했습니다.';
                            Alert.alert('오류', errorMsg);
                          }
                        }
                      }}
                      style={{
                        width: '100%',
                        height: 48,
                        borderRadius: borderRadius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: (isAddEnabled && !isCreating && !isUpdating) ? colors.primary[50] : colors.coolNeutral[20],
                      }}
                    >
                      {(isCreating || isUpdating) ? (
                        <ActivityIndicator size="small" color={colors.coolNeutral[10]} />
                      ) : (
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.h3Bold,
                            color: isAddEnabled ? colors.coolNeutral[10] : colors.coolNeutral[40],
                          }}
                        >
                          {editingExpenseId ? '수정하기' : '추가하기'}
                        </Text>
                      )}
                    </Pressable>
                  </View>
                </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* 날짜 선택 모달 (지출 추가 모달 위로 뜨도록 뒤에서 렌더) */}
      <Modal
        visible={isDatePickerOpen}
        transparent
        animationType="fade"
        onRequestClose={closeDatePicker}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }}>
          {/* backdrop */}
          <Pressable
            onPress={closeDatePicker}
            style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}
            accessibilityRole="button"
            accessibilityLabel="dismiss-date-picker"
          />

          <View
            style={{
              width: '100%',
              backgroundColor: colors.background.default,
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingTop: 18,
              paddingBottom: 24,
              paddingHorizontal: 20,
              gap: 16,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body1Semibold,
                  color: colors.coolNeutral[80],
                }}
              >
                날짜 선택
              </Text>
              <Pressable
                onPress={closeDatePicker}
                accessibilityRole="button"
                accessibilityLabel="close-date-picker"
                style={{ alignItems: 'center', justifyContent: 'center' }}
              >
                <XIcon width={24} height={24} />
              </Pressable>
            </View>

            <View
              style={{ gap: 24 }}
            >
              <View
                style={{
                  width: '100%',
                  borderRadius: borderRadius.lg,
                  backgroundColor: colors.coolNeutral[10],
                  borderWidth: 1,
                  borderColor: colors.coolNeutral[20],
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                }}
              >
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  {/* Year */}
                  <View style={{ flex: 1 }}>
                    <FlatList
                      ref={(r) => {
                        yearListRef.current = r;
                      }}
                      data={DATE_PICKER_YEARS}
                      keyExtractor={(item) => `y-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                      decelerationRate="fast"
                      contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                      getItemLayout={(_, index) => ({
                        length: DATE_WHEEL_ITEM_HEIGHT,
                        offset: DATE_WHEEL_ITEM_HEIGHT * index,
                        index,
                      })}
                      style={{ height: DATE_WHEEL_HEIGHT }}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                        const y = DATE_PICKER_YEARS[idx] ?? pickedYear;
                        setPickedYear(y);
                        const maxDay = new Date(y, pickedMonth, 0).getDate();
                        setPickedDay((d) => Math.min(d, maxDay));
                      }}
                      renderItem={({ item, index }) => {
                        const selected = item === pickedYear;
                        return (
                          <Pressable
                            onPress={() => {
                              setPickedYear(item);
                              yearListRef.current?.scrollToIndex({ index, animated: true });
                              const maxDay = new Date(item, pickedMonth, 0).getDate();
                              setPickedDay((d) => Math.min(d, maxDay));
                            }}
                            style={{
                              height: DATE_WHEEL_ITEM_HEIGHT,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body1Bold,
                                color: selected ? colors.primary[50] : colors.coolNeutral[40],
                              }}
                            >
                              {item}년
                            </Text>
                          </Pressable>
                        );
                      }}
                    />
                  </View>

                  {/* Month */}
                  <View style={{ flex: 1 }}>
                    <FlatList
                      ref={(r) => {
                        monthListRef.current = r;
                      }}
                      data={Array.from({ length: 12 }, (_, i) => i + 1)}
                      keyExtractor={(item) => `m-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                      decelerationRate="fast"
                      contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                      getItemLayout={(_, index) => ({
                        length: DATE_WHEEL_ITEM_HEIGHT,
                        offset: DATE_WHEEL_ITEM_HEIGHT * index,
                        index,
                      })}
                      style={{ height: DATE_WHEEL_HEIGHT }}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                        const mo = idx + 1;
                        setPickedMonth(mo);
                        const maxDay = new Date(pickedYear, mo, 0).getDate();
                        setPickedDay((d) => Math.min(d, maxDay));
                      }}
                      renderItem={({ item, index }) => {
                        const selected = item === pickedMonth;
                        return (
                          <Pressable
                            onPress={() => {
                              setPickedMonth(item);
                              monthListRef.current?.scrollToIndex({ index, animated: true });
                              const maxDay = new Date(pickedYear, item, 0).getDate();
                              setPickedDay((d) => Math.min(d, maxDay));
                            }}
                            style={{
                              height: DATE_WHEEL_ITEM_HEIGHT,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body1Bold,
                                color: selected ? colors.primary[50] : colors.coolNeutral[40],
                              }}
                            >
                              {item}월
                            </Text>
                          </Pressable>
                        );
                      }}
                    />
                  </View>

                  {/* Day */}
                  <View style={{ flex: 1 }}>
                    <FlatList
                      ref={(r) => {
                        dayListRef.current = r;
                      }}
                      data={Array.from({ length: dayCountInPickedMonth }, (_, i) => i + 1)}
                      keyExtractor={(item) => `d-${item}`}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                      decelerationRate="fast"
                      contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                      getItemLayout={(_, index) => ({
                        length: DATE_WHEEL_ITEM_HEIGHT,
                        offset: DATE_WHEEL_ITEM_HEIGHT * index,
                        index,
                      })}
                      style={{ height: DATE_WHEEL_HEIGHT }}
                      onMomentumScrollEnd={(e) => {
                        const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                        setPickedDay(idx + 1);
                      }}
                      renderItem={({ item, index }) => {
                        const selected = item === pickedDay;
                        return (
                          <Pressable
                            onPress={() => {
                              setPickedDay(item);
                              dayListRef.current?.scrollToIndex({ index, animated: true });
                            }}
                            style={{
                              height: DATE_WHEEL_ITEM_HEIGHT,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body1Bold,
                                color: selected ? colors.primary[50] : colors.coolNeutral[40],
                              }}
                            >
                              {item}일
                            </Text>
                          </Pressable>
                        );
                      }}
                    />
                  </View>
                </View>

                {/* center highlight */}
                <View
                  pointerEvents="none"
                  style={{
                    position: 'absolute',
                    left: 12,
                    right: 12,
                    top: 16 + DATE_WHEEL_PADDING,
                    height: DATE_WHEEL_ITEM_HEIGHT,
                    borderRadius: borderRadius.md,
                    borderWidth: 1,
                    borderColor: colors.coolNeutral[20],
                  }}
                />
              </View>

              <Pressable
                onPress={() => {
                  setAddDate(pickedDateLabel);
                  closeDatePicker();
                }}
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: borderRadius.md,
                  backgroundColor: colors.primary[50],
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                accessibilityRole="button"
                accessibilityLabel="confirm-date-picker"
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: colors.coolNeutral[10],
                  }}
                >
                  {pickedDateLabel} 선택
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'stretch',
          paddingBottom: 80,
        }}
      >
        <View style={{ width: '100%', flex: 1, gap: 32 }}>
          <View style={{ width: '100%' }}>
          {/* 상단 헤더 */}
          <View
            style={{
              paddingVertical: 12,
              paddingHorizontal: 20,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              backgroundColor: colors.background.default,
            }}
          >
            <Pressable
              onPress={() => router.back()}
              style={{ width: 24, height: 24, justifyContent: 'center' }}
              accessibilityRole="button"
              accessibilityLabel="back"
            >
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>

            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h3Semibold,
                color: colors.coolNeutral[90],
              }}
            >
              지출관리
            </Text>
          </View>

          {/* 탭 + 요약 */}
          <View
            style={{
              width: '100%',
              backgroundColor: colors.background.default,
            }}
          >
            <CouponTab tabs={tabs} selectedTab={selectedTab} onTabChange={setSelectedTab} />
          </View>
          <View
            style={{
              width: '100%',
              backgroundColor: selectedTab === 'expense' ? '#FFFFFF' : colors.background.default,
              paddingTop: 20,
              paddingBottom: 20
            }}
          >
            <View style={{ paddingHorizontal: 20 }}>
              {/* 요약 카드 */}
              <View
                style={{
                  width: '100%',
                  backgroundColor: colors.coolNeutral[10],
                  borderRadius: borderRadius.md,
                  padding: 20,
                }}
              >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: colors.coolNeutral[80],
                  }}
                >
                  <Text style={{ color: colors.primary[50] }}>{selectedTab === 'expense' && isMonthlySummaryExpanded ? '누적' : summaryMonthLabel}</Text> 소비금액
                </Text>

                <Pressable
                  onPress={() => setIsMonthlySummaryExpanded((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel="monthly-summary-toggle"
                  style={{ width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}
                >
                  {isMonthlySummaryExpanded ? (
                    <UpIcon width={20} height={20} />
                  ) : (
                    <DownIcon width={20} height={20} />
                  )}
                </Pressable>
              </View>

              {!isMonthlySummaryExpanded ? (
                isSummaryLoading ? (
                  <ActivityIndicator size="small" color={colors.primary[50]} style={{ marginTop: 12 }} />
                ) : (
                <Text
                  style={{
                    marginTop: 12,
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h1Bold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  {summaryTotalAmountLabel}
                </Text>
                )
              ) : (
                <View style={{ marginTop: 16, gap: 12 }}>
                  {selectedTab === 'expense' && summaryPeriodLabel ? (
                    <>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.coolNeutral[30],
                          opacity: 0.6,
                        }}
                      />
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body3Medium,
                          color: colors.coolNeutral[50],
                        }}
                      >
                        <Text style={{ color: colors.primary[50] }}>
                          {summary?.period?.startDate ? `${summary.period.startDate.split('-')[0]}년 ${String(Number(summary.period.startDate.split('-')[1]))}월` : ''}
                        </Text>
                        {'부터 사용한 금액이에요.'}
                      </Text>
                    </>
                  ) : (
                    <>
                      <View
                        style={{
                          height: 1,
                          backgroundColor: colors.coolNeutral[30],
                          opacity: 0.6,
                        }}
                      />

                      {summaryDifferenceLabel && (
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Medium,
                            color: colors.coolNeutral[50],
                          }}
                        >
                          전월대비
                        </Text>
                        {summary?.totalAmount?.comparison?.difference != null && summary.totalAmount.comparison.difference > 0 ? (
                          <UpGraphIcon width={12} height={12} />
                        ) : summary?.totalAmount?.comparison?.difference != null && summary.totalAmount.comparison.difference < 0 ? (
                          <RGraphIcon width={12} height={12} />
                        ) : (
                          <GGraphIcon width={12} height={12} />
                        )}
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body3Semibold,
                            color: summary?.totalAmount?.comparison?.difference != null && summary.totalAmount.comparison.difference > 0
                              ? colors.primary[50]
                              : summary?.totalAmount?.comparison?.difference != null && summary.totalAmount.comparison.difference < 0
                                ? colors.red[40]
                                : colors.coolNeutral[40],
                          }}
                        >
                          {summaryDifferenceLabel}
                        </Text>
                      </View>
                      )}
                    </>
                  )}

                  <View style={{ gap: 8 }}>
                    {summaryCategoryItems.map((item) => (
                      <View
                        key={item.label}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[90],
                          }}
                        >
                          {item.label}
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[90],
                          }}
                        >
                          {item.value}
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View
                    style={{
                      height: 2,
                      backgroundColor: colors.coolNeutral[70],
                      opacity: 0.9,
                    }}
                  />

                  <View
                    style={{
                      flexDirection: 'row',
                      // alignItems: 'baseline',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Bold,
                        color: colors.coolNeutral[90],
                      }}
                    >
                      전체금액
                    </Text>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.h2Bold,
                        color: colors.coolNeutral[90],
                      }}
                    >
                      {summaryTotalAmountLabel}
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ marginTop: 24 }}>
                <MainButton
                  label="지출내역 추가하기"
                  alwaysPrimary
                  onPress={openCarSelect}
                  containerStyle={{ width: '100%' }}
                />
              </View>
            </View>
            </View>
          </View>
          </View>

          {/* 캘린더 */}
          {selectedTab === 'calendar' && (
            <View
              style={{
                width: '100%',
                backgroundColor: colors.coolNeutral[10],
              }}
            >
              <View
                style={{
                  width: '100%',
                  paddingVertical: 24,
                  paddingHorizontal: 20,
                }}
              >
                <View style={{ gap: 24 }}>
                  {/* 월 이동 */}
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 24,
                    }}
                  >
                    <Pressable
                      onPress={goPrevMonth}
                      accessibilityRole="button"
                      accessibilityLabel="prev-month"
                      style={{ width: 40, height: 40, padding: 8,alignItems: 'center', justifyContent: 'center' }}
                    >
                      <LeftIcon width={24} height={24} />
                    </Pressable>

                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body1Bold,
                        color: colors.coolNeutral[90],
                      }}
                    >
                      {calendarHeaderLabel}
                    </Text>

                    <Pressable
                      onPress={goNextMonth}
                      accessibilityRole="button"
                      accessibilityLabel="next-month"
                      style={{ width: 40, height: 40, padding: 8, alignItems: 'center', justifyContent: 'center' }}
                    >
                      <RightIcon width={24} height={24} />
                    </Pressable>
                  </View>

                  <View style={{ gap: 12 }}>
                    {/* 요일 */}
                    <View style={{ flexDirection: 'row' }}>
                      {WEEKDAYS.map((w) => (
                        <View key={w} style={{ width: calendarCellSize, alignItems: 'center' }}>
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body1Medium,
                              color: colors.coolNeutral[40],
                            }}
                          >
                            {w}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* 날짜 그리드 */}
                    <View
                      style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        rowGap: 2,
                      }}
                    >
                      {calendarCells.map((cell) => {
                        const isSelected = !!cell.day && cell.day === selectedDay;
                        const hasDay = !!cell.day;
                        const isActiveSelected = isSelected && isDaySelected;

                        return (
                          <Pressable
                            key={cell.key}
                            disabled={!hasDay}
                            onPress={() => {
                              if (hasDay) {
                                setSelectedDay(cell.day!);
                                setIsDaySelected(true);
                              }
                            }}
                            style={{
                              width: calendarCellSize,
                              height: calendarCellSize,
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              paddingTop: 4,
                              paddingBottom: 2,
                              backgroundColor: isActiveSelected ? colors.primary[10] : 'transparent',
                              borderBottomWidth: isActiveSelected ? 1 : 0,
                              borderBottomColor: isActiveSelected ? colors.primary[50] : 'transparent',
                            }}
                            accessibilityRole="button"
                            accessibilityLabel={hasDay ? `day-${cell.day}` : 'empty'}
                          >
                            <View style={{ alignItems: 'center', gap: 3 }}>
                              <View
                                style={{
                                  width: 38,
                                  borderRadius: borderRadius.full,
                                  backgroundColor: 'transparent',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                {hasDay && (
                                  <Text
                                    style={{
                                      fontFamily: typography.fontFamily.pretendard,
                                      ...typography.styles.body1Semibold,
                                      color: isActiveSelected
                                        ? colors.primary[50]
                                        : cell.amountLabel
                                          ? colors.coolNeutral[80]
                                          : colors.coolNeutral[40],
                                    }}
                                  >
                                    {cell.day}
                                  </Text>
                                )}
                              </View>

                              {hasDay && cell.amountLabel && (
                                <Text
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionBold,
                                    color: cell.amountColor ?? colors.primary[50],
                                  }}
                                >
                                  {cell.amountLabel}
                                </Text>
                              )}
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>

              {/* 범례 + 카테고리 탭 + 리스트 */}
              <View style={{ gap: 20, backgroundColor: colors.background.default }}>
                {/* 범례 */}
                <View
                  style={{
                    width: '100%',
                    paddingHorizontal: 20,
                    paddingTop: 14,
                    backgroundColor: colors.coolNeutral[10],
                  }}
                >
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.coolNeutral[30],
                      opacity: 0.6,
                    }}
                  />

                  <View style={{ paddingTop: 17, paddingBottom: 24, gap: 12 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body3Medium,
                        color: colors.coolNeutral[40],
                      }}
                    >
                      지출 범위
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 20 }}>
                      {[
                        { label: '~1만', color: colors.primary[20] },
                        { label: '~5만', color: colors.primary[40] },
                        { label: '~10만', color: colors.primary[60] },
                        { label: '10만+', color: colors.primary[80] },
                        { label: '20만+', color: colors.primary[100] },
                      ].map((item) => (
                        <View key={item.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <View
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: 4,
                              backgroundColor: item.color,
                            }}
                          />
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body3Medium,
                              color: colors.coolNeutral[40],
                            }}
                          >
                            {item.label}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>

                {/* 카테고리 탭 + 타이틀 + 리스트 */}
                <View style={{ backgroundColor: colors.coolNeutral[10] }}>
                  {/* 카테고리 탭 */}
                  <View style={{ paddingLeft: 20, paddingVertical: 32 }}>
                    <CategoryTab
                      selected={calendarSelectedCategory}
                      onSelect={(key) => {
                        setCalendarSelectedCategory(key);
                        setIsCalendarExpenseListExpanded(false);
                      }}
                      categories={apiCategoryItems}
                    />
                  </View>

              {/* 타이틀 */}
              <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  {isDaySelected ? (
                    <>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h3Bold,
                          color: colors.primary[50],
                        }}
                      >
                        {selectedDateLabel}
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h3Bold,
                          color: colors.coolNeutral[80],
                        }}
                      >
                        지출
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h3Bold,
                          color: colors.coolNeutral[90],
                        }}
                      >
                        최근 지출내역
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h3Bold,
                          color: colors.primary[50],
                        }}
                      >
                        {calendarMonthExpenseItems.length}건
                      </Text>
                    </>
                  )}
                </View>
              </View>

              {/* 리스트 */}
              <View style={{ backgroundColor: colors.coolNeutral[10] }}>
                {isLoading ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary[50]} />
                  </View>
                ) : error ? (
                  <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Medium,
                        color: colors.coolNeutral[60],
                        textAlign: 'center',
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : calendarExpenseItems.length === 0 ? (
                  isDaySelected ? (
                    <View style={{ paddingHorizontal: 20, paddingVertical: 60, alignItems: 'center', gap: 12 }}>
                      <Pressable
                        onPress={() => openAddExpenseWithDate(selectedDateString)}
                        accessibilityRole="button"
                        accessibilityLabel="add-expense-for-date"
                      >
                        <BPlusIcon width={40} height={40} />
                      </Pressable>
                      <View style={{ alignItems: 'center', gap: 4 }}>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[40],
                            textAlign: 'center',
                          }}
                        >
                          아직 지출내역이 없어요
                        </Text>
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.body2Semibold,
                            color: colors.coolNeutral[40],
                            textAlign: 'center',
                          }}
                        >
                          직접 입력해주세요
                        </Text>
                      </View>
                    </View>
                  ) : (
                    <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.body2Medium,
                          color: colors.coolNeutral[60],
                          textAlign: 'center',
                        }}
                      >
                        지출 내역이 없습니다.
                      </Text>
                    </View>
                  )
                ) : (
                  displayedCalendarExpenseItems.map((item, idx) => {
                    const isLast = idx === displayedCalendarExpenseItems.length - 1;
                    const categoryLabelMap: Record<Exclude<CategoryKey, 'ALL'>, string> = {
                      FUEL: '주유비',
                      PARKING: '주차비',
                      REPAIR: '정비·수리비',
                      TOLL: '통행료',
                      CAR_WASH: '세차비',
                      INSURANCE: '보험료',
                      ACCESSORY: '자동차 용품비',
                    };
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleExpensePress(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`calendar-expense-${item.id}`}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          ...(isLast
                            ? {}
                            : {
                                borderBottomWidth: 1,
                                borderBottomColor: colors.coolNeutral[30],
                              }),
                        }}
                      >
                        {/* 썸네일 */}
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: borderRadius.full,
                            backgroundColor: colors.background.default,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.category === 'FUEL' && <OilingIcon width={24} height={24} />}
                          {item.category === 'PARKING' && <ParkingIcon width={24} height={24} />}
                          {item.category === 'INSURANCE' && <InsuranceIcon width={24} height={24} />}
                          {item.category === 'TOLL' && <TollIcon width={24} height={24} />}
                          {item.category === 'REPAIR' && <MaintenanceIcon width={24} height={24} />}
                          {item.category === 'CAR_WASH' && <CarwashIcon width={24} height={24} />}
                          {item.category === 'ACCESSORY' && <ExpendablesIcon width={24} height={24} />}
                        </View>

                        {/* 본문 */}
                        <View style={{ flex: 1, gap: 6 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                flex: 1,
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Semibold,
                                color: colors.coolNeutral[90],
                              }}
                            >
                              {item.title}
                            </Text>

                            <GRightIcon width={24} height={24} />
                          </View>

                          <View style={{ gap: 4 }}>
                            {item.carInfo && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <GCarIcon width={14} height={14} />
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionSemibold,
                                    color: colors.coolNeutral[40],
                                  }}
                                >
                                  {item.carInfo}
                                </Text>
                              </View>
                            )}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              {item.note ? (
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    flex: 1,
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionMedium,
                                    color: colors.primary[30],
                                  }}
                                >
                                  {item.note}
                                </Text>
                              ) : (
                                <View style={{ flex: 1 }} />
                              )}

                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body2Bold,
                                  color: colors.primary[50],
                                }}
                              >
                                {item.amount.toLocaleString('ko-KR')}원
                              </Text>
                            </View>

                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.captionMedium,
                                  color: colors.coolNeutral[40],
                                }}
                              >
                                {categoryLabelMap[item.category]}
                              </Text>

                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.captionMedium,
                                  color: colors.coolNeutral[40],
                                }}
                              >
                                {item.date}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </View>

              {calendarExpenseItems.length > 5 && (
                <Pressable
                  onPress={() => setIsCalendarExpenseListExpanded((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel="calendar-expense-list-toggle"
                  style={{
                    backgroundColor: colors.coolNeutral[10],
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: colors.coolNeutral[30],
                  }}
                >
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body3Medium,
                      color: colors.coolNeutral[50],
                    }}
                  >
                    {isCalendarExpenseListExpanded ? '접기' : '더보기'}
                  </Text>
                  {isCalendarExpenseListExpanded ? (
                    <UpIcon width={22} height={22} />
                  ) : (
                    <DownIcon width={22} height={22} />
                  )}
                </Pressable>
              )}
                </View>
              </View>
            </View>
          )}

          {/* 지출 탭 */}
          {selectedTab === 'expense' && (
            <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
              {/* 카테고리 탭 */}
              <View style={{ paddingLeft: 20, paddingVertical: 32 }}>
                <CategoryTab
                  selected={selectedCategory}
                  onSelect={(key) => {
                    setSelectedCategory(key);
                    setIsExpenseListExpanded(false);
                  }}
                  categories={apiCategoryItems}
                />
              </View>

              {/* 타이틀 */}
              <View style={{ paddingHorizontal: 20 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h3Bold,
                      color: colors.coolNeutral[90],
                    }}
                  >
                    {selectedCategoryLabel}
                  </Text>
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.h3Bold,
                      color: colors.primary[50],
                    }}
                  >
                    {totalCount}건
                  </Text>
                </View>
              </View>

              {/* 리스트 */}
              <View style={{ backgroundColor: colors.coolNeutral[10] }}>
                {isLoading ? (
                  <View style={{ paddingVertical: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary[50]} />
                  </View>
                ) : error ? (
                  <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Medium,
                        color: colors.coolNeutral[60],
                        textAlign: 'center',
                      }}
                    >
                      {error}
                    </Text>
                  </View>
                ) : expenseItems.length === 0 ? (
                  <View style={{ paddingHorizontal: 20, paddingVertical: 40, alignItems: 'center' }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body2Medium,
                        color: colors.coolNeutral[60],
                        textAlign: 'center',
                      }}
                    >
                      지출 내역이 없습니다.
                    </Text>
                  </View>
                ) : (
                  displayedExpenseItems.map((item, idx) => {
                    const isLast = idx === displayedExpenseItems.length - 1;
                    const categoryLabelMap: Record<Exclude<CategoryKey, 'ALL'>, string> = {
                      FUEL: '주유비',
                      PARKING: '주차비',
                      REPAIR: '정비·수리비',
                      TOLL: '통행료',
                      CAR_WASH: '세차비',
                      INSURANCE: '보험료',
                      ACCESSORY: '자동차 용품비',
                    };
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => handleExpensePress(item.id)}
                        accessibilityRole="button"
                        accessibilityLabel={`expense-${item.id}`}
                        style={{
                          paddingHorizontal: 20,
                          paddingVertical: 16,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          ...(isLast
                            ? {}
                            : {
                                borderBottomWidth: 1,
                                borderBottomColor: colors.coolNeutral[30],
                              }),
                        }}
                      >
                        {/* 썸네일 */}
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: borderRadius.full,
                            backgroundColor: colors.background.default,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {item.category === 'FUEL' && <OilingIcon width={24} height={24} />}
                          {item.category === 'PARKING' && <ParkingIcon width={24} height={24} />}
                          {item.category === 'INSURANCE' && <InsuranceIcon width={24} height={24} />}
                          {item.category === 'TOLL' && <TollIcon width={24} height={24} />}
                          {item.category === 'REPAIR' && <MaintenanceIcon width={24} height={24} />}
                          {item.category === 'CAR_WASH' && <CarwashIcon width={24} height={24} />}
                          {item.category === 'ACCESSORY' && <ExpendablesIcon width={24} height={24} />}
                        </View>

                        {/* 본문 */}
                        <View style={{ flex: 1, gap: 6 }}>
                          <View
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Text
                              numberOfLines={1}
                              style={{
                                flex: 1,
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Semibold,
                                color: colors.coolNeutral[90],
                              }}
                            >
                              {item.title}
                            </Text>

                            <GRightIcon width={24} height={24} />
                          </View>

                          <View style={{ gap: 4 }}>
                            {item.carInfo && (
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                <GCarIcon width={14} height={14} />
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionSemibold,
                                    color: colors.coolNeutral[40],
                                  }}
                                >
                                  {item.carInfo}
                                </Text>
                              </View>
                            )}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              {/* 메모(왼쪽) + 금액(오른쪽) 같은 줄 */}
                              {item.note ? (
                                <Text
                                  numberOfLines={1}
                                  style={{
                                    flex: 1,
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionMedium,
                                    color: colors.primary[30],
                                  }}
                                >
                                  {item.note}
                                </Text>
                              ) : (
                                <View style={{ flex: 1 }} />
                              )}

                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body2Bold,
                                  color: colors.primary[50],
                                }}
                              >
                                {item.amount.toLocaleString('ko-KR')}원
                              </Text>
                            </View>

                            {/* 날짜 + 카테고리 */}
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'flex-end',
                                justifyContent: 'space-between',
                              }}
                            >
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.captionMedium,
                                  color: colors.coolNeutral[40],
                                }}
                              >
                                {categoryLabelMap[item.category]}
                              </Text>
                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.captionMedium,
                                  color: colors.coolNeutral[40],
                                }}
                              >
                                {item.date}
                              </Text>

                            </View>
                          </View>
                        </View>
                      </Pressable>
                    );
                  })
                )}
              </View>

              {expenseItems.length > 5 && (
                <Pressable
                  onPress={() => setIsExpenseListExpanded((v) => !v)}
                  accessibilityRole="button"
                  accessibilityLabel="expense-list-toggle"
                  style={{
                    backgroundColor: colors.coolNeutral[10],
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingVertical: 16,
                    flexDirection: 'row',
                    borderTopWidth: 1,
                    borderTopColor: colors.coolNeutral[30],
                  }}
                >
                  <Text
                    style={{
                      fontFamily: typography.fontFamily.pretendard,
                      ...typography.styles.body3Medium,
                      color: colors.coolNeutral[50],
                    }}
                  >
                    {isExpenseListExpanded ? '접기' : '더보기'}
                  </Text>
                  {isExpenseListExpanded ? (
                    <UpIcon width={22} height={22} />
                  ) : (
                    <DownIcon width={22} height={22} />
                  )}
                </Pressable>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* 플로팅 지출 추가 버튼 (캘린더 날짜 선택 + 지출내역 없음일 때만 숨김) */}
      {!(selectedTab === 'calendar' && isDaySelected && calendarExpenseItems.length === 0) && (
        <Pressable
          onPress={
            selectedTab === 'calendar' && isDaySelected
              ? () => openAddExpenseWithDate(selectedDateString)
              : openCarSelect
          }
          accessibilityRole="button"
          accessibilityLabel="지출내역 추가"
          style={{
            position: 'absolute',
            right: 20,
            bottom: 100,
            zIndex: 100,
            // 그림자 (iOS)
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.18,
            shadowRadius: 8,
            // 그림자 (Android)
            elevation: 6,
          }}
        >
          <BPlusIcon width={56} height={56} />
        </Pressable>
      )}

      {/* 하단 네비게이션 영역은 흰 배경으로 가로 꽉 채움(좌우 빈공간 방지) */}
      <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
        <View style={{  }}>
          <NavigationBar
            active="coin"
            showBorder
            onPress={(tab) => {
              const to =
                tab === 'home'
                  ? '/home'
                  : tab === 'car'
                    ? '/car'
                    : tab === 'coin'
                      ? '/coin'
                      : tab === 'store'
                        ? '/store'
                        : '/user';
              router.push(to);
            }}
          />
        </View>
      </View>

      {/* 지출 추가 완료 토스트 */}
      <Toast
        visible={isExpenseToastVisible}
        message="지출내역이 추가되었어요!"
        actionLabel="보러가기"
        onAction={() => {
          setSelectedTab('expense');
          setSelectedCategory('ALL');
        }}
        onDismiss={() => setIsExpenseToastVisible(false)}
        duration={5000}
      />
    </SafeAreaView>
  );
}

