import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ExerciseCard } from '@/components/ExerciseCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAuth, useExercises } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import { syncAdminExercises } from '@/services';
import type { Exercise } from '@/interfaces/exercise';

export default function ExercisesScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const { items, loading, refreshing, error, refresh, retry } = useExercises({ perPage: 100 });
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const summary = useMemo(
    () => [
      { label: 'Ejercicios', value: String(items.length), detail: 'en el catálogo local' },
      {
        label: 'Sincronización',
        value: syncing ? '...' : 'lista',
        detail: syncMessage ?? 'usa el botón para actualizar desde la API externa',
      },
    ],
    [items.length, syncing, syncMessage]
  );

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    setSyncMessage(null);

    try {
      const response = await syncAdminExercises(token);
      const data = response?.data ?? {};
      if (Array.isArray(data.errors) && data.errors.length > 0) {
        setSyncError(data.errors[0] ?? 'No se pudo sincronizar los ejercicios.');
      } else {
        setSyncMessage(
          `Creados: ${data.created ?? 0} · Actualizados: ${data.updated ?? 0} · Omitidos: ${data.omitted ?? 0}`
        );
      }
      await refresh();
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'No se pudo sincronizar los ejercicios.');
    } finally {
      setSyncing(false);
    }
  }

  const header = (
    <View style={styles.headerStack}>
      <AppHeader
        title="Ejercicios"
        subtitle="Catálogo local y sincronización con la API externa"
        showBack
        rightElement={
          <Pressable
            onPress={() => void handleSync()}
            disabled={syncing}
            style={({ pressed }) => [
              styles.syncButton,
              { backgroundColor: theme.colors.primary },
              pressed && !syncing && styles.pressed,
              syncing && styles.disabled,
            ]}>
            {syncing ? (
              <ActivityIndicator size="small" color="#061018" />
            ) : (
              <TextBlock variant="button" style={styles.syncButtonLabel}>
                Sincronizar
              </TextBlock>
            )}
          </Pressable>
        }
      />

      <View
        style={[
          styles.heroCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <TextBlock variant="eyebrow" color="primary">
          Exercise admin
        </TextBlock>
        <TextBlock variant="header">Administra el catálogo local desde un solo lugar</TextBlock>
        <TextBlock variant="body" color="muted">
          La lista ya no depende de la llamada directa a la API externa; puedes sincronizar cuando
          necesites actualizar GIFs, textos o metadatos.
        </TextBlock>
        <TextBlock variant="caption" color="subtle">
          La sincronización puede tardar varios minutos porque consulta el catálogo completo y
          evita bloqueos del proveedor externo.
        </TextBlock>
      </View>

      <View style={styles.summaryGrid}>
        {summary.map((card) => (
          <View
            key={card.label}
            style={[
              styles.summaryCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <TextBlock variant="header">{card.value}</TextBlock>
            <TextBlock variant="caption" color="muted">
              {card.label}
            </TextBlock>
            <TextBlock variant="caption" color="subtle">
              {card.detail}
            </TextBlock>
          </View>
        ))}
      </View>

      {syncMessage ? (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="caption" color="primary">
            {syncMessage}
          </TextBlock>
        </View>
      ) : null}

      {syncError ? (
        <View
          style={[
            styles.noticeBox,
            { backgroundColor: theme.colors.backgroundSelected, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="caption" color="primary">
            {syncError}
          </TextBlock>
        </View>
      ) : null}

      <View style={styles.quickLinks}>
        {[
          { label: 'Rutina personalizada', href: ROUTES.app.routineCreate },
          { label: 'Músculos', href: ROUTES.app.muscles },
          { label: 'Usuarios', href: ROUTES.app.adminUsers },
        ].map((action) => (
          <Pressable
            key={action.label}
            onPress={() => router.push(action.href as never)}
            style={({ pressed }) => [styles.quickLink, pressed && styles.pressed]}>
            <TextBlock variant="button" color="primary">
              {action.label}
            </TextBlock>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Ejercicios" subtitle="Catálogo local y sincronización" showBack />
        <LoadingSpinner label="Cargando ejercicios" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Ejercicios" subtitle="Catálogo local y sincronización" showBack />
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
        ListHeaderComponent={header}
        ListEmptyComponent={
          <EmptyState
            title="Sin ejercicios"
            description="Sincroniza el catálogo para poblar el almacenamiento local."
            icon="dumbbell"
            actionLabel="Sincronizar"
            onAction={() => void handleSync()}
          />
        }
        renderItem={({ item }: { item: Exercise }) => (
          <View style={styles.cardWrap}>
            <ExerciseCard
              exercise={item}
              onPress={() =>
                router.push({
                  pathname: ROUTES.app.exerciseDetail,
                  params: { id: String(item.id) },
                })
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
    gap: 16,
  },
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
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: 160,
    minWidth: 160,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 6,
  },
  noticeBox: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickLink: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  syncButton: {
    minHeight: 44,
    borderRadius: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncButtonLabel: {
    color: '#061018',
  },
  cardWrap: {
    marginBottom: 14,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.7,
  },
});
