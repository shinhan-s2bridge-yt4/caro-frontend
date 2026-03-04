import { useEffect, useRef } from 'react';
import { FlatList, Modal, Pressable, Text, View } from 'react-native';
import { MainButton } from '@/components/common/Button/MainButton';
import { borderRadius, colors, typography } from '@/theme';
import XIcon from '@/assets/icons/x_icon.svg';

const DATE_WHEEL_ITEM_HEIGHT = 44;
const DATE_WHEEL_HEIGHT = 220;
const DATE_WHEEL_PADDING = (DATE_WHEEL_HEIGHT - DATE_WHEEL_ITEM_HEIGHT) / 2;
const DATE_PICKER_YEARS: number[] = [2024, 2025, 2026, 2027, 2028];
const DATE_PICKER_MONTHS: number[] = Array.from({ length: 12 }, (_, i) => i + 1);

interface CarDatePickerModalProps {
  visible: boolean;
  pickedYear: number;
  pickedMonth: number;
  onClose: () => void;
  onSetPickedYear: (value: number) => void;
  onSetPickedMonth: (value: number) => void;
  onConfirm: () => void;
}

export function CarDatePickerModal({
  visible,
  pickedYear,
  pickedMonth,
  onClose,
  onSetPickedYear,
  onSetPickedMonth,
  onConfirm,
}: CarDatePickerModalProps) {
  const yearListRef = useRef<FlatList<number> | null>(null);
  const monthListRef = useRef<FlatList<number> | null>(null);
  const yearIdxRef = useRef<number>(Math.max(0, DATE_PICKER_YEARS.indexOf(pickedYear)));
  const monthIdxRef = useRef<number>(Math.max(0, DATE_PICKER_MONTHS.indexOf(pickedMonth)));

  useEffect(() => {
    if (!visible) return;
    const yearIndex = Math.max(0, DATE_PICKER_YEARS.indexOf(pickedYear));
    const monthIndex = Math.max(0, DATE_PICKER_MONTHS.indexOf(pickedMonth));
    yearIdxRef.current = yearIndex;
    monthIdxRef.current = monthIndex;
    yearListRef.current?.scrollToIndex({ index: yearIndex, animated: false });
    monthListRef.current?.scrollToIndex({ index: monthIndex, animated: false });
  }, [visible, pickedYear, pickedMonth]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
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
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="close-date-picker"
              style={{ alignItems: 'center', justifyContent: 'center' }}
            >
              <XIcon width={24} height={24} />
            </Pressable>
          </View>

          <View style={{ gap: 24 }}>
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
                <View style={{ flex: 1, position: 'relative' }}>
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: DATE_WHEEL_PADDING,
                      height: DATE_WHEEL_ITEM_HEIGHT,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.background.default,
                    }}
                  />
                  <FlatList
                    ref={(r) => {
                      yearListRef.current = r;
                    }}
                    data={DATE_PICKER_YEARS}
                    keyExtractor={(item) => `y-${item}`}
                    showsVerticalScrollIndicator={false}
                    initialScrollIndex={Math.max(0, DATE_PICKER_YEARS.indexOf(pickedYear))}
                    initialNumToRender={DATE_PICKER_YEARS.length}
                    snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                    getItemLayout={(_, index) => ({
                      length: DATE_WHEEL_ITEM_HEIGHT,
                      offset: DATE_WHEEL_ITEM_HEIGHT * index,
                      index,
                    })}
                    style={{ height: DATE_WHEEL_HEIGHT }}
                    onScrollToIndexFailed={() => {}}
                    scrollEventThrottle={16}
                    onScroll={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                      if (idx === yearIdxRef.current) return;
                      const y = DATE_PICKER_YEARS[idx];
                      if (!y) return;
                      yearIdxRef.current = idx;
                      onSetPickedYear(y);
                    }}
                    renderItem={({ item, index }) => {
                      const selected = item === pickedYear;
                      return (
                        <Pressable
                          onPress={() => {
                            onSetPickedYear(item);
                            yearListRef.current?.scrollToIndex({ index, animated: true });
                          }}
                          style={{
                            height: DATE_WHEEL_ITEM_HEIGHT,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: borderRadius.md,
                            backgroundColor: 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Bold,
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

                <View style={{ flex: 1, position: 'relative' }}>
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      top: DATE_WHEEL_PADDING,
                      height: DATE_WHEEL_ITEM_HEIGHT,
                      borderRadius: borderRadius.md,
                      backgroundColor: colors.background.default,
                    }}
                  />
                  <FlatList
                    ref={(r) => {
                      monthListRef.current = r;
                    }}
                    data={DATE_PICKER_MONTHS}
                    keyExtractor={(item) => `m-${item}`}
                    showsVerticalScrollIndicator={false}
                    initialScrollIndex={Math.max(0, DATE_PICKER_MONTHS.indexOf(pickedMonth))}
                    initialNumToRender={DATE_PICKER_MONTHS.length}
                    snapToInterval={DATE_WHEEL_ITEM_HEIGHT}
                    decelerationRate="fast"
                    contentContainerStyle={{ paddingVertical: DATE_WHEEL_PADDING }}
                    getItemLayout={(_, index) => ({
                      length: DATE_WHEEL_ITEM_HEIGHT,
                      offset: DATE_WHEEL_ITEM_HEIGHT * index,
                      index,
                    })}
                    style={{ height: DATE_WHEEL_HEIGHT }}
                    onScrollToIndexFailed={() => {}}
                    scrollEventThrottle={16}
                    onScroll={(e) => {
                      const idx = Math.round(e.nativeEvent.contentOffset.y / DATE_WHEEL_ITEM_HEIGHT);
                      if (idx === monthIdxRef.current) return;
                      const m = DATE_PICKER_MONTHS[idx];
                      if (!m) return;
                      monthIdxRef.current = idx;
                      onSetPickedMonth(m);
                    }}
                    renderItem={({ item, index }) => {
                      const selected = item === pickedMonth;
                      return (
                        <Pressable
                          onPress={() => {
                            onSetPickedMonth(item);
                            monthListRef.current?.scrollToIndex({ index, animated: true });
                          }}
                          style={{
                            height: DATE_WHEEL_ITEM_HEIGHT,
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: borderRadius.md,
                            backgroundColor: 'transparent',
                          }}
                        >
                          <Text
                            style={{
                              fontFamily: typography.fontFamily.pretendard,
                              ...typography.styles.body2Bold,
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
              </View>
            </View>

            <MainButton
              label={`${pickedYear}년 ${pickedMonth}월 선택`}
              alwaysPrimary
              onPress={onConfirm}
              containerStyle={{ width: '100%' }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
