import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MuscleCard } from '@/components/MuscleCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAuth, useMuscles } from '@/hooks';
import type { Muscle } from '@/interfaces/muscle';
import { useTheme } from '@/hooks/use-theme';
import { getMuscleDisplayName, getMuscleSubtext } from '@/utils/fitness';

function getColumns(width: number) {
  if (width >= 1100) return 3;
  if (width >= 700) return 2;
  return 1;
}

export default function MusclesScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { items, loading, loadingPage, refreshing, error, meta, page, lastPage, refresh, retry, goToPage } =
    useMuscles({ perPage: 9 });
  const columns = getColumns(width);
  const subtitle = 'Explora grupos musculares y abre sus ejercicios.';
  const isAdmin = user?.role?.slug === 'admin';
  const backHref = isAdmin ? ROUTES.app.adminDashboard : ROUTES.app.explore;
  const exercisesHref = isAdmin ? ROUTES.app.adminCatalogExercises : ROUTES.app.exercises;

  const pageOptions = useMemo(() => {
    const candidates = new Set<number>([1, lastPage, page - 2, page - 1, page, page + 1, page + 2]);

    return [...candidates].filter((value) => value >= 1 && value <= lastPage).sort((a, b) => a - b);
  }, [lastPage, page]);

  async function handlePageChange(nextPage: number) {
    await goToPage(nextPage);
  }

  const header = useMemo(
    () => (
      <View style={styles.headerStack}>
        <AppHeader
          title="Musculos"
          subtitle={subtitle}
          showBack
          backHref={backHref}
          backVariant="button-right"
        />

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            Fitness map
          </TextBlock>
          <TextBlock variant="header">Selecciona un musculo para ver sus ejercicios</TextBlock>
          <TextBlock variant="body" color="muted">
            La vista consume la API, soporta pull to refresh y navega directo al catalogo filtrado.
          </TextBlock>
          <TextBlock variant="caption" color="subtle">
            {meta?.total ? `${meta.total} musculos disponibles.` : 'Cargando total del catalogo...'}
          </TextBlock>
        </View>

        {lastPage > 1 ? (
          <View
            style={[
              styles.paginationCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <View style={styles.paginationHeader}>
              <TextBlock variant="caption" color="muted">
                Pagina {page} de {lastPage}
              </TextBlock>
              {loadingPage ? <LoadingSpinner label="Cargando pagina" /> : null}
            </View>

            <View style={styles.paginationControls}>
              {pageOptions.map((value, index) => {
                const previous = pageOptions[index - 1];
                const showEllipsis = typeof previous === 'number' && value - previous > 1;
                const active = value === page;

                return (
                  <View key={value} style={styles.pageNumberGroup}>
                    {showEllipsis ? (
                      <TextBlock variant="caption" color="subtle">
                        ...
                      </TextBlock>
                    ) : null}
                    <Pressable
                      onPress={() => void handlePageChange(value)}
                      disabled={loadingPage || active}
                      style={({ pressed }) => [
                        styles.pageNumberButton,
                        {
                          borderColor: active ? theme.colors.primary : theme.colors.border,
                          backgroundColor: active ? theme.colors.backgroundSelected : theme.colors.surface,
                        },
                        pressed && !loadingPage && !active && styles.pressed,
                        (loadingPage || active) && styles.disabled,
                      ]}>
                      <TextBlock variant="button" color={active ? 'primary' : 'muted'}>
                        {value}
                      </TextBlock>
                    </Pressable>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    ),
    [
      backHref,
      lastPage,
      loadingPage,
      meta?.total,
      page,
      pageOptions,
      subtitle,
      theme.colors.backgroundSelected,
      theme.colors.border,
      theme.colors.primary,
      theme.colors.surface,
    ]
  );

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        {header}
        <LoadingSpinner label="Cargando musculos" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        {header}
        <EmptyState
          title="No pudimos cargar los musculos"
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
        key={columns}
        numColumns={columns}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={columns > 1 ? styles.columnWrapper : undefined}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="No hay musculos disponibles"
            description="Cuando el backend regrese datos, apareceran aqui en forma de grid."
            icon="arm-flex"
          />
        }
        renderItem={({ item }: { item: Muscle }) => {
          const displayName = getMuscleDisplayName(item);
          const subtext = getMuscleSubtext(item);

          return (
            <View style={[styles.gridItem, columns > 1 && styles.gridItemSplit]}>
              <MuscleCard
                name={displayName}
                description={subtext}
                badge={item.slug ?? 'grupo'}
                accentColor={theme.colors.primary}
                onPress={() =>
                  router.push({
                    pathname: exercisesHref as never,
                    params: {
                      muscleId: String(item.id),
                      muscleName: displayName,
                    },
                  })
                }
              />
            </View>
          );
        }}
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
  paginationCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
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
  list: {
    flex: 1,
  },
  listContent: {
    paddingTop: 8,
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
  },
  columnWrapper: {
    gap: 12,
  },
  gridItem: {
    flex: 1,
    marginBottom: 12,
  },
  gridItemSplit: {
    maxWidth: '100%',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.7,
  },
});
