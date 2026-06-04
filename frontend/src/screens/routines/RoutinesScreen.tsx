import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { RoutineCard } from '@/components/RoutineCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAuth, useRoutines } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Routine } from '@/interfaces/routine';

type RoutineTab = 'recommended' | 'mine';

const TAB_OPTIONS: { key: RoutineTab; label: string; description: string }[] = [
  { key: 'recommended', label: 'Recomendadas', description: 'Rutinas predefinidas del catálogo' },
  { key: 'mine', label: 'Mis rutinas', description: 'Rutinas creadas o asignadas a tu usuario' },
];

export default function RoutinesScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { items, loading, refreshing, error, refresh, retry } = useRoutines();
  const [activeTab, setActiveTab] = useState<RoutineTab>('recommended');

  const recommended = useMemo(
    () => items.filter((routine) => Boolean(routine.is_predefined)),
    [items]
  );

  const mine = useMemo(
    () =>
      items.filter(
        (routine) => !routine.is_predefined && String(routine.user_id ?? '') === String(user?.id ?? '')
      ),
    [items, user?.id]
  );
  const isAdmin = user?.role?.slug === 'admin';

  const data = activeTab === 'recommended' ? recommended : mine;

  const title = activeTab === 'recommended' ? 'Rutinas recomendadas' : 'Mis rutinas';
  const subtitle =
    activeTab === 'recommended'
      ? 'Plantillas listas para usar con los ejercicios del sistema.'
      : 'Rutinas personalizadas vinculadas a tu perfil.';

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Rutinas"
          subtitle="Explora recomendaciones y tus rutinas personales."
        />
        <LoadingSpinner label="Cargando rutinas" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Rutinas"
          subtitle="Explora recomendaciones y tus rutinas personales."
        />
        <EmptyState
          title="No pudimos cargar las rutinas"
          description={error}
          icon="alert-circle-outline"
          actionLabel="Reintentar"
          onAction={retry}
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <FlatList
        style={styles.list}
        data={data}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader
              title="Rutinas"
              subtitle="Explora recomendaciones y tus rutinas personales."
              rightElement={isAdmin ? (
                <Pressable
                  onPress={() => router.push(ROUTES.app.routineCreate)}
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}>
                  <TextBlock variant="button" style={styles.createButtonLabel}>
                    Crear rutina
                  </TextBlock>
                </Pressable>
              ) : undefined}
            />

            <View
              style={[
                styles.heroCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}>
              <TextBlock variant="eyebrow" color="primary">
                Workout planner
              </TextBlock>
              <TextBlock variant="header">{title}</TextBlock>
              <TextBlock variant="body" color="muted">
                {subtitle}
              </TextBlock>
            </View>

            <View style={[styles.segmented, { backgroundColor: theme.colors.surface }]}>
              {TAB_OPTIONS.map((option) => {
                const selected = activeTab === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setActiveTab(option.key)}
                    style={({ pressed }) => [
                      styles.segmentButton,
                      selected && { backgroundColor: theme.colors.surfaceElevated },
                      pressed && styles.pressed,
                    ]}>
                    <TextBlock
                      variant="button"
                      color={selected ? 'default' : 'muted'}
                      style={styles.segmentLabel}>
                      {option.label}
                    </TextBlock>
                    <TextBlock variant="caption" color="subtle" style={styles.segmentDescription}>
                      {option.description}
                    </TextBlock>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={activeTab === 'recommended' ? 'Sin rutinas recomendadas' : 'Sin rutinas personales'}
            description={
              activeTab === 'recommended'
                ? 'Las rutinas predefinidas aparecerán aquí cuando el backend las exponga.'
                : 'Crea tu primera rutina personalizada para verla en este espacio.'
            }
            icon={activeTab === 'recommended' ? 'clipboard-text-outline' : 'account-heart-outline'}
            actionLabel={
              activeTab === 'recommended' && !isAdmin ? undefined : 'Crear rutina'
            }
            onAction={
              activeTab === 'recommended' && !isAdmin
                ? undefined
                : () => router.push(ROUTES.app.routineCreate)
            }
          />
        }
        renderItem={({ item }: { item: Routine }) => (
          <View style={styles.cardWrap}>
            <RoutineCard
              routine={item}
              exercisesCount={item.exercises?.length ?? 0}
              onPress={() =>
                router.push({
                  pathname: ROUTES.app.routineDetail,
                  params: { id: String(item.id) },
                })
              }
            />
          </View>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
  },
  header: {
    gap: 16,
    marginBottom: 12,
  },
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  segmented: {
    borderRadius: DIMENSIONS.cardRadius,
    padding: 8,
    gap: 8,
  },
  segmentButton: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 4,
  },
  segmentLabel: {
    textAlign: 'center',
  },
  segmentDescription: {
    textAlign: 'center',
  },
  cardWrap: {
    marginBottom: 14,
  },
  createButton: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonLabel: {
    color: '#061018',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
});
