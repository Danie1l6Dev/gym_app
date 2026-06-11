import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Alert, Modal } from 'react-native';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Switch,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppBackground } from '@/components/AppBackground';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { TextBlock } from '@/components/TextBlock';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants';
import { useAuth, useCreateRoutine, useMuscles, usePaginatedExercises, useRoutine, useUpdateRoutine } from '@/hooks';
import type { Exercise } from '@/interfaces/exercise';
import type { RoutineInputExercise } from '@/interfaces/routine';
import { TYPOGRAPHY } from '@/theme';
import { getExerciseDescription, getExerciseDisplayName, getMuscleDisplayName, getMuscleSubtext } from '@/utils/fitness';

type SelectedExercise = {
  exercise: Exercise;
  sets: string;
  reps: string;
  restSeconds: string;
  notes: string;
};

function getSubmitErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === 'object') {
    const message = 'message' in error && typeof error.message === 'string' ? error.message : null;
    const data = 'data' in error && error.data && typeof error.data === 'object' ? error.data as {
      errors?: Record<string, string[]>;
    } : null;
    const fieldErrors = data?.errors
      ? Object.values(data.errors).flat().filter((value) => typeof value === 'string' && value.trim().length > 0)
      : [];

    if (fieldErrors.length > 0) {
      return fieldErrors.join('\n');
    }

    if (message) {
      return message;
    }
  }

  return fallback;
}

const ROUTINE_THEME = {
  colors: {
    background: '#020204',
    backgroundSoft: '#050508',
    backgroundSelected: 'rgba(109,40,217,0.14)',
    surface: '#090910',
    surfaceElevated: '#0f0b17',
    border: 'rgba(139,92,246,0.14)',
    primary: '#7c3aed',
    text: '#ffffff',
    textMuted: 'rgba(255,255,255,0.45)',
    textSubtle: 'rgba(255,255,255,0.28)',
    shadow: 'rgba(109,40,217,0.16)',
  },
};

function buildRoutineExercises(selected: SelectedExercise[]): RoutineInputExercise[] {
  return selected.map((entry, index) => ({
    exercise_id: entry.exercise.id,
    position: index + 1,
    sets: entry.sets ? Number(entry.sets) : null,
    reps: entry.reps ? Number(entry.reps) : null,
    rest_seconds: entry.restSeconds ? Number(entry.restSeconds) : null,
    notes: entry.notes.trim() || null,
  }));
}

function AppHeader({ title, subtitle }: { title: string; subtitle?: string; showBack?: boolean }) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        <Text style={styles.eyebrow}>GYM PONTE PIÑUO</Text>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.greeting}>{subtitle}</Text> : null}
      </View>
      <Pressable
        onPress={() => {
          if (typeof router.canGoBack === 'function' && router.canGoBack()) {
            router.back();
            return;
          }

          router.replace(ROUTES.app.routines);
        }}
        style={({ hovered, pressed }) => [
          styles.backBtn,
          hovered && styles.backBtnHover,
          pressed && styles.pressed,
        ]}>
        <MaterialCommunityIcons name="arrow-left" size={16} color="#c4b5fd" />
        <Text style={styles.backBtnText}>Volver</Text>
      </Pressable>
    </View>
  );
}

