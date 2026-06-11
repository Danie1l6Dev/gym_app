import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { AppBackground } from '@/components/AppBackground';
import { TopBar } from '@/components/TopBar';
import { ROUTES } from '@/constants';
import { TYPOGRAPHY } from '@/theme';

const SECTIONS = [
  {
    id: 'musculos',
    title: 'Músculos',
    description: 'Consulta grupos musculares y su base visual.',
    route: ROUTES.app.muscles,
    icon: 'arm-flex',
  },
  {
    id: 'ejercicios',
    title: 'Ejercicios',
    description: 'Navega por el catálogo de ejercicios preparado para backend.',
    route: ROUTES.app.exercises,
    icon: 'dumbbell',
  },
];

export default function ExploreScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <AppBackground />
      <TopBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>GYM FLOW</Text>
          <Text style={styles.pageTitle}>Explorar</Text>
          <Text style={styles.headerDesc}>
            Puerta de entrada a músculos y ejercicios.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoGlow} />
          <View style={styles.infoIconWrap}>
            <MaterialCommunityIcons name="compass" size={20} color="#8b5cf6" />
          </View>
          <Text style={styles.infoTitle}>Navegación exploratoria lista</Text>
          <Text style={styles.infoDesc}>
            Desde aquí vamos a dividir el catálogo en bloques claros y
            escalables.
          </Text>
        </View>

        <View style={styles.sectionsList}>
          {SECTIONS.map((section) => (
            <View key={section.id} style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.sectionDesc}>{section.description}</Text>

              <Pressable
                onPress={() => router.push(section.route)}
                style={({ hovered }) => [
                  styles.sectionBtn,
                  {
                    borderColor: hovered
                      ? 'rgba(139,92,246,0.6)'
                      : 'rgba(139,92,246,0.3)',
                    shadowColor: hovered
                      ? 'rgba(139,92,246,0.3)'
                      : 'transparent',
                    shadowOpacity: 0.4,
                    shadowRadius: 20,
                    shadowOffset: { width: 0, height: 0 },
                    elevation: hovered ? 6 : 0,
                  },
                ]}>
                {({ hovered }) => (
                  <>
                    <View
                      style={[
                        styles.sectionBtnGlow,
                        { opacity: hovered ? 1 : 0 },
                      ]}
                    />
                    <Text style={styles.sectionBtnText}>
                      Abrir sección
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={16}
                      color="#8b5cf6"
                    />
                  </>
                )}
              </Pressable>
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#020203',
  },

  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 48,
    paddingTop: 40,
    paddingBottom: 100,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
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
  headerDesc: {
    fontSize: 13.5,
    color: 'rgba(255,255,255,0.35)',
  },
  infoCard: {
    borderRadius: 20,
    padding: 28,
    marginBottom: 32,
    backgroundColor: '#090910',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  infoGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0,
    backgroundColor: 'transparent',
  },
  infoIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139,92,246,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  infoDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    lineHeight: 21,
    maxWidth: 560,
  },
  sectionsList: {
    gap: 24,
  },
  sectionBlock: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
    marginBottom: 12,
  },
  sectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
    alignSelf: 'flex-start',
    position: 'relative',
    overflow: 'hidden',
  },
  sectionBtnGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139,92,246,0.1)',
  },
  sectionBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8b5cf6',
    position: 'relative',
    zIndex: 1,
  },
});
