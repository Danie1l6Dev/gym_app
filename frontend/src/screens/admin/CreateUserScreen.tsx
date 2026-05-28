import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { ADMIN_ROLE_OPTIONS, DIMENSIONS, ROUTES } from '@/constants';
import { useCreateUser } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';

type FieldKey = 'name' | 'username' | 'email' | 'password' | 'passwordConfirmation';

const FORM_FIELDS: {
  key: FieldKey;
  label: string;
  placeholder: string;
  secure?: boolean;
}[] = [
  { key: 'name', label: 'Nombre completo', placeholder: 'Juan Pérez' },
  { key: 'username', label: 'Username', placeholder: 'juanperez' },
  { key: 'email', label: 'Correo', placeholder: 'juan@email.com' },
  { key: 'password', label: 'Contraseña', placeholder: '********', secure: true },
  {
    key: 'passwordConfirmation',
    label: 'Confirmar contraseña',
    placeholder: '********',
    secure: true,
  },
];

export default function CreateUserScreen() {
  const theme = useTheme();
  const { loading, error, submit } = useCreateUser();
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [roleId, setRoleId] = useState<number>(2);
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      Boolean(
        values.name.trim() &&
          values.email.trim() &&
          values.password.trim() &&
          values.passwordConfirmation.trim()
      ),
    [values]
  );

  function updateField(field: FieldKey, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setValidationError('Completa los campos obligatorios.');
      return;
    }

    if (values.password !== values.passwordConfirmation) {
      setValidationError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setValidationError(null);
      const created = await submit({
        role_id: roleId,
        name: values.name.trim(),
        username: values.username.trim() || null,
        email: values.email.trim().toLowerCase(),
        password: values.password,
        password_confirmation: values.passwordConfirmation,
        is_active: true,
      });

      if (created) {
        router.replace({
          pathname: ROUTES.app.adminUserDetail as never,
          params: { id: String(created.id) },
        } as never);
      }
    } catch {
      // handled in hook
    }
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader title="Crear usuario" subtitle="Alta de cuentas para el gimnasio" showBack />

        <View
          style={[
            styles.hero,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            User builder
          </TextBlock>
          <TextBlock variant="header">Crea usuarios con rol, estado y acceso listos</TextBlock>
          <TextBlock variant="body" color="muted">
            La validación se mantiene en el frontend y el submit va directo al service admin.
          </TextBlock>
        </View>

        {validationError || error ? (
          <EmptyState
            title="Revisa el formulario"
            description={validationError ?? error ?? ''}
            icon="alert-circle-outline"
          />
        ) : null}

        <View
          style={[
            styles.form,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          {FORM_FIELDS.map((field) => (
            <View key={field.key} style={styles.field}>
              <TextBlock variant="caption" color="muted">
                {field.label}
              </TextBlock>
              <TextInput
                value={values[field.key]}
                onChangeText={(value) => updateField(field.key, value)}
                placeholder={field.placeholder}
                placeholderTextColor={theme.colors.textSubtle}
                secureTextEntry={Boolean(field.secure)}
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.border,
                    color: theme.colors.text,
                  },
                ]}
              />
            </View>
          ))}

          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">
              Rol
            </TextBlock>
            <View style={styles.roleRow}>
              {ADMIN_ROLE_OPTIONS.map((option) => {
                const selected = roleId === option.id;
                return (
                  <Pressable
                    key={option.slug}
                    onPress={() => setRoleId(option.id)}
                    style={({ pressed }) => [
                      styles.rolePill,
                      {
                        backgroundColor: selected
                          ? theme.colors.surfaceElevated
                          : theme.colors.backgroundSoft,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                      pressed && styles.pressed,
                    ]}>
                    <TextBlock variant="caption" color={selected ? 'primary' : 'muted'}>
                      {option.label}
                    </TextBlock>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            onPress={() => void handleSubmit()}
            disabled={loading}
            style={({ pressed }) => [
              styles.submit,
              { backgroundColor: theme.colors.primary },
              pressed && !loading && styles.pressed,
              loading && styles.disabled,
            ]}>
            {loading ? (
              <ActivityIndicator size="small" color="#061018" />
            ) : (
              <TextBlock variant="button" style={styles.submitLabel}>
                Guardar usuario
              </TextBlock>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: DIMENSIONS.screenPadding * 1.5,
    gap: 16,
  },
  hero: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 20,
    gap: 10,
  },
  form: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 14,
  },
  field: {
    gap: 8,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rolePill: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  submit: {
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
