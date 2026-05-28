import { View, StyleSheet } from 'react-native';

import { ScreenContainer } from '@/components/ScreenContainer';
import { AppHeader } from '@/components/AppHeader';
import { EmptyState } from '@/components/EmptyState';
import { DIMENSIONS, ROUTES } from '@/constants';
import { useTheme } from '@/hooks/use-theme';
import { TextBlock } from '@/components/TextBlock';

export default function LoginScreen() {
  const theme = useTheme();

  return (
    <ScreenContainer scrollable centerContent>
      <AppHeader
        title="Acceso"
        subtitle="Base visual lista para autenticación futura."
      />

      <View
        style={[
          styles.heroCard,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
        ]}>
        <TextBlock variant="eyebrow" color="primary">
          Auth stack
        </TextBlock>
        <TextBlock variant="header">Bienvenido al panel del gimnasio</TextBlock>
        <TextBlock variant="body" color="muted">
          Esta pantalla queda preparada para conectar login, registro y recuperación de acceso
          cuando el backend esté listo.
        </TextBlock>
      </View>

      <EmptyState
        title="Autenticación pendiente"
        description={`La ruta ${ROUTES.auth.login} ya existe en el stack de auth, pero todavía no tiene lógica de negocio ni llamadas a API.`}
        icon="shield-account-outline"
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: DIMENSIONS.cardRadius,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 24,
    gap: 12,
    marginBottom: 16,
  },
});
