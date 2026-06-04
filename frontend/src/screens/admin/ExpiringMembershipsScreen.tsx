import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MembershipCard } from '@/components/MembershipCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { DIMENSIONS, DEFAULT_EXPIRING_WINDOW_DAYS } from '@/constants';
import { useExpiringMemberships } from '@/hooks';

export default function ExpiringMembershipsScreen() {
  const { items, loading, refreshing, error, refresh, retry, loadMore } =
    useExpiringMemberships(DEFAULT_EXPIRING_WINDOW_DAYS, 10);

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Vencimientos" subtitle="Membresías próximas a vencer" />
        <LoadingSpinner label="Cargando vencimientos" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Vencimientos" subtitle="Membresías próximas a vencer" />
        <EmptyState
          title="No pudimos cargar los vencimientos"
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
          <AppHeader title="Vencimientos" subtitle="Membresías próximas a vencer" />
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin vencimientos"
            description="No hay membresías dentro de la ventana actual."
            icon="calendar-alert"
          />
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrap}>
            <MembershipCard membership={item} />
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
  cardWrap: {
    marginBottom: 12,
  },
});
