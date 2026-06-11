import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants';
import { useAuth, useDeleteRoutine, useRoutines } from '@/hooks';
import { TYPOGRAPHY } from '@/theme';
import type { Exercise } from '@/interfaces/exercise';
import type { Routine } from '@/interfaces/routine';

type RoutineTab = 'recommended' | 'mine';

const TABS: { key: RoutineTab; label: string; sub: string }[] = [
  { key: 'recommended', label: 'Recomendadas', sub: 'Rutinas predefinidas del catÃ¡logo' },
  { key: 'mine', label: 'Mis rutinas', sub: 'Rutinas creadas o asignadas a tu usuario' },
];

const NIVEL_STYLE: Record<string, { bg: string; color: string }> = {
  Principiante: { bg: 'rgba(52,211,153,0.1)', color: '#34d399' },
  Intermedio: { bg: 'rgba(251,191,36,0.1)', color: '#fbbf24' },
  Avanzado: { bg: 'rgba(248,113,113,0.1)', color: '#f87171' },
};

function getNivel(r: Routine): string {
  const labels = new Set<string>();
  for (const ex of (r.exercises ?? []) as Exercise[]) {
    if (ex.difficulty_label) labels.add(ex.difficulty_label);
  }
  if (labels.has('Avanzado') || labels.has('advanced')) return 'Avanzado';
  if (labels.has('Intermedio') || labels.has('intermediate')) return 'Intermedio';
  if (labels.has('Principiante') || labels.has('beginner')) return 'Principiante';
  return 'Intermedio';
}

