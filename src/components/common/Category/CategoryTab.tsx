import { View, Text, Pressable } from 'react-native';
import { CATEGORIES, CategoryKey } from '@/constants/categories';
import { colors, typography, borderRadius } from '@/theme';

interface CategoryProps {
  selected: CategoryKey;
  onSelect: (key: CategoryKey) => void;
}

const Category = ({ selected, onSelect }: CategoryProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 12,
      }}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selected === category.key;

        return (
          <Pressable
            key={category.key}
            onPress={() => onSelect(category.key)}
            style={{
              height: 36, 
              padding: 12,
              borderRadius: borderRadius.md,  // 12px
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isSelected
                ? colors.primary[50]        // 선택
                : colors.background.default,   // 미선택
            }}
          >
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.body3Semibold,
                color: isSelected
                  ? colors.background.default  // 흰색
                  : colors.coolNeutral[40], // 회색
              }}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
};

export default Category;
