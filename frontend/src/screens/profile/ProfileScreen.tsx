import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState, type ComponentProps, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { ScreenContainer } from '@/components/ScreenContainer';
import { TextBlock } from '@/components/TextBlock';
import { DIMENSIONS } from '@/constants';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import type { UpdateProfilePayload, User } from '@/interfaces/auth';
import type { ApiError } from '@/services/api/client';
import { formatShortDate } from '@/utils/dates';
import { shadowStyle } from '@/utils';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type ProfileItem = {
  label: string;
  value: string;
  icon: IconName;
  detail?: string;
};

type ProfileFormState = {
  name: string;
  username: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: '' | 'male' | 'female' | 'other';
  height: string;
  weight: string;
  photoPreviewUri: string;
  profile_photo_file?: UpdateProfilePayload['profile_photo_file'];
};

const GENDER_OPTIONS: { label: string; value: ProfileFormState['gender'] }[] = [
  { label: 'Sin definir', value: '' },
  { label: 'Masculino', value: 'male' },
  { label: 'Femenino', value: 'female' },
  { label: 'Otro', value: 'other' },
];

export default function ProfileScreen() {
  const theme = useTheme();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<ProfileFormState>(() => createProfileForm(user));
  const [focusedField, setFocusedField] = useState<keyof ProfileFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const membership = user?.latest_membership;
  const routines = user?.routines ?? [];
  const avatarUri = user?.avatarUrl ?? user?.profile_photo ?? null;
  const initials = getInitials(user?.name);
  const roleLabel = user?.role?.name ?? user?.role?.slug ?? 'Usuario';
  const accountStatus = user?.is_active === false ? 'Cuenta inactiva' : 'Cuenta activa';
  const bmi = calculateBmi(user?.height, user?.weight);

  const accountItems: ProfileItem[] = [
    { label: 'Usuario', value: user?.username ?? 'No registrado', icon: 'account-outline' },
    { label: 'Correo', value: user?.email ?? 'No disponible', icon: 'email-outline' },
    { label: 'Teléfono', value: user?.phone ?? 'No registrado', icon: 'phone-outline' },
    { label: 'Rol', value: roleLabel, icon: 'shield-account-outline' },
    {
      label: 'Estado',
      value: user?.is_active === false ? 'Inactivo' : 'Activo',
      icon: user?.is_active === false ? 'account-off-outline' : 'account-check-outline',
    },
  ];

  const physicalItems: ProfileItem[] = [
    {
      label: 'Fecha de nacimiento',
      value: user?.birth_date ? formatShortDate(user.birth_date) : 'No registrada',
      icon: 'calendar-account-outline',
    },
    { label: 'Edad', value: calculateAge(user?.birth_date) ?? 'No disponible', icon: 'calendar-clock' },
    { label: 'Género', value: formatGender(user?.gender), icon: 'human-male-female' },
    { label: 'Altura', value: formatMeasurement(user?.height, 'm'), icon: 'human-male-height' },
    { label: 'Peso', value: formatMeasurement(user?.weight, 'kg'), icon: 'weight-kilogram' },
    { label: 'IMC', value: bmi ?? 'No disponible', icon: 'calculator-variant-outline' },
  ];

  const membershipItems: ProfileItem[] = [
    { label: 'Plan', value: membership?.plan_label ?? 'Sin membresía', icon: 'card-account-details-outline' },
    { label: 'Estado', value: formatMembershipStatus(membership?.status), icon: 'check-decagram-outline' },
    {
      label: 'Inicio',
      value: membership?.starts_at ? formatShortDate(membership.starts_at) : 'No registrado',
      icon: 'calendar-start-outline',
    },
    {
      label: 'Vencimiento',
      value: membership?.ends_at ? formatShortDate(membership.ends_at) : 'No registrado',
      icon: 'calendar-end-outline',
    },
    { label: 'Precio', value: formatCurrency(membership?.price), icon: 'cash' },
    {
      label: 'Fecha de pago',
      value: membership?.paid_at ? formatShortDate(membership.paid_at) : 'No registrada',
      icon: 'receipt-text-check-outline',
    },
  ];

  function openEditForm() {
    setForm(createProfileForm(user));
    setFormMessage(null);
    setIsEditing(true);
  }

  function closeEditForm() {
    setForm(createProfileForm(user));
    setFormMessage(null);
    setFocusedField(null);
    setIsEditing(false);
  }

  function updateField(field: keyof ProfileFormState, value: string) {
    setForm((currentForm) => ({ ...currentForm, [field]: value }));
  }

  async function handleSaveProfile() {
    if (!form.name.trim() || !form.email.trim()) {
      setFormMessage('Nombre y correo son obligatorios.');
      return;
    }

    setSaving(true);
    setFormMessage(null);

    const payload: UpdateProfilePayload = {
      name: form.name.trim(),
      username: nullableText(form.username),
      email: form.email.trim().toLowerCase(),
      phone: nullableText(form.phone),
      birth_date: nullableText(form.birth_date),
      gender: form.gender || undefined,
      height: nullableText(form.height),
      weight: nullableText(form.weight),
      profile_photo_file: form.profile_photo_file,
    };

    try {
      await updateProfile(payload);
      setIsEditing(false);
      setFocusedField(null);
    } catch (error) {
      setFormMessage(getProfileErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function pickProfilePhoto() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      setFormMessage('Permite el acceso a tus archivos para seleccionar una foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      mediaTypes: ['images'],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const asset = result.assets[0];
    const extension = getFileExtension(asset.uri);
    const fallbackName = `profile-photo.${extension}`;
    const mimeType = asset.mimeType || getMimeTypeForExtension(extension);

    setForm((currentForm) => ({
      ...currentForm,
      photoPreviewUri: asset.uri,
      profile_photo_file: {
        uri: asset.uri,
        name: asset.fileName ?? fallbackName,
        type: mimeType,
      },
    }));
    setFormMessage(null);
  }

  return (
    <ScreenContainer>
      <AppHeader title={user?.name ?? 'Perfil'} subtitle="Datos de la sesión autenticada." />

      {!user ? (
        <EmptyState
          title="Sin datos de usuario"
          description="Inicia sesión nuevamente para cargar el perfil."
          icon="account-alert-outline"
        />
      ) : null}

      {user ? (
        <>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                ...shadowStyle({
                  color: theme.colors.shadow,
                  opacity: 0.18,
                  radius: 22,
                  offsetY: 10,
                  elevation: 3,
                }),
              },
            ]}>
            <View style={styles.heroTop}>
              <View
                style={[
                  styles.avatarFrame,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: theme.colors.primary,
                  },
                ]}>
                {avatarUri ? (
                  <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
                ) : (
                  <TextBlock variant="header" color="primary">
                    {initials}
                  </TextBlock>
                )}
              </View>

              <View style={styles.heroText}>
                <TextBlock variant="title" style={styles.heroName}>
                  {user.name}
                </TextBlock>
                <TextBlock variant="body" color="muted" numberOfLines={1}>
                  {user.email}
                </TextBlock>

                <View style={styles.badgeRow}>
                  <StatusBadge icon="shield-account-outline" label={roleLabel} />
                  <StatusBadge
                    icon={user.is_active === false ? 'account-off-outline' : 'account-check-outline'}
                    label={accountStatus}
                    muted={user.is_active === false}
                  />
                </View>
              </View>
            </View>

            <View style={styles.heroStats}>
              <MiniStat label="Plan" value={membership?.plan_label ?? 'Sin membresía'} />
              <MiniStat label="Peso" value={formatMeasurement(user.weight, 'kg')} />
              <MiniStat label="IMC" value={bmi ?? 'No disponible'} />
            </View>

            <Pressable
              accessibilityRole="button"
              onPress={isEditing ? closeEditForm : openEditForm}
              style={({ pressed }) => [
                styles.editButton,
                { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                pressed && styles.pressed,
              ]}>
              <MaterialCommunityIcons
                name={isEditing ? 'close' : 'account-edit-outline'}
                size={20}
                color="#FFFFFF"
              />
              <TextBlock variant="button" style={styles.editButtonText}>
                {isEditing ? 'Cancelar edición' : 'Editar datos'}
              </TextBlock>
            </Pressable>
          </View>

          {isEditing ? (
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
              <View
                style={[
                styles.formCard,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  ...shadowStyle({
                    color: theme.colors.shadow,
                    opacity: 0.12,
                    radius: 18,
                    offsetY: 8,
                    elevation: 2,
                  }),
                },
              ]}>
                <View style={styles.formHeader}>
                  <View>
                    <TextBlock variant="title">Editar datos básicos</TextBlock>
                    <TextBlock variant="caption" color="muted">
                      Actualiza la información que aparece en tu perfil.
                    </TextBlock>
                  </View>
                </View>

                {formMessage ? (
                  <View style={[styles.messageBox, { borderColor: theme.colors.danger }]}>
                    <MaterialCommunityIcons
                      name="alert-circle-outline"
                      size={18}
                      color={theme.colors.danger}
                    />
                    <TextBlock variant="caption" style={{ color: theme.colors.danger }}>
                      {formMessage}
                    </TextBlock>
                  </View>
                ) : null}

                <View style={styles.formGrid}>
                  <ProfileInput
                    label="Nombre"
                    value={form.name}
                    onChangeText={(value) => updateField('name', value)}
                    focused={focusedField === 'name'}
                    onFocus={() => setFocusedField('name')}
                    onBlur={() => setFocusedField(null)}
                    required
                  />
                  <ProfileInput
                    label="Usuario"
                    value={form.username}
                    onChangeText={(value) => updateField('username', value)}
                    focused={focusedField === 'username'}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                  />
                  <ProfileInput
                    label="Correo"
                    value={form.email}
                    onChangeText={(value) => updateField('email', value)}
                    focused={focusedField === 'email'}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    required
                  />
                  <ProfileInput
                    label="Teléfono"
                    value={form.phone}
                    onChangeText={(value) => updateField('phone', value)}
                    focused={focusedField === 'phone'}
                    onFocus={() => setFocusedField('phone')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                  />
                  <ProfileInput
                    label="Fecha de nacimiento"
                    value={form.birth_date}
                    onChangeText={(value) => updateField('birth_date', value)}
                    focused={focusedField === 'birth_date'}
                    onFocus={() => setFocusedField('birth_date')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="AAAA-MM-DD"
                  />
                  <ProfileInput
                    label="Altura"
                    value={form.height}
                    onChangeText={(value) => updateField('height', value)}
                    focused={focusedField === 'height'}
                    onFocus={() => setFocusedField('height')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="numeric"
                    placeholder="Ej: 1.75"
                  />
                  <ProfileInput
                    label="Peso"
                    value={form.weight}
                    onChangeText={(value) => updateField('weight', value)}
                    focused={focusedField === 'weight'}
                    onFocus={() => setFocusedField('weight')}
                    onBlur={() => setFocusedField(null)}
                    keyboardType="numeric"
                    placeholder="Ej: 72"
                  />
                </View>

                <View style={styles.photoPickerGroup}>
                  <TextBlock variant="caption" color="muted">
                    Foto de perfil
                  </TextBlock>
                  <View style={styles.photoPickerRow}>
                    <View
                      style={[
                        styles.photoPreview,
                        {
                          backgroundColor: theme.colors.surfaceElevated,
                          borderColor: theme.colors.border,
                        },
                      ]}>
                      {form.photoPreviewUri ? (
                        <Image source={{ uri: form.photoPreviewUri }} style={styles.photoPreviewImage} />
                      ) : (
                        <MaterialCommunityIcons
                          name="account-circle-outline"
                          size={34}
                          color={theme.colors.textMuted}
                        />
                      )}
                    </View>
                    <Pressable
                      accessibilityRole="button"
                      onPress={pickProfilePhoto}
                      style={({ pressed }) => [
                        styles.photoButton,
                        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
                        pressed && styles.pressed,
                      ]}>
                      <MaterialCommunityIcons name="image-plus" size={18} color={theme.colors.primary} />
                      <TextBlock variant="button" color="primary">
                        Seleccionar foto
                      </TextBlock>
                    </Pressable>
                  </View>
                </View>

                <View style={styles.genderGroup}>
                  <TextBlock variant="caption" color="muted">
                    Género
                  </TextBlock>
                  <View style={styles.genderOptions}>
                    {GENDER_OPTIONS.map((option) => {
                      const selected = form.gender === option.value;

                      return (
                        <Pressable
                          key={option.label}
                          accessibilityRole="button"
                          accessibilityState={{ selected }}
                          onPress={() => updateField('gender', option.value)}
                          style={({ pressed }) => [
                            styles.genderButton,
                            {
                              backgroundColor: selected
                                ? theme.colors.primary
                                : theme.colors.surfaceElevated,
                              borderColor: selected ? theme.colors.primary : theme.colors.border,
                            },
                            pressed && styles.pressed,
                          ]}>
                          <TextBlock
                            variant="caption"
                            style={selected ? styles.genderButtonTextActive : undefined}
                            color={selected ? undefined : 'muted'}>
                            {option.label}
                          </TextBlock>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.formActions}>
                  <Pressable
                    disabled={saving}
                    onPress={closeEditForm}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      { borderColor: theme.colors.border },
                      pressed && styles.pressed,
                      saving && styles.disabled,
                    ]}>
                    <TextBlock variant="button" color="muted">
                      Cancelar
                    </TextBlock>
                  </Pressable>
                  <Pressable
                    disabled={saving}
                    onPress={handleSaveProfile}
                    style={({ pressed }) => [
                      styles.saveButton,
                      { backgroundColor: theme.colors.primary },
                      pressed && styles.pressed,
                      saving && styles.disabled,
                    ]}>
                    {saving ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="content-save-outline" size={18} color="#FFFFFF" />
                        <TextBlock variant="button" style={styles.editButtonText}>
                          Guardar cambios
                        </TextBlock>
                      </>
                    )}
                  </Pressable>
                </View>
              </View>
            </KeyboardAvoidingView>
          ) : null}

          <ProfileSection title="Cuenta" icon="account-circle-outline">
            {accountItems.map((item) => (
              <InfoCard key={item.label} {...item} />
            ))}
          </ProfileSection>

          <ProfileSection title="Datos físicos" icon="arm-flex-outline">
            {physicalItems.map((item) => (
              <InfoCard key={item.label} {...item} />
            ))}
          </ProfileSection>

          <ProfileSection title="Membresía" icon="wallet-membership">
            {membershipItems.map((item) => (
              <InfoCard key={item.label} {...item} />
            ))}
            {membership?.notes ? (
              <InfoCard label="Notas" value={membership.notes} icon="note-text-outline" fullWidth />
            ) : null}
          </ProfileSection>

          {routines.length > 0 ? (
            <ProfileSection title="Rutinas" icon="clipboard-list-outline">
              {routines.map((routine) => (
                <InfoCard
                  key={routine.id}
                  label={routine.is_predefined ? 'Rutina predefinida' : 'Rutina personalizada'}
                  value={routine.name}
                  detail={routine.description ?? 'Sin descripción'}
                  icon="dumbbell"
                  fullWidth
                />
              ))}
            </ProfileSection>
          ) : null}
        </>
      ) : null}

      <Pressable
        onPress={() => void logout()}
        style={({ pressed }) => [
          styles.logoutButton,
          { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
          pressed && styles.pressed,
        ]}>
        <MaterialCommunityIcons name="logout" size={20} color={theme.colors.primary} />
        <TextBlock variant="button" color="primary">
          Cerrar sesión
        </TextBlock>
      </Pressable>
    </ScreenContainer>
  );
}

type StatusBadgeProps = {
  icon: IconName;
  label: string;
  muted?: boolean;
};

function StatusBadge({ icon, label, muted = false }: StatusBadgeProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
      ]}>
      <MaterialCommunityIcons
        name={icon}
        size={15}
        color={muted ? theme.colors.textMuted : theme.colors.primary}
      />
      <TextBlock variant="caption" color={muted ? 'muted' : 'primary'} numberOfLines={1}>
        {label}
      </TextBlock>
    </View>
  );
}

