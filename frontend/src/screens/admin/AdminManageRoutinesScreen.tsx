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
import { useRoutines } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import { deleteRoutine } from '@/services/admin.service';
import type { Routine } from '@/interfaces/routine';

export default function AdminManageRoutinesScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const { items, loading, refreshing, error, refresh, retry, loadMore, hasMore } =
    useRoutines(debouncedSearch);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = (routine: Routine) => {
    Alert.alert(
      'Eliminar rutina',
      `¿Está seguro que desea eliminar la rutina "${routine.name}"? Esta acción no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            setDeleting(routine.id);
            try {
              await deleteRoutine(routine.id);
              refresh();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la rutina');
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
          title="Rutinas"
          subtitle="Gestionar rutinas de entrenamiento"
          showBack
          backHref={ROUTES.app.adminManage}
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
          subtitle="Gestionar rutinas de entrenamiento"
          showBack
          backHref={ROUTES.app.adminManage}
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
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader
              title="Rutinas"
              subtitle="Gestionar rutinas de entrenamiento"
              showBack
              backHref={ROUTES.app.adminManage}
              rightElement={
                <Pressable
                  onPress={() => router.push(ROUTES.app.routineCreate as never)}
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
              placeholder="Nombre de la rutina"
              value={search}
              onChangeText={setSearch}
              helperText={loading && items.length > 0 ? 'Buscando...' : undefined}
            />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.routineCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.routineInfo}>
              <TextBlock variant="title" style={styles.routineName}>
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
              <View style={styles.routineMetadata}>
                {item.exercises && (
                  <TextBlock variant="caption" color="muted">
                    {item.exercises.length} ejercicio{item.exercises.length !== 1 ? 's' : ''}
                  </TextBlock>
                )}
                {item.user && (
                  <TextBlock variant="caption" color="muted">
                    Usuario: {item.user.name}
                  </TextBlock>
                )}
                {item.is_predefined && (
                  <View style={[styles.predefinedBadge, { backgroundColor: theme.colors.primary }]}>
                    <TextBlock variant="caption" style={styles.predefinedLabel}>
                      Predefinida
                    </TextBlock>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.routineActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.app.routineCreate,
                    params: { id: String(item.id) },
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
            title="Sin rutinas"
            description="No hay rutinas registradas. Crea una para comenzar."
            icon="playlist-remove"
            actionLabel="Crear rutina"
            onAction={() => router.push(ROUTES.app.routineCreate as never)}
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
  routineCard: {
    marginHorizontal: DIMENSIONS.screenPadding,
    marginBottom: 12,
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  routineInfo: {
    flex: 1,
  },
  routineName: {
    marginBottom: 4,
  },
  description: {
    marginBottom: 8,
  },
  routineMetadata: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'center',
  },
  predefinedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  predefinedLabel: {
    color: '#fff',
  },
  routineActions: {
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
