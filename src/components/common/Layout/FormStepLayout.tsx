import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Pressable, SafeAreaView, ScrollView, Text, View } from 'react-native';
import { colors, typography } from '@/theme';
import ProgressBar from '@/components/common/Bar/ProgressBar';
import ArrowLeftIcon from '@/assets/icons/arrow-left.svg';

const SCREEN_MAX_WIDTH = 375;

type SubtitleTone = 'body2' | 'body3';

interface FormStepLayoutProps {
  onBack: () => void;
  title: string;
  subtitle?: string;
  subtitleTone?: SubtitleTone;
  totalSteps?: number;
  activeStepIndex?: number;
  showProgress?: boolean;
  progressSpacerHeight?: number;
  titleMarginTop?: number;
  bodyMarginTop?: number;
  footer?: ReactNode;
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled';
  bodyContainerStyle?: StyleProp<ViewStyle>;
  children: ReactNode;
}

function getSubtitleStyle(tone: SubtitleTone) {
  return tone === 'body2' ? typography.styles.body2Regular : typography.styles.body3Regular;
}

export default function FormStepLayout({
  onBack,
  title,
  subtitle,
  subtitleTone = 'body3',
  totalSteps = 5,
  activeStepIndex = 0,
  showProgress = true,
  progressSpacerHeight = 0,
  titleMarginTop = 46,
  bodyMarginTop = 46,
  footer,
  keyboardShouldPersistTaps = 'handled',
  bodyContainerStyle,
  children,
}: FormStepLayoutProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.coolNeutral[10] }}>
      <ScrollView
        keyboardShouldPersistTaps={keyboardShouldPersistTaps}
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
        }}
      >
        <View style={{ flex: 1, width: '100%', maxWidth: SCREEN_MAX_WIDTH }}>
          <View style={{ paddingVertical: 12, paddingHorizontal: 20 }}>
            <Pressable
              onPress={onBack}
              style={{ width: 24, height: 24, justifyContent: 'center' }}
            >
              <ArrowLeftIcon width={24} height={24} />
            </Pressable>
          </View>

          {showProgress ? (
            <View style={{ marginTop: 10, width: '100%', alignItems: 'center' }}>
              <ProgressBar total={totalSteps} activeIndex={activeStepIndex} />
            </View>
          ) : progressSpacerHeight > 0 ? (
            <View style={{ marginTop: progressSpacerHeight }} />
          ) : null}

          <View style={{ marginTop: titleMarginTop, paddingHorizontal: 20 }}>
            <Text
              style={{
                fontFamily: typography.fontFamily.pretendard,
                ...typography.styles.h2Semibold,
                color: colors.coolNeutral[80],
              }}
            >
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={{
                  marginTop: 8,
                  fontFamily: typography.fontFamily.pretendard,
                  ...getSubtitleStyle(subtitleTone),
                  color: colors.coolNeutral[40],
                }}
              >
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={[{ marginTop: bodyMarginTop }, bodyContainerStyle]}>
            {children}
          </View>

          <View style={{ flex: 1 }} />
          {footer ? (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>{footer}</View>
          ) : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
