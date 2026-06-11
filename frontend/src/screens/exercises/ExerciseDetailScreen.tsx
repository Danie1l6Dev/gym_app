import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAuth, useExercise } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import {
  getExerciseDescription,
  getExerciseDifficulty,
  getExerciseDisplayName,
} from '@/utils/fitness';

type ExerciseParams = {
  id?: string;
};

function normalizeInstructionList(value: unknown): string[] {
  const cleanStep = (item: unknown) => String(item).trim().replace(/^(?:Paso|Step)\s*:?\s*\d+\s*/i, '').trim();

  if (Array.isArray(value)) {
    return value
      .flat()
      .map(cleanStep)
      .filter(Boolean);
  }

  if (typeof value !== 'string') {
    return [];
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return [];
  }

  const stepMatches = [...trimmed.matchAll(/(?:^|\n|\r|\s)(?:Paso|Step)\s*:?\s*\d+\s+(.+?)(?=(?:\n|\r|\s)(?:Paso|Step)\s*:?\s*\d+\s+|$)/gis)];
  if (stepMatches.length > 0) {
    return stepMatches
      .map((match) => match[1]?.trim())
      .filter((item): item is string => Boolean(item));
  }

  return trimmed
    .split(/\r?\n+/)
    .map(cleanStep)
    .filter(Boolean);
}

