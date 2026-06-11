import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppBackground } from '@/components/AppBackground';
import { TopBar } from '@/components/TopBar';
import { useExercises, useMuscles, useRoutines } from '@/hooks';
import { useAuth } from '@/hooks/use-auth';
import { ROUTES } from '@/constants';
import { TYPOGRAPHY } from '@/theme';

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

function StatCard({
  value, label, sub, icon, accent, glow,
}: {
  value: number; label: string; sub: string;
  icon: string; accent: string; glow: string;
}) {
  return (
    <Pressable
      style={({ hovered }) => [
        styles.statCard,
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
          <Text style={[styles.statValue, { color: '#fff' }]}>{value}</Text>
          <Text style={[styles.statLabel, { color: accent }]}>{label}</Text>
          <Text style={[styles.statSub, { color: 'rgba(255,255,255,0.28)' }]}>{sub}</Text>
        </>
      )}
    </Pressable>
  );
}

function QuickCard({
  label, hint, icon, onPress,
}: {
  label: string; hint: string; icon: string; onPress: () => void;
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
  const { user } = useAuth();
  const routines = useRoutines();
  const muscles = useMuscles();
  const exercises = useExercises();
  const muscleCount = muscles.meta?.total ?? muscles.items.length;
  const exerciseCount = exercises.meta?.total ?? exercises.items.length;

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
        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statCol}>
              <StatCard {...s} />
            </View>
          ))}
        </View>

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
  statCol: {
    flex: 1,
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
    ...StyleSheet.absoluteFillObject,
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
