import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  Alert,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { usePaginatedExercises } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import { deleteExercise } from '@/services/admin.service';
import type { Exercise } from '@/interfaces/exercise';

export default function AdminManageExercisesScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const { items, loading, refreshing, error, refresh, retry, loadMore, hasMore } =
    usePaginatedExercises({ search: debouncedSearch, perPage: 10 });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = (exercise: Exercise) => {
    Alert.alert(
      'Eliminar ejercicio',
      `¿Está seguro que desea eliminar "${exercise.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            setDeleting(exercise.id);
            try {
              await deleteExercise(exercise.id);
              refresh();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar el ejercicio');
            } finally {
              setDeleting(null);
            }
          },
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Ejercicios"
          subtitle="Gestionar ejercicios del sistema"
          showBack
          backHref={ROUTES.app.adminManage}
        />
        <LoadingSpinner label="Cargando ejercicios" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Ejercicios"
          subtitle="Gestionar ejercicios del sistema"
          showBack
          backHref={ROUTES.app.adminManage}
        />
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
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader
              title="Ejercicios"
              subtitle="Gestionar ejercicios del sistema"
              showBack
              backHref={ROUTES.app.adminManage}
              rightElement={
                <Pressable
                  onPress={() => router.push('manage/exercises' as never)}
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}
                >
                  <TextBlock variant="button" style={styles.buttonLabel}>
                    Crear +
                  </TextBlock>
                </Pressable>
              }
            />

            <SearchBar
              label="Buscar"
              placeholder="Nombre del ejercicio"
              value={search}
              onChangeText={setSearch}
              helperText={loading && items.length > 0 ? 'Buscando...' : undefined}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.exerciseCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.exerciseInfo}>
              <TextBlock variant="subtitle" style={styles.exerciseName}>
                {item.name}
              </TextBlock>
              {item.description && (
                <TextBlock
                  variant="body"
                  color="muted"
                  style={styles.description}
                  numberOfLines={2}
                >
                  {item.description}
                </TextBlock>
              )}
              {item.muscles && item.muscles.length > 0 && (
                <View style={styles.musclesContainer}>
                  {item.muscles.map((muscle) => (
                    <View
                      key={muscle.id}
                      style={[
                        styles.muscleBadge,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <TextBlock
                        variant="caption"
                        style={styles.muscleBadgeLabel}
                      >
                        {muscle.name}
                      </TextBlock>
                    </View>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.exerciseActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.app.adminManageExercises + '/[id]',
                    params: { id: item.id },
                  } as never)
                }
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <TextBlock variant="caption" style={styles.buttonLabel}>
                  Editar
                </TextBlock>
              </Pressable>

              <Pressable
                onPress={() => handleDelete(item)}
                disabled={deleting === item.id}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: '#FF6B6B' },
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <TextBlock variant="caption" style={styles.buttonLabel}>
                  {deleting === item.id ? '...' : 'Eliminar'}
                </TextBlock>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Sin ejercicios"
            description="No hay ejercicios registrados. Crea uno para comenzar."
            icon="dumbbell-off"
            actionLabel="Crear ejercicio"
            onAction={() =>
              router.push(ROUTES.app.adminManageExercises + '/new' as never)
            }
          />
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  content: {
    paddingBottom: DIMENSIONS.tabBarHeight,
  },
  header: {
    paddingHorizontal: DIMENSIONS.screenPadding,
    paddingTop: DIMENSIONS.screenPadding,
    paddingBottom: 16,
    gap: 16,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: DIMENSIONS.chipRadius,
  },
  pressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: '#fff',
  },
  exerciseCard: {
    marginHorizontal: DIMENSIONS.screenPadding,
    marginBottom: 12,
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  musclesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  muscleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: DIMENSIONS.chipRadius,
  },
  muscleBadgeLabel: {
    color: '#fff',
  },
  exerciseActions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: DIMENSIONS.chipRadius,
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
});
