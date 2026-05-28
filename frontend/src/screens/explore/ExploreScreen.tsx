import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

const EXPLORE_LINKS = [
  {
    title: 'Músculos',
    description: 'Consulta grupos musculares y su base visual.',
    href: ROUTES.app.muscles,
  },
  {
    title: 'Ejercicios',
    description: 'Navega por el catálogo de ejercicios preparado para backend.',
    href: ROUTES.app.exercises,
  },
] as const;

export default function ExploreScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer>
      <AppHeader title="Explorar" subtitle="Puerta de entrada a músculos y ejercicios." />

      <EmptyState
        title="Navegación exploratoria lista"
        description="Desde aquí vamos a dividir el catálogo en bloques claros y escalables."
        icon="compass-outline"
      />

      <View style={styles.linksGrid}>
        {EXPLORE_LINKS.map((item) => (
          <Link href={item.href} asChild key={item.title}>
            <Pressable
              style={({ pressed }) => [
                styles.linkCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                pressed && styles.pressed,
              ]}>
              <TextBlock variant="title">{item.title}</TextBlock>
              <TextBlock variant="body" color="muted">
                {item.description}
              </TextBlock>
              <TextBlock variant="button" color="primary">
                Abrir sección
              </TextBlock>
            </Pressable>
          </Link>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  linksGrid: {
    marginTop: 16,
    gap: 12,
  },
  linkCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 8,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
});
