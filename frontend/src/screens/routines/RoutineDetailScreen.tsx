import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, useWindowDimensions, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useRoutine } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/interfaces/exercise';

type RoutineParams = {
  id?: string;
};

const WIDE_EXERCISE_LAYOUT_BREAKPOINT = 760;

type RoutineExerciseMediaCardProps = {
  exercise: Exercise;
  isWideLayout: boolean;
  onPress: () => void;
};

function RoutineExerciseMediaCard({ exercise, isWideLayout, onPress }: RoutineExerciseMediaCardProps) {
  const theme = useTheme();
  const [failedGifUrl, setFailedGifUrl] = useState<string | null>(null);
  const gifUrl = exercise.gif_url && exercise.gif_url !== failedGifUrl ? exercise.gif_url : undefined;
  const shouldShowGif = Boolean(gifUrl);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.mediaCard,
        isWideLayout && styles.mediaCardWide,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.mediaFrame}>
        {shouldShowGif ? (
          <Image
            recyclingKey={String(exercise.id)}
            source={{ uri: gifUrl }}
            style={styles.mediaImage}
            contentFit="contain"
            contentPosition="center"
            transition={140}
            cachePolicy="memory-disk"
            onError={() => setFailedGifUrl(gifUrl ?? null)}
          />
        ) : (
          <View style={[styles.mediaPlaceholder, { backgroundColor: theme.colors.surfaceElevated }]}>
            <MaterialCommunityIcons name="dumbbell" size={28} color={theme.colors.primary} />
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default function RoutineDetailScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<RoutineParams>();
  const { item, loading, refreshing, error, refresh, retry } = useRoutine(id);
  const isWideExerciseLayout = width >= WIDE_EXERCISE_LAYOUT_BREAKPOINT;

  if (loading && !item) {
    return (
      <ScreenContainer>
        <AppHeader title="Rutina" subtitle="Cargando detalle" showBack />
        <LoadingSpinner label="Preparando rutina" />
      </ScreenContainer>
    );
  }

  if (error || !item) {
    return (
      <ScreenContainer>
        <AppHeader title="Rutina" subtitle="Detalle" showBack />
        <EmptyState
          title="No pudimos cargar la rutina"
          description={error ?? 'No encontramos la rutina solicitada.'}
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
        data={item.exercises ?? []}
        keyExtractor={(exercise) => String(exercise.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader
              title={item.name}
              subtitle={item.description ?? 'Rutina lista para entrenar.'}
              showBack
              rightElement={(
                <Pressable
                  onPress={() => router.replace(ROUTES.app.routines)}
                  style={({ pressed }) => [
                    styles.backToRoutinesButton,
                    {
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <TextBlock variant="button" color="primary">
                    Volver a rutinas
                  </TextBlock>
                </Pressable>
              )}
            />

            <View
              style={[
                styles.heroCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}>
              <View style={styles.headerRow}>
                <View style={styles.badgeRow}>
                  <TextBlock variant="caption" color="muted">
                    {item.is_predefined ? 'Predefinida' : 'Personalizada'}
                  </TextBlock>
                </View>
                <TextBlock variant="caption" color="subtle">
                  {item.exercises?.length ?? 0} ejercicios
                </TextBlock>
              </View>
              <TextBlock variant="eyebrow" color="primary">
                Routine detail
              </TextBlock>
              <TextBlock variant="body" color="muted">
                Desde aquí puedes revisar el orden, sets, reps, descanso y notas de cada ejercicio.
              </TextBlock>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Esta rutina no tiene ejercicios"
            description="Cuando el backend sincronice ejercicios, aparecerán aquí con su información de pivot."
            icon="dumbbell"
            actionLabel="Crear rutina"
            onAction={() => router.push(ROUTES.app.routineCreate)}
          />
        }
        renderItem={({ item: exercise, index }: { item: Exercise; index: number }) => {
          const pivot = exercise.pivot;
          const goToExerciseDetail = () =>
            router.push({
              pathname: ROUTES.app.exerciseDetail,
              params: { id: String(exercise.id) },
            });

          return (
            <View style={[styles.exerciseWrap, isWideExerciseLayout && styles.exerciseWrapWide]}>
              <RoutineExerciseMediaCard
                exercise={exercise}
                isWideLayout={isWideExerciseLayout}
                onPress={goToExerciseDetail}
              />
              <View
                style={[
                  styles.pivotCard,
                  isWideExerciseLayout && styles.pivotCardWide,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}>
                <View style={styles.pivotHeader}>
                  <TextBlock variant="caption" color="muted">
                    Posición {pivot?.position ?? index + 1}
                  </TextBlock>
                  <TextBlock variant="caption" color="primary">
                    {exercise.display_name ?? exercise.name_es ?? exercise.name_en ?? 'Ejercicio'}
                  </TextBlock>
                </View>

                <View style={styles.metricsRow}>
                  <View style={styles.metric}>
                    <TextBlock variant="caption" color="muted">
                      Sets
                    </TextBlock>
                    <TextBlock variant="title">{pivot?.sets ?? '—'}</TextBlock>
                  </View>
                  <View style={styles.metric}>
                    <TextBlock variant="caption" color="muted">
                      Reps
                    </TextBlock>
                    <TextBlock variant="title">{pivot?.reps ?? '—'}</TextBlock>
                  </View>
                  <View style={styles.metric}>
                    <TextBlock variant="caption" color="muted">
                      Descanso
                    </TextBlock>
                    <TextBlock variant="title">
                      {pivot?.rest_seconds ? `${pivot.rest_seconds}s` : '—'}
                    </TextBlock>
                  </View>
                </View>

                {pivot?.notes ? (
                  <View style={styles.notesBox}>
                    <TextBlock variant="caption" color="muted">
                      Notas
                    </TextBlock>
                    <TextBlock variant="body">{pivot.notes}</TextBlock>
                  </View>
                ) : null}
              </View>
            </View>
          );
        }}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exerciseWrap: {
    marginBottom: 14,
    gap: 10,
  },
  exerciseWrapWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 14,
  },
  mediaCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  mediaCardWide: {
    width: 340,
    maxWidth: '42%',
  },
  mediaFrame: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  mediaPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pivotCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  pivotCardWide: {
    flex: 1,
    justifyContent: 'center',
  },
  pivotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  metricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metric: {
    flexGrow: 1,
    flexBasis: 96,
    borderRadius: 18,
    padding: 12,
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  notesBox: {
    gap: 6,
  },
  backToRoutinesButton: {
    minHeight: DIMENSIONS.touchTarget,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  pressed: {
    opacity: 0.72,
  },
});
