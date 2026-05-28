import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { MembershipCard } from '@/components/MembershipCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { DIMENSIONS } from '@/constants';
import { useAdminMemberships } from '@/hooks';

export default function MembershipsScreen() {
  const { items, loading, refreshing, error, refresh, retry, loadMore } = useAdminMemberships(12);

  if (loading && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Membresías" subtitle="Gestión de planes y estado" />
        <LoadingSpinner label="Cargando membresías" />
      </ScreenContainer>
    );
  }

  if (error && items.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Membresías" subtitle="Gestión de planes y estado" />
        <EmptyState
          title="No pudimos cargar las membresías"
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
          <AppHeader title="Membresías" subtitle="Gestión de planes y estado" />
        }
        ListEmptyComponent={
          <EmptyState
            title="Sin membresías"
            description="Cuando el backend devuelva resultados, aparecerán aquí."
            icon="card-account-details-outline"
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
