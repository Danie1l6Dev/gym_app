import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

type ScreenContainerProps = {
  children: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  scrollable?: boolean;
  centerContent?: boolean;
};

export function ScreenContainer({
  children,
  contentStyle,
  scrollable = true,
  centerContent = false,
}: ScreenContainerProps) {
  const theme = useTheme();

  const content = (
    <View
      style={[
        styles.content,
        { backgroundColor: theme.colors.background },
        centerContent && styles.centerContent,
        contentStyle,
      ]}>
      <View style={[styles.inner, { maxWidth: DIMENSIONS.contentMaxWidth }]}>{children}</View>
    </View>
  );

  if (!scrollable) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
        {content}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          Platform.OS === 'web' && styles.webScrollContent,
        ]}
        showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  webScrollContent: {
    alignItems: 'center',
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: DIMENSIONS.screenPadding,
    paddingTop: DIMENSIONS.screenPadding,
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
  },
  inner: {
    width: '100%',
    flex: 1,
    alignSelf: 'center',
  },
  centerContent: {
    justifyContent: 'center',
  },
});
