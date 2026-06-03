import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';

import { AppHeader } from '@/components/AppHeader';
import { AdminStatCard } from '@/components/AdminStatCard';
import { EmptyState } from '@/components/EmptyState';
import { MembershipCard } from '@/components/MembershipCard';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DEFAULT_EXPIRING_WINDOW_DAYS, DIMENSIONS, ROUTES } from '@/constants';
import { useAdminDashboard, useAuth } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';

export default function AdminDashboardScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  const { data, loading, refreshing, error, refresh, retry } = useAdminDashboard();

  if (loading && !data) {
    return (
      <ScreenContainer>
        <AppHeader title="Admin" subtitle="Panel de control del gimnasio" />
        <EmptyState title="Cargando panel" description="Preparando métricas administrativas." icon="shield-account-outline" />
      </ScreenContainer>
    );
  }

  if (error && !data) {
    return (
      <ScreenContainer>
        <AppHeader title="Admin" subtitle="Panel de control del gimnasio" />
        <EmptyState
          title="No pudimos cargar el panel"
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
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
        <AppHeader title="Admin" subtitle="Panel de control del gimnasio" />

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            Control center
          </TextBlock>
          <TextBlock variant="header">Administra usuarios, membresías y vencimientos</TextBlock>
          <TextBlock variant="body" color="muted">
            Vista central para supervisar el gimnasio y acceder rápido a las acciones de gestión.
          </TextBlock>
        </View>

        <View style={styles.statsGrid}>
          <AdminStatCard
            label="Total usuarios"
            value={String(data?.stats.totalUsers ?? 0)}
            detail="usuarios registrados en el sistema"
            tone="primary"
          />
          <AdminStatCard
            label="Membresías activas"
            value={String(data?.stats.activeMemberships ?? 0)}
            detail="membresías con estado activo"
            tone="secondary"
          />
          <AdminStatCard
            label="Próximos vencimientos"
            value={String(data?.stats.expiringMemberships ?? 0)}
            detail={`ventana de ${DEFAULT_EXPIRING_WINDOW_DAYS} días`}
            tone="warning"
          />
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <TextBlock variant="title">Herramientas admin</TextBlock>
            <TextBlock variant="caption" color="subtle">
              Gestión diaria y catálogos
            </TextBlock>
          </View>

          <View style={styles.quickActions}>
            {[
              { label: 'Usuarios', href: ROUTES.app.adminUsers },
              { label: 'Administradores', href: ROUTES.app.adminUsers, params: { role: 'admin' } },
              { label: 'Ejercicios', href: ROUTES.app.adminExercises },
              { label: 'Rutina personalizada', href: ROUTES.app.routineCreate },
              { label: 'Músculos', href: ROUTES.app.muscles },
              { label: 'Membresías', href: ROUTES.app.adminMemberships },
              { label: 'Vencimientos', href: ROUTES.app.adminExpiringMemberships },
            ].map((action) => (
              <Pressable
                key={action.label}
                onPress={() =>
                  router.push(
                    (action.params
                      ? { pathname: action.href as never, params: action.params }
                      : action.href) as never
                  )
                }
                style={({ pressed }) => [styles.quickAction, pressed && styles.pressed]}>
                <TextBlock variant="button" color="primary">
                  {action.label}
                </TextBlock>
              </Pressable>
            ))}
          </View>

          <View style={styles.adminNote}>
            <TextBlock variant="caption" color="subtle">
              El módulo de ejercicios permite sincronizar el catálogo local con la API externa.
              Músculos y rutinas ya quedan accesibles desde aquí para que el flujo de administración
              no se sienta igual al de un usuario normal.
            </TextBlock>
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <TextBlock variant="title">Vencimientos próximos</TextBlock>
            <TextBlock variant="caption" color="subtle">
              {data?.expiringMemberships.length ?? 0} resultados
            </TextBlock>
          </View>

          {(data?.expiringMemberships ?? []).length === 0 ? (
            <EmptyState
              title="Sin vencimientos próximos"
              description="No hay membresías próximas a vencer en la ventana actual."
              icon="calendar-alert"
            />
          ) : (
            data?.expiringMemberships.slice(0, 3).map((membership) => (
              <MembershipCard key={membership.id} membership={membership} />
            ))
          )}
        </View>

        <Pressable
          onPress={() => void logout()}
          style={({ pressed }) => [
            styles.logoutButton,
            { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            pressed && styles.pressed,
          ]}>
          <TextBlock variant="button" color="primary">
            Cerrar sesión
          </TextBlock>
        </Pressable>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    gap: 16,
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
  },
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sectionCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  quickAction: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  adminNote: {
    marginTop: 4,
  },
  logoutButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
