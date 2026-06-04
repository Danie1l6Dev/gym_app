import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Alert, Modal } from 'react-native';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  Switch,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAuth, useCreateRoutine, useMuscles, usePaginatedExercises } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/interfaces/exercise';
import type { RoutineInputExercise } from '@/interfaces/routine';
import { getExerciseDescription, getExerciseDisplayName, getMuscleDisplayName, getMuscleSubtext } from '@/utils/fitness';

type SelectedExercise = {
  exercise: Exercise;
  sets: string;
  reps: string;
  restSeconds: string;
  notes: string;
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

function ExerciseSelectionCard({
  exercise,
  selected,
  onPress,
}: {
  exercise: Exercise;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const title = getExerciseDisplayName(exercise);
  const description = getExerciseDescription(exercise);
  const muscleLabel =
    exercise.muscle?.display_name ?? exercise.muscle?.name_es ?? exercise.muscle?.name_en ?? '';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.exerciseCard,
        {
          backgroundColor: theme.colors.surface,
          borderColor: selected ? theme.colors.primary : theme.colors.border,
          shadowColor: selected ? theme.colors.primary : theme.colors.shadow,
        },
        pressed && styles.pressed,
      ]}>
      <View style={styles.exerciseImageWrap}>
        {exercise.gif_url ? (
          <Image
            source={{ uri: exercise.gif_url }}
            style={styles.exerciseImage}
            contentFit="contain"
            contentPosition="center"
            cachePolicy="memory-disk"
            transition={120}
          />
        ) : (
          <View style={[styles.exercisePlaceholder, { backgroundColor: theme.colors.surfaceElevated }]}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={theme.colors.primary} />
          </View>
        )}
        <View style={[styles.exerciseBadge, { backgroundColor: theme.colors.surfaceElevated }]}>
          <TextBlock variant="caption" color="primary">
            {selected ? 'Seleccionado' : 'Añadir'}
          </TextBlock>
        </View>
      </View>

      <View style={styles.exerciseCardBody}>
        <View style={styles.exerciseCardHeader}>
          <TextBlock variant="title" style={styles.exerciseTitle} numberOfLines={2}>
            {title}
          </TextBlock>
          <MaterialCommunityIcons
            name={selected ? 'check-circle' : 'circle-outline'}
            size={20}
            color={selected ? theme.colors.primary : theme.colors.textSubtle}
          />
        </View>

        {description ? (
          <TextBlock variant="caption" color="muted" numberOfLines={2}>
            {description}
          </TextBlock>
        ) : null}

        {muscleLabel ? (
          <TextBlock variant="caption" color="subtle" numberOfLines={1}>
            {muscleLabel}
          </TextBlock>
        ) : null}
      </View>
    </Pressable>
  );
}

