import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAdminMemberships } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { AdminMembership } from '@/interfaces/admin';
import { deleteAdminMembership } from '@/services/admin.service';

export default function AdminManageMembershipsScreen() {
  const theme = useTheme();
  const { items, loading, refreshing, error, refresh, retry } = useAdminMemberships(50);
  const [deleting, setDeleting] = useState<string | number | null>(null);

  const handleDelete = (membership: AdminMembership) => {
    Alert.alert(
      'Eliminar membresía',
      `¿Está seguro que desea eliminar la membresía de ${membership.user?.name}?`,
      [
        {
          text: 'Cancelar',
          onPress: () => { },
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          onPress: async () => {
            setDeleting(membership.id);
            try {
              await deleteAdminMembership(membership.id);
              refresh();
            } catch (err) {
              Alert.alert('Error', 'No se pudo eliminar la membresía');
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
          title="Membresías"
          subtitle="Gestionar membresías del sistema"
          showBack
          backHref={ROUTES.app.adminManage}
        />
        <LoadingSpinner label="Cargando membresías" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Membresías"
          subtitle="Gestionar membresías del sistema"
          showBack
          backHref={ROUTES.app.adminManage}
        />
        <EmptyState
          title="Error al cargar"
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
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader
              title="Membresías"
              subtitle="Gestionar membresías del sistema"
              showBack
              backHref={ROUTES.app.adminManage}
              rightElement={
                <Pressable
                  onPress={() => router.push('manage/memberships' as never)}
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}
                >
                  <TextBlock variant="button" style={styles.buttonLabel}>
                    Nueva +
                  </TextBlock>
                </Pressable>
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <View
            style={[styles.membershipCard, { backgroundColor: theme.colors.surface }]}
          >
            <View style={styles.membershipInfo}>
              <TextBlock variant="subtitle" style={styles.userName}>
                {item.user?.name || 'Sin asignar'}
              </TextBlock>
              <TextBlock variant="body" color="muted">
                {item.plan_label || item.plan_type}
              </TextBlock>
              <View style={styles.dates}>
                <TextBlock variant="caption" color="muted">
                  Inicia: {item.starts_at ? new Date(item.starts_at).toLocaleDateString() : 'N/A'}
                </TextBlock>
                <TextBlock variant="caption" color="muted">
                  Vence: {item.ends_at ? new Date(item.ends_at).toLocaleDateString() : 'N/A'}
                </TextBlock>
              </View>
            </View>

            <View style={styles.membershipActions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.app.adminManageMemberships + '/[id]',
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
                  {deleting === item.id ? 'Eliminando...' : 'Eliminar'}
                </TextBlock>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Sin membresías"
            description="No hay membresías registradas. Crea una nueva para comenzar."
            icon="card-off-outline"
            actionLabel="Crear membresía"
            onAction={() =>
              router.push(ROUTES.app.adminManageMemberships + '/new' as never)
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
  membershipCard: {
    marginHorizontal: DIMENSIONS.screenPadding,
    marginBottom: 12,
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  membershipInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 4,
  },
  dates: {
    marginTop: 8,
    gap: 4,
  },
  membershipActions: {
    gap: 8,
    marginLeft: 12,
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
