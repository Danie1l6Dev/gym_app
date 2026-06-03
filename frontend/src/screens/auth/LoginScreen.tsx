import { useState } from 'react';
import { Image } from 'react-native';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextBlock } from '@/components/TextBlock';
import { useAuth } from '@/hooks/use-auth';
import { TYPOGRAPHY } from '@/theme';

const FEATURE_ITEMS = [
  { icon: '✓', label: 'Control de acceso al gym' },
  { icon: '◎', label: 'Gestión de miembros' },
  { icon: '▥', label: 'Reportes de asistencia' },
];

export default function LoginScreen() {
  const { width } = useWindowDimensions();
  const { login } = useAuth();
  const isWide = width >= 900;

  const [email, setEmail] = useState('entrenador@gympontepinuo.com');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit() {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Ingresa correo y contraseña.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await login({
        email: email.trim().toLowerCase(),
        password,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'No se pudo iniciar sesión.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.scrollContent, !isWide && styles.mobileScrollContent]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.keyboardWrapper, isWide ? styles.desktopLayout : styles.mobileLayout]}>
          <View style={[styles.brandPanel, !isWide && styles.mobileBrandPanel]}>
            {/* <View style={styles.logoTile}>
              <TextBlock style={styles.logoMark}>GP</TextBlock>
            </View> */}
            <Image
              source={require('@/assets/images/LogGym3.png')}
              style={{ width: 80, height: 80 }}
              resizeMode="contain"
            />

            <View style={styles.brandCopy}>
              <TextBlock style={styles.brandKicker}>GYM</TextBlock>
              <TextBlock style={styles.brandTitle}>Ponte Piñuo</TextBlock>
              <TextBlock style={styles.brandDescription}>
                Gestión de membresías, control de asistencia y seguimiento del rendimiento de tus
                atletas en un solo lugar.
              </TextBlock>
            </View>

            <View style={styles.featureList}>
              {FEATURE_ITEMS.map((item) => (
                <Pressable
                  key={item.label}
                  accessibilityRole="button"
                  style={({ hovered, pressed }) => [
                    styles.featureRow,
                    hovered && styles.featureRowHovered,
                    pressed && styles.featureRowPressed,
                  ]}>
                  {({ hovered }) => (
                    <>
                      <View style={[styles.featureIconTile, hovered && styles.featureIconTileHover]}>
                        <TextBlock style={[styles.featureIcon, hovered && styles.featureIconHover]}>
                          {item.icon}
                        </TextBlock>
                      </View>
                      <TextBlock style={[styles.featureText, hovered && styles.featureTextHover]}>
                        {item.label}
                      </TextBlock>
                      <TextBlock style={[styles.chevronIcon, hovered && styles.chevronIconHover]}>
                        ›
                      </TextBlock>
                    </>
                  )}
                </Pressable>
              ))}
            </View>

            <TextBlock style={styles.footerCode}>GYM-PP-2026 · Ponte Piñuo</TextBlock>
          </View>

          <View style={[styles.formPanel, !isWide && styles.mobileFormPanel]}>
            <View style={styles.formColumn}>
              <View style={styles.formHeader}>
                <TextBlock style={styles.formTitle}>Acceso al gimnasio</TextBlock>
                <TextBlock style={styles.formSubtitle}>
                  Ingresa tus credenciales para gestionar tu gimnasio
                </TextBlock>
              </View>

              <View style={styles.noticeBox}>
                <View style={styles.noticeIconCircle}>
                  <TextBlock style={styles.noticeIconText}>i</TextBlock>
                </View>
                <TextBlock style={styles.noticeText}>
                  Acceso restringido al personal autorizado. Tras 5 intentos fallidos la cuenta se
                  bloquea 10 minutos por seguridad.
                </TextBlock>
              </View>

              <View style={styles.noticeBoxSmall}>
                <View style={styles.noticeIconSmall}>
                  <TextBlock style={styles.noticeIconTextSmall}>!</TextBlock>
                </View>
                <TextBlock style={styles.noticeSmallText}>
                  Tu sesión expiró por inactividad. Vuelve a iniciar sesión.
                </TextBlock>
              </View>

              {errorMessage ? (
                <View style={styles.errorBox}>
                  <View style={styles.errorIconCircle}>
                    <TextBlock style={styles.errorIconText}>!</TextBlock>
                  </View>
                  <TextBlock style={styles.errorText}>{errorMessage}</TextBlock>
                </View>
              ) : null}

              <View style={styles.fieldGroup}>
                <TextBlock style={styles.label}>Correo electrónico</TextBlock>
                <TextInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  onBlur={() => setFocusedField(null)}
                  onFocus={() => setFocusedField('email')}
                  placeholder="entrenador@gympontepinuo.com"
                  placeholderTextColor="#5F6670"
                  value={email}
                  onChangeText={setEmail}
                  style={[styles.input, focusedField === 'email' && styles.inputFocused]}
                  textContentType="emailAddress"
                  accessibilityLabel="Correo electrónico"
                />
              </View>

              <View style={styles.fieldGroup}>
                <TextBlock style={styles.label}>Contraseña</TextBlock>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    autoCapitalize="none"
                    onBlur={() => setFocusedField(null)}
                    onFocus={() => setFocusedField('password')}
                    placeholder="Tu contraseña de acceso"
                    placeholderTextColor="#5F6670"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={[
                      styles.input,
                      styles.passwordInput,
                      focusedField === 'password' && styles.inputFocused,
                    ]}
                    textContentType="password"
                    accessibilityLabel="Contraseña"
                  />
                  <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  onPress={() => setShowPassword((value) => !value)}
                    style={({ hovered, pressed }) => [
                      styles.eyeButton,
                      hovered && styles.eyeButtonHover,
                      pressed && styles.optionPressed,
                    ]}>
                    {({ hovered }) => (
                      <TextBlock style={[styles.eyeButtonText, hovered && styles.eyeButtonTextHover]}>
                        {showPassword ? 'Ocultar' : 'Ver'}
                      </TextBlock>
                    )}
                  </Pressable>
                </View>
              </View>

              <View style={styles.formOptions}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: rememberMe }}
                  onPress={() => setRememberMe((value) => !value)}
                  style={({ hovered, pressed }) => [
                    styles.rememberButton,
                    hovered && styles.rememberButtonHover,
                    pressed && styles.optionPressed,
                  ]}>
                  {({ hovered }) => (
                    <>
                      <View
                        style={[
                          styles.checkbox,
                          hovered && styles.checkboxHover,
                          rememberMe && styles.checkboxChecked,
                        ]}>
                        {rememberMe ? (
                          <TextBlock style={styles.checkboxCheck}>✓</TextBlock>
                        ) : null}
                      </View>
                      <TextBlock style={[styles.optionText, hovered && styles.optionTextHover]}>
                        Recordarme
                      </TextBlock>
                    </>
                  )}
                </Pressable>

                <Pressable
                  style={({ hovered, pressed }) => [
                    styles.forgotButton,
                    hovered && styles.forgotButtonHover,
                    pressed && styles.optionPressed,
                  ]}>
                  {({ hovered }) => (
                    <TextBlock style={[styles.forgotText, hovered && styles.forgotTextHover]}>
                      Olvidé mi contraseña
                    </TextBlock>
                  )}
                </Pressable>
              </View>

              <Pressable
                disabled={submitting}
                onPress={handleSubmit}
                style={({ hovered, pressed }) => [
                  styles.primaryButton,
                  hovered && !submitting && styles.primaryButtonHover,
                  pressed && !submitting && styles.pressed,
                  submitting && styles.disabled,
                ]}>
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <TextBlock style={styles.buttonLabel}>Entrar al panel del gym</TextBlock>
                )}
              </Pressable>

              <TextBlock style={styles.formFooter}>GYM-PP-2026 · Ponte Piñuo</TextBlock>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ayuda"
        style={({ hovered, pressed }) => [
          styles.helpButton,
          hovered && styles.helpButtonHover,
          pressed && styles.optionPressed,
        ]}>
        {({ hovered }) => (
          <TextBlock style={[styles.helpText, hovered && styles.helpTextHover]}>?</TextBlock>
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#020203',
  },
  scrollContent: {
    flex: 1,
    backgroundColor: '#020203',
  },
  mobileScrollContent: {
    padding: 18,
  },
  keyboardWrapper: {
    width: '100%',
    flex: 1,
  },
  desktopLayout: {
    flexDirection: 'row',
  },
  mobileLayout: {
    gap: 28,
  },
  brandPanel: {
    flex: 1,
    paddingLeft: 48,
    paddingRight: 50,
    paddingTop: 54,
    paddingBottom: 48,
    borderRightWidth: StyleSheet.hairlineWidth,
    borderRightColor: '#34175B',
    backgroundColor: '#0B0712',
    justifyContent: 'space-between',
  },
  mobileBrandPanel: {
    minHeight: 0,
    borderRightWidth: 0,
    borderRadius: 8,
    paddingHorizontal: 26,
    paddingVertical: 30,
  },
  logoTile: {
    width: 60,
    height: 60,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#8B5CF6',
    backgroundColor: '#241044',
  },
  logoMark: {
    color: '#F5F3FF',
    fontFamily: TYPOGRAPHY.fonts.display,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
    letterSpacing: 0,
  },
  brandCopy: {
    marginTop: 20,
    maxWidth: 390,
  },
  brandKicker: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fonts.display,
    fontSize: 36,
    lineHeight: 40,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fonts.display,
    fontSize: 28,
    lineHeight: 54,
    fontWeight: '700',
    marginTop: 2,
  },
  brandDescription: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 24,
    fontWeight: '500',
    marginTop: 12,
  },
  featureList: {
    gap: 10,
    marginTop: 32,
    maxWidth: 512,
    flex: 1,
  },
  featureRow: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#33204C',
    backgroundColor: '#08050D',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  featureRowHovered: {
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
  featureRowPressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  featureIconTile: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1C1230',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#4C1D95',
  },
  featureIconTileHover: {
    backgroundColor: '#7C3AED',
    borderColor: '#A78BFA',
  },
  featureIcon: {
    color: '#D8B4FE',
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '900',
    textAlign: 'center',
  },
  featureIconHover: {
    color: '#FFFFFF',
  },
  featureText: {
    flex: 1,
    color: '#A1A1AA',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  featureTextHover: {
    color: '#F4F4F5',
  },
  chevronIcon: {
    color: '#A78BFA',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
  },
  chevronIconHover: {
    color: '#F5F3FF',
  },
  footerCode: {
    color: '#282730',
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 'auto',
  },
  formPanel: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 56,
    paddingVertical: 48,
    backgroundColor: '#020203',
  },
  mobileFormPanel: {
    minHeight: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  formColumn: {
    width: '100%',
    maxWidth: 500,
  },
  formHeader: {
    width: '100%',
  },
  formTitle: {
    color: '#FFFFFF',
    fontFamily: TYPOGRAPHY.fonts.display,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '900',
  },
  formSubtitle: {
    color: '#8B929E',
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    marginTop: 6,
  },
  noticeBox: {
    width: '100%',
    minHeight: 60,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#6D3AB8',
    backgroundColor: '#120A1D',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  noticeIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C4B5FD',
    marginTop: 2,
  },
  noticeIconText: {
    color: '#DDD6FE',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  noticeText: {
    flex: 1,
    color: '#C4B5FD',
    fontSize: 13,
    lineHeight: 22,
    fontWeight: '600',
  },
  noticeBoxSmall: {
    width: '100%',
    minHeight: 40,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#513082',
    backgroundColor: '#100818',
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
  },
  noticeIconSmall: {
    width: 18,
    height: 18,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#A78BFA',
  },
  noticeIconTextSmall: {
    color: '#C4B5FD',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  noticeSmallText: {
    flex: 1,
    color: '#A78BFA',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  errorBox: {
    width: '100%',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#7F1D1D',
    backgroundColor: '#1A080A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
  },
  errorIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#FCA5A5',
  },
  errorIconText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '900',
  },
  errorText: {
    flex: 1,
    color: '#FCA5A5',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  segmentedControl: {
    display: 'none',
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  segmentButtonActive: {
    backgroundColor: '#341763',
  },
  segmentButtonHover: {
    backgroundColor: '#1D102F',
  },
  segmentButtonPressed: {
    opacity: 0.88,
  },
  segmentTextActive: {
    color: '#FFFFFF',
  },
  segmentText: {
    color: '#8A8F98',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  segmentTextHover: {
    color: '#DDD6FE',
  },
  fieldGroup: {
    width: '100%',
    gap: 8,
    marginTop: 20,
  },
  label: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  input: {
    width: '100%',
    minHeight: 52,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#5B2A96',
    backgroundColor: '#010101',
    color: '#FFFFFF',
    paddingHorizontal: 18,
    fontSize: 15,
    fontWeight: '600',
  },
  inputFocused: {
    borderColor: '#A78BFA',
    backgroundColor: '#030106',
    ...Platform.select({
      web: {
        boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.14)',
      },
      default: {
        shadowColor: '#7C3AED',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 0 },
      },
    }),
  },
  passwordInputWrap: {
    width: '100%',
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 92,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 86,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  eyeButtonHover: {
    backgroundColor: 'rgba(124, 58, 237, 0.16)',
  },
  eyeButtonText: {
    color: '#DDD6FE',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '900',
  },
  eyeButtonTextHover: {
    color: '#FFFFFF',
  },
  formOptions: {
    width: '100%',
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    flexWrap: 'wrap',
  },
  rememberButton: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 8,
    paddingRight: 8,
  },
  rememberButtonHover: {
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#7C3AED',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#050407',
  },
  checkboxHover: {
    borderColor: '#C4B5FD',
    backgroundColor: '#130A20',
  },
  checkboxChecked: {
    borderColor: '#A78BFA',
    backgroundColor: '#7C3AED',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '900',
  },
  optionText: {
    color: '#A1A1AA',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  optionTextHover: {
    color: '#F4F4F5',
  },
  forgotButton: {
    minHeight: 32,
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  forgotButtonHover: {
    backgroundColor: 'rgba(124, 58, 237, 0.12)',
  },
  forgotText: {
    color: '#A78BFA',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '800',
  },
  forgotTextHover: {
    color: '#FFFFFF',
    textDecorationLine: 'underline',
  },
  primaryButton: {
    width: '100%',
    minHeight: 58,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    backgroundColor: '#7C3AED',
    marginTop: 26,
    ...Platform.select({
      web: {
        boxShadow: '0 12px 30px rgba(124, 58, 237, 0.34)',
      },
      default: {
        elevation: 6,
        shadowColor: '#7C3AED',
        shadowOpacity: 0.3,
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 10 },
      },
    }),
  },
  primaryButtonHover: {
    backgroundColor: '#8B5CF6',
    transform: [{ translateY: -1 }],
    ...Platform.select({
      web: {
        boxShadow: '0 18px 38px rgba(139, 92, 246, 0.42)',
      },
      default: {
        elevation: 8,
      },
    }),
  },
  buttonLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  formFooter: {
    color: '#25252A',
    fontFamily: TYPOGRAPHY.fonts.mono,
    fontSize: 12,
    letterSpacing: 2,
    marginTop: 40,
    textAlign: 'center',
  },
  helpButton: {
    position: 'absolute',
    right: 14,
    bottom: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#777783',
    backgroundColor: '#34343A',
    ...Platform.select({
      web: {
        boxShadow: '0 8px 18px rgba(0, 0, 0, 0.42)',
      },
      default: {
        elevation: 4,
      },
    }),
  },
  helpButtonHover: {
    borderColor: '#C4B5FD',
    backgroundColor: '#4C1D95',
    transform: [{ translateY: -2 }],
  },
  helpText: {
    color: '#FFFFFF',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '400',
  },
  helpTextHover: {
    color: '#F5F3FF',
  },
  optionPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.98 }],
  },
  pressed: {
    transform: [{ scale: 0.99 }],
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.7,
  },
});