export default function CreateRoutineScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { items: muscles, loading: musclesLoading, error: musclesError, retry: retryMuscles } =
    useMuscles({ perPage: 100 });
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | number | null>(null);
  const [muscleModalVisible, setMuscleModalVisible] = useState(false);
  const [muscleSearch, setMuscleSearch] = useState('');
  const [exerciseSearch, setExerciseSearch] = useState('');
  const selectedMuscle = useMemo(
    () => muscles.find((muscle) => String(muscle.id) === String(selectedMuscleId ?? '')) ?? null,
    [muscles, selectedMuscleId]
  );

  const scrollViewRef = useRef<ScrollView | null>(null);
  const [exercisesSectionOffset, setExercisesSectionOffset] = useState<number>(0);
  const [configSectionOffset, setConfigSectionOffset] = useState<number>(0);
  const selectedCountRef = useRef<number>(0);

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
    keepPreviousPages: false,
    enabled: Boolean(selectedMuscleId),
  });

  const pageOptions = useMemo(() => {
    const candidates = new Set<number>([
      exercisesPage - 2,
      exercisesPage - 1,
      exercisesPage,
      exercisesPage + 1,
      exercisesPage + 2,
    ]);

    return [...candidates]
      .filter((value) => value > 1 && value < exercisesLastPage)
      .sort((a, b) => a - b);
  }, [exercisesLastPage, exercisesPage]);

  const scrollToExercisesStart = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }

    const scrollView = scrollViewRef.current as any;
    const offset = exercisesSectionOffset || 0;

    if (typeof scrollView.scrollTo === 'function') {
      try {
        scrollView.scrollTo({ y: offset, animated: true });
        return;
      } catch {
        scrollView.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
        return;
      }
    }
  }, [exercisesSectionOffset]);

  const scrollToConfigStart = useCallback(() => {
    if (!scrollViewRef.current) {
      return;
    }

    const scrollView = scrollViewRef.current as any;
    const offset = configSectionOffset || 0;

    if (typeof scrollView.scrollTo === 'function') {
      try {
        scrollView.scrollTo({ y: offset, animated: true });
        return;
      } catch {
        scrollView.scrollTo({ top: offset, left: 0, behavior: 'smooth' });
        return;
      }
    }
  }, [configSectionOffset]);

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

  const { submit, loading: saving, error: submitError } = useCreateRoutine();
  const isAdmin = user?.role?.slug === 'admin';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPredefined, setIsPredefined] = useState(false);

  useEffect(() => {
    const previousCount = selectedCountRef.current;
    if (selected.length > previousCount && configSectionOffset > 0) {
      const timeout = setTimeout(() => {
        scrollToConfigStart();
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
      setValidationError(message);
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
      const result = await submit(payload);
      console.log('[CreateRoutine] submit result', result);
      if (result?.item?.id) {
        router.push(`/routines/${String(result.item.id)}`);
        return;
      }

      setValidationError('No se pudo obtener el detalle de la rutina creada. Intenta nuevamente.');
    } catch (error) {
      console.error('[CreateRoutine] submit error', error);
      if (error instanceof Error) {
        setValidationError(error.message);
      } else {
        setValidationError('Ocurrió un error al crear la rutina.');
      }
    }
  }

  if (musclesLoading && muscles.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Crear rutina" subtitle="Cargando catálogo de ejercicios" showBack />
        <LoadingSpinner label="Preparando músculos" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView
        ref={scrollViewRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}>
        <AppHeader title="Crear rutina" subtitle="Construye una rutina personalizada paso a paso" showBack />

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            Routine builder
          </TextBlock>
          <TextBlock variant="header">Selecciona ejercicios y define el volumen</TextBlock>
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
              onChangeText={setName}
              placeholder="Push Day"
              placeholderTextColor={theme.colors.textSubtle}
              autoCapitalize="words"
              autoCorrect={false}
              style={[
                styles.input,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text },
              ]}
            />
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
            <View style={styles.sectionHeader}>
              <View>
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
                  { backgroundColor: theme.colors.primary },
                  pressed && styles.pressed,
                ]}>
                <TextBlock variant="button" style={styles.muscleButtonLabel}>
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
            />
          ) : (
            <>
              <SearchBar
                label="Buscar ejercicios"
                placeholder={`Buscar en ${getMuscleDisplayName(selectedMuscle)}`}
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
              />

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
                data={filteredExercises}
                keyExtractor={(item) => String(item.id)}
                scrollEnabled={false}
                contentContainerStyle={styles.exerciseList}
                renderItem={({ item }) => {
                  const selectedItem = selectedIds.has(String(item.id));

                  return (
                    <ExerciseSelectionCard
                      exercise={item}
                      selected={selectedItem}
                      onPress={() => toggleExercise(item)}
                    />
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
          onLayout={(event) => setConfigSectionOffset(event.nativeEvent.layout.y)}
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
            {saving ? 'Guardando...' : 'Guardar rutina'}
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
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
    gap: 16,
  },
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  formCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
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
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  sectionCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
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
  exerciseCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
  exerciseBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
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
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
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
  },
  modalContent: {
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
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
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  muscleButtonLabel: {
    color: '#ffffff',
  },

  submitButton: {
    minHeight: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitLabel: {
    color: '#061018',
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.99 }],
  },
  paginationCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
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
  paginationButton: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
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
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  disabled: {
    opacity: 0.7,
  },
});
