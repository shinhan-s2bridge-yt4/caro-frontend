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
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import CouponTab from '@/components/common/Category/CouponTab';
import { MainButton } from '@/components/common/Button/MainButton';
import CategoryTab from '@/components/common/Category/CategoryTab';
import type { CategoryKey } from '@/constants/categories';
import TextInput from '@/components/common/Input/TextInput';
import NumberInput from '@/components/common/Input/NumberInput';
import { useAuthStore } from '@/stores/authStore';
import { useExpenseStore } from '@/stores/expenseStore';
import { useProfileStore } from '@/stores/profileStore';
import type { ExpenseCategory } from '@/types/expense';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import DownIcon from '../assets/icons/DownIcon.svg';
import UpIcon from '../assets/icons/UpIcon.svg';
import GraphIcon from '../assets/icons/graphIcon.svg';
import LeftIcon from '../assets/icons/LeftIcon.svg';
import RightIcon from '../assets/icons/RightIcon.svg';
import GRightIcon from '../assets/icons/GRightIcon.svg';
import XIcon from '../assets/icons/x_icon.svg';
import CameraIcon from '../assets/icons/camera.svg';
import BCarIcon from '../assets/icons/bcar.svg';


const SCREEN_MAX_WIDTH = 375;
const CALENDAR_CELL_SIZE = 46.141;
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
};

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'] as const;

