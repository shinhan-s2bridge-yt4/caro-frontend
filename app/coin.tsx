import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import CategoryTab from '@/components/common/Category/CategoryTab';
import type { CategoryKey } from '@/constants/categories';
import { CarSelectModal } from '@/components/coin/modals/CarSelectModal';
import { DatePickerModal } from '@/components/coin/modals/DatePickerModal';
import { ExpenseDetailModal } from '@/components/coin/modals/ExpenseDetailModal';
import { ExpenseFormModal } from '@/components/coin/modals/ExpenseFormModal';
import { CoinBottomSection } from '@/components/coin/sections/CoinBottomSection';
import { CoinCalendarSection } from '@/components/coin/sections/CoinCalendarSection';
import { CoinExpenseSection } from '@/components/coin/sections/CoinExpenseSection';
import { CoinHeaderSummarySection } from '@/components/coin/sections/CoinHeaderSummarySection';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useProfileStore } from '@/stores/profileStore';
import { useMyCarStore } from '@/stores/myCarStore';
import type { Expense, ExpenseCategory } from '@/types/expense';
import type { PrimaryCar } from '@/types/profile';
import { useCoinExpenseData } from '@/hooks/coin/useCoinExpenseData';
import { useCoinExpenseSubmit } from '@/hooks/coin/useCoinExpenseSubmit';
import { getTabRoute } from '@/utils/navigation';
import {
  formatYearMonthKorean,
  toDotYmd,
  toYearMonth,
  toYmd,
} from '@/utils/date';

import { performOcr } from '@/services/ocrService';

