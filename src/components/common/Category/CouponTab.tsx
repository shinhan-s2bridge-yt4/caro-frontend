import { View, Text, Pressable } from 'react-native';
import { colors, typography } from '@/theme';

interface Tab {
  id: string;
  label: string;
}

interface CouponTabProps {
  tabs: Tab[];
  selectedTab: string;
  onTabChange: (tabId: string) => void;
}

const CouponTab = ({ tabs, selectedTab, onTabChange }: CouponTabProps) => {
  return (
    <View
      style={{
        borderBottomWidth: 0.8,
        borderBottomColor: colors.coolNeutral[30],
        paddingHorizontal: 12,
        gap: 4,
        width:375,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          gap: 4,
        }}
      >
        {tabs.map((tab) => {
          const isSelected = selectedTab === tab.id;

          return (
            <Pressable
              key={tab.id}
              onPress={() => onTabChange(tab.id)}
              style={{
                width: 109,
                flex: 1,
                padding: 12,
                borderBottomWidth: 1.8,
                borderBottomColor: isSelected
                  ? colors.coolNeutral[70]      // 선택: 보라색
                  : 'transparent',          // 미선택: 투명
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: typography.fontFamily.pretendard,
                  ...typography.styles.body2Bold, // 적절한 타이포 선택
                  color: isSelected
                    ? colors.coolNeutral[70]  // 선택: 진흰색
                    : colors.coolNeutral[40], // 미선택: 연회색
                }}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

export default CouponTab;