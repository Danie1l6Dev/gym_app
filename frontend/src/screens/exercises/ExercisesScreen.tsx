import { router, useLocalSearchParams } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { usePaginatedExercises } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/interfaces/exercise';

type ExercisesParams = {
  muscleId?: string;
  muscleName?: string;
};

export default function ExercisesScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<ExercisesParams>();
  const { items, loading, loadingMore, refreshing, error, hasMore, loadMore, refresh, retry, meta } =
    usePaginatedExercises({
      muscleId: params.muscleId,
      perPage: 25,
    });

  const subtitle = params.muscleName && params.muscleId
    ? `Filtrando ejercicios para ${params.muscleName}.`
    : 'Catálogo visual de ejercicios con GIF y detalle.';

  const header = (
    <View style={styles.headerStack}>
      <AppHeader title="Ejercicios" subtitle={subtitle} showBack={Boolean(params.muscleId)} />

      <View
        style={[
          styles.heroCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <TextBlock variant="eyebrow" color="primary">
          Training library
        </TextBlock>
        <TextBlock variant="header">Catálogo optimizado para explorar y abrir detalle</TextBlock>
        <TextBlock variant="body" color="muted">
          GIFs con caché, estados de red claros y navegación limpia a la vista de detalle.
        </TextBlock>
        <TextBlock variant="caption" color="subtle">
          {meta?.total ? `${meta.total} ejercicios disponibles en el catálogo.` : 'Cargando total del catálogo...'}
        </TextBlock>
      </View>
    </View>
  );

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        {header}
        <LoadingSpinner label="Cargando ejercicios" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        {header}
        <EmptyState
          title="No pudimos cargar los ejercicios"
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
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        onEndReachedThreshold={0.4}
        onEndReached={hasMore ? loadMore : undefined}
        ListHeaderComponent={header}
        ListFooterComponent={
          loadingMore ? (
            <View style={styles.footer}>
              <LoadingSpinner label="Cargando más ejercicios" />
            </View>
          ) : null
        }
        ListEmptyComponent={
          <EmptyState
            title="No hay ejercicios disponibles"
            description="Aquí aparecerá el catálogo del backend cuando el recurso responda datos."
            icon="dumbbell"
          />
        }
        renderItem={({ item }: { item: Exercise }) => (
          <View style={styles.cardWrapper}>
            <ExerciseCard
              exercise={item}
              onPress={() =>
                router.push({
                  pathname: ROUTES.app.exerciseDetail,
                  params: {
                    id: String(item.id),
                  },
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
  headerStack: {
    gap: 16,
    marginBottom: 8,
  },
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
  },
  cardWrapper: {
    marginBottom: 14,
  },
  footer: {
    paddingTop: 8,
  },
});