import DownIcon from '@/assets/icons/DownIcon.svg';
import UpIcon from '@/assets/icons/UpIcon.svg';
import LeftIcon from '@/assets/icons/LeftIcon.svg';
import RightIcon from '@/assets/icons/RightIcon.svg';
import GRightIcon from '@/assets/icons/GRightIcon.svg';
import GCarIcon from '@/assets/icons/gcar.svg';
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
  return toYmd(Number(year), Number(month), Number(day));
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

  const openAddExpenseModal = () => {
    requestAnimationFrame(() => setIsAddExpenseOpen(true));
  };

  const closeCarSelectModal = () => {
    setIsCarSelectOpen(false);
  };

  const openCarSelectModal = () => {
    if (accessToken) {
      loadMyCars();
    }
    setIsCarSelectOpen(true);
  };

  const closeAddExpenseModal = (options?: { resetForm?: boolean; clearEditing?: boolean }) => {
    setIsAddExpenseOpen(false);
    if (options?.resetForm) {
      resetAddExpenseForm();
    }
    if (options?.clearEditing) {
      setEditingExpenseId(null);
    }
  };

  const closeDatePicker = () => {
    setIsDatePickerOpen(false);
    if (restoreAddExpenseAfterDatePicker) {
      setRestoreAddExpenseAfterDatePicker(false);
      openAddExpenseModal();
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

  const { refreshExpenseData } = useCoinExpenseData({
    accessToken,
    selectedTab: selectedTab as 'calendar' | 'expense',
    selectedCategory,
    calendarSelectedCategory,
    currentYear,
    currentMonthIndex,
    categoriesLength: categories.length,
    addCategory,
    setAddCategory,
    fetchExpenses,
    fetchSummary,
    fetchCategories,
    mapUiCategoryToApi,
    categories,
  });

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
    const prefix = toYearMonth(currentYear, currentMonthIndex + 1);
    
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

  const summaryStartYearMonthLabel = useMemo(() => {
    if (!summary?.period?.startDate) return null;
    const [y, m] = summary.period.startDate.split('-');
    return `${y}년 ${String(Number(m))}월`;
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
    return formatYearMonthKorean(currentYear, currentMonthIndex + 1);
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
    return toYmd(currentYear, currentMonthIndex + 1, selectedDay);
  }, [currentYear, currentMonthIndex, selectedDay]);

  const selectedDateLabel = useMemo(() => {
    return toDotYmd(currentYear, currentMonthIndex + 1, selectedDay);
  }, [currentYear, currentMonthIndex, selectedDay]);

  // 해당 달의 모든 지출
  const calendarMonthExpenseItems = useMemo<ExpenseItem[]>(() => {
    const prefix = toYearMonth(currentYear, currentMonthIndex + 1);
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
    openCarSelectModal();
  };

  // 차량 선택 후 지출 추가 폼으로 이동
  const handleCarSelected = (car: PrimaryCar) => {
    setSelectedCar(car);
    closeCarSelectModal();
    openAddExpenseModal();
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
    closeAddExpenseModal();
    openCarSelectModal();
  };

  const handleSubmitExpense = useCoinExpenseSubmit({
    isAddEnabled,
    accessToken,
    selectedCar,
    addDate,
    addAmount,
    addCategory,
    addPlace,
    addMemo,
    editingExpenseId,
    isUpdating,
    isCreating,
    parseKoreanDateToIso,
    updateExpense,
    createExpense,
    getUpdateError: () => useExpenseStore.getState().updateError,
    getCreateError: () => useExpenseStore.getState().createError,
    closeAddExpenseModal,
    refreshExpenseData,
    setIsExpenseToastVisible,
  });

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.background.default }}
    >
      <ExpenseDetailModal
        visible={isDetailModalVisible}
        detailExpense={detailExpense}
        myCars={myCars}
        onClose={() => setIsDetailModalVisible(false)}
        onEdit={(expense) => {
          setIsDetailModalVisible(false);
          const [y, m, d] = expense.expenseDate.split('-').map(Number);
          setAddDate(formatKoreanDateLabel(y, m, d));
          setPickedYear(y);
          setPickedMonth(m);
          setPickedDay(d);
          setAddAmount(expense.amount.toLocaleString('ko-KR'));
          setAddPlace(expense.location || '');
          setAddMemo(expense.memo || '');
          setAddCategory(expense.category);
          setEditingExpenseId(expense.id);
          const matched = myCars.find((c) => c.id === expense.memberCar?.id);
          if (matched) {
            setSelectedCar(matched);
          }
          openAddExpenseModal();
        }}
      />

      <CarSelectModal
        visible={isCarSelectOpen}
        isLoading={isCarsLoading}
        cars={myCars}
        selectedCar={selectedCar}
        onClose={closeCarSelectModal}
        onSelectCar={handleCarSelected}
      />

      <ExpenseFormModal
        visible={isAddExpenseOpen}
        editingExpenseId={editingExpenseId}
        selectedCar={selectedCar}
        categories={categories}
        addCategory={addCategory}
        addDate={addDate}
        addAmount={addAmount}
        addPlace={addPlace}
        addMemo={addMemo}
        isAddEnabled={isAddEnabled}
        isCreating={isCreating}
        isUpdating={isUpdating}
        isOcrLoading={isOcrLoading}
        onDismiss={() => closeAddExpenseModal({ clearEditing: true })}
        onClose={() => closeAddExpenseModal({ resetForm: true, clearEditing: true })}
        onReceiptPress={handleReceiptPress}
        onChangeCarFromForm={handleChangeCarFromForm}
        onOpenDatePicker={openDatePicker}
        onSelectCategory={setAddCategory}
        onChangeAmount={setAddAmount}
        onChangePlace={setAddPlace}
        onChangeMemo={setAddMemo}
        onSubmit={handleSubmitExpense}
      />

      <DatePickerModal
        visible={isDatePickerOpen}
        closeDatePicker={closeDatePicker}
        pickedDateLabel={pickedDateLabel}
        pickedYear={pickedYear}
        pickedMonth={pickedMonth}
        pickedDay={pickedDay}
        dayCountInPickedMonth={dayCountInPickedMonth}
        setPickedYear={setPickedYear}
        setPickedMonth={setPickedMonth}
        setPickedDay={setPickedDay}
        setAddDate={setAddDate}
        yearListRef={yearListRef}
        monthListRef={monthListRef}
        dayListRef={dayListRef}
      />

      <ScrollView
        style={{ flex: 1, width: '100%' }}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'stretch',
          paddingBottom: 80,
        }}
      >
        <View style={{ width: '100%', flex: 1, gap: 32 }}>
          <CoinHeaderSummarySection
            tabs={tabs}
            selectedTab={selectedTab}
            onTabChange={setSelectedTab}
            isMonthlySummaryExpanded={isMonthlySummaryExpanded}
            onToggleMonthlySummary={() => setIsMonthlySummaryExpanded((v) => !v)}
            isSummaryLoading={isSummaryLoading}
            summaryMonthLabel={summaryMonthLabel}
            summaryTotalAmountLabel={summaryTotalAmountLabel}
            summaryPeriodLabel={summaryPeriodLabel}
            summaryStartYearMonthLabel={summaryStartYearMonthLabel}
            summaryDifferenceLabel={summaryDifferenceLabel}
            summaryDifferenceValue={summary?.totalAmount?.comparison?.difference ?? null}
            summaryCategoryItems={summaryCategoryItems}
            onBack={() => router.back()}
            onAddExpense={openCarSelect}
          />

          {selectedTab === 'calendar' && (
            <CoinCalendarSection
              calendarHeaderLabel={calendarHeaderLabel}
              goPrevMonth={goPrevMonth}
              goNextMonth={goNextMonth}
              weekdays={WEEKDAYS}
              calendarCellSize={calendarCellSize}
              calendarCells={calendarCells}
              selectedDay={selectedDay}
              isDaySelected={isDaySelected}
              onSelectDay={(day) => {
                setSelectedDay(day);
                setIsDaySelected(true);
              }}
              calendarSelectedCategory={calendarSelectedCategory}
              onSelectCalendarCategory={(key) => {
                setCalendarSelectedCategory(key);
                setIsCalendarExpenseListExpanded(false);
              }}
              apiCategoryItems={apiCategoryItems}
              selectedDateLabel={selectedDateLabel}
              calendarMonthExpenseItemsLength={calendarMonthExpenseItems.length}
              isLoading={isLoading}
              error={error}
              calendarExpenseItems={calendarExpenseItems}
              displayedCalendarExpenseItems={displayedCalendarExpenseItems}
              onExpensePress={handleExpensePress}
              selectedDateString={selectedDateString}
              onAddExpenseWithDate={openAddExpenseWithDate}
              isCalendarExpenseListExpanded={isCalendarExpenseListExpanded}
              onToggleCalendarExpenseList={() => setIsCalendarExpenseListExpanded((v) => !v)}
            />
          )}

          {selectedTab === 'expense' && (
            <CoinExpenseSection
              selectedCategory={selectedCategory}
              onSelectCategory={(key) => {
                setSelectedCategory(key);
                setIsExpenseListExpanded(false);
              }}
              apiCategoryItems={apiCategoryItems}
              selectedCategoryLabel={selectedCategoryLabel}
              totalCount={totalCount}
              isLoading={isLoading}
              error={error}
              expenseItems={expenseItems}
              displayedExpenseItems={displayedExpenseItems}
              onExpensePress={handleExpensePress}
              isExpenseListExpanded={isExpenseListExpanded}
              onToggleExpenseList={() => setIsExpenseListExpanded((v) => !v)}
            />
          )}
        </View>
      </ScrollView>

      <CoinBottomSection
        selectedTab={selectedTab}
        isDaySelected={isDaySelected}
        calendarExpenseItemsLength={calendarExpenseItems.length}
        selectedDateString={selectedDateString}
        isExpenseToastVisible={isExpenseToastVisible}
        onOpenAddExpenseWithDate={openAddExpenseWithDate}
        onOpenCarSelect={openCarSelect}
        onNavigateTab={(tab) => router.push(getTabRoute(tab))}
        onToastGoToExpense={() => {
          setSelectedTab('expense');
          setSelectedCategory('ALL');
        }}
        onDismissToast={() => setIsExpenseToastVisible(false)}
      />
    </SafeAreaView>
  );
}