type MiniStatProps = {
  label: string;
  value: string;
};

function MiniStat({ label, value }: MiniStatProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.miniStat,
        { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
      ]}>
      <TextBlock variant="caption" color="muted">
        {label}
      </TextBlock>
      <TextBlock variant="button" numberOfLines={1}>
        {value}
      </TextBlock>
    </View>
  );
}

type ProfileSectionProps = {
  title: string;
  icon: IconName;
  children: ReactNode;
};

function ProfileSection({ title, icon, children }: ProfileSectionProps) {
  const theme = useTheme();

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <TextBlock variant="eyebrow" color="muted">
          {title}
        </TextBlock>
        <View style={[styles.sectionLine, { backgroundColor: theme.colors.border }]} />
      </View>
      <View style={styles.grid}>{children}</View>
    </View>
  );
}

type InfoCardProps = ProfileItem & {
  fullWidth?: boolean;
};

function InfoCard({ label, value, detail, icon, fullWidth = false }: InfoCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.itemCard,
        fullWidth && styles.fullWidth,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          ...shadowStyle({
            color: theme.colors.shadow,
            opacity: 0.08,
            radius: 14,
            offsetY: 6,
            elevation: 1,
          }),
        },
      ]}>
      <View style={styles.itemTop}>
        <View style={[styles.itemIcon, { backgroundColor: theme.colors.surfaceElevated }]}>
          <MaterialCommunityIcons name={icon} size={18} color={theme.colors.primary} />
        </View>
        <TextBlock variant="caption" color="muted" style={styles.itemLabel}>
          {label}
        </TextBlock>
      </View>
      <TextBlock variant="title" style={styles.itemValue}>
        {value}
      </TextBlock>
      {detail ? (
        <TextBlock variant="caption" color="subtle">
          {detail}
        </TextBlock>
      ) : null}
    </View>
  );
}

