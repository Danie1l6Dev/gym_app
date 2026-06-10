import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { ADMIN_ROLE_OPTIONS, DIMENSIONS, ROUTES } from '@/constants';
import { useCreateUser, useMembershipTypes } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';

type FieldKey = 'name' | 'username' | 'email' | 'password' | 'passwordConfirmation';

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createDefaultEndDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 30);
  return formatDateInput(date);
}

function roleSlugFromParams(role?: string): 'admin' | 'user' {
  return role === 'admin' ? 'admin' : 'user';
}

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
  const params = useLocalSearchParams<{ role?: string }>();
  const { loading, error, submit } = useCreateUser();
  const [values, setValues] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  });
  const [roleSlug, setRoleSlug] = useState<'admin' | 'user'>(() => roleSlugFromParams(params.role));
  const [membershipPlanType, setMembershipPlanType] = useState('monthly');
  const [membershipEndsAt, setMembershipEndsAt] = useState(createDefaultEndDate());
  const [membershipNotes, setMembershipNotes] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const { items: membershipTypes } = useMembershipTypes();
  const activeMembershipTypes = useMemo(
    () => membershipTypes.filter((membershipType) => membershipType.is_active),
    [membershipTypes]
  );
  const isUserRole = roleSlug === 'user';
  const subjectLabel = isUserRole ? 'usuario' : 'administrador';

  const canSubmit = useMemo(
    () => {
      const basicFieldsReady = Boolean(
        values.name.trim() &&
          values.email.trim() &&
          values.password.trim() &&
          values.passwordConfirmation.trim()
      );

      if (!basicFieldsReady) {
        return false;
      }

      if (isUserRole) {
        return Boolean(membershipPlanType && membershipEndsAt.trim() && activeMembershipTypes.length > 0);
      }

      return true;
    },
    [activeMembershipTypes.length, isUserRole, membershipEndsAt, membershipPlanType, values]
  );

  useEffect(() => {
    if (!isUserRole || activeMembershipTypes.length === 0) {
      return;
    }

    const currentPlanExists = activeMembershipTypes.some(
      (membershipType) => membershipType.code === membershipPlanType
    );

    if (!currentPlanExists) {
      setMembershipPlanType(activeMembershipTypes[0].code);
    }
  }, [activeMembershipTypes, isUserRole, membershipPlanType]);

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
        role_slug: roleSlug,
        name: values.name.trim(),
        username: values.username.trim() || null,
        email: values.email.trim().toLowerCase(),
        password: values.password,
        password_confirmation: values.passwordConfirmation,
        is_active: true,
        membership_plan_type: isUserRole ? membershipPlanType : null,
        membership_ends_at: isUserRole ? membershipEndsAt : null,
        membership_notes: isUserRole ? membershipNotes.trim() || null : null,
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
        <AppHeader
          title={`Crear ${subjectLabel}`}
          subtitle={
            isUserRole
              ? 'Alta de cuentas con membresía inicial incluida.'
              : 'Alta de cuentas administrativas sin membresía.'
          }
          showBack
        />

        <View
          style={[
            styles.hero,
            { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}>
          <TextBlock variant="eyebrow" color="primary">
            User builder
          </TextBlock>
          <TextBlock variant="header">
            {isUserRole
              ? 'Crea usuarios con rol, estado y membresía lista'
              : 'Crea administradores con acceso listo'}
          </TextBlock>
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
                const selected = roleSlug === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => setRoleSlug(option.value)}
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

          {isUserRole ? (
            <View
              style={[
                styles.membershipCard,
                { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border },
              ]}>
              <View style={styles.membershipHeader}>
                <View style={styles.membershipHeading}>
                  <TextBlock variant="title">Membresía inicial</TextBlock>
                  <TextBlock variant="caption" color="subtle">
                    Se crea junto con el usuario y queda activa desde hoy.
                  </TextBlock>
                </View>
                <TextBlock variant="caption" color="primary">
                  Requerida para usuarios
                </TextBlock>
              </View>

              <View style={styles.field}>
                <TextBlock variant="caption" color="muted">
                  Plan
                </TextBlock>
                <View style={styles.planRow}>
                  {activeMembershipTypes.map((option) => {
                    const selected = membershipPlanType === option.code;

                    return (
                      <Pressable
                        key={option.id}
                        onPress={() => setMembershipPlanType(option.code)}
                        style={({ pressed }) => [
                          styles.planPill,
                          {
                            backgroundColor: selected
                              ? theme.colors.surfaceElevated
                              : theme.colors.surface,
                            borderColor: selected ? theme.colors.primary : theme.colors.border,
                          },
                          pressed && styles.pressed,
                        ]}>
                        <TextBlock variant="caption" color={selected ? 'primary' : 'muted'}>
                          {option.name}
                        </TextBlock>
                        <TextBlock variant="caption" color="subtle">
                          {Number(option.price).toLocaleString('es-CO')} COP
                        </TextBlock>
                      </Pressable>
                    );
                  })}
                </View>
                {activeMembershipTypes.length === 0 ? (
                  <TextBlock variant="caption" color="muted">
                    No hay tipos de membresia activos. Crea uno desde Administrar.
                  </TextBlock>
                ) : null}
              </View>

              <View style={styles.field}>
                <TextBlock variant="caption" color="muted">
                  Fecha final
                </TextBlock>
                <TextInput
                  value={membershipEndsAt}
                  onChangeText={setMembershipEndsAt}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.colors.textSubtle}
                  keyboardType="numbers-and-punctuation"
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

              <View style={styles.field}>
                <TextBlock variant="caption" color="muted">
                  Notas de membresía
                </TextBlock>
                <TextInput
                  value={membershipNotes}
                  onChangeText={setMembershipNotes}
                  placeholder="Opcional: observaciones de la alta"
                  placeholderTextColor={theme.colors.textSubtle}
                  multiline
                  style={[
                    styles.input,
                    styles.notesInput,
                    {
                      backgroundColor: theme.colors.surfaceElevated,
                      borderColor: theme.colors.border,
                      color: theme.colors.text,
                    },
                  ]}
                />
              </View>
            </View>
          ) : (
            <View
              style={[
                styles.adminNote,
                { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border },
              ]}>
              <TextBlock variant="caption" color="subtle">
                Los administradores no necesitan membresía ni fecha de vencimiento.
              </TextBlock>
            </View>
          )}

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
  membershipCard: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  membershipHeading: {
    flex: 1,
    gap: 4,
  },
  planRow: {
    flexDirection: 'row',
    gap: 10,
  },
  planPill: {
    flex: 1,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notesInput: {
    minHeight: 84,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  adminNote: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
