import { View, Text, Pressable, ScrollView } from 'react-native';
import { CATEGORIES, CategoryKey } from '@/constants/categories';
import { colors, typography, borderRadius } from '@/theme';

type CategoryItem<T extends string = CategoryKey> = {
  key: T;
  label: string;
};

interface CategoryProps<T extends string = CategoryKey> {
  selected: T;
  onSelect: (key: T) => void;
  categories?: CategoryItem<T>[];
  variant?: 'default' | 'store';
  dividerAfterIndex?: number;
}

const Category = <T extends string = CategoryKey>({ selected, onSelect, categories, variant = 'default', dividerAfterIndex }: CategoryProps<T>) => {
  const items = (categories ?? CATEGORIES) as CategoryItem<T>[];

  // variant에 따른 스타일
  const getSelectedBgColor = () => colors.primary[50];
  const getSelectedTextColor = () => colors.background.default;
  const getUnselectedBgColor = () => variant === 'store' ? colors.coolNeutral[10] : colors.background.default;
  const getUnselectedTextColor = () => variant === 'store' ? colors.coolNeutral[40] : colors.coolNeutral[40];

  const gap = variant === 'store' ? 12 : 8;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      <View style={{ flexDirection: 'row', gap, alignItems: 'center' }}>
        {items.map((category, index) => {
          const isSelected = selected === category.key;
          const showDivider = dividerAfterIndex !== undefined && index === dividerAfterIndex;

          return (
            <View key={`${category.key}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', gap }}>
              <Pressable
                onPress={() => onSelect(category.key)}
                style={{
                  height: 36,
                  paddingHorizontal: 12,
                  borderRadius: borderRadius.md,  // 12px
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected
                    ? getSelectedBgColor()        // 선택
                    : getUnselectedBgColor(),   // 미선택
                }}
              >
                <Text
                  style={{
                    fontFamily: typography.fontFamily.pretendard,
                    ...typography.styles.body2Semibold,
                    color: isSelected
                      ? getSelectedTextColor()  // 선택 글자색
                      : getUnselectedTextColor(), // 미선택 글자색
                  }}
                >
                  {category.label}
                </Text>
              </Pressable>
              {showDivider && (
                <View
                  style={{
                    width: 2,
                    height: 37,
                    backgroundColor: colors.coolNeutral[10],
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
};

export default Category;
