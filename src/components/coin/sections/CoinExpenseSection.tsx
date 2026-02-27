import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { borderRadius, colors, typography } from '@/theme';
import CategoryTab from '@/components/common/Category/CategoryTab';
import type { CategoryKey } from '@/constants/categories';
import GRightIcon from '@/assets/icons/GRightIcon.svg';
import GCarIcon from '@/assets/icons/gcar.svg';
import DownIcon from '@/assets/icons/DownIcon.svg';
import UpIcon from '@/assets/icons/UpIcon.svg';
import OilingIcon from '@/assets/icons/oiling.svg';
import ParkingIcon from '@/assets/icons/parking.svg';
import InsuranceIcon from '@/assets/icons/insurance.svg';
import TollIcon from '@/assets/icons/toll.svg';
import MaintenanceIcon from '@/assets/icons/maintenance.svg';
import CarwashIcon from '@/assets/icons/carwash.svg';
import ExpendablesIcon from '@/assets/icons/expendables.svg';

type ExpenseItem = {
  id: string;
  category: Exclude<CategoryKey, 'ALL'>;
  title: string;
  note?: string;
  date: string;
  amount: number;
  carInfo?: string;
};

interface CoinExpenseSectionProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (key: CategoryKey) => void;
  apiCategoryItems:
    | {
        key: CategoryKey;
        label: string;
      }[]
    | undefined;
  selectedCategoryLabel: string;
  totalCount: number;
  isLoading: boolean;
  error: string | null;
  expenseItems: ExpenseItem[];
  displayedExpenseItems: ExpenseItem[];
  onExpensePress: (id: string) => void;
  isExpenseListExpanded: boolean;
  onToggleExpenseList: () => void;
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

export function CoinExpenseSection({
  selectedCategory,
  onSelectCategory,
  apiCategoryItems,
  selectedCategoryLabel,
  totalCount,
  isLoading,
  error,
  expenseItems,
  displayedExpenseItems,
  onExpensePress,
  isExpenseListExpanded,
  onToggleExpenseList,
}: CoinExpenseSectionProps) {
  return (
    <View style={{ width: '100%', backgroundColor: colors.coolNeutral[10] }}>
      <View style={{ paddingLeft: 20, paddingVertical: 32 }}>
        <CategoryTab selected={selectedCategory} onSelect={onSelectCategory} categories={apiCategoryItems} />
      </View>

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
            return (
              <Pressable
                key={item.id}
                onPress={() => onExpensePress(item.id)}
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

      {expenseItems.length > 5 && (
        <Pressable
          onPress={onToggleExpenseList}
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
          {isExpenseListExpanded ? <UpIcon width={22} height={22} /> : <DownIcon width={22} height={22} />}
        </Pressable>
      )}
    </View>
  );
}
