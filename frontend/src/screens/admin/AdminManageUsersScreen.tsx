import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
  Alert,
  Platform,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AdminUserCard } from '@/components/AdminUserCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAdminUsers, useAuth } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { AdminUser } from '@/interfaces/admin';
import { deleteAdminUser } from '@/services/admin.service';

type UsersView = 'users' | 'admins';

export default function AdminManageUsersScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [view, setView] = useState<UsersView>('users');
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const { user: currentUser } = useAuth();
  const role = view === 'admins' ? 'admin' : 'user';
  const { items, loading, refreshing, error, refresh, retry, loadMore, hasMore } =
    useAdminUsers(debouncedSearch, 10, role);

  const createLabel = view === 'admins' ? 'Crear admin +' : 'Crear usuario +';
  const emptyTitle = view === 'admins' ? 'Sin administradores' : 'Sin usuarios';
  const emptyDescription =
    view === 'admins'
      ? 'No hay administradores registrados. Crea uno para comenzar.'
      : 'No hay usuarios registrados. Crea uno para comenzar.';
  const subtitle =
    view === 'admins'
      ? 'Gestionar cuentas administrativas'
      : 'Gestionar usuarios del sistema';

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = (userToDelete: AdminUser) => {
    if (String(currentUser?.id) === String(userToDelete.id)) {
      Alert.alert('Accion no permitida', 'No puedes eliminar tu propia cuenta desde esta pantalla.');
      return;
    }

    const deleteUser = async () => {
      setDeleting(userToDelete.id);
      try {
        await deleteAdminUser(userToDelete.id);
        await refresh();
      } catch (err) {
        Alert.alert('Error', err instanceof Error ? err.message : 'No se pudo eliminar el usuario');
      } finally {
        setDeleting(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Seguro que deseas eliminar a ${userToDelete.name}? Esta accion no se puede deshacer.`
      );

      if (confirmed) {
        void deleteUser();
      }

      return;
    }

    Alert.alert(
      'Eliminar usuario',
      `Seguro que deseas eliminar a ${userToDelete.name}? Esta accion no se puede deshacer.`,
      [
        {
          text: 'Cancelar',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: () => void deleteUser(),
          style: 'destructive',
        },
      ]
    );
  };

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Usuarios"
          subtitle={subtitle}
          showBack
          backHref={ROUTES.app.adminManage}
        />
        <LoadingSpinner label="Cargando usuarios" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Usuarios"
          subtitle={subtitle}
          showBack
          backHref={ROUTES.app.adminManage}
        />
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
              showBack
              backHref={ROUTES.app.adminManage}
              rightElement={
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: ROUTES.app.adminManageUserCreate,
                      params: view === 'admins' ? { role: 'admin' } : undefined,
                    } as never)
                  }
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}
                >
                  <TextBlock variant="button" style={styles.buttonLabel}>
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
                      ]}
                    >
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
        renderItem={({ item }) => (
          <View style={styles.userItemContainer}>
            <AdminUserCard
              user={item}
              onPress={() =>
                router.push({
                  pathname: ROUTES.app.adminUserDetail,
                  params: { id: item.id },
                } as never)
              }
            />
            <View style={styles.userActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.app.adminUserDetail,
                    params: { id: item.id },
                  } as never)
                }
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  pressed && styles.actionButtonPressed,
                ]}
              >
                <TextBlock variant="caption" color="muted">
                  Ver
                </TextBlock>
              </Pressable>

              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.app.adminManageUserDetail,
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
                disabled={deleting === item.id || String(currentUser?.id) === String(item.id)}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: '#FF6B6B' },
                  (deleting === item.id || String(currentUser?.id) === String(item.id)) && styles.disabledAction,
                  pressed && deleting !== item.id && styles.actionButtonPressed,
                ]}
              >
                <TextBlock variant="caption" style={styles.buttonLabel}>
                  {deleting === item.id ? 'Eliminando...' : 'Eliminar'}
                </TextBlock>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title={emptyTitle}
            description={emptyDescription}
            icon={view === 'admins' ? 'shield-account-outline' : 'account-off-outline'}
            actionLabel={view === 'admins' ? 'Crear administrador' : 'Crear usuario'}
            onAction={() =>
              router.push({
                pathname: ROUTES.app.adminManageUserCreate,
                params: view === 'admins' ? { role: 'admin' } : undefined,
              } as never)
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
  pressed: {
    opacity: 0.7,
  },
  buttonLabel: {
    color: '#fff',
  },
  userItemContainer: {
    marginHorizontal: DIMENSIONS.screenPadding,
    marginBottom: 12,
    gap: 8,
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: DIMENSIONS.chipRadius,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  disabledAction: {
    opacity: 0.45,
  },
});
