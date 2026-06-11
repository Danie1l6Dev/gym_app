import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import { ROUTES } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { capitalize } from '@/utils';
import { TextBlock } from './TextBlock';

type AppHeaderProps = {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  backHref?: string;
  backVariant?: 'icon-left' | 'button-right';
  rightElement?: ReactNode;
};

export function AppHeader({
  title,
  subtitle,
  showBack = false,
  backHref,
  backVariant = 'icon-left',
  rightElement,
}: AppHeaderProps) {
  const theme = useTheme();
  const handleBack = () => {
    if (backHref) {
      router.replace(backHref as never);
      return;
    }

    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
      return;
    }

    router.replace(ROUTES.app.home);
  };

  const rightContent = showBack && backVariant === 'button-right'
    ? (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Volver"
        onPress={handleBack}
        style={({ hovered, pressed }) => [
          styles.backActionButton,
          hovered && styles.backActionButtonHover,
          pressed && styles.pressed,
        ]}>
        <MaterialCommunityIcons name="arrow-left" size={16} color="#c4b5fd" />
        <TextBlock variant="button" style={styles.backActionButtonText}>
          Volver
        </TextBlock>
      </Pressable>
    )
    : rightElement;

  return (
    <View style={styles.wrapper}>
      <View style={styles.left}>
        {showBack && backVariant === 'icon-left' ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Volver"
            onPress={handleBack}
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

      {rightContent ? <View style={styles.right}>{rightContent}</View> : null}
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
  backActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: 'rgba(109,40,217,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  backActionButtonHover: {
    backgroundColor: 'rgba(109,40,217,0.22)',
    transform: [{ translateY: -1 }],
  },
  backActionButtonText: {
    color: '#c4b5fd',
    fontSize: 13,
    fontWeight: '600',
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
