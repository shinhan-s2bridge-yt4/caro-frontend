import { useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { borderRadius, colors, typography } from '@/theme';
import { NavigationBar } from '@/components/common/Bar/NavigationBar';
import CouponTab from '@/components/common/Category/CouponTab';
import { MainButton } from '@/components/common/Button/MainButton';
import CategoryTab from '@/components/common/Category/CategoryTab';
import type { CategoryKey } from '@/constants/categories';

import ArrowLeftIcon from '../assets/icons/arrow-left.svg';
import DownIcon from '../assets/icons/DownIcon.svg';
import UpIcon from '../assets/icons/UpIcon.svg';
import GraphIcon from '../assets/icons/graphIcon.svg';
import LeftIcon from '../assets/icons/LeftIcon.svg';
import RightIcon from '../assets/icons/RightIcon.svg';
import GRightIcon from '../assets/icons/GRightIcon.svg';


const SCREEN_MAX_WIDTH = 375;

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

export default function CoinScreen() {
  const router = useRouter();

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

  const expenseByDay = useMemo(() => {
    // 스크린샷 예시 값 (임시)
    return new Map<number, { amountLabel: string; level: ExpenseLevel }>([
      [3, { amountLabel: '8만', level: 2 }],
      [5, { amountLabel: '7만', level: 2 }],
      [10, { amountLabel: '2만', level: 1 }],
      [15, { amountLabel: '7만', level: 2 }],
      [18, { amountLabel: '7만', level: 2 }],
      [20, { amountLabel: '9만', level: 2 }],
      [23, { amountLabel: '3만', level: 1 }],
      [25, { amountLabel: '7만', level: 2 }],
      [28, { amountLabel: '28만', level: 3 }],
    ]);
  }, []);

  const expenseItems = useMemo<ExpenseItem[]>(
    () => [
      {
        id: '1',
        category: 'FUEL',
        title: 'S-OIL 깨나리주유소',
        note: '현대카드로 결제했고, 무료시간 1시간',
        date: '2026-02-02',
        amount: 27000,
      },
      {
        id: '2',
        category: 'FUEL',
        title: 'GS 칼텍스 강남점',
        note: 'KT 할인 쿠폰을 사용했음',
        date: '2026-02-02',
        amount: 27000,
      },
      {
        id: '3',
        category: 'FUEL',
        title: 'SK에너지 판교점',
        note: '기름값이 근방에서 제일 싸다',
        date: '2026-02-02',
        amount: 27000,
      },
      {
        id: '4',
        category: 'PARKING',
        title: '역삼역 공영주차장',
        note: '정기권 구매',
        date: '2026-02-01',
        amount: 12000,
      },
      {
        id: '5',
        category: 'TOLL',
        title: '하이패스 통행료',
        note: '출퇴근',
        date: '2026-02-01',
        amount: 3500,
      },
      {
        id: '6',
        category: 'REPAIR',
        title: '블루핸즈',
        note: '엔진오일 교체',
        date: '2026-01-28',
        amount: 82000,
      },
    ],
    [],
  );

  const filteredExpenseItems = useMemo(() => {
    if (selectedCategory === 'ALL') return expenseItems;
    return expenseItems.filter((it) => it.category === selectedCategory);
  }, [expenseItems, selectedCategory]);

  const displayedExpenseItems = useMemo(() => {
    return isExpenseListExpanded
      ? filteredExpenseItems
      : filteredExpenseItems.slice(0, 5);
  }, [filteredExpenseItems, isExpenseListExpanded]);

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
    // 2026년 1월 (1일 = 목요일)
    const daysInMonth = 31;
    const firstDayOfWeek = 4; // 0=일 ... 4=목
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
  }, [expenseByDay]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.default }}>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
        }}
      >
        <View style={{ width: '100%', maxWidth: SCREEN_MAX_WIDTH, flex: 1 }}>
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
                ...typography.styles.body1Semibold,
                color: colors.coolNeutral[90],
              }}
            >
              지출관리
            </Text>
          </View>

          {/* 탭 + 내용 */}
          <View style={{ width: '100%', gap: 34.8 }}>
            <CouponTab
              tabs={tabs}
              selectedTab={selectedTab}
              onTabChange={setSelectedTab}
            />

            {/* 내용 */}
            <View
              style={{
                paddingBottom: 20,
                alignItems: 'center',
                gap: 36,
              }}
            >
              {/* 요약 카드 */}
              <View
                style={{
                  width: 335,
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
                        ...typography.styles.captionMedium,
                        color: colors.coolNeutral[50],
                      }}
                    >
                      전월대비
                    </Text>
                    <GraphIcon width={12} height={12} />
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.captionSemibold,
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
                  onPress={() => {}}
                  containerStyle={{ width: '100%' }}
                />
              </View>
            </View>

            {/* 캘린더 */}
            {selectedTab === 'calendar' && (
              <View
                style={{
                  width: '100%',
                  backgroundColor: colors.coolNeutral[10],
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
                      onPress={() => {}}
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
                      2026년 1월
                    </Text>

                    <Pressable
                      onPress={() => {}}
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
                              ...typography.styles.captionMedium,
                              color: colors.coolNeutral[40],
                            }}
                          >
                            {w}
                          </Text>
                        </View>
                      ))}
                    </View>

                    {/* 날짜 그리드 */}
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 2 }}>
                      {calendarCells.map((cell) => {
                        const isSelected = !!cell.day && cell.day === selectedDay;
                        const hasDay = !!cell.day;
                        const dateColor = isSelected
                          ? colors.coolNeutral[90]
                          : cell.amountLabel
                            ? colors.coolNeutral[90]
                            : colors.coolNeutral[40];
                        const amountColor = colors.primary[50];

                        return (
                          <Pressable
                            key={cell.key}
                            disabled={!hasDay}
                            onPress={() => hasDay && setSelectedDay(cell.day!)}
                            style={{
                              width: `${100 / 7}%`,
                              height: 64,
                              alignItems: 'center',
                              justifyContent: 'flex-start',
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
                                      ...(isSelected
                                        ? typography.styles.body2Bold
                                        : typography.styles.body3Medium),
                                      color: dateColor,
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
                                    ...typography.styles.captionMedium,
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

                {/* 범례 */}
                <View style={{ marginTop: 14 }}>
                  <View
                    style={{
                      height: 1,
                      backgroundColor: colors.coolNeutral[30],
                      opacity: 0.6,
                    }}
                  />

                  <View style={{ paddingTop: 17, gap: 12 }}>
                    <Text
                      style={{
                        fontFamily: typography.fontFamily.pretendard,
                        ...typography.styles.captionMedium,
                        color: colors.coolNeutral[40],
                      }}
                    >
                      지출 범위
                    </Text>

                    <View style={{ flexDirection: 'row', gap: 20 }}>
                      {[
                        { label: '~1만', color: '#93C5FD' },
                        { label: '~5만', color: '#60A5FA' },
                        { label: '~10만', color: '#3B82F6' },
                        { label: '10만+', color: '#1E40AF' },
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
                              ...typography.styles.captionMedium,
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

              {/* 지출 탭(임시 영역) */}
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
                        1월 {selectedCategoryLabel}
                      </Text>
                      <Text
                        style={{
                          fontFamily: typography.fontFamily.pretendard,
                          ...typography.styles.h3Bold,
                          color: colors.primary[50],
                        }}
                      >
                        {filteredExpenseItems.length}건
                      </Text>
                    </View>
                  </View>

                  {/* 리스트 */}
                  <View style={{ backgroundColor: colors.coolNeutral[10] }}>
                    {displayedExpenseItems.map((item, idx) => {
                      const isLast = idx === displayedExpenseItems.length - 1;
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
                                  ...typography.styles.body3Semibold,
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
                                    ...typography.styles.captionMedium,
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
                                    ...typography.styles.captionMedium,
                                    color: colors.coolNeutral[40],
                                  }}
                                >
                                  {item.date}
                                </Text>

                                <Text
                                  style={{
                                    fontFamily: typography.fontFamily.pretendard,
                                    ...typography.styles.captionMedium,
                                    color: colors.coolNeutral[40],
                                  }}
                                >
                                  {selectedCategoryLabel}
                                </Text>
                              </View>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                  </View>

                  {filteredExpenseItems.length > 5 && (
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
          </View>
        </View>
      </ScrollView>

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
    </SafeAreaView>
  );
}

