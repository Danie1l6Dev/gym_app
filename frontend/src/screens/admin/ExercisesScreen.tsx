import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
import { useAuth, usePaginatedExercises } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import { syncAdminExercises } from '@/services';
import type { Exercise } from '@/interfaces/exercise';

export default function ExercisesScreen() {
  const theme = useTheme();
  const { token } = useAuth();
  const listRef = useRef<FlatList<Exercise> | null>(null);
  const {
    items,
    loading,
    loadingPage,
    refreshing,
    error,
    page,
    lastPage,
    goToPage,
    refresh,
    retry,
    meta,
  } = usePaginatedExercises({ perPage: 10, keepPreviousPages: false });
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [translationNoticeVisible, setTranslationNoticeVisible] = useState(false);

  const summary = useMemo(
    () => [
      {
        label: 'Ejercicios',
        value: String(meta?.total ?? items.length),
        detail: 'en el catálogo local',
      },
      {
        label: 'Sincronización',
        value: syncing ? '...' : 'lista',
        detail: syncMessage ?? 'usa el botón para actualizar desde la API externa',
      },
    ],
    [items.length, syncing, syncMessage, meta?.total]
  );

  const pageOptions = useMemo(() => {
    const candidates = new Set<number>([1, lastPage, page - 2, page - 1, page, page + 1, page + 2]);

    return [...candidates]
      .filter((value) => value >= 1 && value <= lastPage)
      .sort((a, b) => a - b);
  }, [lastPage, page]);

  function scrollToTop() {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }

  async function handleRefresh() {
    await refresh();
    scrollToTop();
  }

  async function handlePageChange(nextPage: number) {
    await goToPage(nextPage);
    scrollToTop();
  }

  async function handleSync() {
    setSyncing(true);
    setSyncError(null);
    setSyncMessage(null);
    setTranslationNoticeVisible(false);

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
      if (
        ! (Array.isArray(data.errors) && data.errors.length > 0)
        && ((data.created ?? 0) > 0 || (data.updated ?? 0) > 0)
      ) {
        setTranslationNoticeVisible(true);
      }

      await refresh();
      scrollToTop();
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

      <View
        style={[
          styles.paginationCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <View style={styles.paginationHeader}>
          <TextBlock variant="caption" color="muted">
            Página {page} de {lastPage}
          </TextBlock>
          {loadingPage ? <ActivityIndicator size="small" color={theme.colors.primary} /> : null}
        </View>

        <View style={styles.paginationControls}>
          <Pressable
            onPress={() => void handlePageChange(1)}
            disabled={loadingPage || page === 1}
            style={({ pressed }) => [
              styles.paginationButton,
              { borderColor: theme.colors.border },
              pressed && !loadingPage && page !== 1 && styles.pressed,
              (loadingPage || page === 1) && styles.disabled,
            ]}>
            <TextBlock variant="button" color="primary">
              Primera
            </TextBlock>
          </Pressable>

          <Pressable
            onPress={() => void handlePageChange(page - 1)}
            disabled={loadingPage || page === 1}
            style={({ pressed }) => [
              styles.paginationButton,
              { borderColor: theme.colors.border },
              pressed && !loadingPage && page !== 1 && styles.pressed,
              (loadingPage || page === 1) && styles.disabled,
            ]}>
            <TextBlock variant="button" color="primary">
              Anterior
            </TextBlock>
          </Pressable>

          <View style={styles.pageNumberRow}>
            {pageOptions.map((value, index) => {
              const previous = pageOptions[index - 1];
              const showEllipsis = typeof previous === 'number' && value - previous > 1;

              return (
                <View key={value} style={styles.pageNumberGroup}>
                  {showEllipsis ? (
                    <TextBlock variant="caption" color="subtle">
                      ...
                    </TextBlock>
                  ) : null}
                  <Pressable
                    onPress={() => void handlePageChange(value)}
                    disabled={loadingPage || value === page}
                    style={({ pressed }) => [
                      styles.pageNumberButton,
                      {
                        borderColor: value === page ? theme.colors.primary : theme.colors.border,
                        backgroundColor:
                          value === page ? theme.colors.backgroundSelected : theme.colors.surface,
                      },
                      pressed && !loadingPage && value !== page && styles.pressed,
                      (loadingPage || value === page) && styles.disabled,
                    ]}>
                    <TextBlock variant="button" color={value === page ? 'primary' : 'muted'}>
                      {value}
                    </TextBlock>
                  </Pressable>
                </View>
              );
            })}
          </View>

          <Pressable
            onPress={() => void handlePageChange(page + 1)}
            disabled={loadingPage || page === lastPage}
            style={({ pressed }) => [
              styles.paginationButton,
              { borderColor: theme.colors.border },
              pressed && !loadingPage && page !== lastPage && styles.pressed,
              (loadingPage || page === lastPage) && styles.disabled,
            ]}>
            <TextBlock variant="button" color="primary">
              Siguiente
            </TextBlock>
          </Pressable>

          <Pressable
            onPress={() => void handlePageChange(lastPage)}
            disabled={loadingPage || page === lastPage}
            style={({ pressed }) => [
              styles.paginationButton,
              { borderColor: theme.colors.border },
              pressed && !loadingPage && page !== lastPage && styles.pressed,
              (loadingPage || page === lastPage) && styles.disabled,
            ]}>
            <TextBlock variant="button" color="primary">
              Última
            </TextBlock>
          </Pressable>
        </View>
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
      <Modal visible={translationNoticeVisible} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.35)' }]}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <View style={styles.modalHeader}>
              <TextBlock variant="title">Traducción en progreso</TextBlock>
              <Pressable onPress={() => setTranslationNoticeVisible(false)}>
                <TextBlock variant="button" color="primary">
                  Cerrar
                </TextBlock>
              </Pressable>
            </View>

            <TextBlock variant="body" color="muted">
              La sincronización terminó correctamente. Las instrucciones en español se están
              generando en segundo plano.
            </TextBlock>

            <TextBlock variant="caption" color="subtle">
              Durante unos momentos algunos ejercicios pueden seguir apareciendo en inglés. No hace
              falta volver a sincronizar.
            </TextBlock>

            {syncMessage ? (
              <View
                style={[
                  styles.modalSummary,
                  { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border },
                ]}>
                <TextBlock variant="caption" color="primary">
                  {syncMessage}
                </TextBlock>
              </View>
            ) : null}

            <Pressable
              onPress={() => setTranslationNoticeVisible(false)}
              style={({ pressed }) => [
                styles.modalPrimaryButton,
                { backgroundColor: theme.colors.primary },
                pressed && styles.pressed,
              ]}>
              <TextBlock variant="button" style={styles.modalPrimaryButtonLabel}>
                Entendido
              </TextBlock>
            </Pressable>
          </View>
        </View>
      </Modal>

      <FlatList
        ref={listRef}
        style={styles.list}
        data={items}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void handleRefresh()} />}
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
  paginationCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  paginationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  paginationControls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    alignItems: 'center',
  },
  paginationButton: {
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pageNumberRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  pageNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pageNumberButton: {
    minHeight: 40,
    minWidth: 40,
    borderRadius: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalSummary: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  modalPrimaryButton: {
    minHeight: 46,
    borderRadius: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalPrimaryButtonLabel: {
    color: '#061018',
  },
});
