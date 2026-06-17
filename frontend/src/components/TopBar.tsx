import { useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/hooks/use-auth';
import { TYPOGRAPHY } from '@/theme';

export function TopBar() {
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  }

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
        <Pressable
          onPress={() => void handleLogout()}
          disabled={isLoggingOut}
          style={({ hovered, pressed }) => [
            styles.logoutBtn,
            hovered && !isLoggingOut && styles.logoutBtnHover,
            pressed && styles.logoutBtnPressed,
            isLoggingOut && styles.logoutBtnDisabled,
          ]}>
          {({ hovered }) => (
            <Text style={[styles.logoutText, hovered && !isLoggingOut && styles.logoutTextHover]}>
              {isLoggingOut ? 'Saliendo...' : 'Salir'}
            </Text>
          )}
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
  logoutBtnHover: {
    borderColor: '#7C3AED',
    backgroundColor: '#140B22',
    transform: [{ translateX: 3 }],
    ...Platform.select({
      web: {
        boxShadow: '0 10px 24px rgba(124, 58, 237, 0.18)',
      },
      default: {
        elevation: 2,
      },
    }),
  },
  logoutBtnPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.99 }],
  },
  logoutBtnDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: 'rgba(167,139,250,0.8)',
    fontSize: 11,
    fontFamily: TYPOGRAPHY.fonts.body,
    letterSpacing: 0.4,
  },
  logoutTextHover: {
    color: '#F4F4F5',
  },
});
