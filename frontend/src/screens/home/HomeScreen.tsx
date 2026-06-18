import { useEffect, useRef, useState, type ComponentProps } from 'react';
import {
  Animated,
  Easing,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { AppBackground } from '@/components/AppBackground';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { useExercises, useMuscles, useRoutines, useWeeklyProgress } from '@/hooks';
import type { WeeklyProgress, WeeklyProgressDay } from '@/interfaces/weekly-progress';
import type { Routine } from '@/interfaces/routine';
import { TYPOGRAPHY } from '@/theme';
import { shadowStyle } from '@/utils';

type MaterialIconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const ICONS = {
  Repeat2: 'repeat-variant',
  Target: 'bullseye',
  Dumbbell: 'dumbbell',
  TrendingUp: 'trending-up',
  Flame: 'fire',
} as const;

const WEEKDAY_SLUGS = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'] as const;

const PROMO_SLIDES = [
  {
    image: require('@/assets/images/dashboard-ads/ad-6.jpeg'),
    eyebrow: 'Anuncio destacado',
    title: 'Fitness is not a one-time thing. It is a lifestyle.',
    description:
      'Campanas visuales de alto impacto para mover membresias, clases especiales y retos semanales.',
    chip: 'Brand campaign',
  },
  {
    image: require('@/assets/images/dashboard-ads/ad-7.jpeg'),
    eyebrow: 'Promo de temporada',
    title: 'Stay fit, not still.',
    description:
      'Ideal para anunciar descuentos anuales, bonos por inscripcion y activaciones de temporada.',
    chip: '20% off annual',
  },
  {
    image: require('@/assets/images/dashboard-ads/ad-8.jpeg'),
    eyebrow: 'Nueva membresia',
    title: 'Get in shape. Become stronger.',
    description:
      'Usa este espacio para empujar nuevas membresias, clases premium o beneficios del mes.',
    chip: 'Join our gym',
  },
  {
    image: require('@/assets/images/dashboard-ads/ad-9.jpeg'),
    eyebrow: 'Comunidad activa',
    title: 'Historias reales para motivar asistencia y permanencia.',
    description:
      'Perfecto para destacar transformaciones, rutinas recomendadas y logros de tus usuarios.',
    chip: 'Fitness stories',
  },
  {
    image: require('@/assets/images/dashboard-ads/ad-10.jpeg'),
    eyebrow: 'Entrena pro',
    title: 'Visuales potentes para retos, clases funcionales y programas elite.',
    description:
      'Convierte el dashboard en una vitrina viva para tus anuncios internos mas importantes.',
    chip: 'Cinematic tones',
  },
] as const;

const INTRO_SLIDE = {
  type: 'intro' as const,
  eyebrow: 'Resumen diario',
  title: 'Entrena con datos reales del sistema',
  description:
    'Este panel usa los servicios actuales de rutinas, musculos y ejercicios para mostrar el estado disponible en la plataforma.',
  chip: 'System live data',
};

const HERO_SLIDES = [
  INTRO_SLIDE,
  ...PROMO_SLIDES.map((slide) => ({
    type: 'promo' as const,
    ...slide,
  })),
] as const;

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
          ...shadowStyle({
            color: hovered ? 'rgba(109,40,217,0.18)' : 'rgba(109,40,217,0.08)',
            opacity: hovered ? 0.4 : 0.22,
            radius: hovered ? 32 : 18,
            elevation: hovered ? 8 : 0,
          }),
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
  value,
  label,
  sub,
  icon,
  accent,
  glow,
  compact,
}: {
  value: number;
  label: string;
  sub: string;
  icon: MaterialIconName;
  accent: string;
  glow: string;
  compact?: boolean;
}) {
  return (
    <Pressable
      style={({ hovered }) => [
        styles.statCard,
        compact && styles.statCardCompact,
        {
          borderColor: hovered ? 'rgba(139,92,246,0.5)' : 'rgba(139,92,246,0.14)',
          ...shadowStyle({
            color: hovered ? glow : 'transparent',
            opacity: 0.4,
            radius: 32,
            elevation: hovered ? 8 : 0,
          }),
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
          <Text style={[styles.statValue, compact && styles.statValueCompact]}>{value}</Text>
          <Text style={[styles.statLabel, { color: accent }]} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.statSub} numberOfLines={2}>
            {sub}
          </Text>
        </>
      )}
    </Pressable>
  );
}

