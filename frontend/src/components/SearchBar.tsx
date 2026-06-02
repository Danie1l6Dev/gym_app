import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { DIMENSIONS } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from '@/components/TextBlock';

type SearchBarProps = {
  label?: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  helperText?: string;
  containerStyle?: ViewStyle;
  autoFocus?: boolean;
};

export function SearchBar({
  label = 'Buscar',
  placeholder,
  value,
  onChangeText,
  helperText,
  containerStyle,
  autoFocus,
}: SearchBarProps) {
  const theme = useTheme();
  const hasValue = value.trim().length > 0;

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        containerStyle,
      ]}>
      <TextBlock variant="caption" color="muted">
        {label}
      </TextBlock>

      <View
        style={[
          styles.inputRow,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: theme.colors.border,
          },
        ]}>
        <MaterialCommunityIcons name="magnify" size={20} color={theme.colors.textSubtle} />
        <TextInput
          autoCorrect={false}
          autoCapitalize="none"
          autoComplete="off"
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSubtle}
          value={value}
          onChangeText={onChangeText}
          autoFocus={autoFocus}
          style={[
            styles.input,
            {
              color: theme.colors.text,
            },
          ]}
        />
        {hasValue ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Limpiar búsqueda"
            onPress={() => onChangeText('')}
            style={({ pressed }) => [styles.clearButton, pressed && styles.pressed]}>
            <MaterialCommunityIcons name="close-circle" size={20} color={theme.colors.textSubtle} />
          </Pressable>
        ) : null}
      </View>

      {helperText ? (
        <TextBlock variant="caption" color="subtle">
          {helperText}
        </TextBlock>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  inputRow: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minHeight: 52,
    fontSize: 15,
    paddingVertical: 0,
  },
  clearButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
  },
  pressed: {
    opacity: 0.85,
  },
});
