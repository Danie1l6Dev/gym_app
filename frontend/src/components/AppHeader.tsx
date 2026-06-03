import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { capitalize } from '@/utils';
import { TextBlock } from './TextBlock';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  rightElement?: ReactNode;
};

export function AppHeader({ title, subtitle, showBack = false, rightElement }: AppHeaderProps) {
  const theme = useTheme();

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
              pressed && styles.pressed,
            ]}>
            <MaterialCommunityIcons name="arrow-left" size={22} color={theme.colors.text} />
          </Pressable>
        ) : null}

        <View style={styles.textGroup}>
          <TextBlock variant="eyebrow" color="muted">
            {capitalize('GYM PONTE PIÑUO')}
          </TextBlock>
          <TextBlock variant="header">{title}</TextBlock>
          {subtitle ? (
            <TextBlock variant="body" color="muted">
              {subtitle}
            </TextBlock>
          ) : null}
        </View>
      </View>

      {rightElement ? <View style={styles.right}>{rightElement}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: DIMENSIONS.screenPadding,
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: DIMENSIONS.touchTarget,
    height: DIMENSIONS.touchTarget,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
});
