import { View } from 'react-native';
import { colors, borderRadius } from '@/theme';

interface ProgressBarProps {
  total?: number;
  activeIndex?: number;
}

const ProgressBar = ({
  total = 5,
  activeIndex = 0,
}: ProgressBarProps) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        gap: 6, // ✅ gap은 부모에
      }}
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index <= activeIndex;

        return (
          <View
            key={index}
            style={{
              width: 62.2,
              height: 4,
              borderRadius: borderRadius.full ?? 999,
              backgroundColor: isActive
                ? colors.primary[50]
                : colors.background.default,
            }}
          />
        );
      })}
    </View>
  );
};

export default ProgressBar;