function ExerciseSelectionCard({
  exercise,
  selected,
  onPress,
}: {
  exercise: Exercise;
  selected: boolean;
  onPress: () => void;
}) {
  const [failedGifUrl, setFailedGifUrl] = useState<string | null>(null);
  const title = getExerciseDisplayName(exercise);
  const description = getExerciseDescription(exercise);
  const muscleLabel =
    exercise.muscle?.display_name ?? exercise.muscle?.name_es ?? exercise.muscle?.name_en ?? '';
  const shouldShowGif = Boolean(exercise.gif_url && exercise.gif_url !== failedGifUrl);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.exerciseCard,
        {
          borderColor: selected ? 'rgba(139,92,246,0.58)' : 'rgba(139,92,246,0.14)',
          shadowColor: selected ? 'rgba(109,40,217,0.22)' : 'transparent',
          shadowOpacity: selected ? 1 : 0,
          shadowRadius: selected ? 24 : 0,
          shadowOffset: { width: 0, height: 0 },
          elevation: selected ? 5 : 0,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.exerciseImageWrap}>
        {shouldShowGif ? (
          <Image
            source={{ uri: exercise.gif_url }}
            style={styles.exerciseImage}
            contentFit="contain"
            contentPosition="center"
            cachePolicy="memory-disk"
            transition={120}
            onError={() => setFailedGifUrl(exercise.gif_url ?? null)}
          />
        ) : (
          <View style={styles.exercisePlaceholder}>
            <MaterialCommunityIcons name="dumbbell" size={24} color="#a78bfa" />
          </View>
        )}
        <View style={[styles.exerciseBadge, selected && styles.exerciseBadgeSelected]}>
          <Text style={[styles.exerciseBadgeText, selected && styles.exerciseBadgeTextSelected]}>
            {selected ? 'Seleccionado' : 'Añadir'}
          </Text>
        </View>
      </View>

      <View style={styles.exerciseCardBody}>
        <View style={styles.exerciseCardHeader}>
          <Text style={styles.exerciseTitle} numberOfLines={2}>
            {title}
          </Text>
          <MaterialCommunityIcons
            name={selected ? 'check-circle' : 'circle-outline'}
            size={20}
            color={selected ? '#a78bfa' : 'rgba(255,255,255,0.22)'}
          />
        </View>

        {description ? (
          <Text style={styles.exerciseDesc} numberOfLines={2}>
            {description}
          </Text>
        ) : null}

        {muscleLabel ? (
          <Text style={styles.exerciseMuscle} numberOfLines={1}>
            {muscleLabel}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function CreateRoutineScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const routineId = typeof params.id === 'string' ? params.id : undefined;
  const isEditing = Boolean(routineId);
  const theme = ROUTINE_THEME;
  const { width } = useWindowDimensions();
  const isCompactLayout = width < 600;
  const { user } = useAuth();
  const {
    item: routineToEdit,
    loading: routineLoading,
    error: routineError,
    retry: retryRoutine,
  } = useRoutine(routineId);
  const { items: muscles, loading: musclesLoading, error: musclesError, retry: retryMuscles } =
    useMuscles({ perPage: 100 });
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | number | null>(null);
  const [muscleModalVisible, setMuscleModalVisible] = useState(false);
  const [muscleSearch, setMuscleSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [onlyExercisesWithGif, setOnlyExercisesWithGif] = useState(true);
  const selectedMuscle = useMemo(
    () => muscles.find((muscle) => String(muscle.id) === String(selectedMuscleId ?? '')) ?? null,
    [muscles, selectedMuscleId]
  );

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [exercisesSectionOffset, setExercisesSectionOffset] = useState<number>(0);
  const [routineDetailsSectionOffset, setRoutineDetailsSectionOffset] = useState<number>(0);
  const [configSectionOffset, setConfigSectionOffset] = useState<number>(0);
  const routineDetailsOffsetRef = useRef(0);
  const selectedCountRef = useRef<number>(0);
  const pendingConfigScrollRef = useRef(false);

  const {
    items: exercises,
    loading: exercisesLoading,
    loadingPage: exercisesLoadingPage,
    error: exercisesError,
    retry: retryExercises,
    page: exercisesPage,
    lastPage: exercisesLastPage,
    goToPage,
  } = usePaginatedExercises({
    muscleId: selectedMuscleId ?? undefined,
    perPage: 10,
    hasGif: onlyExercisesWithGif,
    keepPreviousPages: false,
    enabled: Boolean(selectedMuscleId),
  });

  const pageOptions = useMemo(() => {
    const candidates = new Set<number>([
      exercisesPage - 4,
      exercisesPage - 3,
      exercisesPage - 2,
      exercisesPage - 1,
      exercisesPage,
      exercisesPage + 1,
      exercisesPage + 2,
      exercisesPage + 3,
      exercisesPage + 4,
    ]);

    return [...candidates]
      .filter((value) => value > 1 && value < exercisesLastPage)
      .sort((a, b) => a - b);
  }, [exercisesLastPage, exercisesPage]);

  const exerciseGridColumns = useMemo(() => {
    if (width < 600) return 1;
    if (width < 1024) return 2;
    return 3;
  }, [width]);

  const exerciseColumnWrapperStyle = useMemo(() => {
    if (exerciseGridColumns === 1) return undefined;
    return styles.exerciseColumnWrapper;
  }, [exerciseGridColumns]);

  const exerciseCardWrapperStyle = useMemo(() => {
    if (exerciseGridColumns === 1) return styles.exerciseCardWrapper;

    return [
      styles.exerciseCardWrapper,
      { maxWidth: `${100 / exerciseGridColumns}%` as `${number}%` },
    ];
  }, [exerciseGridColumns]);

  const scrollToOffset = useCallback((offset: number) => {
    if (!scrollViewRef.current) {
      return;
    }

    const scrollView = scrollViewRef.current as any;

    if (typeof scrollView.scrollTo === 'function') {
      try {
        scrollView.scrollTo({ y: offset, animated: true });
        return;
      } catch {
        scrollView.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
        return;
      }
    }
  }, []);

  const scrollToExercisesStart = useCallback(() => {
    scrollToOffset(exercisesSectionOffset || 0);
  }, [exercisesSectionOffset, scrollToOffset]);

  const scrollToConfigStart = useCallback(() => {
    scrollToOffset(configSectionOffset || 0);
  }, [configSectionOffset, scrollToOffset]);

  const scrollToRoutineDetailsStart = useCallback(() => {
    scrollToOffset(routineDetailsOffsetRef.current || routineDetailsSectionOffset || 0);
  }, [routineDetailsSectionOffset, scrollToOffset]);

  async function handlePageChange(nextPage: number) {
    await goToPage(nextPage);
  }

  useEffect(() => {
    if (exercisesSectionOffset <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      scrollToExercisesStart();
    }, 100);

    return () => clearTimeout(timeout);
  }, [exercisesPage, exercisesSectionOffset, scrollToExercisesStart]);

  const { submit: createRoutineSubmit, loading: creating, error: createError } = useCreateRoutine();
  const { submit: updateRoutineSubmit, loading: updating, error: updateError } = useUpdateRoutine();
  const saving = creating || updating;
  const submitError = createError ?? updateError;
  const isAdmin = user?.role?.slug === 'admin';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [nameMissing, setNameMissing] = useState(false);
  const [isPredefined, setIsPredefined] = useState(false);
  const [didPopulateForm, setDidPopulateForm] = useState(false);

  useEffect(() => {
    if (!isEditing || !routineToEdit || didPopulateForm) {
      return;
    }

    const timeout = setTimeout(() => {
      setName(routineToEdit.name ?? '');
      setDescription(routineToEdit.description ?? '');
      setIsPredefined(Boolean(routineToEdit.is_predefined));
      setSelected(
        (routineToEdit.exercises ?? []).map((exercise) => ({
          exercise,
          sets: String(exercise.pivot?.sets ?? ''),
          reps: String(exercise.pivot?.reps ?? ''),
          restSeconds: String(exercise.pivot?.rest_seconds ?? ''),
          notes: exercise.pivot?.notes ?? '',
        }))
      );
      setDidPopulateForm(true);
    }, 0);

    return () => clearTimeout(timeout);
  }, [didPopulateForm, isEditing, routineToEdit]);

  useEffect(() => {
    const previousCount = selectedCountRef.current;
    if (selected.length > previousCount) {
      pendingConfigScrollRef.current = true;
    }

    if (pendingConfigScrollRef.current && selected.length > 0 && configSectionOffset > 0) {
      const timeout = setTimeout(() => {
        scrollToConfigStart();
        pendingConfigScrollRef.current = false;
      }, 100);

      selectedCountRef.current = selected.length;
      return () => clearTimeout(timeout);
    }

    selectedCountRef.current = selected.length;
    return undefined;
  }, [selected.length, configSectionOffset, scrollToConfigStart]);

  const filteredMuscles = useMemo(() => {
    const q = muscleSearch.trim().toLowerCase();
    if (!q) return muscles;

    return muscles.filter((muscle) => {
      const displayName = getMuscleDisplayName(muscle).toLowerCase();
      const subtext = getMuscleSubtext(muscle).toLowerCase();
      const slug = (muscle.slug ?? '').toLowerCase();

      return displayName.includes(q) || subtext.includes(q) || slug.includes(q);
    });
  }, [muscleSearch, muscles]);

  const filteredExercises = useMemo(() => {
    const q = exerciseSearch.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((exercise) => {
      const title = getExerciseDisplayName(exercise).toLowerCase();
      const muscle = (exercise.muscle?.display_name ?? exercise.muscle?.name_es ?? exercise.muscle?.name_en ?? '').toLowerCase();
      return title.includes(q) || muscle.includes(q);
    });
  }, [exerciseSearch, exercises]);

  const selectedIds = useMemo(() => new Set(selected.map((entry) => String(entry.exercise.id))), [selected]);

  function toggleExercise(exercise: Exercise) {
    const id = String(exercise.id);
    if (selectedIds.has(id)) {
      setSelected((current) => current.filter((entry) => String(entry.exercise.id) !== id));
      return;
    }

    pendingConfigScrollRef.current = true;
    setSelected((current) => [
      ...current,
      {
        exercise,
        sets: '3',
        reps: '10',
        restSeconds: '60',
        notes: '',
      },
    ]);
  }

  function updateSelected(id: string, field: keyof Omit<SelectedExercise, 'exercise'>, value: string) {
    setSelected((current) =>
      current.map((entry) =>
        String(entry.exercise.id) === id ? { ...entry, [field]: value } : entry
      )
    );
  }

  async function handleSubmit() {
    const trimmedName = name.trim();

    console.log('[CreateRoutine] handleSubmit invoked', { name: trimmedName, selectedCount: selected.length });

    if (!trimmedName) {
      const message = 'El nombre de la rutina es obligatorio.';
      setNameMissing(true);
      setValidationError(message);
      setTimeout(() => {
        scrollToRoutineDetailsStart();
      }, 100);
      Alert.alert('Atención', message);
      return;
    }

    if (selected.length === 0) {
      const message = 'Selecciona al menos un ejercicio.';
      setValidationError(message);
      Alert.alert('Atención', message);
      return;
    }

    const payload = {
      name: trimmedName,
      description: description.trim() || null,
      is_predefined: isAdmin ? isPredefined : false,
      exercises: buildRoutineExercises(selected),
    };

    try {
      setValidationError(null);
      console.log('[CreateRoutine] payload', payload);
      const result = isEditing && routineId
        ? await updateRoutineSubmit(routineId, payload)
        : await createRoutineSubmit(payload);
      console.log('[CreateRoutine] submit result', result);
      if (isEditing && routineId) {
        router.replace(`/routines/${String(routineId)}`);
        return;
      }

      if (result?.item?.id) {
        router.push(`/routines/${String(result.item.id)}`);
        return;
      }

      setValidationError('No se pudo obtener el detalle de la rutina creada. Intenta nuevamente.');
    } catch (error) {
      console.error('[CreateRoutine] submit error', error);
      const message = getSubmitErrorMessage(
        error,
        isEditing ? 'Ocurrió un error al actualizar la rutina.' : 'Ocurrió un error al crear la rutina.'
      );
      setValidationError(message);
      setTimeout(() => {
        scrollToRoutineDetailsStart();
      }, 100);
    }
  }

  if (isEditing && routineLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBackground />
        <TopBar />
        <AppHeader title="Editar rutina" subtitle="Cargando datos de la rutina" showBack />
        <LoadingSpinner label="Preparando rutina" />
      </SafeAreaView>
    );
  }

  if (isEditing && routineError && !routineToEdit) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBackground />
        <TopBar />
        <View style={styles.loadingWrap}>
          <AppHeader title="Editar rutina" subtitle="No pudimos cargar la rutina" showBack />
          <EmptyState
            title="No pudimos cargar la rutina"
            description={routineError}
            icon="alert-circle-outline"
            actionLabel="Reintentar"
            onAction={() => void retryRoutine()}
          />
        </View>
      </SafeAreaView>
    );
  }

  if (musclesLoading && muscles.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <AppBackground />
        <TopBar />
        <AppHeader title="Crear rutina" subtitle="Cargando catálogo de ejercicios" showBack />
        <LoadingSpinner label="Preparando músculos" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground />
      <TopBar />
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader
          title={isEditing ? 'Editar rutina' : 'Crear rutina'}
          subtitle={
            isEditing
              ? 'Ajusta ejercicios, volumen y detalles de tu rutina.'
              : 'Construye una rutina personalizada paso a paso'
          }
          showBack
        />

        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={styles.heroIcon}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={108} color="#a78bfa" />
          </View>
          <TextBlock variant="eyebrow" color="primary">
            {isEditing ? 'Routine editor' : 'Routine builder'}
          </TextBlock>
          <TextBlock variant="header">
            {isEditing ? 'Actualiza ejercicios y define el volumen' : 'Selecciona ejercicios y define el volumen'}
          </TextBlock>
          <TextBlock variant="body" color="muted">
            Cada ejercicio guarda sets, reps, descanso y notas directamente en el pivot de rutina.
          </TextBlock>
        </View>

        {isAdmin ? (
          <View
            style={[
              styles.formCard,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleText}>
                <TextBlock variant="caption" color="muted">
                  Rutina recomendada
                </TextBlock>
                <TextBlock variant="caption" color="subtle">
                  Al activarla, la rutina será visible para todos los usuarios.
                </TextBlock>
              </View>
              <Switch
                value={isPredefined}
                onValueChange={setIsPredefined}
                trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                thumbColor="#fff"
              />
            </View>
          </View>
        ) : null}

        {(validationError || submitError) ? (
          <EmptyState
            title="Revisa los datos"
            description={validationError ?? submitError ?? ''}
            icon="alert-circle-outline"
          />
        ) : null}

        <View
          onLayout={(event) => {
            const nextOffset = event.nativeEvent.layout.y;
            routineDetailsOffsetRef.current = nextOffset;
            setRoutineDetailsSectionOffset(nextOffset);
          }}
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <View style={styles.fieldGroup}>
            <TextBlock variant="caption" color="muted">
              Nombre de rutina
            </TextBlock>
            <TextInput
              value={name}
              onChangeText={(value) => {
                setName(value);
                if (value.trim()) {
                  setNameMissing(false);
                }
              }}
              placeholder="Push Day"
              placeholderTextColor={theme.colors.textSubtle}
              autoCapitalize="words"
              autoCorrect={false}
              style={[
                styles.input,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text },
                nameMissing && styles.inputMissing,
              ]}
            />
            {nameMissing ? (
              <Text style={styles.fieldErrorText}>El nombre de la rutina es obligatorio.</Text>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <TextBlock variant="caption" color="muted">
              Descripción
            </TextBlock>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Rutina enfocada en empuje superior"
              placeholderTextColor={theme.colors.textSubtle}
              multiline
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text },
              ]}
            />
          </View>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
            <View style={[styles.sectionHeader, isCompactLayout && styles.sectionHeaderCompact]}>
              <View style={styles.muscleHeaderText}>
                <TextBlock variant="title">
                  {selectedMuscle ? getMuscleDisplayName(selectedMuscle) : '1. Elige un músculo'}
                </TextBlock>
                <TextBlock variant="caption" color="subtle">
                  {selectedMuscle ? 'Músculo seleccionado' : 'Selecciona un grupo'}
                </TextBlock>
              </View>
              <Pressable
                onPress={() => setMuscleModalVisible(true)}
                style={({ pressed }) => [
                  styles.muscleButton,
                  isCompactLayout && styles.muscleButtonFull,
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}>
                <TextBlock variant="button" numberOfLines={1} adjustsFontSizeToFit style={styles.muscleButtonLabel}>
                  {selectedMuscle ? 'Cambiar músculo' : 'Elegir músculo'}
                </TextBlock>
              </Pressable>
            </View>

            <TextBlock variant="caption" color="muted">
              Usa el picker para buscar y seleccionar el músculo antes de elegir ejercicios.
            </TextBlock>

            <Modal visible={muscleModalVisible} animationType="slide" transparent>
              <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.35)' }]}> 
                <View style={[styles.modalContent, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}> 
                  <View style={styles.modalHeader}>
                    <TextBlock variant="title">Seleccionar músculo</TextBlock>
                    <Pressable onPress={() => setMuscleModalVisible(false)}>
                      <TextBlock variant="button" color="primary">
                        Cerrar
                      </TextBlock>
                    </Pressable>
                  </View>

                  <SearchBar
                    label="Buscar músculo"
                    placeholder="Pecho, espalda, glúteos..."
                    value={muscleSearch}
                    onChangeText={setMuscleSearch}
                  />

                  {musclesError ? (
                    <EmptyState
                      title="No pudimos cargar los músculos"
                      description={musclesError}
                      icon="alert-circle-outline"
                      actionLabel="Reintentar"
                      onAction={retryMuscles}
                    />
                  ) : null}

                  {musclesLoading && muscles.length === 0 ? (
                    <LoadingSpinner label="Cargando músculos" />
                  ) : null}

                  {!musclesLoading && filteredMuscles.length === 0 ? (
                    <EmptyState
                      title="Sin músculos"
                      description="Prueba con otra búsqueda."
                      icon="arm-flex"
                    />
                  ) : null}

                  <ScrollView contentContainerStyle={styles.muscleGrid} showsVerticalScrollIndicator={false}>
                    {filteredMuscles.map((muscle) => {
                      const selected = String(muscle.id) === String(selectedMuscleId ?? '');
                      return (
                        <Pressable
                          key={muscle.id}
                          onPress={() => {
                            setSelectedMuscleId(muscle.id);
                            setExerciseSearch('');
                            setMuscleModalVisible(false);
                          }}
                          style={({ pressed }) => [
                            styles.muscleChip,
                            {
                              backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.backgroundSoft,
                              borderColor: selected ? theme.colors.primary : theme.colors.border,
                            },
                            pressed && styles.pressed,
                          ]}>
                          <View style={styles.muscleChipText}>
                            <TextBlock variant="caption" color={selected ? 'primary' : 'muted'} numberOfLines={1}>
                              {getMuscleDisplayName(muscle)}
                            </TextBlock>
                            <TextBlock variant="caption" color="subtle" numberOfLines={1}>
                              {getMuscleSubtext(muscle) || muscle.slug || 'Grupo muscular'}
                            </TextBlock>
                          </View>
                          <MaterialCommunityIcons
                            name={selected ? 'check-circle' : 'circle-outline'}
                            size={18}
                            color={selected ? theme.colors.primary : theme.colors.textSubtle}
                          />
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                </View>
              </View>
            </Modal>
        </View>

        <View
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <TextBlock variant="title">2. Ejercicios</TextBlock>
            <TextBlock variant="caption" color="subtle">
              {selectedMuscle
                ? `${getMuscleDisplayName(selectedMuscle)} · página ${exercisesPage} de ${exercisesLastPage}`
                : 'Primero selecciona un músculo'}
            </TextBlock>
          </View>

          {!selectedMuscle ? (
            <EmptyState
              title="Elige un músculo primero"
              description="Solo después mostraremos los ejercicios y sus GIFs."
              icon="arm-flex"
              containerStyle={styles.inputToneEmptyState}
            />
          ) : (
            <>
              <SearchBar
                label="Buscar ejercicios"
                placeholder={`Buscar en ${getMuscleDisplayName(selectedMuscle)}`}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
              />

              <View style={styles.gifFilterRow}>
                <View style={styles.gifFilterCopy}>
                  <TextBlock variant="caption" color="muted">
                    Solo ejercicios con GIF
                  </TextBlock>
                  <TextBlock variant="caption" color="subtle">
                    Oculta ejercicios sin animacion para que la grilla no deje espacios vacios.
                  </TextBlock>
                </View>
                <Switch
                  value={onlyExercisesWithGif}
                  onValueChange={setOnlyExercisesWithGif}
                  trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
                  thumbColor="#fff"
                />
              </View>

              {exercisesError ? (
                <EmptyState
                  title="No pudimos cargar los ejercicios"
                  description={exercisesError}
                  icon="alert-circle-outline"
                  actionLabel="Reintentar"
                  onAction={retryExercises}
                />
              ) : null}

              {exercisesLoading && exercises.length === 0 ? (
                <LoadingSpinner label="Cargando ejercicios" />
              ) : null}

              {!exercisesLoading && filteredExercises.length === 0 ? (
                <EmptyState
                  title="Sin ejercicios"
                  description="Prueba con otro texto o elige otro músculo."
                  icon="magnify"
                />
              ) : null}

              <FlatList
                key={`exercise-grid-${exerciseGridColumns}`}
                data={filteredExercises}
                numColumns={exerciseGridColumns}
                columnWrapperStyle={exerciseColumnWrapperStyle}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                contentContainerStyle={styles.exerciseList}
                renderItem={({ item }) => {
                  const selectedItem = selectedIds.has(String(item.id));

                  return (
                    <View style={exerciseCardWrapperStyle}>
                      <ExerciseSelectionCard
                        exercise={item}
                        selected={selectedItem}
                        onPress={() => toggleExercise(item)}
                      />
                    </View>
                  );
                }}
              />

              {exercisesLastPage > 1 ? (
                <View
                  style={[
                    styles.paginationCard,
                    { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  ]}>
                  <View style={styles.paginationHeader}>
                    <TextBlock variant="caption" color="subtle">
                      Página {exercisesPage} de {exercisesLastPage}
                    </TextBlock>
                    {exercisesLoadingPage ? (
                      <LoadingSpinner label="Cargando página" />
                    ) : null}
                  </View>

                  <View style={styles.paginationControls}>
                    <Pressable
                      onPress={() => void handlePageChange(1)}
                      disabled={exercisesLoadingPage || exercisesPage === 1}
                      style={({ pressed }) => [
                        styles.paginationButton,
                        { borderColor: theme.colors.border },
                        pressed && !exercisesLoadingPage && exercisesPage !== 1 && styles.pressed,
                        (exercisesLoadingPage || exercisesPage === 1) && styles.disabled,
                      ]}>
                      <TextBlock variant="button" color="primary">
                        1
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
                              disabled={exercisesLoadingPage || value === exercisesPage}
                              style={({ pressed }) => [
                                styles.pageNumberButton,
                                {
                                  borderColor:
                                    value === exercisesPage ? theme.colors.primary : theme.colors.border,
                                  backgroundColor:
                                    value === exercisesPage
                                      ? theme.colors.backgroundSelected
                                      : theme.colors.surface,
                                },
                                pressed && !exercisesLoadingPage && value !== exercisesPage && styles.pressed,
                                (exercisesLoadingPage || value === exercisesPage) && styles.disabled,
                              ]}>
                              <TextBlock variant="button" color={value === exercisesPage ? 'primary' : 'muted'}>
                                {value}
                              </TextBlock>
                            </Pressable>
                          </View>
                        );
                      })}
                    </View>

                    <Pressable
                      onPress={() => void handlePageChange(exercisesLastPage)}
                      disabled={exercisesLoadingPage || exercisesPage === exercisesLastPage}
                      style={({ pressed }) => [
                        styles.paginationButton,
                        { borderColor: theme.colors.border },
                        pressed && !exercisesLoadingPage && exercisesPage !== exercisesLastPage && styles.pressed,
                        (exercisesLoadingPage || exercisesPage === exercisesLastPage) && styles.disabled,
                      ]}>
                      <TextBlock variant="button" color="primary">
                        {exercisesLastPage}
                      </TextBlock>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </>
          )}
        </View>

        <View
          onLayout={(event) => {
            const nextOffset = event.nativeEvent.layout.y;
            setConfigSectionOffset(nextOffset);
            if (pendingConfigScrollRef.current && selected.length > 0) {
              setTimeout(() => {
                scrollToOffset(nextOffset);
                pendingConfigScrollRef.current = false;
              }, 100);
            }
          }}
          style={[
            styles.sectionCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <View style={styles.sectionHeader}>
            <TextBlock variant="title">Configuración de ejercicios</TextBlock>
            <TextBlock variant="caption" color="subtle">
              {selected.length} items
            </TextBlock>
          </View>

          {selected.length === 0 ? (
            <EmptyState
              title="Aún no has agregado ejercicios"
              description="Selecciona ejercicios arriba para ajustar sets, reps, descanso y notas."
              icon="playlist-plus"
              containerStyle={styles.inputToneEmptyState}
            />
          ) : (
            selected.map((entry, index) => {
              const id = String(entry.exercise.id);
              return (
                <View
                  key={id}
                  style={[
                    styles.selectedCard,
                    { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                  ]}>
                  <View style={styles.exerciseToggleHeader}>
                    <View style={styles.selectedText}>
                      <TextBlock variant="title">{getExerciseDisplayName(entry.exercise)}</TextBlock>
                      <TextBlock variant="caption" color="muted">
                        Orden {index + 1}
                      </TextBlock>
                    </View>
                    <Pressable onPress={() => toggleExercise(entry.exercise)}>
                      <TextBlock variant="caption" color="primary">
                        Quitar
                      </TextBlock>
                    </Pressable>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <TextBlock variant="caption" color="muted">
                        Sets
                      </TextBlock>
                      <TextInput
                        value={entry.sets}
                        onChangeText={(value) => updateSelected(id, 'sets', value)}
                        keyboardType="number-pad"
                        placeholder="3"
                        placeholderTextColor={theme.colors.textSubtle}
                        style={[
                          styles.input,
                          styles.compactInput,
                          { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border, color: theme.colors.text },
                        ]}
                      />
                    </View>
                    <View style={styles.halfField}>
                      <TextBlock variant="caption" color="muted">
                        Reps
                      </TextBlock>
                      <TextInput
                        value={entry.reps}
                        onChangeText={(value) => updateSelected(id, 'reps', value)}
                        keyboardType="number-pad"
                        placeholder="10"
                        placeholderTextColor={theme.colors.textSubtle}
                        style={[
                          styles.input,
                          styles.compactInput,
                          { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border, color: theme.colors.text },
                        ]}
                      />
                    </View>
                  </View>

                  <View style={styles.row}>
                    <View style={styles.halfField}>
                      <TextBlock variant="caption" color="muted">
                        Descanso (s)
                      </TextBlock>
                      <TextInput
                        value={entry.restSeconds}
                        onChangeText={(value) => updateSelected(id, 'restSeconds', value)}
                        keyboardType="number-pad"
                        placeholder="60"
                        placeholderTextColor={theme.colors.textSubtle}
                        style={[
                          styles.input,
                          styles.compactInput,
                          { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border, color: theme.colors.text },
                        ]}
                      />
                    </View>
                    <View style={styles.halfField}>
                      <TextBlock variant="caption" color="muted">
                        Notas
                      </TextBlock>
                      <TextInput
                        value={entry.notes}
                        onChangeText={(value) => updateSelected(id, 'notes', value)}
                        placeholder="Controla la fase excéntrica"
                        placeholderTextColor={theme.colors.textSubtle}
                        style={[
                          styles.input,
                          styles.compactInput,
                          { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border, color: theme.colors.text },
                        ]}
                      />
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>

        <Pressable
          disabled={saving}
          onPress={() => void handleSubmit()}
          style={({ pressed }) => [
            styles.submitButton,
            { backgroundColor: theme.colors.primary },
            pressed && !saving && styles.pressed,
            saving && styles.disabled,
          ]}>
          <TextBlock variant="button" style={styles.submitLabel}>
            {saving ? 'Guardando...' : isEditing ? 'Actualizar rutina' : 'Guardar rutina'}
          </TextBlock>
        </Pressable>
        {(validationError || submitError) ? (
          <View style={styles.submitErrorBox}>
            <Text style={styles.submitErrorText}>{validationError ?? submitError}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020203',
  },
  loadingWrap: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 40,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 100,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
    gap: 18,
  },
  headerCopy: {
    flex: 1,
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
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: 'rgba(109,40,217,0.12)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.35)',
  },
  backBtnHover: {
    backgroundColor: 'rgba(109,40,217,0.22)',
    transform: [{ translateY: -1 }],
  },
  backBtnText: {
    color: '#c4b5fd',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  heroCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
    backgroundColor: '#090910',
    paddingVertical: 28,
    paddingHorizontal: 32,
    gap: 10,
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(109,40,217,0.14)',
    pointerEvents: 'none',
  },
  heroIcon: {
    position: 'absolute',
    right: 28,
    top: '50%',
    marginTop: -54,
    opacity: 0.05,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.14)',
    backgroundColor: '#090910',
    padding: 22,
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  input: {
    minHeight: 52,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
    backgroundColor: '#050508',
    color: 'rgba(255,255,255,0.86)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  inputMissing: {
    borderColor: 'rgba(248,113,113,0.85)',
    shadowColor: 'rgba(248,113,113,0.22)',
    shadowOpacity: 1,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 4,
  },
  fieldErrorText: {
    color: '#f87171',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  inputToneEmptyState: {
    backgroundColor: '#050508',
    borderColor: 'rgba(139,92,246,0.28)',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.14)',
    backgroundColor: '#090910',
    padding: 22,
    gap: 14,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionHeaderCompact: {
    alignItems: 'stretch',
    flexDirection: 'column',
  },
  muscleHeaderText: {
    flex: 1,
    minWidth: 0,
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  muscleChip: {
    flexGrow: 1,
    flexBasis: '48%',
    minHeight: 58,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  muscleChipText: {
    flex: 1,
    gap: 2,
  },
  exerciseList: {
    gap: 12,
  },
  exerciseColumnWrapper: {
    gap: 12,
    justifyContent: 'flex-start',
  },
  exerciseCardWrapper: {
    flex: 1,
    marginBottom: 12,
  },
  exerciseCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#090910',
    overflow: 'hidden',
  },
  exerciseImageWrap: {
    position: 'relative',
    width: '100%',
    aspectRatio: 16 / 10,
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  exercisePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050508',
  },
  exerciseBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(9,9,16,0.92)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.22)',
  },
  exerciseBadgeSelected: {
    backgroundColor: 'rgba(109,40,217,0.24)',
    borderColor: 'rgba(139,92,246,0.55)',
  },
  exerciseBadgeText: {
    color: 'rgba(255,255,255,0.48)',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  exerciseBadgeTextSelected: {
    color: '#c4b5fd',
  },
  exerciseCardBody: {
    padding: 16,
    gap: 8,
  },
  exerciseCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  exerciseTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.display,
    lineHeight: 20,
  },
  exerciseDesc: {
    color: 'rgba(255,255,255,0.36)',
    fontSize: 12,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  exerciseMuscle: {
    color: 'rgba(167,139,250,0.72)',
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  exerciseToggleHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleText: {
    flex: 1,
    gap: 4,
  },
  selectedCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.14)',
    backgroundColor: '#0f0b17',
    padding: 14,
    gap: 12,
  },
  selectedText: {
    flex: 1,
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 8,
  },
  compactInput: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  modalContent: {
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.3)',
    backgroundColor: '#090910',
    padding: 18,
    gap: 14,
    shadowColor: 'rgba(109,40,217,0.26)',
    shadowOpacity: 0.5,
    shadowRadius: 44,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalScroll: {
    flexGrow: 1,
    paddingBottom: 26,
  },
  muscleButton: {
    borderRadius: 16,
    minHeight: 42,
    paddingHorizontal: 18,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#5b21b6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.5)',
    shadowColor: 'rgba(109,40,217,0.3)',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 18,
    elevation: 6,
  },
  muscleButtonFull: {
    width: '100%',
  },
  muscleButtonLabel: {
    color: '#ffffff',
    textAlign: 'center',
  },

  submitButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5b21b6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.5)',
    shadowColor: 'rgba(109,40,217,0.34)',
    shadowOpacity: 0.5,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 0 },
    elevation: 7,
  },
  submitLabel: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  submitErrorBox: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,113,113,0.35)',
    backgroundColor: 'rgba(127,29,29,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  submitErrorText: {
    color: '#fca5a5',
    fontSize: 12.5,
    lineHeight: 18,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  paginationCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.14)',
    backgroundColor: '#0f0b17',
    padding: 14,
    gap: 12,
  },
  paginationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  paginationControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  gifFilterRow: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.14)',
    backgroundColor: '#0f0b17',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  gifFilterCopy: {
    flex: 1,
    gap: 4,
  },
  paginationButton: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.22)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  pageNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  pageNumberGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pageNumberButton: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.7,
  },
});