type ProfileInputProps = ComponentProps<typeof TextInput> & {
  label: string;
  focused: boolean;
  required?: boolean;
};

function ProfileInput({ label, focused, required = false, style, ...inputProps }: ProfileInputProps) {
  const theme = useTheme();

  return (
    <View style={styles.inputGroup}>
      <TextBlock variant="caption" color="muted">
        {label}
        {required ? ' *' : ''}
      </TextBlock>
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: theme.colors.surfaceElevated,
            borderColor: focused ? theme.colors.primary : theme.colors.border,
            color: theme.colors.text,
          },
          style,
        ]}
        {...inputProps}
      />
    </View>
  );
}

function createProfileForm(user?: User | null): ProfileFormState {
  return {
    name: user?.name ?? '',
    username: user?.username ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    birth_date: user?.birth_date ?? '',
    gender: isProfileGender(user?.gender) ? user.gender : '',
    height: user?.height === null || user?.height === undefined ? '' : String(user.height),
    weight: user?.weight === null || user?.weight === undefined ? '' : String(user.weight),
    photoPreviewUri: user?.avatarUrl ?? user?.profile_photo ?? '',
  };
}

function isProfileGender(value?: string | null): value is ProfileFormState['gender'] {
  return value === 'male' || value === 'female' || value === 'other' || value === '';
}

