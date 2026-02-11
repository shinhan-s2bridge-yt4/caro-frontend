import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { colors, typography } from '@/theme';
// SVG 아이콘 임포트
import HomeIcon from '@/assets/icons/home.svg';
import CarIcon from '@/assets/icons/car.svg';
import CoinIcon from '@/assets/icons/coin.svg';
import StoreIcon from '@/assets/icons/store.svg';
import UserIcon from '@/assets/icons/user.svg';
import AHomeIcon from '@/assets/icons/a-home.svg';
import ACarIcon from '@/assets/icons/a-car.svg';
import ACoinIcon from '@/assets/icons/a-coin.svg';
import AStoreIcon from '@/assets/icons/a-store.svg';
import AUserIcon from '@/assets/icons/a-user.svg';

interface NavigationBarProps {
  active?: 'home' | 'car' | 'coin' | 'store' | 'user';
  onPress?: (tab: 'home' | 'car' | 'coin' | 'store' | 'user') => void;
  showBorder?: boolean; // 보더 표시 여부
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  active: controlledActive,
  onPress,
  showBorder = false, // 기본값 false
}) => {
  // 내부 상태 추가
  const [internalActive, setInternalActive] = useState<'home' | 'car' | 'coin' | 'store' | 'user'>('home');
  
  // controlled vs uncontrolled
  const active = controlledActive ?? internalActive;

  const tabs = [
    { key: 'home', label: '홈', Icon: HomeIcon, activeIcon: AHomeIcon },
    { key: 'car', label: '운행기록', Icon: CarIcon, activeIcon: ACarIcon },
    { key: 'coin', label: '지출관리', Icon: CoinIcon, activeIcon: ACoinIcon },
    { key: 'store', label: '리워드', Icon: StoreIcon, activeIcon: AStoreIcon },
    { key: 'user', label: '마이페이지', Icon: UserIcon, activeIcon: AUserIcon },
  ] as const;

  const handlePress = (tab: 'home' | 'car' | 'coin' | 'store' | 'user') => {
    // 외부에서 제어하지 않는 경우 내부 상태 업데이트
    if (controlledActive === undefined) {
      setInternalActive(tab);
    }
    // 외부 콜백 실행
    onPress?.(tab);
  };

  return (
    <View
      style={{
        width: '100%',
        backgroundColor: colors.coolNeutral[10],
        alignItems: 'center',
        // showBorder가 true일 때만 보더 표시
        ...(showBorder && {
          borderTopWidth: 0.5,
          borderTopColor: colors.coolNeutral[40],
        }),
      }}
    >
    <View
      style={{
        flexDirection: 'row',
        width: '100%',
        maxWidth: 375,
        height: 75,
        alignItems: 'flex-start',
        paddingTop: 8,
        paddingBottom: 12,
        paddingHorizontal: 16,
        gap: 8,
      }}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.key;
        const { Icon } = tab;

        return (
          <Pressable
            key={tab.key}
            testID={`nav-tab-${tab.key}`}
            accessibilityRole="button"
            accessibilityLabel={`nav-tab-${tab.key}`}
            style={{
              alignItems: 'center',
              flex: 1,
              flexDirection: 'column',
              justifyContent: 'flex-end',
              gap: 4,
            }}
            onPress={() => handlePress(tab.key)}
          >
            {/* 아이콘 감싸는 Wrapper */}
            <View
              style={{
                height: 32,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {isActive ? (
                <tab.activeIcon width={24} height={24} />
              ) : (
                <Icon width={24} height={24} />
              )}
            </View>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.captionSemibold,
                color: isActive
                  ? colors.coolNeutral[80]
                  : colors.coolNeutral[40],
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