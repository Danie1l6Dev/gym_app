import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import type { ThemePalette } from '@/theme/colors';

type ManageOption = {
  id: string;
  label: string;
  description: string;
  detail: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  route: string;
  tone: 'primary' | 'success' | 'warning' | 'danger';
};

const MANAGE_OPTIONS: ManageOption[] = [
  {
    id: 'users',
    label: 'Usuarios',
    description: 'Crea cuentas, revisa perfiles y administra permisos.',
    detail: 'Cuentas y roles',
    icon: 'account-group-outline',
    route: ROUTES.app.adminUsers,
    tone: 'primary',
  },
  {
    id: 'memberships',
    label: 'Membresias',
    description: 'Gestiona pagos, vigencias, renovaciones y planes activos.',
    detail: 'Planes y pagos',
    icon: 'card-account-details-outline',
    route: ROUTES.app.adminManageMemberships,
    tone: 'success',
  },
  {
    id: 'exercises',
    label: 'Ejercicios',
    description: 'Mantén el catalogo limpio y sincroniza movimientos.',
    detail: 'Catalogo fitness',
    icon: 'dumbbell',
    route: ROUTES.app.adminExercises,
    tone: 'warning',
  },
  {
    id: 'routines',
    label: 'Rutinas',
    description: 'Crea planes semanales y estructura entrenamientos.',
    detail: 'Programacion',
    icon: 'calendar-clock',
    route: ROUTES.app.adminManageRoutines,
    tone: 'danger',
  },
];

const QUICK_LINKS = [
  {
    label: 'Nuevo usuario',
    icon: 'account-plus-outline' as const,
    route: ROUTES.app.adminUserCreate,
  },
  {
    label: 'Nueva membresia',
    icon: 'credit-card-plus-outline' as const,
    route: ROUTES.app.adminManageMembershipCreate,
  },
  {
    label: 'Vencimientos',
    icon: 'calendar-alert' as const,
    route: ROUTES.app.adminExpiringMemberships,
  },
  {
    label: 'Musculos',
    icon: 'arm-flex-outline' as const,
    route: ROUTES.app.adminMuscles,
  },
];

function toneColor(theme: { colors: ThemePalette }, tone: ManageOption['tone']) {
  const colors = {
    primary: theme.colors.primary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    danger: theme.colors.danger,
  };

  return colors[tone];
}

function ManageCard({
  option,
  compact,
}: {
  option: ManageOption;
  compact: boolean;
}) {
  const theme = useTheme();
  const color = toneColor(theme, option.tone);

  return (
    <Pressable
      onPress={() => router.push(option.route as never)}
      style={({ pressed, hovered }) => [
        styles.optionCard,
        compact && styles.optionCardCompact,
        {
          backgroundColor: theme.colors.surface,
          borderColor: hovered ? color : theme.colors.border,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.optionTop}>
        <View
          style={[
            styles.optionIcon,
            {
              backgroundColor: `${color}18`,
              borderColor: `${color}44`,
            },
          ]}>
          <MaterialCommunityIcons name={option.icon} size={24} color={color} />
        </View>
        <View style={[styles.optionBadge, { backgroundColor: theme.colors.surfaceElevated }]}>
          <TextBlock variant="caption" color="subtle">
            {option.detail}
          </TextBlock>
        </View>
      </View>

      <View style={styles.optionCopy}>
        <TextBlock variant="title">{option.label}</TextBlock>
        <TextBlock variant="body" color="muted" style={styles.optionDescription}>
          {option.description}
        </TextBlock>
      </View>

      <View style={styles.optionFooter}>
        <TextBlock variant="button" style={{ color }}>
          Abrir modulo
        </TextBlock>
        <MaterialCommunityIcons name="arrow-right" size={18} color={color} />
      </View>
    </Pressable>
  );
}

export default function AdminManageScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader title="Administrar" subtitle="Centro de gestion del gimnasio" />

        <View style={[styles.hero, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.heroCopy}>
            <TextBlock variant="eyebrow" color="primary">
              Operacion diaria
            </TextBlock>
            <TextBlock variant="header">Todo lo importante en un solo lugar</TextBlock>
            <TextBlock variant="body" color="muted">
              Accede rapido a usuarios, membresias, ejercicios y rutinas sin perderte entre pantallas.
            </TextBlock>
          </View>
          <View style={[styles.heroIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
            <MaterialCommunityIcons name="view-dashboard-edit-outline" size={46} color={theme.colors.primary} />
          </View>
        </View>

        <View style={styles.quickGrid}>
          {QUICK_LINKS.map((link) => (
            <Pressable
              key={link.label}
              onPress={() => router.push(link.route as never)}
              style={({ pressed }) => [
                styles.quickLink,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                pressed && styles.pressed,
              ]}>
              <MaterialCommunityIcons name={link.icon} size={19} color={theme.colors.primary} />
              <TextBlock variant="button">{link.label}</TextBlock>
            </Pressable>
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <TextBlock variant="title">Modulos principales</TextBlock>
            <TextBlock variant="caption" color="subtle">
              Selecciona que quieres administrar
            </TextBlock>
          </View>
        </View>

        <View style={[styles.grid, compact && styles.gridCompact]}>
          {MANAGE_OPTIONS.map((option) => (
            <ManageCard key={option.id} option={option} compact={compact} />
          ))}
        </View>

        <View style={[styles.workflow, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.workflowHeader}>
            <MaterialCommunityIcons name="clipboard-check-outline" size={20} color={theme.colors.primary} />
            <TextBlock variant="title">Flujo recomendado</TextBlock>
          </View>
          <View style={styles.workflowSteps}>
            {[
              'Crea o actualiza el usuario',
              'Asigna o renueva su membresia',
              'Revisa rutina y progreso semanal',
            ].map((step, index) => (
              <View key={step} style={styles.workflowStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.colors.surfaceElevated }]}>
                  <TextBlock variant="caption" color="primary">
                    {index + 1}
                  </TextBlock>
                </View>
                <TextBlock variant="body" color="muted">
                  {step}
                </TextBlock>
              </View>
            ))}
          </View>
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
    gap: 16,
    paddingBottom: DIMENSIONS.screenPadding + DIMENSIONS.tabBarHeight,
  },
  hero: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroIcon: {
    width: 92,
    height: 92,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickLink: {
    flexGrow: 1,
    flexBasis: 150,
    minHeight: DIMENSIONS.touchTarget,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  sectionHeader: {
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  gridCompact: {
    flexDirection: 'column',
  },
  optionCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 280,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 18,
  },
  optionCardCompact: {
    minWidth: 0,
  },
  optionTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionIcon: {
    width: 54,
    height: 54,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  optionCopy: {
    gap: 7,
  },
  optionDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  optionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  workflow: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  workflowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  workflowSteps: {
    gap: 10,
  },
  workflowStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.78,
    transform: [{ scale: 0.99 }],
  },
});
