import { router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { AdminUserCard } from '@/components/AdminUserCard';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAdminUsers } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { AdminUser } from '@/interfaces/admin';

export default function UsersScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const { items, loading, refreshing, error, refresh, retry, loadMore, hasMore } =
    useAdminUsers(search, 12);

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Usuarios" subtitle="Gestión de usuarios del gimnasio" />
        <LoadingSpinner label="Cargando usuarios" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Usuarios" subtitle="Gestión de usuarios del gimnasio" />
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
              subtitle="Listado, búsqueda y detalle de cuentas"
              rightElement={
                <Pressable
                  onPress={() => router.push(ROUTES.app.adminUserCreate as never)}
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}>
                  <TextBlock variant="button" style={styles.createButtonLabel}>
                    Crear usuario
                  </TextBlock>
                </Pressable>
              }
            />

            <View
              style={[
                styles.searchCard,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}>
              <TextBlock variant="caption" color="muted">
                Buscar
              </TextBlock>
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Nombre, email o username"
                placeholderTextColor={theme.colors.textSubtle}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
              />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin usuarios"
            description="Agrega usuarios o ajusta el criterio de búsqueda."
            icon="account-group-outline"
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
  searchCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
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
