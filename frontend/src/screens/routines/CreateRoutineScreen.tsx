import { useMemo, useState } from 'react';
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

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { SearchBar } from '@/components/SearchBar';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useAuth, useCreateRoutine, useExercises } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import type { Exercise } from '@/interfaces/exercise';
import type { RoutineInputExercise } from '@/interfaces/routine';
import { getExerciseDisplayName } from '@/utils/fitness';

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

export default function CreateRoutineScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { items: exercises, loading, error, retry } = useExercises();
  const { submit, loading: saving, error: submitError } = useCreateRoutine();
  const isAdmin = user?.role?.slug === 'admin';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<SelectedExercise[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPredefined, setIsPredefined] = useState(false);

  const filteredExercises = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return exercises;
    return exercises.filter((exercise) => {
      const title = getExerciseDisplayName(exercise).toLowerCase();
      const muscle = (exercise.muscle?.display_name ?? exercise.muscle?.name_es ?? exercise.muscle?.name_en ?? '').toLowerCase();
      return title.includes(q) || muscle.includes(q);
    });
  }, [exercises, search]);

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

    if (!trimmedName) {
      setValidationError('El nombre de la rutina es obligatorio.');
      return;
    }

    if (selected.length === 0) {
      setValidationError('Selecciona al menos un ejercicio.');
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
      const result = await submit(payload);
      if (result.item) {
        router.replace({
          pathname: ROUTES.app.routineDetail,
          params: { id: String(result.item.id) },
        });
      }
    } catch {
      // error state already handled in hook
    }
  }

  if (loading && exercises.length === 0) {
    return (
      <ScreenContainer>
        <AppHeader title="Crear rutina" subtitle="Cargando catálogo de ejercicios" showBack />
        <LoadingSpinner label="Preparando formulario" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView
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
            <TextBlock variant="title">Seleccionar ejercicios</TextBlock>
            <TextBlock variant="caption" color="subtle">
              {selected.length} seleccionados
            </TextBlock>
          </View>

          <SearchBar
            label="Buscar ejercicios"
            placeholder="Buscar por nombre o músculo"
            value={search}
            onChangeText={setSearch}
          />

          {error ? (
            <EmptyState
              title="No pudimos cargar los ejercicios"
              description={error}
              icon="alert-circle-outline"
              actionLabel="Reintentar"
              onAction={retry}
            />
          ) : null}

          {filteredExercises.length === 0 && !error ? (
            <EmptyState
              title="Sin resultados"
              description="Prueba con otro texto de búsqueda."
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
                <Pressable
                  onPress={() => toggleExercise(item)}
                  style={({ pressed }) => [
                    styles.exerciseToggle,
                    {
                      backgroundColor: selectedItem
                        ? theme.colors.surfaceElevated
                        : theme.colors.backgroundSoft,
                      borderColor: selectedItem ? theme.colors.primary : theme.colors.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.exerciseToggleHeader}>
                    <View style={styles.selectedText}>
                      <TextBlock variant="title">{getExerciseDisplayName(item)}</TextBlock>
                      <TextBlock variant="caption" color="muted">
                        {item.muscle?.display_name ?? item.muscle?.name_es ?? item.muscle?.name_en ?? 'Músculo'}
                      </TextBlock>
                    </View>
                    <TextBlock variant="caption" color={selectedItem ? 'primary' : 'muted'}>
                      {selectedItem ? 'Seleccionado' : 'Añadir'}
                    </TextBlock>
                  </View>
                </Pressable>
              );
            }}
          />
        </View>

        <View
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
  exerciseList: {
    gap: 12,
  },
  exerciseToggle: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
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
  disabled: {
    opacity: 0.7,
  },
});
