import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { DIMENSIONS } from '@/constants';
import type { Routine } from '@/interfaces/routine';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from './TextBlock';

type RoutineCardProps = {
  routine: Routine;
  exercisesCount?: number;
  onPress?: () => void;
};

function RoutineCardBase({ routine, exercisesCount = 0, onPress }: RoutineCardProps) {
  const theme = useTheme();
  const countLabel = `${exercisesCount} ejercicios`;
  const daysLabel = routine.days?.length
    ? routine.days.map((day) => day.name ?? day.slug ?? 'Dia').join(', ')
    : null;

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.headerRow}>
        <View style={styles.textGroup}>
          <TextBlock variant="title">{routine.name}</TextBlock>
          {routine.description ? (
            <TextBlock variant="body" color="muted" numberOfLines={2}>
              {routine.description}
            </TextBlock>
          ) : null}
        </View>

        <View
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.surfaceElevated,
              borderColor: routine.is_predefined ? theme.colors.primary : theme.colors.border,
            },
          ]}>
          <TextBlock variant="caption" color={routine.is_predefined ? 'primary' : 'muted'}>
            {routine.is_predefined ? 'Predefinida' : 'Personalizada'}
          </TextBlock>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.metaItem}>
          <MaterialCommunityIcons name="dumbbell" size={18} color={theme.colors.primary} />
          <TextBlock variant="caption" color="muted">
            {countLabel}
          </TextBlock>
        </View>
        {daysLabel ? (
          <View style={styles.metaItem}>
            <MaterialCommunityIcons name="calendar-week" size={18} color={theme.colors.primary} />
            <TextBlock variant="caption" color="muted" numberOfLines={1}>
              {daysLabel}
            </TextBlock>
          </View>
        ) : null}
        <View style={styles.metaItem}>
          <TextBlock variant="caption" color="subtle">
            Ver detalle
          </TextBlock>
          <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.textSubtle} />
        </View>
      </View>
    </Pressable>
  );
}

export const RoutineCard = memo(RoutineCardBase);

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  textGroup: {
    flex: 1,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
