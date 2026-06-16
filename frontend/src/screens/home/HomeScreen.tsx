import type { ComponentProps } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppBackground } from '@/components/AppBackground';
import { TopBar } from '@/components/TopBar';
import { useExercises, useMuscles, useRoutines } from '@/hooks';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/constants';
import { TYPOGRAPHY } from '@/theme';
import type { Routine } from '@/interfaces/routine';

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICONS = {
  Repeat2: 'repeat-variant',
  Target: 'bullseye',
  Dumbbell: 'dumbbell',
  TrendingUp: 'trending-up',
  Flame: 'fire',
  Bell: 'bell-outline',
  Settings: 'cog-outline',
  ChevronRight: 'chevron-right',
} as const;

const WEEKDAY_SLUGS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;

function getTodaySlug(): string {
  return WEEKDAY_SLUGS[new Date().getDay()];
}

function getDayDisplayName(slug: string): string {
  const names: Record<string, string> = {
    lunes: 'Lunes',
    martes: 'Martes',
    miercoles: 'Miercoles',
    jueves: 'Jueves',
    viernes: 'Viernes',
    sabado: 'Sabado',
    domingo: 'Domingo',
  };

  return names[slug] ?? 'Hoy';
}

function TodayRoutineBanner({
  todaySlug,
  todayLabel,
  todaysRoutines,
  personalRoutineCount,
}: {
  todaySlug: string;
  todayLabel: string;
  todaysRoutines: Routine[];
  personalRoutineCount: number;
}) {
  const hasTodaysRoutines = todaysRoutines.length > 0;
  const title = hasTodaysRoutines
    ? 'Tu rutina para el dia de hoy es...'
    : personalRoutineCount > 0
      ? 'Tienes rutinas creadas pero no las has asociado a ningun dia'
      : 'No tienes rutinas creadas';
  const description = hasTodaysRoutines
    ? `${todayLabel}: ${todaysRoutines.map((routine) => routine.name).join(', ')}`
    : personalRoutineCount > 0
      ? 'Asociala y mejora tu plan de entrenamiento.'
      : 'Crea una y asociala a un dia, o usa alguna rutina recomendada.';

  function handlePress() {
    if (todaysRoutines.length === 1) {
      router.push({
        pathname: ROUTES.app.routineDetail,
        params: { id: String(todaysRoutines[0].id) },
      });
      return;
    }

    if (todaysRoutines.length > 1) {
      router.push({
        pathname: ROUTES.app.routines,
        params: { day: todaySlug },
      });
      return;
    }

    router.push(hasTodaysRoutines ? ROUTES.app.routines : ROUTES.app.routineCreate);
  }

  return (
    <Pressable
      onPress={handlePress}
      style={({ hovered }) => [
        styles.todayBanner,
        {
          borderColor: hovered ? 'rgba(167,139,250,0.56)' : 'rgba(167,139,250,0.28)',
          shadowColor: hovered ? 'rgba(109,40,217,0.18)' : 'rgba(109,40,217,0.08)',
          shadowOpacity: hovered ? 0.4 : 0.22,
          shadowRadius: hovered ? 32 : 18,
          shadowOffset: { width: 0, height: 0 },
          elevation: hovered ? 8 : 0,
        },
      ]}>
      <View style={styles.todayBannerGlow} />
      <View style={styles.todayBannerIcon}>
        <MaterialCommunityIcons
          name={hasTodaysRoutines ? 'calendar-check' : 'calendar-plus'}
          size={20}
          color="#c4b5fd"
        />
      </View>
      <View style={styles.todayBannerCopy}>
        <Text style={styles.todayBannerEyebrow}>Plan semanal recurrente</Text>
        <Text style={styles.todayBannerTitle}>{title}</Text>
        <Text style={styles.todayBannerDesc}>{description}</Text>
        {hasTodaysRoutines && todaysRoutines.length > 1 ? (
          <View style={styles.todayRoutineList}>
            {todaysRoutines.map((routine) => (
              <View key={String(routine.id)} style={styles.todayRoutinePill}>
                <Text style={styles.todayRoutinePillText}>{routine.name}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color="rgba(196,181,253,0.72)" />
    </Pressable>
  );
}

function StatCard({
  value, label, sub, icon, accent, glow, compact,
}: {
  value: number; label: string; sub: string;
  icon: MaterialIconName; accent: string; glow: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={({ hovered }) => [
        styles.statCard,
        compact && styles.statCardCompact,
        {
          borderColor: hovered ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.14)',
          shadowColor: hovered ? glow : 'transparent',
          shadowOpacity: 0.4,
          shadowRadius: 32,
          shadowOffset: { width: 0, height: 0 },
          elevation: hovered ? 8 : 0,
        },
      ]}>
      {({ hovered }) => (
        <>
          <View style={[styles.statGlow, { opacity: hovered ? 1 : 0.5 }]}>
            <View style={[styles.statGlowInner, { backgroundColor: glow }]} />
          </View>
          <View style={[styles.statIconWrap, { backgroundColor: glow, borderColor: `${accent}30` }]}>
            <MaterialCommunityIcons name={icon} size={16} color={accent} />
          </View>
          <Text style={[styles.statValue, compact && styles.statValueCompact, { color: '#fff' }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: accent }]} numberOfLines={1}>{label}</Text>
          <Text style={[styles.statSub, { color: 'rgba(255,255,255,0.28)' }]} numberOfLines={2}>{sub}</Text>
        </>
      )}
    </Pressable>
  );
}

function QuickCard({
  label, hint, icon, onPress,
}: {
  label: string; hint: string; icon: MaterialIconName; onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [
        styles.quickCard,
        {
          borderColor: hovered ? 'rgba(139,92,246,0.42)' : 'rgba(139,92,246,0.12)',
          shadowColor: hovered ? 'rgba(109,40,217,0.12)' : 'transparent',
          shadowOpacity: 0.4,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 0 },
          elevation: hovered ? 4 : 0,
        },
      ]}>
      {({ hovered }) => (
        <>
          <View style={styles.quickIconWrap}>
            <MaterialCommunityIcons name={icon} size={15} color={hovered ? '#c4b5fd' : '#a78bfa'} />
          </View>
          <View style={styles.quickTextWrap}>
            <Text style={[styles.quickLabel, { color: hovered ? '#fff' : 'rgba(255,255,255,0.82)' }]}>
              {label}
            </Text>
            <Text style={styles.quickHint}>{hint}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={14} color="rgba(139,92,246,0.45)" />
        </>
      )}
    </Pressable>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const routines = useRoutines();
  const muscles = useMuscles();
  const exercises = useExercises();
  const muscleCount = muscles.meta?.total ?? muscles.items.length;
  const exerciseCount = exercises.meta?.total ?? exercises.items.length;
  const isCompactLayout = width < 640;
  const todaySlug = getTodaySlug();
  const todayLabel = getDayDisplayName(todaySlug);
  const personalRoutines = routines.items.filter(
    (routine) => !routine.is_predefined && String(routine.user_id ?? '') === String(user?.id ?? '')
  );
  const todaysRoutines = personalRoutines.filter((routine) =>
    (routine.days ?? []).some((day) => day.slug === todaySlug)
  );

  const stats = [
    {
      value: routines.items.length,
      label: 'Rutinas',
      sub: routines.error ?? 'disponibles para tu sesión',
      icon: ICONS.Repeat2,
      accent: '#8b5cf6',
      glow: 'rgba(109,40,217,0.18)',
    },
    {
      value: muscleCount,
      label: 'Músculos',
      sub: muscles.error ?? 'grupos musculares registrados',
      icon: ICONS.Target,
      accent: '#a78bfa',
      glow: 'rgba(139,92,246,0.16)',
    },
    {
      value: exerciseCount,
      label: 'Ejercicios',
      sub: exercises.error ?? 'ejercicios del catálogo local',
      icon: ICONS.Dumbbell,
      accent: '#c4b5fd',
      glow: 'rgba(167,139,250,0.14)',
    },
  ];

  const quickActions = [
    {
      label: 'Crear nueva rutina',
      icon: ICONS.Repeat2,
      hint: 'Personaliza tu entrenamiento',
      onPress: () => router.push(ROUTES.app.routineCreate),
    },
    {
      label: 'Ver progreso semanal',
      icon: ICONS.TrendingUp,
      hint: 'Próximamente',
      onPress: () => Alert.alert('Próximamente', 'Esta funcionalidad estará disponible pronto.'),
    },
    {
      label: 'Explorar ejercicios',
      icon: ICONS.Flame,
      hint: 'Catálogo completo',
      onPress: () => router.push(ROUTES.app.exercises),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <AppBackground />
      <TopBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.eyebrow}>GYM PONTE PIÑUO</Text>
          <Text style={styles.pageTitle}>Inicio</Text>
          <Text style={styles.greeting}>
            Hola{user?.name ? `, ${user.name}` : ''}. Resumen actualizado desde el sistema.
          </Text>
        </View>

        {/* Resumen Diario banner */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroDumbbell}>
            <MaterialCommunityIcons name="dumbbell" size={120} color="#a78bfa" />
          </View>
          <Text style={styles.heroEyebrow}>Resumen diario</Text>
          <Text style={styles.heroTitle}>Entrena con datos reales del sistema</Text>
          <Text style={styles.heroDesc}>
            Este panel usa los servicios actuales de rutinas, músculos y ejercicios para mostrar el
            estado disponible en la plataforma.
          </Text>
        </View>

        {/* Stat cards */}
        <View style={[styles.statsRow, isCompactLayout && styles.statsRowCompact]}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.statCol, isCompactLayout && styles.statColCompact]}>
              <StatCard {...s} compact={isCompactLayout} />
            </View>
          ))}
        </View>

        <TodayRoutineBanner
          todaySlug={todaySlug}
          todayLabel={todayLabel}
          todaysRoutines={todaysRoutines}
          personalRoutineCount={personalRoutines.length}
        />

        {/* Quick actions */}
        <Text style={styles.quickSectionLabel}>Acciones rápidas</Text>
        <View style={styles.quickList}>
          {quickActions.map((q) => (
            <QuickCard key={q.label} {...q} />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020203',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 100,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  pageHeader: {
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 2.2,
    color: '#7c3aed',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 42,
  },
  greeting: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.35)',
  },
  todayBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 26,
    marginBottom: 28,
    backgroundColor: '#0b0911',
    borderWidth: StyleSheet.hairlineWidth,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(124,58,237,0.78)',
    position: 'relative',
    overflow: 'hidden',
  },
  todayBannerGlow: {
    position: 'absolute',
    right: -36,
    top: -42,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(109,40,217,0.08)',
    pointerEvents: 'none',
  },
  todayBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(109,40,217,0.18)',
    borderColor: 'rgba(139,92,246,0.35)',
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayBannerCopy: {
    flex: 1,
    gap: 4,
  },
  todayBannerEyebrow: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 1.6,
    color: '#8b5cf6',
    textTransform: 'uppercase',
  },
  todayBannerTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
    fontFamily: TYPOGRAPHY.fonts.display,
  },
  todayBannerDesc: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 13,
    lineHeight: 19,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  todayRoutineList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  todayRoutinePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(109,40,217,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
  },
  todayRoutinePillText: {
    color: '#c4b5fd',
    fontSize: 11,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  heroCard: {
    borderRadius: 20,
    paddingVertical: 32,
    paddingHorizontal: 36,
    marginBottom: 24,
    backgroundColor: '#090910',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.22)',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -80,
    top: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(109,40,217,0.06)',
    pointerEvents: 'none',
  },
  heroDumbbell: {
    position: 'absolute',
    right: 32,
    top: '50%',
    marginTop: -60,
    opacity: 0.06,
  },
  heroEyebrow: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 2.4,
    color: '#8b5cf6',
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 12,
    maxWidth: 520,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 21,
    maxWidth: 560,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 28,
  },
  statsRowCompact: {
    flexWrap: 'wrap',
    gap: 12,
  },
  statCol: {
    flex: 1,
  },
  statColCompact: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 140,
    minWidth: 140,
  },
  statCard: {
    borderRadius: 18,
    paddingVertical: 28,
    paddingHorizontal: 26,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#090910',
    position: 'relative',
    overflow: 'hidden',
  },
  statCardCompact: {
    minHeight: 166,
    paddingVertical: 20,
    paddingHorizontal: 18,
  },
  statGlow: {
    position: 'absolute',
    top: -30,
    right: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    pointerEvents: 'none',
    overflow: 'hidden',
  },
  statGlowInner: {
    ...StyleSheet.absoluteFill,
    borderRadius: 50,
    opacity: 0.7,
  },
  statIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  statValue: {
    fontSize: 44,
    fontWeight: '700',
    lineHeight: 44,
    marginBottom: 10,
    letterSpacing: -0.5,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  statValueCompact: {
    fontSize: 34,
    lineHeight: 36,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statSub: {
    fontSize: 12,
  },
  quickSectionLabel: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 1.6,
    color: 'rgba(255,255,255,0.2)',
    textTransform: 'uppercase',
    marginBottom: 14,
  },
  quickList: {
    gap: 10,
  },
  quickCard: {
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#090910',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  quickIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(109,40,217,0.14)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTextWrap: {
    flex: 1,
  },
  quickLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
  },
  quickHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
    marginTop: 2,
  },
});
