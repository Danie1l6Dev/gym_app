import { AppHeader, EmptyState, ScreenContainer } from '@/components/common';

export default function AdminScreen() {
  return (
    <ScreenContainer>
      <AppHeader
        title="Admin"
        subtitle="Base preparada para panel administrativo y mantenimiento futuro."
      />

      <EmptyState
        title="Panel administrativo"
        description="Cuando conectes el backend, aqui apareceran usuarios, membresias y sincronizacion."
        iconName="shield-checkmark-outline"
      />
    </ScreenContainer>
  );
}

