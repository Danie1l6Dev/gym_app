import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import type { Exercise } from '@/interfaces/exercise';
import { useTheme } from '@/hooks/use-theme';
import {
  getExerciseDescription,
  getExerciseDifficulty,
  getExerciseDisplayName,
} from '@/utils/fitness';
import { TextBlock } from './TextBlock';

type ExerciseCardProps = {
  exercise: Exercise;
  onPress?: () => void;
};

function ExerciseCardBase({ exercise, onPress }: ExerciseCardProps) {
  const theme = useTheme();
  const title = getExerciseDisplayName(exercise);
  const description = getExerciseDescription(exercise);
  const difficulty = getExerciseDifficulty(exercise);
  const muscleLabel =
    exercise.muscle?.display_name ?? exercise.muscle?.name_es ?? exercise.muscle?.name_en ?? '';

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.thumbnailWrap}>
        {exercise.gif_url ? (
          <Image
            recyclingKey={String(exercise.id)}
            source={{ uri: exercise.gif_url }}
            style={styles.thumbnail}
            contentFit="contain"
            contentPosition="center"
            transition={140}
            cachePolicy="memory-disk"
          />
        ) : (
          <View style={[styles.placeholder, { backgroundColor: theme.colors.surfaceElevated }]}>
            <MaterialCommunityIcons name="dumbbell" size={24} color={theme.colors.primary} />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <TextBlock variant="title" style={styles.title} numberOfLines={2}>
            {title}
          </TextBlock>
          {difficulty ? (
            <View style={[styles.difficultyPill, { backgroundColor: theme.colors.surfaceElevated }]}>
              <TextBlock variant="caption" color="primary">
                {difficulty}
              </TextBlock>
            </View>
          ) : null}
        </View>

        {description ? (
          <TextBlock variant="body" color="muted" numberOfLines={3} style={styles.description}>
            {description}
          </TextBlock>
        ) : null}

        <View style={styles.footer}>
          {muscleLabel ? (
            <TextBlock variant="caption" color="subtle" numberOfLines={1}>
              {muscleLabel}
            </TextBlock>
          ) : null}
          <View style={styles.footerAction}>
            <TextBlock variant="caption" color="primary">
              Ver detalle
            </TextBlock>
            <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.primary} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export const ExerciseCard = memo(ExerciseCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  thumbnailWrap: {
    width: '100%',
    aspectRatio: 16 / 10,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: 16,
    gap: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
  },
  difficultyPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  description: {
    minHeight: 44,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
});
