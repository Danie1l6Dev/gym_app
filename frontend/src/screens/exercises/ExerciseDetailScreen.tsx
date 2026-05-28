import { Image } from 'expo-image';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useExercise } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import {
  getExerciseDescription,
  getExerciseDifficulty,
  getExerciseDisplayName,
} from '@/utils/fitness';

type ExerciseParams = {
  id?: string;
};

export default function ExerciseDetailScreen() {
  const theme = useTheme();
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
          description={error ?? 'No encontramos la información solicitada.'}
          icon="alert-circle-outline"
          actionLabel="Reintentar"
          onAction={retry}
        />
      </ScreenContainer>
    );
  }

  const title = getExerciseDisplayName(item);
  const description = getExerciseDescription(item);
  const difficulty = getExerciseDifficulty(item);
  const muscleLabel =
    item.muscle?.display_name ?? item.muscle?.name_es ?? item.muscle?.name_en ?? '';

  return (
    <ScreenContainer>
      <AppHeader title="Detalle" subtitle={title} showBack />

      <View
        style={[
          styles.heroCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <View style={styles.imageWrap}>
          {item.gif_url ? (
            <Image
              recyclingKey={String(item.id)}
              source={{ uri: item.gif_url }}
              style={styles.image}
              contentFit="cover"
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
          {description ? (
            <TextBlock variant="body" color="muted">
              {description}
            </TextBlock>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          {muscleLabel ? (
            <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceElevated }]}>
              <TextBlock variant="caption" color="muted">
                {muscleLabel}
              </TextBlock>
            </View>
          ) : null}
          {difficulty ? (
            <View style={[styles.metaChip, { backgroundColor: theme.colors.surfaceElevated }]}>
              <TextBlock variant="caption" color="primary">
                {difficulty}
              </TextBlock>
            </View>
          ) : null}
        </View>
      </View>

      <View
        style={[
          styles.infoCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <TextBlock variant="title">Información adicional</TextBlock>
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
              Última sincronización
            </TextBlock>
            <TextBlock variant="caption">{item.synced_at ?? 'Pendiente'}</TextBlock>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 16,
    marginBottom: 14,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 16 / 11,
    borderRadius: 20,
    overflow: 'hidden',
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
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metaChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
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
