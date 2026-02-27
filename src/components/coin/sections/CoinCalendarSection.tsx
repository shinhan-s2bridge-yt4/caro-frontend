import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import CategoryTab from '@/components/common/Category/CategoryTab';
import type { CategoryKey } from '@/constants/categories';
import LeftIcon from '@/assets/icons/LeftIcon.svg';
import RightIcon from '@/assets/icons/RightIcon.svg';
import GRightIcon from '@/assets/icons/GRightIcon.svg';
import GCarIcon from '@/assets/icons/gcar.svg';
import DownIcon from '@/assets/icons/DownIcon.svg';
import UpIcon from '@/assets/icons/UpIcon.svg';
import BPlusIcon from '@/assets/icons/bplus.svg';
import OilingIcon from '@/assets/icons/oiling.svg';
import ParkingIcon from '@/assets/icons/parking.svg';
import InsuranceIcon from '@/assets/icons/insurance.svg';
import TollIcon from '@/assets/icons/toll.svg';
import MaintenanceIcon from '@/assets/icons/maintenance.svg';
import CarwashIcon from '@/assets/icons/carwash.svg';
import ExpendablesIcon from '@/assets/icons/expendables.svg';

type CalendarCell = {
  key: string;
  day?: number;
  amountLabel?: string;
  amountColor?: string;
};

type ExpenseItem = {
  id: string;
  category: Exclude<CategoryKey, 'ALL'>;
  title: string;
  note?: string;
  date: string;
  amount: number;
  carInfo?: string;
};

interface CoinCalendarSectionProps {
  calendarHeaderLabel: string;
  goPrevMonth: () => void;
  goNextMonth: () => void;
  weekdays: readonly string[];
  calendarCellSize: number;
  calendarCells: CalendarCell[];
  selectedDay: number;
  isDaySelected: boolean;
  onSelectDay: (day: number) => void;
  calendarSelectedCategory: CategoryKey;
  onSelectCalendarCategory: (key: CategoryKey) => void;
  apiCategoryItems:
    | {
        key: CategoryKey;
        label: string;
      }[]
    | undefined;
  selectedDateLabel: string;
  calendarMonthExpenseItemsLength: number;
  isLoading: boolean;
  error: string | null;
  calendarExpenseItems: ExpenseItem[];
  displayedCalendarExpenseItems: ExpenseItem[];
  onExpensePress: (id: string) => void;
  selectedDateString: string;
  onAddExpenseWithDate: (date: string) => void;
  isCalendarExpenseListExpanded: boolean;
  onToggleCalendarExpenseList: () => void;
}

const CATEGORY_LABEL_MAP: Record<Exclude<CategoryKey, 'ALL'>, string> = {
  FUEL: '주유비',
  PARKING: '주차비',
  REPAIR: '정비·수리비',
  TOLL: '통행료',
  CAR_WASH: '세차비',
  INSURANCE: '보험료',
  ACCESSORY: '자동차 용품비',
};

export function CoinCalendarSection({
  calendarHeaderLabel,
  goPrevMonth,
  goNextMonth,
  weekdays,
  calendarCellSize,
  calendarCells,
  selectedDay,
  isDaySelected,
  onSelectDay,
  calendarSelectedCategory,
  onSelectCalendarCategory,
  apiCategoryItems,
  selectedDateLabel,
  calendarMonthExpenseItemsLength,
  isLoading,
  error,
  calendarExpenseItems,
  displayedCalendarExpenseItems,
  onExpensePress,
  selectedDateString,
  onAddExpenseWithDate,
  isCalendarExpenseListExpanded,
  onToggleCalendarExpenseList,
}: CoinCalendarSectionProps) {
  return (
    <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
      <View style={{ width: '100%', paddingVertical: 24, paddingHorizontal: 20 }}>
        <View style={{ gap: 24 }}>
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
              style={{ width: 40, height: 40, padding: 8, alignItems: 'center', justifyContent: 'center' }}
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
            <View style={{ flexDirection: 'row' }}>
              {weekdays.map((w) => (
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
                      if (hasDay) onSelectDay(cell.day!);
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

      <View style={{ gap: 20, backgroundColor: colors.background.default }}>
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

        <View style={{ backgroundColor: colors.coolNeutral[10] }}>
          <View style={{ paddingLeft: 20, paddingVertical: 32 }}>
            <CategoryTab
              selected={calendarSelectedCategory}
              onSelect={onSelectCalendarCategory}
              categories={apiCategoryItems}
            />
          </View>

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
                    {calendarMonthExpenseItemsLength}건
                  </Text>
                </>
              )}
            </View>
          </View>

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
                    onPress={() => onAddExpenseWithDate(selectedDateString)}
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
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => onExpensePress(item.id)}
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
                            {CATEGORY_LABEL_MAP[item.category]}
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
              onPress={onToggleCalendarExpenseList}
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
  );
}
