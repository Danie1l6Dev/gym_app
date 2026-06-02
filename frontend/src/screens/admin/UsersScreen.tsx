import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AdminUserCard } from '@/components/AdminUserCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAdminUsers } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { AdminUser } from '@/interfaces/admin';

type UsersView = 'users' | 'admins';

export default function UsersScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [view, setView] = useState<UsersView>('users');
  const role = view === 'admins' ? 'admin' : 'user';
  const { items, loading, refreshing, error, refresh, retry, loadMore, hasMore } =
    useAdminUsers(debouncedSearch, 12, role);

  const createLabel = view === 'admins' ? 'Crear admin' : 'Crear usuario';
  const emptyTitle = view === 'admins' ? 'Sin administradores' : 'Sin usuarios';
  const emptyDescription =
    view === 'admins'
      ? 'No hay administradores registrados en este momento.'
      : 'Agrega usuarios o ajusta el criterio de búsqueda.';

  const subtitle = useMemo(
    () =>
      view === 'admins'
        ? 'Listado de administradores del aplicativo'
        : 'Listado, búsqueda y detalle de cuentas',
    [view]
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Usuarios" subtitle={subtitle} />
        <LoadingSpinner label="Cargando usuarios" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Usuarios" subtitle={subtitle} />
        <EmptyState
          title="No pudimos cargar los usuarios"
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
              title="Usuarios"
              subtitle={subtitle}
              rightElement={
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: ROUTES.app.adminUserCreate as never,
                      params: view === 'admins' ? { role: 'admin' } : undefined,
                    } as never)
                  }
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}>
                  <TextBlock variant="button" style={styles.createButtonLabel}>
                    {createLabel}
                  </TextBlock>
                </Pressable>
              }
            />

            <View style={styles.segmentedWrap}>
              <View style={[styles.segmented, { backgroundColor: theme.colors.surface }]}>
                {[
                  { key: 'users' as const, label: 'Usuarios' },
                  { key: 'admins' as const, label: 'Administradores' },
                ].map((option) => {
                  const selected = view === option.key;

                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setView(option.key)}
                      style={({ pressed }) => [
                        styles.segmentButton,
                        selected && { backgroundColor: theme.colors.surfaceElevated },
                        pressed && styles.pressed,
                      ]}>
                      <TextBlock variant="button" color={selected ? 'default' : 'muted'}>
                        {option.label}
                      </TextBlock>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <SearchBar
              label="Buscar"
              placeholder="Nombre, email o username"
              value={search}
              onChangeText={setSearch}
              helperText={loading && items.length > 0 ? 'Actualizando resultados...' : undefined}
            />
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={view === 'admins' ? 'shield-account-outline' : 'account-group-outline'}
          />
        }
        ListFooterComponent={
          hasMore ? (
            <View style={styles.footer}>
              <TextBlock variant="caption" color="muted">
                Cargando más resultados...
              </TextBlock>
            </View>
          ) : null
        }
        renderItem={({ item }: { item: AdminUser }) => (
          <View style={styles.cardWrap}>
            <AdminUserCard
              user={item}
              onPress={() =>
                router.push({
                  pathname: ROUTES.app.adminUserDetail as never,
                  params: { id: String(item.id) },
                } as never)
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
  segmentedWrap: {
    gap: 10,
  },
  segmented: {
    borderRadius: DIMENSIONS.cardRadius,
    padding: 8,
    gap: 8,
  },
  segmentButton: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardWrap: {
    marginBottom: 12,
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
  footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
});
