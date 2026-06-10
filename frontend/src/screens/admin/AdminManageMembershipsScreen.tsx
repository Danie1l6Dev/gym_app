import { router } from 'expo-router';
import { Alert, FlatList, Platform, Pressable, RefreshControl, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useMembershipTypes } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { MembershipType } from '@/interfaces/membership-type';
import { deleteMembershipType } from '@/services/admin.service';

function formatPrice(value: string | number) {
  const amount = Number(value);

  if (Number.isNaN(amount)) {
    return '$0';
  }

  return amount.toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  });
}

export default function AdminManageMembershipsScreen() {
  const theme = useTheme();
  const { items, loading, refreshing, error, refresh, retry } = useMembershipTypes();

  const handleDelete = (membershipType: MembershipType) => {
    const deleteType = async () => {
      try {
        await deleteMembershipType(membershipType.id);
        await refresh();
      } catch {
        Alert.alert('Error', 'No se pudo eliminar el tipo de membresia.');
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `¿Deseas eliminar "${membershipType.name}"? Esta accion no se puede deshacer.`
      );

      if (confirmed) {
        void deleteType();
      }

      return;
    }

    Alert.alert(
      'Eliminar tipo de membresia',
      `¿Deseas eliminar "${membershipType.name}"? Esta accion no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => void deleteType(),
        },
      ]
    );
  };

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Membresias"
          subtitle="Tipos de membresia disponibles"
          showBack
          backHref={ROUTES.app.adminManage}
        />
        <LoadingSpinner label="Cargando tipos de membresia" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader
          title="Membresias"
          subtitle="Tipos de membresia disponibles"
          showBack
          backHref={ROUTES.app.adminManage}
        />
        <EmptyState
          title="No pudimos cargar las membresias"
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
              title="Membresias"
              subtitle="Tipos de membresia disponibles"
              showBack
              backHref={ROUTES.app.adminManage}
              rightElement={
                <Pressable
                  onPress={() => router.push(ROUTES.app.adminManageMembershipCreate as never)}
                  style={({ pressed }) => [
                    styles.createButton,
                    { backgroundColor: theme.colors.primary },
                    pressed && styles.pressed,
                  ]}
                >
                  <TextBlock variant="button" style={styles.primaryButtonLabel}>
                    Nueva +
                  </TextBlock>
                </Pressable>
              }
            />
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.cardInfo}>
              <View style={styles.titleRow}>
                <TextBlock variant="title">{item.name}</TextBlock>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.is_active
                        ? `${theme.colors.primary}22`
                        : theme.colors.backgroundSoft,
                    },
                  ]}
                >
                  <TextBlock variant="caption" color={item.is_active ? 'primary' : 'muted'}>
                    {item.is_active ? 'Activa' : 'Inactiva'}
                  </TextBlock>
                </View>
              </View>

              <TextBlock variant="body" color="muted">
                {formatPrice(item.price)} · {item.duration_days} dias
              </TextBlock>

              {item.description ? (
                <TextBlock variant="caption" color="subtle" numberOfLines={2}>
                  {item.description}
                </TextBlock>
              ) : null}
            </View>

            <View style={styles.actions}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: ROUTES.app.adminManageMembershipDetail,
                    params: { id: String(item.id) },
                  } as never)
                }
                style={({ pressed }) => [
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}
              >
                <TextBlock variant="caption" style={styles.primaryButtonLabel}>
                  Editar
                </TextBlock>
              </Pressable>

              <Pressable
                onPress={() => handleDelete(item)}
                style={({ pressed }) => [
                  styles.actionButton,
                  styles.deleteButton,
                  pressed && styles.pressed,
                ]}
              >
                <TextBlock variant="caption" style={styles.primaryButtonLabel}>
                  Eliminar
                </TextBlock>
              </Pressable>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            title="Sin tipos de membresia"
            description="Crea el primer tipo para usarlo al registrar usuarios."
            icon="card-off-outline"
            actionLabel="Crear membresia"
            onAction={() => router.push(ROUTES.app.adminManageMembershipCreate as never)}
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
    opacity: 0.75,
  },
  primaryButtonLabel: {
    color: '#fff',
  },
  card: {
    marginHorizontal: DIMENSIONS.screenPadding,
    marginBottom: 12,
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  cardInfo: {
    flex: 1,
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    borderRadius: DIMENSIONS.chipRadius,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  actions: {
    gap: 8,
    alignItems: 'flex-end',
  },
  actionButton: {
    minWidth: 86,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: DIMENSIONS.chipRadius,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF6B6B',
  },
});
