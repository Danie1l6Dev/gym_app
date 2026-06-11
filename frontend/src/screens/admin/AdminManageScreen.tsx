import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useTheme } from '@/hooks/use-theme';

interface ManageOption {
  id: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  color: string;
}

const MANAGE_OPTIONS: ManageOption[] = [
  {
    id: 'memberships',
    label: 'Membresías',
    description: 'Crear, editar y eliminar membresías',
    icon: 'card-membership',
    route: 'manage/memberships',
    color: '#FF6B6B',
  },
  {
    id: 'users',
    label: 'Usuarios',
    description: 'Gestionar cuentas y permisos',
    icon: 'account-multiple',
    route: ROUTES.app.adminUsers,
    color: '#4ECDC4',
  },
  {
    id: 'exercises',
    label: 'Ejercicios',
    description: 'Administrar ejercicios del sistema',
    icon: 'dumbbell',
    route: ROUTES.app.adminExercises,
    color: '#45B7D1',
  },
  {
    id: 'routines',
    label: 'Rutinas',
    description: 'Gestionar rutinas de entrenamiento',
    icon: 'playlist-plus',
    route: ROUTES.app.routineCreate,
    color: '#FFA502',
  },
];

export default function AdminManageScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <AppHeader
          title="Administrar"
          subtitle="Gestión completa del sistema"
        />

        <View style={styles.grid}>
          {MANAGE_OPTIONS.map((option) => (
            <Pressable
              key={option.id}
              onPress={() => router.push(option.route as never)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: theme.colors.surface },
                pressed && styles.cardPressed,
              ]}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${option.color}20` },
                ]}
              >
                <TextBlock
                  variant="title"
                  style={{ fontSize: 32, color: option.color }}
                >
                  {option.id === 'memberships' && '💳'}
                  {option.id === 'users' && '👥'}
                  {option.id === 'exercises' && '💪'}
                  {option.id === 'routines' && '📋'}
                </TextBlock>
              </View>

              <View style={styles.cardContent}>
                <TextBlock variant="title" style={styles.cardLabel}>
                  {option.label}
                </TextBlock>
                <TextBlock
                  variant="body"
                  color="muted"
                  style={styles.cardDescription}
                >
                  {option.description}
                </TextBlock>
              </View>

              <View style={styles.arrow}>
                <TextBlock style={{ fontSize: 18 }}>→</TextBlock>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: DIMENSIONS.screenPadding,
    paddingBottom: DIMENSIONS.screenPadding + DIMENSIONS.tabBarHeight,
  },
  grid: {
    gap: 16,
  },
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: DIMENSIONS.cardRadius,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 12,
  },
  arrow: {
    opacity: 0.5,
  },
});
