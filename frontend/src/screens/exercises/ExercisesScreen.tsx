import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Switch, View, useWindowDimensions } from 'react-native';

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
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<ExercisesParams>();
  const listRef = useRef<FlatList<Exercise> | null>(null);
  const [onlyWithGif, setOnlyWithGif] = useState(true);
  const {
    items,
    loading,
    loadingPage,
    refreshing,
    error,
    meta,
    page,
    lastPage,
    refresh,
    retry,
    goToPage,
  } = usePaginatedExercises({
    muscleId: params.muscleId,
    perPage: 10,
    hasGif: onlyWithGif,
    keepPreviousPages: false,
  });

  // Determinar número de columnas basado en el ancho de la pantalla
  const numColumns = useMemo(() => {
    if (width < 600) return 1; // móvil
    if (width < 1024) return 2; // tablet
    return 3; // desktop
  }, [width]);

  const pageOptions = useMemo(() => {
    const candidates = new Set<number>([1, lastPage, page - 2, page - 1, page, page + 1, page + 2]);

    return [...candidates].filter((value) => value >= 1 && value <= lastPage).sort((a, b) => a - b);
  }, [lastPage, page]);

  const columnWrapperStyle = useMemo(() => {
    if (numColumns === 1) return undefined;
    return { gap: 16, justifyContent: 'flex-start' };
  }, [numColumns]);

  const cardWrapperStyle = useMemo(() => {
    if (numColumns === 1) return styles.cardWrapper;
    // Limitar el ancho máximo de cada tarjeta para mantener la simetría
    const maxWidthPercent = 100 / numColumns;
    return [styles.cardWrapper, { maxWidth: `${maxWidthPercent}%` }];
  }, [numColumns]);

  function scrollToTop() {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }

  async function handleRefresh() {
    await refresh();
    scrollToTop();
  }

  async function handlePageChange(nextPage: number) {
    await goToPage(nextPage);
    scrollToTop();
  }

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

      <View
        style={[
          styles.filterCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <View style={styles.filterCopy}>
          <TextBlock variant="button">Solo ejercicios con GIF</TextBlock>
          <TextBlock variant="caption" color="subtle">
            Oculta ejercicios sin animacion para evitar espacios vacios en la grilla.
          </TextBlock>
        </View>
        <Switch
          value={onlyWithGif}
          onValueChange={(value) => {
            setOnlyWithGif(value);
            scrollToTop();
          }}
          trackColor={{ false: theme.colors.surfaceElevated, true: theme.colors.backgroundSelected }}
          thumbColor={onlyWithGif ? theme.colors.primary : theme.colors.textSubtle}
        />
      </View>

      {lastPage > 1 ? (
        <View
          style={[
            styles.paginationCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <View style={styles.paginationHeader}>
            <TextBlock variant="caption" color="muted">
              Página {page} de {lastPage}
            </TextBlock>
            {loadingPage ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}
          </View>

          <View style={styles.paginationControls}>
            <Pressable
              onPress={() => void handlePageChange(1)}
              disabled={loadingPage || page === 1}
              style={({ pressed }) => [
                styles.paginationButton,
                { borderColor: theme.colors.border },
                pressed && !loadingPage && page !== 1 && styles.pressed,
                (loadingPage || page === 1) && styles.disabled,
              ]}>
              <TextBlock variant="button" color="primary">
                Primera
              </TextBlock>
            </Pressable>

            <Pressable
              onPress={() => void handlePageChange(page - 1)}
              disabled={loadingPage || page === 1}
              style={({ pressed }) => [
                styles.paginationButton,
                { borderColor: theme.colors.border },
                pressed && !loadingPage && page !== 1 && styles.pressed,
                (loadingPage || page === 1) && styles.disabled,
              ]}>
              <TextBlock variant="button" color="primary">
                Anterior
              </TextBlock>
            </Pressable>

            <View style={styles.pageNumberRow}>
              {pageOptions.map((value, index) => {
                const previous = pageOptions[index - 1];
                const showEllipsis = typeof previous === 'number' && value - previous > 1;

                return (
                  <View key={value} style={styles.pageNumberGroup}>
                    {showEllipsis ? (
                      <TextBlock variant="caption" color="subtle">
                        ...
                      </TextBlock>
                    ) : null}
                    <Pressable
                      onPress={() => void handlePageChange(value)}
                      disabled={loadingPage || value === page}
                      style={({ pressed }) => [
                        styles.pageNumberButton,
                        {
                          borderColor: value === page ? theme.colors.primary : theme.colors.border,
                          backgroundColor:
                            value === page ? theme.colors.backgroundSelected : theme.colors.surface,
                        },
                        pressed && !loadingPage && value !== page && styles.pressed,
                        (loadingPage || value === page) && styles.disabled,
                      ]}>
                      <TextBlock variant="button" color={value === page ? 'primary' : 'muted'}>
                        {value}
                      </TextBlock>
                    </Pressable>
                  </View>
                );
              })}
            </View>

            <Pressable
              onPress={() => void handlePageChange(page + 1)}
              disabled={loadingPage || page === lastPage}
              style={({ pressed }) => [
                styles.paginationButton,
                { borderColor: theme.colors.border },
                pressed && !loadingPage && page !== lastPage && styles.pressed,
                (loadingPage || page === lastPage) && styles.disabled,
              ]}>
              <TextBlock variant="button" color="primary">
                Siguiente
              </TextBlock>
            </Pressable>

            <Pressable
              onPress={() => void handlePageChange(lastPage)}
              disabled={loadingPage || page === lastPage}
              style={({ pressed }) => [
                styles.paginationButton,
                { borderColor: theme.colors.border },
                pressed && !loadingPage && page !== lastPage && styles.pressed,
                (loadingPage || page === lastPage) && styles.disabled,
              ]}>
              <TextBlock variant="button" color="primary">
                Última
              </TextBlock>
            </Pressable>
          </View>
        </View>
      ) : null}
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
        key={`flatlist-${numColumns}`}
        ref={listRef}
        style={styles.list}
        data={items}
        numColumns={numColumns}
        columnWrapperStyle={columnWrapperStyle}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={7}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="No hay ejercicios disponibles"
            description="Aquí aparecerá el catálogo del backend cuando el recurso responda datos."
            icon="dumbbell"
          />
        }
        renderItem={({ item }: { item: Exercise }) => (
          <View style={cardWrapperStyle}>
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
    gap: 16,
  },
  cardWrapper: {
    flex: 1,
    marginBottom: 14,
  },
  paginationCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  filterCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterCopy: {
    flex: 1,
    gap: 4,
  },
  paginationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  paginationControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  paginationButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pageNumberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  pageNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNumberButton: {
    minHeight: 40,
    minWidth: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.7,
  },
});
