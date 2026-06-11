import { Image, Platform, StyleSheet, View } from 'react-native';

export function AppBackground() {
  return (
    <View style={styles.base}>
      <Image
        source={require('@/assets/images/fond1.png')}
        resizeMode="contain"
        style={styles.leftImage}
      />
      <View style={styles.webPattern} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#020203',
    pointerEvents: 'none',
  },
  leftImage: {
    position: 'absolute',
    left: -80,
    top: -200,
    width: 500,
    opacity: 0.38,
  },
  webPattern: {
    ...StyleSheet.absoluteFillObject,
    ...(Platform.OS === 'web'
      ? ({
          backgroundImage: [
            'linear-gradient(to right, rgba(124,58,237,0.10) 1px, transparent 1px)',
            'linear-gradient(to bottom, rgba(124,58,237,0.10) 1px, transparent 1px)',
            'radial-gradient(circle, rgba(167,139,250,0.5) 1px, transparent 1px)',
          ].join(', '),
          backgroundSize: '20px 20px, 20px 20px, 20px 20px',
          WebkitMaskImage:
            'linear-gradient(to left, #000 0%, #000 50%, transparent 80%, transparent 100%)',
          maskImage:
            'linear-gradient(to left, #000 0%, #000 50%, transparent 80%, transparent 100%)',
        } as any)
      : {
          opacity: 0.16,
        }),
  },
});