function QuickCard({
  label,
  hint,
  icon,
  onPress,
}: {
  label: string;
  hint: string;
  icon: MaterialIconName;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [
        styles.quickCard,
        {
          borderColor: hovered ? 'rgba(139,92,246,0.42)' : 'rgba(139,92,246,0.12)',
          ...shadowStyle({
            color: hovered ? 'rgba(109,40,217,0.12)' : 'transparent',
            opacity: 0.4,
            radius: 20,
            elevation: hovered ? 4 : 0,
          }),
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

function WeeklyProgressPanel({
  progress,
  loading,
  updating,
  error,
  onToggleToday,
}: {
  progress: WeeklyProgress | null;
  loading: boolean;
  updating: boolean;
  error: string | null;
  onToggleToday: (day: WeeklyProgressDay) => void;
}) {
  const today = progress?.days.find((day) => day.is_today) ?? null;
  const nextPending = progress?.next_pending_day ?? null;
  const completedLabel = progress
    ? `${progress.completed_target_days}/${progress.target_days} dias objetivo`
    : 'Cargando progreso';
  const guidance = progress?.target_days
    ? nextPending
      ? `Siguiente pendiente: ${nextPending.label}`
      : 'Todas las rutinas programadas estan listas.'
    : 'Asocia rutinas a dias para activar metas semanales.';

  return (
    <View style={styles.progressCard}>
      <View style={styles.progressHeader}>
        <View style={styles.progressTitleWrap}>
          <Text style={styles.progressEyebrow}>Progreso semanal</Text>
          <Text style={styles.progressTitle}>
            {loading && !progress ? 'Calculando tu semana' : progress?.status_label ?? 'Sin datos'}
          </Text>
          <Text style={styles.progressHint}>{error ?? guidance}</Text>
        </View>
        <View style={styles.progressRing}>
          <Text style={styles.progressPercent}>{progress?.percentage ?? 0}%</Text>
          <Text style={styles.progressMini}>{completedLabel}</Text>
        </View>
      </View>

      <View style={styles.progressBarTrack}>
        <View style={[styles.progressBarFill, { width: `${progress?.percentage ?? 0}%` }]} />
      </View>

      <View style={styles.weekGrid}>
        {(progress?.days ?? []).map((day) => {
          const active = day.completed;
          const scheduled = day.is_scheduled;

          return (
            <Pressable
              key={day.date}
              onPress={() => day.is_today ? onToggleToday(day) : undefined}
              disabled={!day.is_today || updating}
              style={({ hovered }) => [
                styles.weekDay,
                day.is_today && styles.weekDayToday,
                active && styles.weekDayDone,
                !scheduled && styles.weekDayRest,
                hovered && day.is_today && !updating && styles.weekDayHover,
              ]}>
              <Text style={[styles.weekDayLabel, active && styles.weekDayLabelDone]}>
                {day.label.slice(0, 3)}
              </Text>
              <MaterialCommunityIcons
                name={active ? 'check-circle' : scheduled ? 'calendar-clock' : 'minus-circle-outline'}
                size={16}
                color={active ? '#d9ff2b' : scheduled ? '#a78bfa' : 'rgba(255,255,255,0.22)'}
              />
              <Text style={styles.weekDayRoutine} numberOfLines={2}>
                {scheduled ? day.routines.map((routine) => routine.name).join(', ') : 'Descanso'}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {today ? (
        <Pressable
          onPress={() => onToggleToday(today)}
          disabled={updating}
          style={({ hovered }) => [
            styles.progressAction,
            today.completed && styles.progressActionDone,
            hovered && !updating && styles.progressActionHover,
            updating && styles.progressActionDisabled,
          ]}>
          <MaterialCommunityIcons
            name={today.completed ? 'check' : 'plus'}
            size={15}
            color={today.completed ? '#050505' : '#fff'}
          />
          <Text style={[styles.progressActionText, today.completed && styles.progressActionTextDone]}>
            {updating
              ? 'Actualizando...'
              : today.completed
                ? 'Quitar marca de hoy'
                : 'Marcar entrenamiento de hoy'}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function WeeklyProgressModal({
  visible,
  progress,
  updating,
  error,
  onClose,
  onToggleToday,
}: {
  visible: boolean;
  progress: WeeklyProgress | null;
  updating: boolean;
  error: string | null;
  onClose: () => void;
  onToggleToday: (day: WeeklyProgressDay) => void;
}) {
  const today = progress?.days.find((day) => day.is_today) ?? null;
  const nextPending = progress?.next_pending_day ?? null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.progressModalOverlay} onPress={onClose}>
        <Pressable style={styles.progressModalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.progressModalHeader}>
            <View>
              <Text style={styles.progressEyebrow}>Progreso semanal</Text>
              <Text style={styles.progressModalTitle}>{progress?.status_label ?? 'Sin datos'}</Text>
              <Text style={styles.progressHint}>
                {error ??
                  (nextPending
                    ? `Siguiente pendiente: ${nextPending.label}`
                    : 'Resumen de asistencia de la semana actual.')}
              </Text>
            </View>
            <Pressable onPress={onClose} style={styles.progressModalClose}>
              <MaterialCommunityIcons name="close" size={18} color="rgba(255,255,255,0.72)" />
            </Pressable>
          </View>

          <View style={styles.progressModalStats}>
            <View style={styles.progressModalStat}>
              <Text style={styles.progressModalValue}>{progress?.percentage ?? 0}%</Text>
              <Text style={styles.progressMini}>cumplimiento</Text>
            </View>
            <View style={styles.progressModalStat}>
              <Text style={styles.progressModalValue}>{progress?.completed_target_days ?? 0}</Text>
              <Text style={styles.progressMini}>dias cumplidos</Text>
            </View>
            <View style={styles.progressModalStat}>
              <Text style={styles.progressModalValue}>{progress?.target_days ?? 0}</Text>
              <Text style={styles.progressMini}>dias objetivo</Text>
            </View>
          </View>

          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progress?.percentage ?? 0}%` }]} />
          </View>

          <ScrollView
            style={styles.progressModalDaysScroll}
            contentContainerStyle={styles.progressModalDays}
            showsVerticalScrollIndicator={false}>
            {(progress?.days ?? []).map((day) => (
              <View
                key={day.date}
                style={[
                  styles.progressModalDay,
                  day.completed && styles.progressModalDayDone,
                  day.is_today && styles.progressModalDayToday,
                ]}>
                <View style={styles.progressModalDayTop}>
                  <Text style={[styles.weekDayLabel, day.completed && styles.weekDayLabelDone]}>
                    {day.label}
                  </Text>
                  <MaterialCommunityIcons
                    name={day.completed ? 'check-circle' : day.is_scheduled ? 'calendar-clock' : 'minus-circle-outline'}
                    size={17}
                    color={day.completed ? '#d9ff2b' : day.is_scheduled ? '#a78bfa' : 'rgba(255,255,255,0.24)'}
                  />
                </View>
                <Text style={styles.weekDayRoutine} numberOfLines={2}>
                  {day.is_scheduled ? day.routines.map((routine) => routine.name).join(', ') : 'Descanso'}
                </Text>
              </View>
            ))}
          </ScrollView>

          {today ? (
            <Pressable
              onPress={() => onToggleToday(today)}
              disabled={updating}
              style={[
                styles.progressAction,
                styles.progressModalAction,
                today.completed && styles.progressActionDone,
                updating && styles.progressActionDisabled,
              ]}>
              <MaterialCommunityIcons
                name={today.completed ? 'check' : 'plus'}
                size={15}
                color={today.completed ? '#050505' : '#fff'}
              />
              <Text style={[styles.progressActionText, today.completed && styles.progressActionTextDone]}>
                {updating
                  ? 'Actualizando...'
                  : today.completed
                    ? 'Quitar marca de hoy'
                    : 'Marcar entrenamiento de hoy'}
              </Text>
            </Pressable>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PromoCarousel({ compact }: { compact: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [incomingIndex, setIncomingIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const currentTranslateX = useRef(new Animated.Value(0)).current;
  const incomingTranslateX = useRef(new Animated.Value(0)).current;
  const isTransitioningRef = useRef(false);

  const activeSlide = HERO_SLIDES[activeIndex];
  const incomingSlide = incomingIndex === null ? null : HERO_SLIDES[incomingIndex];

  function renderSlide(
    slide: (typeof HERO_SLIDES)[number],
    slideIndex: number,
    animatedValue?: Animated.Value
  ) {
    const isIntro = slide.type === 'intro';
    const isActive = slideIndex === activeIndex && incomingIndex === null;

    return (
      <Animated.View
        style={[
          styles.slideLayer,
          { pointerEvents: isActive ? 'auto' : 'none' },
          animatedValue ? { transform: [{ translateX: animatedValue }] } : null,
        ]}>
        {isIntro ? (
          <>
            <View style={styles.heroGlow} />
            <View style={styles.heroDumbbell}>
              <MaterialCommunityIcons name="dumbbell" size={120} color="#a78bfa" />
            </View>
            <View style={[styles.heroIntroContent, compact && styles.heroIntroContentCompact]}>
              <Text style={styles.heroEyebrow}>{slide.eyebrow}</Text>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{slide.title}</Text>
              <Text style={[styles.heroDesc, compact && styles.heroDescCompact]}>{slide.description}</Text>
            </View>
          </>
        ) : (
          <>
            <Image source={slide.image} style={styles.carouselImage} resizeMode="cover" />
            <View style={styles.carouselImageShade} />
            <View style={styles.carouselImageVignette} />
            <View style={styles.carouselGrid} />
            <View style={styles.carouselAccentOrb} />
            <View style={[styles.carouselContent, compact && styles.carouselContentCompact]}>
              <View style={styles.carouselCopy}>
                <Text style={styles.heroEyebrow}>{slide.eyebrow}</Text>
                <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{slide.title}</Text>
                <Text style={[styles.heroDesc, compact && styles.heroDescCompact]}>{slide.description}</Text>
              </View>

              <View style={[styles.carouselFooter, compact && styles.carouselFooterCompact]}>
                <View style={styles.carouselMeta}>
                  <View style={styles.carouselChip}>
                    <Text style={styles.carouselChipText}>{slide.chip}</Text>
                  </View>
                  <Text style={styles.carouselCounter}>
                    {String(slideIndex + 1).padStart(2, '0')} / {String(HERO_SLIDES.length).padStart(2, '0')}
                  </Text>
                </View>

                <View style={styles.carouselDots}>
                  {HERO_SLIDES.map((item, index) => {
                    const active = index === activeIndex && incomingIndex === null;

                    return (
                      <Pressable
                        key={item.title}
                        onPress={() => goToSlide(index)}
                        style={({ hovered }) => [
                          styles.carouselDot,
                          active && styles.carouselDotActive,
                          hovered && !active && styles.carouselDotHover,
                        ]}
                      />
                    );
                  })}
                </View>
              </View>
            </View>
          </>
        )}
      </Animated.View>
    );
  }

  function goToSlide(nextIndex: number) {
    if (isTransitioningRef.current) {
      return;
    }

    const total = HERO_SLIDES.length;
    const normalizedIndex = (nextIndex + total) % total;

    if (normalizedIndex === activeIndex) {
      return;
    }

    if (!containerWidth) {
      setActiveIndex(normalizedIndex);
      return;
    }

    isTransitioningRef.current = true;
    setIncomingIndex(normalizedIndex);
    currentTranslateX.setValue(0);
    incomingTranslateX.setValue(containerWidth);

    Animated.parallel([
      Animated.timing(currentTranslateX, {
        toValue: -containerWidth,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(incomingTranslateX, {
        toValue: 0,
        duration: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: Platform.OS !== 'web',
      }),
    ]).start(() => {
      setActiveIndex(normalizedIndex);
      setIncomingIndex(null);
      currentTranslateX.setValue(0);
      incomingTranslateX.setValue(0);
      isTransitioningRef.current = false;
    });
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      goToSlide(activeIndex + 1);
    }, 3000);

    return () => clearTimeout(timer);
  }, [activeIndex, containerWidth]);

  return (
    <View
      onLayout={(event) => setContainerWidth(event.nativeEvent.layout.width)}
      style={[styles.heroCard, styles.carouselCard, compact && styles.carouselCardCompact]}>
      {renderSlide(activeSlide, activeIndex, incomingIndex === null ? undefined : currentTranslateX)}
      {incomingSlide ? renderSlide(incomingSlide, incomingIndex ?? activeIndex, incomingTranslateX) : null}
    </View>
  );
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const routines = useRoutines();
  const muscles = useMuscles();
  const exercises = useExercises();
  const weeklyProgress = useWeeklyProgress();
  const [progressModalVisible, setProgressModalVisible] = useState(false);
  const muscleCount = muscles.meta?.total ?? muscles.items.length;
  const exerciseCount = exercises.meta?.total ?? exercises.items.length;
  const isCompactLayout = width < 640;
  const isHeroCompact = width < 860;
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
      sub: routines.error ?? 'disponibles para tu sesion',
      icon: ICONS.Repeat2,
      accent: '#8b5cf6',
      glow: 'rgba(109,40,217,0.18)',
    },
    {
      value: muscleCount,
      label: 'Musculos',
      sub: muscles.error ?? 'grupos musculares registrados',
      icon: ICONS.Target,
      accent: '#a78bfa',
      glow: 'rgba(139,92,246,0.16)',
    },
    {
      value: exerciseCount,
      label: 'Ejercicios',
      sub: exercises.error ?? 'ejercicios del catalogo local',
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
      hint: weeklyProgress.item ? `${weeklyProgress.item.percentage}% completado` : 'Resumen de esta semana',
      onPress: () => setProgressModalVisible(true),
    },
    {
      label: 'Explorar ejercicios',
      icon: ICONS.Flame,
      hint: 'Catalogo completo',
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
        <View style={styles.pageHeader}>
          <Text style={styles.eyebrow}>GYM PONTE PINUO</Text>
          <Text style={styles.pageTitle}>Inicio</Text>
          <Text style={styles.greeting}>
            Hola{user?.name ? `, ${user.name}` : ''}. Resumen actualizado desde el sistema.
          </Text>
        </View>

        <PromoCarousel compact={isHeroCompact} />

        <View style={[styles.statsRow, isCompactLayout && styles.statsRowCompact]}>
          {stats.map((stat) => (
            <View key={stat.label} style={[styles.statCol, isCompactLayout && styles.statColCompact]}>
              <StatCard {...stat} compact={isCompactLayout} />
            </View>
          ))}
        </View>

        <TodayRoutineBanner
          todaySlug={todaySlug}
          todayLabel={todayLabel}
          todaysRoutines={todaysRoutines}
          personalRoutineCount={personalRoutines.length}
        />

        <WeeklyProgressPanel
          progress={weeklyProgress.item}
          loading={weeklyProgress.loading}
          updating={weeklyProgress.updating}
          error={weeklyProgress.error}
          onToggleToday={(day) => {
            void weeklyProgress.submit({
              date: day.date,
              completed: !day.completed,
            });
          }}
        />

        <Text style={styles.quickSectionLabel}>Acciones rapidas</Text>
        <View style={styles.quickList}>
          {quickActions.map((action) => (
            <QuickCard key={action.label} {...action} />
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <WeeklyProgressModal
        visible={progressModalVisible}
        progress={weeklyProgress.item}
        updating={weeklyProgress.updating}
        error={weeklyProgress.error}
        onClose={() => setProgressModalVisible(false)}
        onToggleToday={(day) => {
          void weeklyProgress.submit({
            date: day.date,
            completed: !day.completed,
          });
        }}
      />
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
    fontFamily: TYPOGRAPHY.fonts.display,
  },
  greeting: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.35)',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  heroCard: {
    borderRadius: 20,
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
  heroIntroContent: {
    paddingVertical: 32,
    paddingHorizontal: 36,
    gap: 12,
  },
  heroIntroContentCompact: {
    paddingHorizontal: 22,
    paddingVertical: 24,
  },
  carouselCard: {
    minHeight: 290,
    justifyContent: 'space-between',
  },
  carouselCardCompact: {
    minHeight: 360,
  },
  slideLayer: {
    ...StyleSheet.absoluteFill,
  },
  carouselImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  carouselImageShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2,2,4,0.34)',
  },
  carouselImageVignette: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(7,5,13,0.46)',
  },
  carouselGrid: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    opacity: 0.18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  carouselAccentOrb: {
    position: 'absolute',
    right: -70,
    top: -58,
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(109,40,217,0.18)',
  },
  carouselContent: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 32,
    paddingHorizontal: 36,
    gap: 28,
  },
  carouselContentCompact: {
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 24,
  },
  carouselCopy: {
    maxWidth: 590,
    gap: 12,
  },
  heroEyebrow: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 2.4,
    color: '#d8b4fe',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.4,
    lineHeight: 34,
    fontFamily: TYPOGRAPHY.fonts.display,
    maxWidth: 620,
  },
  heroTitleCompact: {
    fontSize: 24,
    lineHeight: 28,
    maxWidth: '100%',
  },
  heroDesc: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 21,
    maxWidth: 560,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  heroDescCompact: {
    maxWidth: '100%',
  },
  carouselFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  carouselFooterCompact: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  carouselMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carouselChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(217,255,43,0.92)',
  },
  carouselChipText: {
    color: '#050505',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  carouselCounter: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 11,
    letterSpacing: 1.4,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  carouselDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  carouselDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  carouselDotActive: {
    width: 32,
    backgroundColor: '#d9ff2b',
    borderColor: '#d9ff2b',
  },
  carouselDotHover: {
    backgroundColor: 'rgba(255,255,255,0.42)',
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
  progressCard: {
    borderRadius: 18,
    padding: 22,
    marginBottom: 28,
    backgroundColor: '#090910',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.16)',
    borderLeftWidth: 3,
    borderLeftColor: '#d9ff2b',
    gap: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 18,
  },
  progressTitleWrap: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  progressEyebrow: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 1.8,
    color: '#d9ff2b',
    textTransform: 'uppercase',
  },
  progressTitle: {
    color: '#fff',
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 24,
    fontFamily: TYPOGRAPHY.fonts.display,
  },
  progressHint: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  progressRing: {
    width: 112,
    minHeight: 72,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(217,255,43,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(217,255,43,0.28)',
    paddingHorizontal: 10,
  },
  progressPercent: {
    color: '#d9ff2b',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  progressMini: {
    color: 'rgba(255,255,255,0.42)',
    fontSize: 10,
    textAlign: 'center',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    minWidth: 2,
    borderRadius: 999,
    backgroundColor: '#d9ff2b',
  },
  weekGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  weekDay: {
    flexGrow: 1,
    flexBasis: 118,
    minWidth: 112,
    minHeight: 94,
    borderRadius: 12,
    padding: 10,
    gap: 7,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  weekDayToday: {
    borderColor: 'rgba(167,139,250,0.5)',
  },
  weekDayDone: {
    backgroundColor: 'rgba(217,255,43,0.08)',
    borderColor: 'rgba(217,255,43,0.32)',
  },
  weekDayRest: {
    opacity: 0.72,
  },
  weekDayHover: {
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  weekDayLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  weekDayLabelDone: {
    color: '#d9ff2b',
  },
  weekDayRoutine: {
    color: 'rgba(255,255,255,0.36)',
    fontSize: 11,
    lineHeight: 15,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  progressAction: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#5b21b6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.5)',
  },
  progressActionDone: {
    backgroundColor: '#d9ff2b',
    borderColor: 'rgba(217,255,43,0.55)',
  },
  progressActionHover: {
    transform: Platform.OS === 'web' ? [{ translateY: -1 }] : [],
  },
  progressActionDisabled: {
    opacity: 0.66,
  },
  progressActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  progressActionTextDone: {
    color: '#050505',
  },
  progressModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.74)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  progressModalCard: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '92%',
    borderRadius: 20,
    padding: 22,
    gap: 16,
    backgroundColor: '#090910',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
  },
  progressModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  progressModalTitle: {
    color: '#fff',
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.display,
  },
  progressModalClose: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  progressModalStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  progressModalStat: {
    flexGrow: 1,
    flexBasis: 150,
    borderRadius: 14,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.035)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  progressModalValue: {
    color: '#d9ff2b',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  progressModalDaysScroll: {
    maxHeight: 310,
  },
  progressModalDays: {
    gap: 8,
    paddingRight: 2,
  },
  progressModalDay: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.025)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  progressModalDayDone: {
    backgroundColor: 'rgba(217,255,43,0.08)',
    borderColor: 'rgba(217,255,43,0.32)',
  },
  progressModalDayToday: {
    borderColor: 'rgba(167,139,250,0.55)',
  },
  progressModalDayTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  progressModalAction: {
    alignSelf: 'stretch',
    justifyContent: 'center',
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
    color: '#fff',
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
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  statSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.28)',
    fontFamily: TYPOGRAPHY.fonts.body,
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
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  quickHint: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
    marginTop: 2,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  bottomSpacer: {
    height: 40,
  },
});