function areInstructionListsEqual(left: string[], right: string[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((item, index) => item.toLowerCase() === right[index]?.toLowerCase());
}

export default function ExerciseDetailScreen() {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<ExerciseParams>();
  const { item, loading, error, retry } = useExercise(id);

  if (loading && !item) {
    return (
      <ScreenContainer>
        <AppHeader title="Detalle" subtitle="Cargando ejercicio" showBack />
        <LoadingSpinner label="Preparando detalle" />
      </ScreenContainer>
    );
  }

  if (error || !item) {
    return (
      <ScreenContainer>
        <AppHeader title="Detalle" subtitle="Error al abrir ejercicio" showBack />
        <EmptyState
          title="No pudimos cargar el ejercicio"
          description={error ?? 'No encontramos la informacion solicitada.'}
          icon="alert-circle-outline"
          actionLabel="Reintentar"
          onAction={retry}
        />
      </ScreenContainer>
    );
  }

  const title = getExerciseDisplayName(item);
  const description = getExerciseDescription(item);
  const localizedInstructions = normalizeInstructionList(item.instructions_es);
  const originalInstructions = normalizeInstructionList(item.instructions_original);
  const hasSpanishInstructions = item.has_instructions_es
    ?? (localizedInstructions.length > 0 && !areInstructionListsEqual(localizedInstructions, originalInstructions));
  const executionSteps = localizedInstructions.length > 0
    ? localizedInstructions
    : normalizeInstructionList(item.description_es ?? item.display_description ?? item.instructions_original);
  const descriptionLooksLikeSteps = /(?:Paso|Step)\s*:?\s*\d+/i.test(description);
  const difficulty = getExerciseDifficulty(item);
  const muscleLabel =
    item.muscle?.display_name ?? item.muscle?.name_es ?? item.muscle?.name_en ?? '';
  const isAdmin = user?.role?.slug === 'admin';
  const isWide = width >= 900;

  return (
    <ScreenContainer>
      <AppHeader title="Detalle" subtitle={title} showBack />

      <View
        style={[
          styles.heroCard,
          isWide && styles.heroCardWide,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <View style={[styles.imageWrap, isWide && styles.imageWrapWide, { backgroundColor: theme.colors.backgroundSoft }]}>
          {item.gif_url ? (
            <Image
              recyclingKey={String(item.id)}
              source={{ uri: item.gif_url }}
              style={styles.image}
              contentFit="contain"
              contentPosition="center"
              transition={180}
              cachePolicy="memory-disk"
            />
          ) : (
            <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceElevated }]}>
              <TextBlock variant="caption" color="muted">
                GIF no disponible
              </TextBlock>
            </View>
          )}
        </View>

        <View style={styles.detailGroup}>
          <TextBlock variant="eyebrow" color="primary">
            Exercise detail
          </TextBlock>
          <TextBlock variant="header">{title}</TextBlock>
          {description && !descriptionLooksLikeSteps ? (
            <TextBlock variant="body" color="muted" style={styles.description}>
              {description}
            </TextBlock>
          ) : null}

          <View style={styles.metaRow}>
            {muscleLabel ? (
              <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceElevated }]}>
                <MaterialCommunityIcons name="arm-flex" size={16} color={theme.colors.primary} />
                <TextBlock variant="caption" color="muted">
                  {muscleLabel}
                </TextBlock>
              </View>
            ) : null}
            {difficulty ? (
              <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceElevated }]}>
                <MaterialCommunityIcons name="signal-cellular-2" size={16} color={theme.colors.primary} />
                <TextBlock variant="caption" color="primary">
                  {difficulty}
                </TextBlock>
              </View>
            ) : null}
          </View>
        </View>
      </View>

      <View
        style={[
          styles.instructionsCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <View style={styles.instructionsHeader}>
          <View style={[styles.instructionsIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
            <MaterialCommunityIcons name="format-list-checks" size={24} color={theme.colors.primary} />
          </View>
          <View style={styles.instructionsTitleGroup}>
            <TextBlock variant="title">Instrucciones de ejecucion</TextBlock>
            <TextBlock variant="caption" color="subtle">
              Observa el GIF completo y replica el movimiento con control.
            </TextBlock>
          </View>
        </View>

        {!hasSpanishInstructions ? (
          <View style={[styles.translationNotice, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <MaterialCommunityIcons name="translate" size={18} color={theme.colors.primary} />
            <TextBlock variant="caption" color="primary" style={styles.translationNoticeText}>
              Pronto estara disponible la version en español.
            </TextBlock>
          </View>
        ) : null}

        <View style={styles.instructionSteps}>
          {executionSteps.map((step, index) => (
            <View key={step} style={[styles.instructionStep, { borderColor: theme.colors.border }]}>
              <View style={[styles.stepNumber, { backgroundColor: theme.colors.surfaceElevated }]}>
                <TextBlock variant="caption" color="primary">
                  {index + 1}
                </TextBlock>
              </View>
              <TextBlock variant="body" color="muted" style={styles.instructionText}>
                {step}
              </TextBlock>
            </View>
          ))}
        </View>
      </View>

      {isAdmin ? (
        <View
          style={[
            styles.infoCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="title">Informacion adicional</TextBlock>
          <View style={styles.infoRows}>
            <View style={styles.infoRow}>
              <TextBlock variant="caption" color="muted">
                Identificador
              </TextBlock>
              <TextBlock variant="caption">{String(item.id)}</TextBlock>
            </View>
            <View style={styles.infoRow}>
              <TextBlock variant="caption" color="muted">
                Fuente
              </TextBlock>
              <TextBlock variant="caption">{item.source ?? 'Interno'}</TextBlock>
            </View>
            <View style={styles.infoRow}>
              <TextBlock variant="caption" color="muted">
                Ultima sincronizacion
              </TextBlock>
              <TextBlock variant="caption">{item.synced_at ?? 'Pendiente'}</TextBlock>
            </View>
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 18,
    marginBottom: 14,
  },
  heroCardWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
    borderRadius: 22,
    overflow: 'hidden',
  },
  imageWrapWide: {
    flex: 1.15,
    maxWidth: 620,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailGroup: {
    flex: 1,
    gap: 12,
    justifyContent: 'center',
  },
  description: {
    maxWidth: 620,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  instructionsCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 16,
    marginBottom: 14,
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  instructionsIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionsTitleGroup: {
    flex: 1,
    gap: 4,
  },
  translationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  translationNoticeText: {
    flex: 1,
  },
  instructionSteps: {
    gap: 10,
  },
  instructionStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    padding: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  instructionText: {
    flex: 1,
  },
  infoCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  infoRows: {
    gap: 10,
  },
  infoRow: {
    gap: 4,
  },
});
