import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { ScreenContainer } from '@/components/common';
import { colors, spacing, typography } from '@/theme';

export default function LoginScreen() {
  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <LinearGradient
          colors={['rgba(140,255,122,0.24)', 'rgba(107,212,255,0.06)']}
          style={styles.heroGlow}
        />
        <Text style={styles.kicker}>GymApp Access</Text>
        <Text style={styles.title}>Entrena. Administra. Evoluciona.</Text>
        <Text style={styles.subtitle}>
          Base visual lista para conectar autenticacion, rutinas y progreso cuando el backend esté
          listo.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Iniciar sesion</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Correo electronico</Text>
          <TextInput
            placeholder="admin@gymapp.com"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Contrasena</Text>
          <TextInput
            placeholder="••••••••"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
            secureTextEntry
          />
        </View>

        <View style={styles.button}>
          <Text style={styles.buttonLabel}>Ingresar</Text>
        </View>

        <Text style={styles.helper}>
          Esta pantalla es solo estructura visual. La logica de acceso se conecta despues.
        </Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing['2xl'],
    gap: spacing.md,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -20,
    width: 180,
    height: 180,
    borderRadius: 180,
  },
  kicker: {
    color: colors.primary,
    fontSize: typography.fontSizes.xs,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: typography.fontSizes['3xl'],
    lineHeight: typography.lineHeights['3xl'],
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
    letterSpacing: -0.8,
    maxWidth: 520,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.md,
    lineHeight: typography.lineHeights.lg,
    fontFamily: typography.fontFamily.regular,
    maxWidth: 560,
  },
  card: {
    gap: spacing.lg,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing['2xl'],
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.fontSizes.xl,
    lineHeight: typography.lineHeights.xl,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  label: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
    fontFamily: typography.fontFamily.medium,
    fontWeight: typography.fontWeights.medium,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    paddingHorizontal: spacing.lg,
    color: colors.text,
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.regular,
  },
  button: {
    minHeight: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  buttonLabel: {
    color: '#08110A',
    fontSize: typography.fontSizes.md,
    fontFamily: typography.fontFamily.bold,
    fontWeight: typography.fontWeights.bold,
  },
  helper: {
    color: colors.textMuted,
    fontSize: typography.fontSizes.sm,
    lineHeight: typography.lineHeights.md,
    fontFamily: typography.fontFamily.regular,
  },
});