type ExpenseItem = {
  id: string;
  category: Exclude<CategoryKey, 'ALL'>;
  title: string;
  note?: string;
  date: string; // YYYY-MM-DD
  amount: number; // won
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
  const accessToken = useAuthStore((s) => s.accessToken);
  const { primaryCar } = useProfileStore();
  const {
    expenses,
    totalCount,
    isLoading,
    error,
    fetchExpenses,
    createExpense,
    isCreating,
    createError,
    categories,
    fetchCategories,
  } = useExpenseStore();

  const tabs = useMemo(
    () => [
      { id: 'calendar', label: '캘린더' },
      { id: 'expense', label: '지출' },
    ],
    [],
  );

  const [selectedTab, setSelectedTab] = useState<string>(tabs[0]?.id ?? 'calendar');
  const [selectedDay, setSelectedDay] = useState<number>(28);
  const [isMonthlySummaryExpanded, setIsMonthlySummaryExpanded] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('ALL');
  const [isExpenseListExpanded, setIsExpenseListExpanded] = useState<boolean>(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState<boolean>(false);
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(0); // 0=1월

  const [initialKst] = useState(() => getKstTodayParts());

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

  const handleReceiptCameraPress = async () => {
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
      });

      if (result.canceled) return;

      // TODO: OCR 연동 시 여기서 result.assets[0].uri 사용
      // 지금은 촬영만 가능하게 하고, 값 저장/업로드는 이후 연결
    } catch {
      // 권한/카메라 실행 실패 시 조용히 무시(추후 토스트 연결 가능)
    }
  };

  const handleReceiptLibraryPress = async () => {
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: false,
        selectionLimit: 1,
      });

      if (result.canceled) return;

      // TODO: OCR 연동 시 여기서 result.assets[0].uri 사용
    } catch {
      // 권한/갤러리 실행 실패 시 조용히 무시(추후 토스트 연결 가능)
    }
  };

  const handleReceiptPress = () => {
    Alert.alert('영수증 추가', '가져올 방법을 선택해주세요.', [
      { text: '촬영하기', onPress: () => void handleReceiptCameraPress() },
      { text: '갤러리', onPress: () => void handleReceiptLibraryPress() },
      { text: '취소', style: 'cancel' },
    ]);
  };

  const expenseByMonth = useMemo(() => {
    // 스크린샷 예시 값 (임시) - 2026-01만 채워둠
    return new Map<string, Map<number, { amountLabel: string; level: ExpenseLevel }>>([
      [
        '2026-01',
        new Map<number, { amountLabel: string; level: ExpenseLevel }>([
          [3, { amountLabel: '8만', level: 2 }],
          [5, { amountLabel: '7만', level: 2 }],
          [10, { amountLabel: '2만', level: 1 }],
          [15, { amountLabel: '7만', level: 2 }],
          [18, { amountLabel: '7만', level: 2 }],
          [20, { amountLabel: '9만', level: 2 }],
          [23, { amountLabel: '3만', level: 1 }],
          [25, { amountLabel: '7만', level: 2 }],
          [28, { amountLabel: '28만', level: 3 }],
        ]),
      ],
    ]);
  }, []);

  const expenseByDay = useMemo(() => {
    const mm = String(currentMonthIndex + 1).padStart(2, '0');
    const key = `${currentYear}-${mm}`;
    return expenseByMonth.get(key) ?? new Map<number, { amountLabel: string; level: ExpenseLevel }>();
  }, [currentYear, currentMonthIndex, expenseByMonth]);

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
  };

  // API 데이터를 UI 형식으로 변환
  const expenseItems = useMemo<ExpenseItem[]>(() => {
    return expenses.map((expense) => ({
      id: String(expense.id),
      category: mapApiCategoryToUi(expense.category),
      title: expense.location || expense.categoryLabel,
      note: expense.memo || undefined,
      date: expense.expenseDate,
      amount: expense.amount,
    }));
  }, [expenses]);

  const displayedExpenseItems = useMemo(() => {
    return isExpenseListExpanded
      ? expenseItems
      : expenseItems.slice(0, 5);
  }, [expenseItems, isExpenseListExpanded]);

  const selectedCategoryLabel = useMemo(() => {
    const map: Record<CategoryKey, string> = {
      ALL: '전체',
      FUEL: '주유비',
      PARKING: '주차비',
      REPAIR: '정비·수리비',
      TOLL: '통행료',
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
      });
    }

    // 7열 그리드 마지막 줄 정렬용
    while (cells.length % 7 !== 0) {
      cells.push({ key: `pad-${cells.length}` });
    }

    return cells;
  }, [currentMonthIndex, currentYear, expenseByDay]);

  return (
    <SafeAreaView
      edges={['top']}
      style={{ flex: 1, backgroundColor: colors.background.default }}
    >
      <Modal
        visible={isAddExpenseOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsAddExpenseOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)' }}>
          {/* backdrop */}
          <Pressable
            onPress={() => setIsAddExpenseOpen(false)}
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
                  지출 추가
                </Text>

                <Pressable
                  onPress={() => {
                    setIsAddExpenseOpen(false);
                    resetAddExpenseForm();
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
                      }}
                    >
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
                      {/* 선택한 차량(하드코딩) */}
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

                        <View
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
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                            <BCarIcon width={20} height={20} />

                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Semibold,
                                color: colors.primary[50],
                              }}
                            >
                              {primaryCar?.modelName ?? '차량 없음'}
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
                              {primaryCar?.registrationNumber ?? '-'}
                            </Text>
                          </View>

                          <View
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: borderRadius.full,
                              backgroundColor: colors.coolNeutral[10],
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Text
                              style={{
                                fontFamily: typography.fontFamily.pretendard,
                                ...typography.styles.body2Bold,
                                color: colors.primary[50],
                              }}
                            >
                              ✓
                            </Text>
                          </View>
                        </View>
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

                    <View style={{ flexDirection: 'row', gap: 12, flexWrap: 'wrap' }}>
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
                      disabled={!isAddEnabled || isCreating || !primaryCar}
                      onPress={async () => {
                        if (!isAddEnabled || isCreating || !accessToken || !primaryCar) return;
                        
                        const expenseDate = parseKoreanDateToIso(addDate);
                        
                        if (!expenseDate) {
                          Alert.alert('오류', '날짜가 올바르지 않습니다.');
                          return;
                        }

                        const requestData = {
                          memberCarId: primaryCar.id,
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
                          // 지출 목록 새로고침
                          fetchExpenses({ accessToken });
                          Alert.alert('완료', '지출 내역이 추가되었습니다.');
                        } else {
                          // 스토어에서 에러 메시지 가져와서 표시
                          const errorMsg = useExpenseStore.getState().createError || '지출 내역 추가에 실패했습니다.';
                          Alert.alert('오류', errorMsg);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: 48,
                        borderRadius: borderRadius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: (isAddEnabled && !isCreating) ? colors.primary[50] : colors.coolNeutral[20],
                      }}
                    >
                      {isCreating ? (
                        <ActivityIndicator size="small" color={colors.coolNeutral[10]} />
                      ) : (
                        <Text
                          style={{
                            fontFamily: typography.fontFamily.pretendard,
                            ...typography.styles.h3Bold,
                            color: isAddEnabled ? colors.coolNeutral[10] : colors.coolNeutral[40],
                          }}
                        >
                          추가하기
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
        }}
      >
        <View style={{ width: '100%', flex: 1 }}>
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

          {/* 탭 + 요약(캘린더 위쪽 배경만 default) */}
          <View
            style={{
              width: '100%',
              backgroundColor: colors.background.default,
              paddingBottom: 32,
              gap: 32,
            }}
          >
            <CouponTab tabs={tabs} selectedTab={selectedTab} onTabChange={setSelectedTab} />

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
                  <Text style={{ color: colors.primary[50] }}>1월</Text> 소비금액
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
                <Text
                  style={{
                    marginTop: 12,
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.h1Bold,
                    color: colors.coolNeutral[90],
                  }}
                >
                  454,000원
                </Text>
              ) : (
                <View style={{ marginTop: 16, gap: 12 }}>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.coolNeutral[30],
                      opacity: 0.6,
                    }}
                  />

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
                    <GraphIcon width={12} height={12} />
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.body3Semibold,
                        color: colors.primary[50],
                      }}
                    >
                      6,000원 줄어들었어요
                    </Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    {[
                      { label: '주유비', value: '0원' },
                      { label: '주차비', value: '0원' },
                      { label: '정비 · 수리비', value: '0원' },
                      { label: '통행료', value: '0원' },
                    ].map((item) => (
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
                      454,000원
                    </Text>
                  </View>
                </View>
              )}

              <View style={{ marginTop: 24 }}>
                <MainButton
                  label="지출내역 추가하기"
                  alwaysPrimary
                  onPress={() => setIsAddExpenseOpen(true)}
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
                    <View style={{ flexDirection: 'row', gap: 4 }}>
                      {WEEKDAYS.map((w) => (
                        <View key={w} style={{ flex: 1, alignItems: 'center' }}>
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
                        justifyContent: 'space-between',
                      }}
                    >
                      {calendarCells.map((cell) => {
                        const isSelected = !!cell.day && cell.day === selectedDay;
                        const hasDay = !!cell.day;
                        const amountColor = colors.primary[50];

                        return (
                          <Pressable
                            key={cell.key}
                            disabled={!hasDay}
                            onPress={() => hasDay && setSelectedDay(cell.day!)}
                            style={{
                              width: CALENDAR_CELL_SIZE,
                              height: CALENDAR_CELL_SIZE,
                              alignItems: 'center',
                              justifyContent: 'flex-start',
                              paddingTop: 4,
                              paddingBottom: 2,
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
                                      color: cell.amountLabel
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
                                    color: amountColor,
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

              {/* 범례 */}
              <View
                style={{
                  width: '100%',
                  paddingHorizontal: 20,
                  marginTop: 14,
                }}
              >
                <View
                  style={{
                    height: 1,
                    backgroundColor: colors.coolNeutral[30],
                    opacity: 0.6,
                  }}
                />

                <View style={{ paddingVertical: 17, gap: 12 }}>
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
            </View>
          )}

          {/* 지출 탭 */}
          {selectedTab === 'expense' && (
            <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
              {/* 카테고리 탭 */}
              <View style={{ paddingLeft: 20 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingVertical: 32 }}
                >
                  <CategoryTab
                    selected={selectedCategory}
                    onSelect={(key) => {
                      setSelectedCategory(key);
                      setIsExpenseListExpanded(false);
                    }}
                  />
                </ScrollView>
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
                    };
                    return (
                      <Pressable
                        key={item.id}
                        onPress={() => {}}
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
                          }}
                        />

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
                            <View
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                              }}
                            >
                              {/* 메모(왼쪽) + 금액(오른쪽) 같은 줄 */}
                              <Text
                                numberOfLines={1}
                                style={{
                                  flex: 1,
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body2Medium,
                                  color: item.note ? colors.primary[50] : colors.coolNeutral[40],
                                }}
                              >
                                {item.note ?? item.date}
                              </Text>

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
                                  ...typography.styles.body3Medium,
                                  color: colors.coolNeutral[40],
                                }}
                              >
                                {item.date}
                              </Text>

                              <Text
                                style={{
                                  fontFamily: typography.fontFamily.pretendard,
                                  ...typography.styles.body3Medium,
                                  color: colors.coolNeutral[40],
                                }}
                              >
                                {categoryLabelMap[item.category]}
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
    </SafeAreaView>
  );
}

