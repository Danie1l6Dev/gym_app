import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { ADMIN_ROLE_OPTIONS, DIMENSIONS, ROUTES } from '@/constants';
import { useAuth, useMembershipTypes } from '@/hooks';
import { useTheme } from '@/hooks/use-theme';
import {
  createAdminUser,
  deleteAdminUser,
  fetchAdminUserById,
  updateAdminUser,
} from '@/services/admin.service';

type UserParams = {
  id?: string;
  role?: string;
};

type Values = {
  name: string;
  username: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  height: string;
  weight: string;
  roleSlug: 'admin' | 'user';
  isActive: boolean;
  membershipPlanType: string;
  membershipEndsAt: string;
  membershipNotes: string;
};

const EMPTY_VALUES: Values = {
  name: '',
  username: '',
  email: '',
  password: '',
  passwordConfirmation: '',
  phone: '',
  birthDate: '',
  gender: 'other',
  height: '',
  weight: '',
  roleSlug: 'user',
  isActive: true,
  membershipPlanType: 'monthly',
  membershipEndsAt: '',
  membershipNotes: '',
};

function formatDateInput(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function createMembershipEndDate(durationDays?: number | null): string {
  if (!durationDays || durationDays <= 0) {
    return '';
  }

  const date = new Date();
  date.setDate(date.getDate() + durationDays);
  return formatDateInput(date);
}

export default function AdminUserFormScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<UserParams>();
  const isEditing = Boolean(params.id);
  const [values, setValues] = useState<Values>({
    ...EMPTY_VALUES,
    roleSlug: params.role === 'admin' ? 'admin' : 'user',
  });
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { user: currentUser } = useAuth();
  const { items: membershipTypes } = useMembershipTypes();
  const activeMembershipTypes = useMemo(
    () => membershipTypes.filter((membershipType) => membershipType.is_active),
    [membershipTypes]
  );
  const effectiveMembershipPlanType = useMemo(() => {
    const currentPlanExists = activeMembershipTypes.some(
      (membershipType) => membershipType.code === values.membershipPlanType
    );

    return currentPlanExists ? values.membershipPlanType : activeMembershipTypes[0]?.code ?? '';
  }, [activeMembershipTypes, values.membershipPlanType]);
  const selectedMembershipType = useMemo(
    () => activeMembershipTypes.find((membershipType) => membershipType.code === effectiveMembershipPlanType) ?? null,
    [activeMembershipTypes, effectiveMembershipPlanType]
  );
  const calculatedMembershipEndsAt = createMembershipEndDate(selectedMembershipType?.duration_days);
  const membershipEndsAt = !isEditing && values.roleSlug === 'user'
    ? calculatedMembershipEndsAt
    : values.membershipEndsAt;

  const canSubmit = useMemo(() => {
    const baseReady = Boolean(values.name.trim() && values.email.trim());
    const hasPasswordInput = Boolean(values.password || values.passwordConfirmation);
    const passwordReady = isEditing
      ? !hasPasswordInput || Boolean(values.password && values.password === values.passwordConfirmation)
      : Boolean(values.password && values.passwordConfirmation && values.password === values.passwordConfirmation);

    if (!baseReady || !passwordReady) {
      return false;
    }

    if (!isEditing && values.roleSlug === 'user') {
      return Boolean(effectiveMembershipPlanType && membershipEndsAt && activeMembershipTypes.length > 0);
    }

    return true;
  }, [activeMembershipTypes.length, effectiveMembershipPlanType, isEditing, membershipEndsAt, values]);

  useEffect(() => {
    if (!params.id) {
      return;
    }

    let mounted = true;

    async function loadUser() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchAdminUserById(params.id as string);
        const user = response.item;

        if (!mounted || !user) {
          return;
        }

        setValues({
          name: user.name ?? '',
          username: user.username ?? '',
          email: user.email ?? '',
          password: '',
          passwordConfirmation: '',
          phone: user.phone ?? '',
          birthDate: user.birth_date ?? '',
          gender: user.gender === 'male' || user.gender === 'female' ? user.gender : 'other',
          height: user.height ? String(user.height) : '',
          weight: user.weight ? String(user.weight) : '',
          roleSlug: user.role?.slug === 'admin' ? 'admin' : 'user',
          isActive: user.is_active !== false,
          membershipPlanType: user.latest_membership?.plan_type ?? 'monthly',
          membershipEndsAt: user.latest_membership?.ends_at ?? '',
          membershipNotes: user.latest_membership?.notes ?? '',
        });
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar el usuario.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadUser();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  function updateField<T extends keyof Values>(field: T, value: Values[T]) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setValidationError('Completa los campos obligatorios y revisa la contrasena.');
      return;
    }

    if (values.password && values.password.length < 8) {
      setValidationError('La contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (values.password !== values.passwordConfirmation) {
      setValidationError('La confirmacion de contrasena no coincide.');
      return;
    }

    try {
      setSaving(true);
      setValidationError(null);

      const payload = {
        role_slug: values.roleSlug,
        name: values.name.trim(),
        username: values.username.trim() || null,
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim() || null,
        birth_date: values.birthDate.trim() || null,
        gender: values.gender,
        height: values.height ? Number(values.height) : null,
        weight: values.weight ? Number(values.weight) : null,
        is_active: values.isActive,
        ...(values.password
          ? {
              password: values.password,
              password_confirmation: values.passwordConfirmation,
            }
          : {}),
        ...(!isEditing && values.roleSlug === 'user'
          ? {
              membership_plan_type: effectiveMembershipPlanType,
              membership_ends_at: membershipEndsAt,
              membership_notes: values.membershipNotes.trim() || null,
            }
          : {}),
      };

      if (params.id) {
        await updateAdminUser(params.id, payload);
      } else {
        await createAdminUser(payload as Parameters<typeof createAdminUser>[0]);
      }

      router.replace(ROUTES.app.adminManageUsers as never);
    } catch (err) {
      setValidationError(err instanceof Error ? err.message : 'No pudimos guardar el usuario.');
    } finally {
      setSaving(false);
    }
  }

  function handleDelete() {
    if (!params.id) {
      return;
    }

    if (String(currentUser?.id) === String(params.id)) {
      setValidationError('No puedes eliminar tu propia cuenta administrativa.');
      return;
    }

    const deleteUser = async () => {
      try {
        setDeleting(true);
        setValidationError(null);
        await deleteAdminUser(params.id as string);
        router.replace(ROUTES.app.adminManageUsers as never);
      } catch (err) {
        setValidationError(err instanceof Error ? err.message : 'No pudimos eliminar el usuario.');
      } finally {
        setDeleting(false);
      }
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Seguro que deseas eliminar este usuario? Esta accion no se puede deshacer.');

      if (confirmed) {
        void deleteUser();
      }

      return;
    }

    Alert.alert(
      'Eliminar usuario',
      'Seguro que deseas eliminar este usuario? Esta accion no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void deleteUser() },
      ]
    );
  }

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader
          title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          subtitle="Gestion de cuenta"
          showBack
          backHref={ROUTES.app.adminManageUsers}
        />
        <LoadingSpinner label="Cargando usuario" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader
          title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          subtitle="Gestion de cuenta"
          showBack
          backHref={ROUTES.app.adminManageUsers}
        />
        <EmptyState title="No pudimos cargar el usuario" description={error} icon="alert-circle-outline" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={isEditing ? 'Editar usuario' : 'Nuevo usuario'}
          subtitle="Datos personales, rol y estado"
          showBack
          backHref={ROUTES.app.adminManageUsers}
        />

        {validationError ? (
          <EmptyState title="Revisa el formulario" description={validationError} icon="alert-circle-outline" />
        ) : null}

        <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">Nombre completo</TextBlock>
            <TextInput value={values.name} onChangeText={(value) => updateField('name', value)} placeholder="Nombre" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">Username</TextBlock>
              <TextInput value={values.username} onChangeText={(value) => updateField('username', value)} placeholder="usuario" autoCapitalize="none" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
            </View>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">Correo</TextBlock>
              <TextInput value={values.email} onChangeText={(value) => updateField('email', value)} placeholder="correo@email.com" autoCapitalize="none" keyboardType="email-address" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">Telefono</TextBlock>
              <TextInput value={values.phone} onChangeText={(value) => updateField('phone', value)} placeholder="3001234567" keyboardType="phone-pad" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
            </View>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">Nacimiento</TextBlock>
              <TextInput value={values.birthDate} onChangeText={(value) => updateField('birthDate', value)} placeholder="YYYY-MM-DD" keyboardType="numbers-and-punctuation" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">Estatura cm</TextBlock>
              <TextInput value={values.height} onChangeText={(value) => updateField('height', value.replace(/[^0-9.]/g, ''))} placeholder="170" keyboardType="decimal-pad" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
            </View>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">Peso kg</TextBlock>
              <TextInput value={values.weight} onChangeText={(value) => updateField('weight', value.replace(/[^0-9.]/g, ''))} placeholder="70" keyboardType="decimal-pad" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
            </View>
          </View>

          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">Genero</TextBlock>
            <View style={styles.segmentRow}>
              {[
                { value: 'male', label: 'Masculino' },
                { value: 'female', label: 'Femenino' },
                { value: 'other', label: 'Otro' },
              ].map((option) => {
                const selected = values.gender === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => updateField('gender', option.value as Values['gender'])}
                    style={({ pressed }) => [
                      styles.segment,
                      {
                        backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.backgroundSoft,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <TextBlock variant="caption" color={selected ? 'primary' : 'muted'}>{option.label}</TextBlock>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">Rol</TextBlock>
            <View style={styles.segmentRow}>
              {ADMIN_ROLE_OPTIONS.map((option) => {
                const selected = values.roleSlug === option.value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => updateField('roleSlug', option.value)}
                    style={({ pressed }) => [
                      styles.segment,
                      {
                        backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.backgroundSoft,
                        borderColor: selected ? theme.colors.primary : theme.colors.border,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <TextBlock variant="caption" color={selected ? 'primary' : 'muted'}>{option.label}</TextBlock>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={[styles.passwordBox, { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border }]}>
            <View style={styles.passwordHeader}>
              <TextBlock variant="title">{isEditing ? 'Cambiar contrasena' : 'Contrasena de acceso'}</TextBlock>
              <TextBlock variant="caption" color="muted">
                {isEditing
                  ? 'Escribe una nueva contrasena solo si deseas cambiarla. Se cerraran las sesiones abiertas del usuario.'
                  : 'Define la contrasena inicial del usuario.'}
              </TextBlock>
            </View>

            <View style={styles.row}>
              <View style={[styles.field, styles.rowField]}>
                <TextBlock variant="caption" color="muted">
                  {isEditing ? 'Nueva contrasena' : 'Contrasena'}
                </TextBlock>
                <TextInput
                  value={values.password}
                  onChangeText={(value) => updateField('password', value)}
                  placeholder={isEditing ? 'Dejar vacio para no cambiar' : 'Minimo 8 caracteres'}
                  secureTextEntry
                  textContentType="newPassword"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textSubtle}
                  style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
                />
              </View>
              <View style={[styles.field, styles.rowField]}>
                <TextBlock variant="caption" color="muted">Confirmar contrasena</TextBlock>
                <TextInput
                  value={values.passwordConfirmation}
                  onChangeText={(value) => updateField('passwordConfirmation', value)}
                  placeholder="Repetir contrasena"
                  secureTextEntry
                  textContentType="newPassword"
                  autoCapitalize="none"
                  placeholderTextColor={theme.colors.textSubtle}
                  style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
                />
              </View>
            </View>

            {values.password || values.passwordConfirmation ? (
              <TextBlock
                variant="caption"
                color={values.password.length >= 8 && values.password === values.passwordConfirmation ? 'primary' : 'subtle'}
              >
                {values.password.length < 8
                  ? 'Debe tener al menos 8 caracteres.'
                  : values.password === values.passwordConfirmation
                    ? 'La contrasena esta lista para actualizarse.'
                    : 'Las contrasenas no coinciden.'}
              </TextBlock>
            ) : null}
          </View>

          {!isEditing && values.roleSlug === 'user' ? (
            <View style={[styles.membershipBox, { backgroundColor: theme.colors.backgroundSoft, borderColor: theme.colors.border }]}>
              <TextBlock variant="title">Membresia inicial</TextBlock>
              <View style={styles.membershipPlanGrid}>
                {activeMembershipTypes.map((membershipType) => {
                  const selected = effectiveMembershipPlanType === membershipType.code;
                  return (
                    <Pressable
                      key={membershipType.id}
                      onPress={() => updateField('membershipPlanType', membershipType.code)}
                      style={({ pressed }) => [
                        styles.membershipPlanCard,
                        {
                          backgroundColor: selected ? theme.colors.surfaceElevated : theme.colors.surface,
                          borderColor: selected ? theme.colors.primary : theme.colors.border,
                        },
                        pressed && styles.pressed,
                      ]}
                    >
                      <TextBlock variant="caption" color={selected ? 'primary' : 'muted'}>{membershipType.name}</TextBlock>
                      <TextBlock variant="caption" color="subtle">{Number(membershipType.price).toLocaleString('es-CO')} COP · {membershipType.duration_days} dias</TextBlock>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.field}>
                <TextBlock variant="caption" color="muted">Vence</TextBlock>
                <TextInput value={membershipEndsAt} editable={false} placeholder="YYYY-MM-DD" placeholderTextColor={theme.colors.textSubtle} style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
              </View>
              <View style={styles.field}>
                <TextBlock variant="caption" color="muted">Notas</TextBlock>
                <TextInput value={values.membershipNotes} onChangeText={(value) => updateField('membershipNotes', value)} placeholder="Opcional" multiline placeholderTextColor={theme.colors.textSubtle} style={[styles.input, styles.textArea, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]} />
              </View>
            </View>
          ) : null}

          <View style={[styles.switchRow, { borderColor: theme.colors.border }]}>
            <View style={styles.switchText}>
              <TextBlock variant="title">Cuenta activa</TextBlock>
              <TextBlock variant="caption" color="muted">Controla si el usuario puede operar normalmente.</TextBlock>
            </View>
            <Switch value={values.isActive} onValueChange={(value) => updateField('isActive', value)} trackColor={{ false: theme.colors.border, true: theme.colors.primary }} />
          </View>

          <Pressable
            onPress={() => void handleSubmit()}
            disabled={saving || deleting}
            style={({ pressed }) => [
              styles.submit,
              { backgroundColor: theme.colors.primary },
              pressed && !saving && !deleting && styles.pressed,
              (saving || deleting) && styles.disabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#061018" />
            ) : (
              <TextBlock variant="button" style={styles.submitLabel}>
                {isEditing ? 'Guardar cambios' : 'Crear usuario'}
              </TextBlock>
            )}
          </Pressable>

          {isEditing ? (
            <Pressable
              onPress={handleDelete}
              disabled={deleting || saving || String(currentUser?.id) === String(params.id)}
              style={({ pressed }) => [
                styles.deleteButton,
                { borderColor: theme.colors.danger },
                pressed && !deleting && !saving && styles.pressed,
                (deleting || saving || String(currentUser?.id) === String(params.id)) && styles.disabled,
              ]}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={theme.colors.danger} />
              ) : (
                <TextBlock variant="button" style={{ color: theme.colors.danger }}>
                  Eliminar usuario
                </TextBlock>
              )}
            </Pressable>
          ) : null}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: DIMENSIONS.tabBarHeight,
    gap: 16,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowField: {
    flex: 1,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
  },
  textArea: {
    minHeight: 84,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  segmentRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  segment: {
    flexGrow: 1,
    minWidth: 120,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  membershipBox: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  membershipPlanGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  membershipPlanCard: {
    flexGrow: 1,
    flexBasis: '31%',
    minWidth: 120,
    minHeight: 82,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  passwordBox: {
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  passwordHeader: {
    gap: 4,
  },
  switchRow: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  switchText: {
    flex: 1,
    gap: 4,
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
  deleteButton: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
});
