import { useEffect, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MembershipCard } from '@/components/MembershipCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SearchBar } from '@/components/SearchBar';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAdminMemberships } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { AdminMembership } from '@/interfaces/admin';
import { daysUntil } from '@/utils/dates';

type MembershipRow =
  | {
      type: 'section';
      id: string;
      title: string;
      subtitle: string;
      count: number;
      tone: 'active' | 'expired';
    }
  | {
      type: 'membership';
      id: string;
      membership: AdminMembership;
    }
  | {
      type: 'empty';
      id: string;
      message: string;
    };

function isActiveMembership(membership: AdminMembership) {
  const remainingDays = daysUntil(membership.ends_at ?? null);
  return membership.status === 'active' && (remainingDays === null || remainingDays >= 0);
}

function sortActiveMemberships(a: AdminMembership, b: AdminMembership) {
  const aDays = daysUntil(a.ends_at ?? null) ?? Number.MAX_SAFE_INTEGER;
  const bDays = daysUntil(b.ends_at ?? null) ?? Number.MAX_SAFE_INTEGER;
  return aDays - bDays;
}

function sortExpiredMemberships(a: AdminMembership, b: AdminMembership) {
  const aTime = a.ends_at ? new Date(a.ends_at).getTime() : 0;
  const bTime = b.ends_at ? new Date(b.ends_at).getTime() : 0;
  return bTime - aTime;
}

export default function MembershipsScreen() {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const { items, loading, refreshing, error, refresh, retry, loadMore } = useAdminMemberships(
    50,
    debouncedSearch
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => clearTimeout(timeout);
  }, [search]);

  const { activeMemberships, expiredMemberships, rows } = useMemo(() => {
    const active = items.filter(isActiveMembership).sort(sortActiveMemberships);
    const expired = items.filter((membership) => !isActiveMembership(membership)).sort(sortExpiredMemberships);
    const nextRows: MembershipRow[] = [];

    nextRows.push({
      type: 'section',
      id: 'active-section',
      title: 'Membresias activas',
      subtitle: 'Ordenadas por la suscripcion que vence mas pronto',
      count: active.length,
      tone: 'active',
    });

    active.forEach((membership) => {
      nextRows.push({
        type: 'membership',
        id: `active-${membership.id}`,
        membership,
      });
    });

    if (active.length === 0) {
      nextRows.push({
        type: 'empty',
        id: 'active-empty',
        message: 'No hay membresias activas con los filtros actuales.',
      });
    }

    nextRows.push({
      type: 'section',
      id: 'expired-section',
      title: 'Membresias vencidas',
      subtitle: 'Separadas para seguimiento y renovacion',
      count: expired.length,
      tone: 'expired',
    });

    expired.forEach((membership) => {
      nextRows.push({
        type: 'membership',
        id: `expired-${membership.id}`,
        membership,
      });
    });

    if (expired.length === 0) {
      nextRows.push({
        type: 'empty',
        id: 'expired-empty',
        message: 'No hay membresias vencidas con los filtros actuales.',
      });
    }

    return {
      activeMemberships: active,
      expiredMemberships: expired,
      rows: nextRows,
    };
  }, [items]);

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Membresias" subtitle="Clientes activos y vencidos" />
        <LoadingSpinner label="Cargando membresias" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Membresias" subtitle="Clientes activos y vencidos" />
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
        data={rows}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        onEndReachedThreshold={0.4}
        onEndReached={loadMore}
        ListHeaderComponent={
          <View style={styles.header}>
            <AppHeader title="Membresias" subtitle="Activas primero, vencidas por separado" />

            <View style={styles.summaryRow}>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                <TextBlock variant="eyebrow" color="primary">
                  Activas
                </TextBlock>
                <TextBlock variant="header">{activeMemberships.length}</TextBlock>
              </View>
              <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]}>
                <TextBlock variant="eyebrow" style={{ color: theme.colors.danger }}>
                  Vencidas
                </TextBlock>
                <TextBlock variant="header">{expiredMemberships.length}</TextBlock>
              </View>
            </View>

            <SearchBar
              label="Buscar membresia"
              placeholder="Cliente, correo, telefono, plan o estado"
              value={search}
              onChangeText={setSearch}
              helperText={loading && items.length > 0 ? 'Actualizando resultados...' : undefined}
            />
          </View>
        }
        renderItem={({ item }) => {
          if (item.type === 'section') {
            return (
              <View style={styles.sectionHeader}>
                <View>
                  <TextBlock variant="title">{item.title}</TextBlock>
                  <TextBlock variant="caption" color="muted">
                    {item.subtitle}
                  </TextBlock>
                </View>
                <View
                  style={[
                    styles.countBadge,
                    {
                      backgroundColor:
                        item.tone === 'active'
                          ? `${theme.colors.primary}22`
                          : `${theme.colors.danger}22`,
                    },
                  ]}
                >
                  <TextBlock
                    variant="caption"
                    color={item.tone === 'active' ? 'primary' : 'default'}
                    style={item.tone === 'expired' ? { color: theme.colors.danger } : undefined}
                  >
                    {item.count}
                  </TextBlock>
                </View>
              </View>
            );
          }

          if (item.type === 'empty') {
            return (
              <View style={[styles.emptySection, { backgroundColor: theme.colors.surface }]}>
                <TextBlock variant="caption" color="muted">
                  {item.message}
                </TextBlock>
              </View>
            );
          }

          return (
            <View style={styles.cardWrap}>
              <MembershipCard membership={item.membership} />
            </View>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            title="Sin membresias"
            description="No encontramos membresias con los filtros actuales."
            icon="card-account-details-outline"
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
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
  },
  header: {
    gap: 14,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    gap: 8,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  countBadge: {
    minWidth: 42,
    minHeight: 34,
    borderRadius: DIMENSIONS.chipRadius,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cardWrap: {
    marginBottom: 12,
  },
  emptySection: {
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    marginBottom: 12,
  },
});
