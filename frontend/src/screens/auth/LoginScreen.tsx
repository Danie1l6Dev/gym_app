import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Ingresa correo y contraseña.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer scrollable centerContent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrapper}>
        <AppHeader
          title="Acceso"
          subtitle="Autenticación con token Bearer y sin cookies."
        />

        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            Secure auth
          </TextBlock>
          <TextBlock variant="header">Entra al gimnasio digital</TextBlock>
          <TextBlock variant="body" color="muted">
            El frontend ya guarda token, usuario y estado de sesión para trabajar con Laravel
            Sanctum mediante Bearer Token.
          </TextBlock>
        </View>

        <View
          style={[
            styles.formCard,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          {errorMessage ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: theme.colors.backgroundSelected, borderColor: theme.colors.border },
              ]}>
              <TextBlock variant="caption" color="primary">
                {errorMessage}
              </TextBlock>
            </View>
          ) : null}

          <View style={styles.fieldGroup}>
            <TextBlock variant="caption" color="muted">
              Correo electrónico
            </TextBlock>
            <TextInput
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor={theme.colors.textSubtle}
              value={email}
              onChangeText={(value) => setEmail(value)}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              textContentType="emailAddress"
              accessibilityLabel="Correo electrónico"
            />
          </View>

          <View style={styles.fieldGroup}>
            <TextBlock variant="caption" color="muted">
              Contraseña
            </TextBlock>
            <TextInput
              autoCapitalize="none"
              placeholder="••••••••"
              placeholderTextColor={theme.colors.textSubtle}
              secureTextEntry
              value={password}
              onChangeText={(value) => setPassword(value)}
              style={[
                styles.input,
                {
                  backgroundColor: theme.colors.surfaceElevated,
                  borderColor: theme.colors.border,
                  color: theme.colors.text,
                },
              ]}
              textContentType="password"
              accessibilityLabel="Contraseña"
            />
          </View>

          <Pressable
            disabled={submitting}
            onPress={handleSubmit}
            style={({ pressed }) => [
              styles.primaryButton,
              { backgroundColor: theme.colors.primary },
              pressed && !submitting && styles.pressed,
              submitting && styles.disabled,
            ]}>
            {submitting ? (
              <ActivityIndicator size="small" color="#061018" />
            ) : (
              <TextBlock variant="button" style={styles.buttonLabel}>
                Iniciar sesión
              </TextBlock>
            )}
          </Pressable>

          <TextBlock variant="caption" color="subtle" style={styles.helperText}>
            El token se persiste automáticamente en AsyncStorage y se agrega en cada request.
          </TextBlock>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardWrapper: {
    width: '100%',
    gap: 16,
  },
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 12,
    marginBottom: 16,
  },
  formCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 16,
  },
  errorBox: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  fieldGroup: {
    gap: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  primaryButton: {
    minHeight: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonLabel: {
    color: '#061018',
  },
  helperText: {
    textAlign: 'center',
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.7,
  },
});
