import { router } from 'expo-router';
import { useMemo } from 'react';
import {
  FlatList,
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
import { useMuscles } from '@/hooks';
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
  const { items, loading, refreshing, error, refresh, retry } = useMuscles();
  const columns = getColumns(width);
  const subtitle = 'Explora grupos musculares y abre sus ejercicios.';

  const header = useMemo(
    () => (
      <View style={styles.headerStack}>
        <AppHeader
          title="Músculos"
          subtitle={subtitle}
        />

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            Fitness map
          </TextBlock>
          <TextBlock variant="header">Selecciona un músculo para ver sus ejercicios</TextBlock>
          <TextBlock variant="body" color="muted">
            La vista consume la API, soporta pull to refresh y navega directo al catálogo filtrado.
          </TextBlock>
        </View>
      </View>
    ),
    [subtitle, theme.colors.border, theme.colors.surface]
  );

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        {header}
        <LoadingSpinner label="Cargando músculos" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        {header}
        <EmptyState
          title="No pudimos cargar los músculos"
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
            title="No hay músculos disponibles"
            description="Cuando el backend regrese datos, aparecerán aquí en forma de grid."
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
                    pathname: ROUTES.app.exercises,
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
});
