import type { ReactNode } from 'react';
import { Platform, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/AppBackground';
import { DIMENSIONS } from '@/constants';

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
  const content = (
    <View
      style={[
        styles.content,
        centerContent && styles.centerContent,
        contentStyle,
      ]}>
      <View style={[styles.inner, { maxWidth: DIMENSIONS.contentMaxWidth }]}>{children}</View>
    </View>
  );

  if (!scrollable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <AppBackground />
        {content}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
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
    backgroundColor: '#020203',
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