function RutinaCard({
  routine,
  exercisesCount,
  personal,
  onPress,
  onEdit,
  onDelete,
  deleting,
}: {
  routine: Routine;
  exercisesCount: number;
  personal?: boolean;
  onPress: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  deleting?: boolean;
}) {
  const nivel = getNivel(routine);
  const nv = NIVEL_STYLE[nivel] ?? NIVEL_STYLE.Intermedio;
  const muscleNames = (routine.exercises ?? []).map((e: any) => {
    if (typeof e === 'object' && e.muscle?.name) return e.muscle.name;
    return null;
  }).filter(Boolean);
  const uniqueMuscles = [...new Set(muscleNames as string[])].slice(0, 3);

  const totalSets = (routine.exercises ?? []).reduce((sum: number, e: any) => {
    return sum + (e.pivot?.sets ?? e.sets ?? 0);
  }, 0);

  return (
    <Pressable
      onPress={onPress}
      style={({ hovered }) => [
        styles.rCard,
        {
          borderColor: hovered ? 'rgba(139,92,246,0.48)' : 'rgba(139,92,246,0.14)',
          shadowColor: hovered ? 'rgba(109,40,217,0.14)' : 'transparent',
          shadowOpacity: 0.4,
          shadowRadius: 28,
          shadowOffset: { width: 0, height: 0 },
          elevation: hovered ? 6 : 0,
        },
      ]}>
      {({ hovered }) => (
        <>
          <View style={[styles.rGlow, { opacity: hovered ? 1 : 0.4 }]} />
          <View style={styles.rTop}>
            <View style={styles.rTopLeft}>
              <View style={styles.rIconWrap}>
                <MaterialCommunityIcons
                  name={personal ? 'account' : 'star'}
                  size={16} color="#a78bfa"
                />
              </View>
              <View style={styles.rNameWrap}>
                <Text style={styles.rName}>{routine.name}</Text>
                {routine.description ? (
                  <Text style={styles.rDesc} numberOfLines={1}>{routine.description}</Text>
                ) : null}
              </View>
            </View>
            <View style={[styles.rBadge, { backgroundColor: nv.bg, borderColor: `${nv.color}30` }]}>
              <Text style={[styles.rBadgeText, { color: nv.color }]}>{nivel}</Text>
            </View>
          </View>

          {uniqueMuscles.length > 0 && (
            <View style={styles.rTags}>
              {uniqueMuscles.map((m: string) => (
                <View key={m} style={styles.rTag}>
                  <Text style={styles.rTagText}>{m}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.rBottom}>
            <View style={styles.rStats}>
              <View style={styles.rStat}>
                <MaterialCommunityIcons name="dumbbell" size={12} color="rgba(139,92,246,0.6)" />
                <Text style={styles.rStatText}>{exercisesCount} ejercicios</Text>
              </View>
              {totalSets > 0 && (
                <View style={styles.rStat}>
                  <MaterialCommunityIcons name="clock-outline" size={12} color="rgba(139,92,246,0.6)" />
                  <Text style={styles.rStatText}>{totalSets} series</Text>
                </View>
              )}
            </View>
            <View style={styles.rActions}>
              {personal && (
                <>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation?.();
                      onEdit?.();
                    }}
                    style={({ hovered: h }) => [styles.rIconBtn, { backgroundColor: h ? 'rgba(139,92,246,0.12)' : 'transparent', borderColor: h ? 'rgba(139,92,246,0.35)' : 'rgba(255,255,255,0.06)' }]}>
                    <MaterialCommunityIcons name="pencil" size={13} color="#c4b5fd" />
                  </Pressable>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation?.();
                      onDelete?.();
                    }}
                    disabled={deleting}
                    style={({ hovered: h }) => [styles.rIconBtn, { backgroundColor: h ? 'rgba(248,113,113,0.12)' : 'transparent', borderColor: h ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.06)' }]}>
                    <MaterialCommunityIcons
                      name="delete-outline"
                      size={13}
                      color={deleting ? 'rgba(248,113,113,0.55)' : 'rgba(255,255,255,0.3)'}
                    />
                  </Pressable>
                </>
              )}
              <Pressable
                style={({ hovered: h }) => [styles.rActionBtn, { backgroundColor: h ? 'rgba(109,40,217,0.35)' : 'rgba(109,40,217,0.2)' }]}>
                <Text style={styles.rActionText}>{personal ? 'Ver detalles' : 'Usar rutina'}</Text>
                <MaterialCommunityIcons name="chevron-right" size={13} color="#c4b5fd" />
              </Pressable>
            </View>
          </View>
        </>
      )}
    </Pressable>
  );
}

function CrearRutinaModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [focused, setFocused] = useState(false);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="plus" size={16} color="#a78bfa" />
            </View>
            <View>
              <Text style={styles.modalTitle}>Nueva rutina</Text>
              <Text style={styles.modalSub}>Personaliza tu entrenamiento</Text>
            </View>
          </View>

          <View style={styles.modalForm}>
            <View>
              <Text style={styles.modalLabel}>Nombre de la rutina</Text>
              <TextInput
                value={nombre}
                onChangeText={setNombre}
                placeholder="Ej. Rutina de fuerza â€” Martes"
                placeholderTextColor="rgba(255,255,255,0.25)"
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                style={[styles.modalInput, focused && { borderColor: 'rgba(139,92,246,0.85)', shadowColor: 'rgba(109,40,217,0.12)', shadowOpacity: 1, shadowRadius: 3, shadowOffset: { width: 0, height: 0 }, elevation: 3 }]}
              />
            </View>
            <View>
              <Text style={styles.modalLabel}>Nivel</Text>
              <View style={styles.modalNiveles}>
                {(['Principiante', 'Intermedio', 'Avanzado'] as const).map((n) => {
                  const active = nivel === n;
                  const nv = NIVEL_STYLE[n];
                  return (
                    <Pressable
                      key={n}
                      onPress={() => setNivel(n)}
                      style={[
                        styles.modalNivelBtn,
                        {
                          backgroundColor: active ? nv.bg : 'transparent',
                          borderColor: active ? `${nv.color}60` : 'rgba(255,255,255,0.08)',
                        },
                      ]}>
                      <Text style={[styles.modalNivelText, { color: active ? nv.color : 'rgba(255,255,255,0.3)' }]}>
                        {n}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.modalActions}>
            <Pressable onPress={onClose} style={styles.modalCancel}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable onPress={onClose} style={styles.modalCreate}>
              <Text style={styles.modalCreateText}>Crear rutina</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ConfirmDeleteRoutineModal({
  visible,
  routineName,
  deleting,
  deleteError,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  routineName?: string | null;
  deleting?: boolean;
  deleteError?: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.modalOverlay} onPress={deleting ? undefined : onCancel}>
        <Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}>
          <View style={styles.modalHeader}>
            <View style={[styles.modalIconWrap, styles.deleteModalIconWrap]}>
              <MaterialCommunityIcons name="delete-outline" size={16} color="#f87171" />
            </View>
            <View>
              <Text style={styles.modalTitle}>Eliminar rutina</Text>
              <Text style={styles.modalSub}>Esta acciÃ³n no se puede deshacer.</Text>
            </View>
          </View>

          <View style={styles.modalForm}>
            <Text style={styles.deleteModalText}>
              {`Se eliminarÃ¡ "${routineName ?? 'esta rutina'}" de tus rutinas personales.`}
            </Text>
            {deleteError ? <Text style={styles.deleteModalError}>{deleteError}</Text> : null}
          </View>

          <View style={styles.modalActions}>
            <Pressable
              onPress={onCancel}
              disabled={deleting}
              style={[styles.modalCancel, deleting && styles.modalDisabled]}>
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={deleting}
              style={[styles.modalDelete, deleting && styles.modalDisabled]}>
              <Text style={styles.modalDeleteText}>{deleting ? 'Eliminando...' : 'Eliminar'}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function EmptyRoutines({ onCrear }: { onCrear: () => void }) {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIconWrap}>
        <MaterialCommunityIcons name="clipboard-text-outline" size={22} color="#a78bfa" />
      </View>
      <Text style={styles.emptyTitle}>Sin rutinas creadas</Text>
      <Text style={styles.emptyDesc}>
        AÃºn no tienes rutinas personalizadas. Crea una nueva o una recomendada como base.
      </Text>
      <Pressable onPress={onCrear} style={styles.emptyBtn}>
        <MaterialCommunityIcons name="plus" size={14} color="#fff" />
        <Text style={styles.emptyBtnText}>Crear rutina</Text>
      </Pressable>
    </View>
  );
}

export default function RoutinesScreen() {
  const { user } = useAuth();
  const { items, loading, refreshing, error, refresh, retry } = useRoutines();
  const { submit: deleteRoutineSubmit, loading: deleting, error: deleteError } = useDeleteRoutine();
  const [activeTab, setActiveTab] = useState<RoutineTab>('recommended');
  const [modalVisible, setModalVisible] = useState(false);
  const [deletingRoutineId, setDeletingRoutineId] = useState<string | null>(null);
  const [routinePendingDelete, setRoutinePendingDelete] = useState<Routine | null>(null);

  const recommended = useMemo(
    () => items.filter((r) => Boolean(r.is_predefined)),
    [items],
  );

  const mine = useMemo(
    () => items.filter(
      (r) => !r.is_predefined && String(r.user_id ?? '') === String(user?.id ?? ''),
    ),
    [items, user?.id],
  );

  const data = activeTab === 'recommended' ? recommended : mine;
  const title = activeTab === 'recommended' ? 'Rutinas recomendadas' : 'Mis rutinas';
  const subtitle = activeTab === 'recommended'
    ? 'Plantillas listas para usar con los ejercicios del sistema.'
    : 'Rutinas personalizadas vinculadas a tu perfil.';

  function handleDeleteRoutine(routine: Routine) {
    if (deleting) {
      return;
    }

    setRoutinePendingDelete(routine);
    return;
  }

  async function confirmDeleteRoutine() {
    if (!routinePendingDelete) {
      return;
    }

    try {
      const routineId = String(routinePendingDelete.id);
      setDeletingRoutineId(routineId);
      await deleteRoutineSubmit(routinePendingDelete.id);
      setRoutinePendingDelete(null);
      await refresh();
    } finally {
      setDeletingRoutineId(null);
    }
  }

  if (loading && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <LoadingSpinner label="Cargando rutinas" />
      </SafeAreaView>
    );
  }

  if (error && items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.errorWrap}>
          <View style={styles.emptyCard}>
            <View style={styles.emptyIconWrap}>
              <MaterialCommunityIcons name="alert-circle-outline" size={22} color="#a78bfa" />
            </View>
            <Text style={styles.emptyTitle}>No pudimos cargar las rutinas</Text>
            <Text style={styles.emptyDesc}>{error}</Text>
            <Pressable onPress={retry} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Reintentar</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopBar />

      <FlatList
        style={styles.list}
        data={data}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.eyebrow}>GYM PONTE PIÃ‘UO</Text>
                <Text style={styles.pageTitle}>Rutinas</Text>
                <Text style={styles.greeting}>Explora recomendaciones y tus rutinas personales.</Text>
              </View>
              <Pressable
                onPress={() => router.push(ROUTES.app.routineCreate)}
                style={({ hovered }) => [
                  styles.createBtn,
                  {
                    shadowColor: hovered ? 'rgba(109,40,217,0.52)' : 'rgba(109,40,217,0.32)',
                    shadowOpacity: 0.5,
                    shadowRadius: hovered ? 36 : 22,
                    shadowOffset: { width: 0, height: hovered ? -1 : 0 },
                    elevation: hovered ? 10 : 6,
                    transform: hovered ? [{ translateY: -1 }] : [],
                  },
                ]}>
                <MaterialCommunityIcons name="plus" size={16} color="#fff" />
                <Text style={styles.createBtnText}>Crear rutina</Text>
              </Pressable>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.heroGlow} />
              <View style={styles.heroIcon}>
                <MaterialCommunityIcons name="repeat-variant" size={110} color="#a78bfa" />
              </View>
              <Text style={styles.heroEyebrow}>Workout Planner</Text>
              <Text style={styles.heroTitle}>{title}</Text>
              <Text style={styles.heroDesc}>{subtitle}</Text>
            </View>

            <View style={styles.tabList}>
              {TABS.map((t) => {
                const active = activeTab === t.key;
                return (
                  <Pressable
                    key={t.key}
                    onPress={() => setActiveTab(t.key)}
                    style={({ hovered }) => [
                      styles.tabItem,
                      {
                        backgroundColor: active ? 'rgba(109,40,217,0.1)' : hovered ? 'rgba(139,92,246,0.05)' : 'transparent',
                        borderLeftColor: active ? '#7c3aed' : 'transparent',
                        borderBottomWidth: t.key !== TABS[TABS.length - 1].key ? StyleSheet.hairlineWidth : 0,
                        borderBottomColor: 'rgba(139,92,246,0.1)',
                      },
                    ]}>
                    <View>
                      <Text style={[styles.tabLabel, { color: active ? '#c4b5fd' : 'rgba(255,255,255,0.65)' }]}>
                        {t.label}
                      </Text>
                      <Text style={styles.tabSub}>{t.sub}</Text>
                    </View>
                    <View style={styles.tabRight}>
                      <View style={[styles.tabCount, { backgroundColor: active ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)', borderColor: active ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.06)' }]}>
                        <Text style={[styles.tabCountText, { color: active ? '#a78bfa' : 'rgba(255,255,255,0.25)' }]}>
                          {t.key === 'recommended' ? recommended.length : mine.length}
                        </Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={14} color={active ? '#8b5cf6' : 'rgba(255,255,255,0.15)'} />
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyRoutines onCrear={() => setModalVisible(true)} />
        }
        renderItem={({ item }: { item: Routine }) => (
          <RutinaCard
            routine={item}
            exercisesCount={item.exercises?.length ?? 0}
            personal={activeTab === 'mine'}
            onPress={() => router.push({ pathname: ROUTES.app.routineDetail, params: { id: String(item.id) } })}
            onEdit={() =>
              router.push({
                pathname: ROUTES.app.routineCreate,
                params: { id: String(item.id) },
              })
            }
            onDelete={() => handleDeleteRoutine(item)}
            deleting={deletingRoutineId === String(item.id)}
          />
        )}
      />
      <CrearRutinaModal visible={modalVisible} onClose={() => setModalVisible(false)} />
      <ConfirmDeleteRoutineModal
        visible={Boolean(routinePendingDelete)}
        routineName={routinePendingDelete?.name}
        deleting={deleting}
        deleteError={deleteError}
        onCancel={() => {
          if (!deleting) {
            setRoutinePendingDelete(null);
          }
        }}
        onConfirm={() => void confirmDeleteRoutine()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020204',
  },
  errorWrap: {
    flex: 1,
    paddingHorizontal: 48,
    paddingTop: 40,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 100,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  eyebrow: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 2.2,
    color: '#7c3aed',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  pageTitle: {
    fontSize: 38,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.5,
    marginBottom: 8,
    lineHeight: 42,
  },
  greeting: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.35)',
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 8,
    backgroundColor: '#5b21b6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.5)',
  },
  createBtnText: {
    color: '#fff',
    fontSize: 13.5,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  heroCard: {
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 32,
    marginBottom: 20,
    backgroundColor: 'rgba(109,40,217,0.06)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.2)',
    borderLeftWidth: 3,
    borderLeftColor: '#7c3aed',
    position: 'relative',
    overflow: 'hidden',
  },
  heroGlow: {
    position: 'absolute',
    right: -60,
    top: -60,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: 'rgba(109,40,217,0.06)',
    pointerEvents: 'none',
  },
  heroIcon: {
    position: 'absolute',
    right: 28,
    top: '50%',
    marginTop: -55,
    opacity: 0.05,
  },
  heroEyebrow: {
    fontSize: 9,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 2.4,
    color: '#8b5cf6',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  heroDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 21,
    maxWidth: 520,
  },
  tabList: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#090910',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.14)',
  },
  tabItem: {
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderLeftWidth: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  tabSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.28)',
  },
  tabRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tabCount: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabCountText: {
    fontSize: 10,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  rCard: {
    borderRadius: 16,
    padding: 22,
    marginBottom: 14,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: '#090910',
    position: 'relative',
    overflow: 'hidden',
  },
  rGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(109,40,217,0.06)',
    pointerEvents: 'none',
  },
  rTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  rTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  rIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(109,40,217,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rNameWrap: {
    flex: 1,
  },
  rName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    letterSpacing: -0.15,
  },
  rDesc: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
    marginTop: 2,
  },
  rBadge: {
    paddingVertical: 3,
    paddingHorizontal: 9,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.6,
    fontFamily: TYPOGRAPHY.fonts.mono,
  },
  rTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 14,
  },
  rTag: {
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.08)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.2)',
  },
  rTagText: {
    fontSize: 11,
    color: 'rgba(167,139,250,0.75)',
  },
  rBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  rStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  rStatText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
  },
  rActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.38)',
  },
  rActionText: {
    color: '#c4b5fd',
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  emptyCard: {
    borderRadius: 18,
    padding: 48,
    backgroundColor: '#090910',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.12)',
    alignItems: 'flex-start',
    gap: 14,
  },
  emptyIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: 'rgba(109,40,217,0.16)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.32)',
    lineHeight: 21,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 10,
    marginTop: 4,
    backgroundColor: '#5b21b6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.5)',
    shadowColor: 'rgba(109,40,217,0.28)',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  emptyBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    backgroundColor: '#0a0a0f',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.3)',
    padding: 28,
    shadowColor: 'rgba(109,40,217,0.25)',
    shadowOpacity: 0.5,
    shadowRadius: 60,
    shadowOffset: { width: 0, height: 0 },
    elevation: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  modalIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(109,40,217,0.2)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  modalSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.28)',
  },
  deleteModalIconWrap: {
    backgroundColor: 'rgba(248,113,113,0.12)',
    borderColor: 'rgba(248,113,113,0.35)',
  },
  modalForm: {
    gap: 16,
    marginBottom: 24,
  },
  deleteModalText: {
    fontSize: 13,
    lineHeight: 21,
    color: 'rgba(255,255,255,0.72)',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  deleteModalError: {
    fontSize: 12,
    lineHeight: 18,
    color: '#f87171',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    marginBottom: 6,
  },
  modalInput: {
    width: '100%',
    backgroundColor: '#000',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.3)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalNiveles: {
    flexDirection: 'row',
    gap: 8,
  },
  modalNivelBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  modalNivelText: {
    fontSize: 12,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancel: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalCancelText: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 13,
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalCreate: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#5b21b6',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.5)',
    shadowColor: 'rgba(109,40,217,0.3)',
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  modalCreateText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalDelete: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(127,29,29,0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(248,113,113,0.5)',
    shadowColor: 'rgba(248,113,113,0.24)',
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
  modalDeleteText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    fontFamily: TYPOGRAPHY.fonts.body,
  },
  modalDisabled: {
    opacity: 0.7,
  },

});
