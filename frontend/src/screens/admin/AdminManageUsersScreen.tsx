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
import { useAdminUsers } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import { deleteAdminUser } from '@/services/admin.service';

export default function AdminManageUsersScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [deleting, setDeleting] = useState<string | number | null>(null);
  const { items, loading, refreshing, error, refresh, retry, loadMore, hasMore } =
    useAdminUsers(debouncedSearch, 10, undefined);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const handleDelete = (userId: string | number, userName: string) => {
    const deleteUser = async () => {
      setDeleting(userId);
      try {
        await deleteAdminUser(userId);
        await refresh();
      } catch (err) {
        Alert.alert('Error', 'No se pudo eliminar el usuario');
      } finally {
        setDeleting(null);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `¿Está seguro que desea eliminar a ${userName}? Esta acción no se puede deshacer.`
      );

      if (confirmed) {
        void deleteUser();
      }

      return;
    }

    Alert.alert(
      'Eliminar usuario',
      `¿Está seguro que desea eliminar a ${userName}? Esta acción no se puede deshacer.`,
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
          subtitle="Gestionar usuarios del sistema"
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
          subtitle="Gestionar usuarios del sistema"
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
              subtitle="Gestionar usuarios del sistema"
              showBack
              backHref={ROUTES.app.adminManage}
              rightElement={
                <Pressable
                  onPress={() => router.push(ROUTES.app.adminManageUserCreate as never)}
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
                onPress={() => handleDelete(item.id, item.name || 'Usuario')}
                disabled={deleting === item.id}
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: '#FF6B6B' },
                  pressed && styles.actionButtonPressed,
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
            title="Sin usuarios"
            description="No hay usuarios registrados. Crea uno para comenzar."
            icon="account-off-outline"
            actionLabel="Crear usuario"
            onAction={() => router.push(ROUTES.app.adminUserCreate as never)}
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
    alignItems: 'center',
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
});
