import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { TYPOGRAPHY } from '@/theme';

function TopBtn({ icon }: { icon: string }) {
  return (
    <Pressable
      style={({ hovered }) => [
        styles.topBtn,
        {
          backgroundColor: hovered ? 'rgba(139,92,246,0.1)' : 'transparent',
          borderColor: hovered ? 'rgba(139,92,246,0.3)' : 'transparent',
        },
      ]}>
      {({ hovered }) => (
        <MaterialCommunityIcons
          name={icon}
          size={15}
          color={hovered ? '#a78bfa' : 'rgba(255,255,255,0.3)'}
        />
      )}
    </Pressable>
  );
}

export function TopBar() {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarLeft}>
        <Image
          source={require('@/assets/images/LogGym3.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.topBarTitle}>GYM Ponte Piñuo</Text>
      </View>
      <View style={styles.topBarRight}>
        <TopBtn icon="bell-outline" />
        <TopBtn icon="cog-outline" />
        <Pressable style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Salir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 48,
    height: 56,
    backgroundColor: 'rgba(2,2,4,0.92)',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(139,92,246,0.1)',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: {
    width: 65,
    height: 65,
    borderRadius: 6,
  },
  topBarTitle: {
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.mono,
    letterSpacing: 1.5,
    color: 'rgba(167,139,250,0.8)',
    textTransform: 'uppercase',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  topBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutBtn: {
    marginLeft: 8,
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: 'rgba(139,92,246,0.1)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(139,92,246,0.28)',
  },
  logoutText: {
    color: 'rgba(167,139,250,0.8)',
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.body,
    letterSpacing: 0.4,
  },
});
