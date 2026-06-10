import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { DIMENSIONS, ROUTES } from '@/constants';
import {
  createMembershipType,
  fetchMembershipTypeById,
  updateMembershipType,
} from '@/services/admin.service';
import { useTheme } from '@/hooks/use-theme';

type FormValues = {
  name: string;
  code: string;
  durationDays: string;
  price: string;
  description: string;
  isActive: boolean;
};

const EMPTY_VALUES: FormValues = {
  name: '',
  code: '',
  durationDays: '30',
  price: '',
  description: '',
  isActive: true,
};

function normalizeCode(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9_-]/g, '');
}

export default function AdminMembershipTypeFormScreen() {
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(params.id);
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const canSubmit = useMemo(
    () =>
      Boolean(
        values.name.trim() &&
          values.code.trim() &&
          Number(values.durationDays) > 0 &&
          Number(values.price) >= 0
      ),
    [values]
  );

  useEffect(() => {
    if (!params.id) {
      return;
    }

    let mounted = true;

    async function loadMembershipType() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchMembershipTypeById(params.id as string);
        const item = response.item;

        if (!mounted || !item) {
          return;
        }

        setValues({
          name: item.name,
          code: item.code,
          durationDays: String(item.duration_days),
          price: String(item.price),
          description: item.description ?? '',
          isActive: item.is_active,
        });
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'No pudimos cargar la membresia.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadMembershipType();

    return () => {
      mounted = false;
    };
  }, [params.id]);

  function updateField(field: keyof FormValues, value: string | boolean) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit() {
    if (!canSubmit) {
      setValidationError('Completa nombre, codigo, duracion y precio.');
      return;
    }

    try {
      setSaving(true);
      setValidationError(null);

      const payload = {
        name: values.name.trim(),
        code: normalizeCode(values.code),
        duration_days: Number(values.durationDays),
        price: Number(values.price),
        description: values.description.trim() || null,
        is_active: values.isActive,
      };

      if (params.id) {
        await updateMembershipType(params.id, payload);
      } else {
        await createMembershipType(payload);
      }

      router.replace(ROUTES.app.adminManageMemberships as never);
    } catch (err) {
      setValidationError(
        err instanceof Error ? err.message : 'No pudimos guardar el tipo de membresia.'
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <AppHeader
          title={isEditing ? 'Editar membresia' : 'Nueva membresia'}
          subtitle="Tipo de membresia"
          showBack
          backHref={ROUTES.app.adminManageMemberships}
        />
        <LoadingSpinner label="Cargando membresia" />
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <AppHeader
          title={isEditing ? 'Editar membresia' : 'Nueva membresia'}
          subtitle="Tipo de membresia"
          showBack
          backHref={ROUTES.app.adminManageMemberships}
        />
        <EmptyState title="No pudimos cargar la membresia" description={error} icon="alert-circle-outline" />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scrollable={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppHeader
          title={isEditing ? 'Editar membresia' : 'Nueva membresia'}
          subtitle="Configura el tipo, duracion y precio"
          showBack
          backHref={ROUTES.app.adminManageMemberships}
        />

        {validationError ? (
          <EmptyState
            title="Revisa el formulario"
            description={validationError}
            icon="alert-circle-outline"
          />
        ) : null}

        <View style={[styles.form, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">
              Nombre
            </TextBlock>
            <TextInput
              value={values.name}
              onChangeText={(value) => {
                updateField('name', value);
                if (!isEditing) {
                  updateField('code', normalizeCode(value));
                }
              }}
              placeholder="Mensual"
              placeholderTextColor={theme.colors.textSubtle}
              style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            />
          </View>

          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">
              Codigo
            </TextBlock>
            <TextInput
              value={values.code}
              onChangeText={(value) => updateField('code', normalizeCode(value))}
              placeholder="monthly"
              autoCapitalize="none"
              placeholderTextColor={theme.colors.textSubtle}
              style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">
                Duracion en dias
              </TextBlock>
              <TextInput
                value={values.durationDays}
                onChangeText={(value) => updateField('durationDays', value.replace(/[^0-9]/g, ''))}
                keyboardType="number-pad"
                placeholder="30"
                placeholderTextColor={theme.colors.textSubtle}
                style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
              />
            </View>

            <View style={[styles.field, styles.rowField]}>
              <TextBlock variant="caption" color="muted">
                Precio
              </TextBlock>
              <TextInput
                value={values.price}
                onChangeText={(value) => updateField('price', value.replace(/[^0-9.]/g, ''))}
                keyboardType="decimal-pad"
                placeholder="120000"
                placeholderTextColor={theme.colors.textSubtle}
                style={[styles.input, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text }]}
              />
            </View>
          </View>

          <View style={styles.field}>
            <TextBlock variant="caption" color="muted">
              Descripcion
            </TextBlock>
            <TextInput
              value={values.description}
              onChangeText={(value) => updateField('description', value)}
              placeholder="Acceso al gimnasio durante 30 dias"
              multiline
              placeholderTextColor={theme.colors.textSubtle}
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, color: theme.colors.text },
              ]}
            />
          </View>

          <View style={[styles.switchRow, { borderColor: theme.colors.border }]}>
            <View style={styles.switchText}>
              <TextBlock variant="title">Activa</TextBlock>
              <TextBlock variant="caption" color="muted">
                Las membresias inactivas quedan ocultas para nuevos registros.
              </TextBlock>
            </View>
            <Switch
              value={values.isActive}
              onValueChange={(value) => updateField('isActive', value)}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
            />
          </View>

          <Pressable
            onPress={() => void handleSubmit()}
            disabled={saving}
            style={({ pressed }) => [
              styles.submit,
              { backgroundColor: theme.colors.primary },
              pressed && !saving && styles.pressed,
              saving && styles.disabled,
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#061018" />
            ) : (
              <TextBlock variant="button" style={styles.submitLabel}>
                Guardar membresia
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
    minHeight: 96,
    paddingTop: 14,
    textAlignVertical: 'top',
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
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.7,
  },
});