function nullableText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : null;
}

function getFileExtension(uri: string) {
  const extension = uri.split('.').pop()?.split('?')[0]?.toLowerCase();

  return extension && extension.length <= 5 ? extension : 'jpg';
}

function getMimeTypeForExtension(extension: string): string {
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
  };

  return mimeTypes[extension.toLowerCase()] || 'image/jpeg';
}

function getProfileErrorMessage(error: unknown) {
  const apiError = error as ApiError;
  const validationMessages = apiError.data?.errors
    ? Object.values(apiError.data.errors).flat().filter(Boolean)
    : [];

  if (validationMessages.length > 0) {
    return validationMessages[0];
  }

  return error instanceof Error ? error.message : 'No se pudo actualizar el perfil.';
}

function getInitials(name?: string | null) {
  if (!name) return 'U';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function calculateAge(value?: string | null) {
  if (!value) return null;

  const birthDate = new Date(value);
  if (Number.isNaN(birthDate.getTime())) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }

  return `${age} años`;
}

function calculateBmi(height?: string | number | null, weight?: string | number | null) {
  const heightValue = Number(height);
  const weightValue = Number(weight);

  if (!heightValue || !weightValue) return null;

  const heightInMeters = heightValue > 3 ? heightValue / 100 : heightValue;
  const bmi = weightValue / (heightInMeters * heightInMeters);

  if (!Number.isFinite(bmi)) return null;

  return bmi.toFixed(1);
}

function formatMeasurement(value?: string | number | null, unit?: string) {
  if (value === null || value === undefined || value === '') return 'No registrado';

  return `${value}${unit ? ` ${unit}` : ''}`;
}

function formatCurrency(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return 'No registrado';

  const amount = Number(value);
  if (Number.isNaN(amount)) return String(value);

  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatGender(value?: string | null) {
  if (!value) return 'No registrado';

  const labels: Record<string, string> = {
    male: 'Masculino',
    female: 'Femenino',
    other: 'Otro',
  };

  return labels[value] ?? value;
}

function formatMembershipStatus(value?: string | null) {
  if (!value) return 'No registrada';

  const labels: Record<string, string> = {
    active: 'Activa',
    expired: 'Vencida',
    cancelled: 'Cancelada',
  };

  return labels[value] ?? value;
}

const styles = StyleSheet.create({
  heroCard: {
    marginTop: 4,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 18,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarFrame: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  heroText: {
    flex: 1,
    gap: 6,
    minWidth: 0,
  },
  heroName: {
    fontSize: 22,
    lineHeight: 28,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusBadge: {
    minHeight: 30,
    maxWidth: '100%',
    borderRadius: DIMENSIONS.chipRadius,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  heroStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  miniStat: {
    flexGrow: 1,
    flexBasis: '30%',
    minHeight: 64,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: 'center',
    gap: 3,
  },
  editButton: {
    minHeight: 48,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editButtonText: {
    color: '#FFFFFF',
  },
  formCard: {
    marginTop: 16,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 18,
    gap: 16,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  messageBox: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  inputGroup: {
    flexGrow: 1,
    flexBasis: '47%',
    gap: 8,
    minWidth: 220,
  },
  input: {
    minHeight: 50,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    fontSize: 15,
    fontWeight: '600',
  },
  photoPickerGroup: {
    gap: 8,
  },
  photoPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 12,
  },
  photoPreview: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPreviewImage: {
    width: '100%',
    height: '100%',
  },
  photoButton: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  genderGroup: {
    gap: 8,
  },
  genderOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  genderButton: {
    minHeight: 40,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonTextActive: {
    color: '#FFFFFF',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
    gap: 10,
  },
  secondaryButton: {
    minHeight: 48,
    minWidth: 128,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: {
    minHeight: 48,
    minWidth: 170,
    borderRadius: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabled: {
    opacity: 0.7,
  },
  section: {
    marginTop: 22,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sectionIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  itemCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minHeight: 118,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 10,
  },
  fullWidth: {
    flexBasis: '100%',
  },
  itemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemLabel: {
    flex: 1,
  },
  itemValue: {
    fontSize: 17,
    lineHeight: 23,
  },
  logoutButton: {
    marginTop: 22,
    minHeight: 52,
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
