import { Image } from "expo-image";
import { router } from "expo-router";
import * as React from "react";
import { Keyboard, TextInput as RNTextInput, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SystemBars } from 'react-native-edge-to-edge';
import { Button, Switch, TextInput } from "react-native-paper";
import Animated, {
    Easing,
    FadeIn,
    FadeOut,
    Layout,
    SlideInRight,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming
} from 'react-native-reanimated';
import { SafeAreaView } from "react-native-safe-area-context";
import { nucleus } from "../Buddy_variables.js";
import { useAuth } from "../contexts/AuthContext";

export default function EmailLoginScreen() {
  const { signInWithOtp, verifyOtp, loading } = useAuth();
  const [email, setEmail] = React.useState("");
  const [rememberSignIn, setRememberSignIn] = React.useState(true);
  const [showCodeInput, setShowCodeInput] = React.useState(false);
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const [focusedIndex, setFocusedIndex] = React.useState(0);
  const [hasError, setHasError] = React.useState(false);

  // Animation values
  const slideOffset = useSharedValue(0);
  const fadeOpacity = useSharedValue(1);
  const shakeOffset = useSharedValue(0);

  const handleContinue = async () => {
    if (!email.trim()) {
      return;
    }

    // Dismiss keyboard
    Keyboard.dismiss();

    try {
      console.log("Sending OTP to email:", email);
      
      // Send OTP first
      await signInWithOtp(email);
      
      // Animate the transition
      slideOffset.value = withTiming(-100, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      
      fadeOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      }, () => {
        runOnJS(setShowCodeInput)(true);
        slideOffset.value = 100;
        fadeOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        slideOffset.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      });
    } catch (error) {
      console.error('OTP send error:', error);
      // Silently handle error - user can try again
    }
  };

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    
    // Auto-focus next input
    if (text && index < 5) {
      setFocusedIndex(index + 1);
    }
  };

  const handleCodeKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      setFocusedIndex(index - 1);
    }
  };

  const handleVerifyCode = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      return;
    }

    try {
      console.log("Verifying OTP code:", fullCode);

      // Verify the OTP - RootNavigator will handle redirect based on onboarding status
      await verifyOtp(email, fullCode);

      // Don't navigate here - let RootNavigator handle it based on onboarding status
    } catch (error) {
      console.error('OTP verification error:', error);

      // Set error state and animate
      setHasError(true);
      animateDigitError();

      // Clear the code and error state after a short delay
      setTimeout(() => {
        setCode(['', '', '', '', '', '']);
        setFocusedIndex(0);
        setHasError(false);
      }, 500);
    }
  };

  const animateDigitError = () => {
    // Subtle shake animation using Reanimated
    shakeOffset.value = withTiming(2, { duration: 80 }, () => {
      shakeOffset.value = withTiming(-2, { duration: 80 }, () => {
        shakeOffset.value = withTiming(2, { duration: 80 }, () => {
          shakeOffset.value = withTiming(-2, { duration: 80 }, () => {
            shakeOffset.value = withTiming(0, { duration: 80 });
          });
        });
      });
    });
  };

  const handleBack = () => {
    if (showCodeInput) {
      // Animate back to email input
      slideOffset.value = withTiming(100, {
        duration: 300,
        easing: Easing.out(Easing.cubic),
      });
      
      fadeOpacity.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.cubic),
      }, () => {
        runOnJS(setShowCodeInput)(false);
        runOnJS(setCode)(['', '', '', '', '', '']);
        runOnJS(setFocusedIndex)(0);
        slideOffset.value = -100;
        fadeOpacity.value = withTiming(1, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
        slideOffset.value = withTiming(0, {
          duration: 300,
          easing: Easing.out(Easing.cubic),
        });
      });
    } else {
      router.back();
    }
  };

  // Animated styles
  const emailInputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideOffset.value }],
    opacity: fadeOpacity.value,
  }));

  const codeInputAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideOffset.value }],
    opacity: fadeOpacity.value,
  }));

  const shakeAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeOffset.value }],
  }));

  return (
    <>
      <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.white }]} edges={['top', 'bottom']}>
        <SystemBars style="dark" />
        
        {/* Top Bar */}
        <View style={styles.topNav}>
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backButton}
          >
            <Image
              source={require('../assets/icons/back.svg')}
              style={styles.backIcon}
              contentFit="contain"
            />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {showCodeInput ? 'Enter code' : 'Continue with email'}
          </Text>
        </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {!showCodeInput ? (
          <Animated.View 
            style={[styles.inputContainer, emailInputAnimatedStyle]}
            entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic))}
            exiting={FadeOut.duration(200).easing(Easing.out(Easing.cubic))}
            layout={Layout.duration(300).easing(Easing.out(Easing.cubic))}
          >
            {/* Email Input */}
            <TextInput
              mode="outlined"
              label="Email"
              value={email}
              onChangeText={setEmail}
              style={styles.emailInput}
              contentStyle={styles.emailInputContent}
              outlineStyle={styles.emailInputOutline}
              activeOutlineColor={nucleus.light.global.blue["70"]}
              outlineColor={nucleus.light.semantic.border.muted}
              textColor={nucleus.light.semantic.fg.base}
              placeholderTextColor={nucleus.light.semantic.fg.subtle}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              autoFocus={true}
              returnKeyType="next"
              blurOnSubmit={false}
              theme={{
                colors: {
                  onSurfaceVariant: nucleus.light.semantic.fg.subtle,
                  primary: nucleus.light.global.blue["70"],
                  outline: nucleus.light.semantic.border.muted,
                },
                fonts: {
                  bodyLarge: {
                    fontFamily: 'PlusJakartaSans-Regular',
                    fontSize: 16,
                  },
                  labelSmall: {
                    fontFamily: 'PlusJakartaSans-Regular',
                    fontSize: 12,
                  },
                },
              }}
            />

            {/* Remember Sign In Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>Remember sign in details</Text>
              <Switch
                value={rememberSignIn}
                onValueChange={setRememberSignIn}
                trackColor={{
                  false: nucleus.light.semantic.border.muted,
                  true: nucleus.light.global.blue["70"]
                }}
                thumbColor={nucleus.light.global.white}
                ios_backgroundColor={nucleus.light.semantic.border.muted}
                style={styles.switch}
              />
            </View>
          </Animated.View>
        ) : (
          <Animated.View 
            style={[styles.codeInputContainer, codeInputAnimatedStyle]}
            entering={FadeIn.duration(300).easing(Easing.out(Easing.cubic))}
            layout={Layout.duration(300).easing(Easing.out(Easing.cubic))}
          >
            {/* Code Input UI */}
            <View style={styles.codeHeader}>
              <Text style={styles.codeTitle}>Enter authentication code</Text>
              <Text style={styles.codeDescription}>
                Enter the 6-digit code that we have sent to the email{' '}
                <Text style={styles.emailHighlight}>
                  {email.replace(/(.{2}).*(@.*)/, '$1...$2')}
                </Text>
              </Text>
            </View>

            {/* PIN Input */}
            <View style={styles.pinContainer}>
              {code.map((digit, index) => (
                <Animated.View 
                  key={index} 
                  style={[styles.pinInputWrapper, shakeAnimatedStyle]}
                  entering={SlideInRight.delay(index * 100).duration(300).easing(Easing.out(Easing.cubic))}
                >
                  <View style={[
                    styles.pinInput,
                    focusedIndex === index && styles.pinInputFocused,
                    hasError && styles.pinInputError
                  ]}>
                    <RNTextInput
                      style={styles.pinTextInput}
                      value={digit}
                      onChangeText={(text) => handleCodeChange(text, index)}
                      onKeyPress={(e) => handleCodeKeyPress(e, index)}
                      keyboardType="numeric"
                      maxLength={1}
                      textAlign="center"
                      autoFocus={index === 0}
                      ref={(ref) => {
                        if (ref && focusedIndex === index) {
                          ref.focus();
                        }
                      }}
                    />
                  </View>
                </Animated.View>
              ))}
            </View>

            {/* Resend Code Button */}
            <TouchableOpacity 
              style={styles.resendButton}
              onPress={handleContinue}
              disabled={loading}
            >
              <Text style={styles.resendButtonText}>
                {loading ? 'Sending...' : 'Resend code'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>

      {/* Continue/Verify Button */}
      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          style={[styles.continueButton, { backgroundColor: nucleus.light.global.blue["70"] }]}
          labelStyle={[styles.continueButtonLabel, { color: nucleus.light.global.blue["10"] }]}
          contentStyle={styles.continueButtonContent}
          onPress={showCodeInput ? handleVerifyCode : handleContinue}
          compact={false}
          disabled={loading || (showCodeInput ? code.join('').length !== 6 : !email.trim())}
          loading={loading}
        >
          {loading 
            ? (showCodeInput ? 'Verifying...' : 'Sending...') 
            : (showCodeInput ? 'Verify' : 'Continue')
          }
        </Button>
      </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    height: 64,
    paddingVertical: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  backButton: {
    position: 'absolute',
    left: 8,
    top: 4,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 28,
  },
  backIcon: {
    width: 32,
    height: 32,
  },
  headerTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 18,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 16,
  },
  emailInput: {
    backgroundColor: nucleus.light.global.white,
    borderRadius: 8,
    height: 48,
  },
  emailInputContent: {
    paddingHorizontal: 16,
    paddingVertical: 0,
    minHeight: 48,
  },
  emailInputOutline: {
    borderRadius: 8,
    borderWidth: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.muted,
    flex: 1,
  },
  switch: {
    transform: [{ scaleX: 1 }, { scaleY: 1 }],
  },
  // Code Input Styles
  codeInputContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingVertical: 16,
  },
  codeHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
  },
  codeTitle: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 24,
    lineHeight: 28.8,
    letterSpacing: -1,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },
  codeDescription: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 16,
    lineHeight: 24,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
  },
  emailHighlight: {
    fontFamily: 'PlusJakartaSans-SemiBold',
    fontWeight: '600',
  },
  pinContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pinInputWrapper: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInput: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: nucleus.light.semantic.border.muted,
    backgroundColor: nucleus.light.global.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinInputFocused: {
    borderColor: nucleus.light.global.blue["70"],
    borderWidth: 2,
  },
  pinInputError: {
    borderColor: nucleus.light.semantic.border.error,
    borderWidth: 1,
  },
  pinTextInput: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 18,
    lineHeight: 18,
    color: nucleus.light.semantic.fg.base,
    textAlign: 'center',
    width: '100%',
    height: '100%',
    includeFontPadding: false,
  },
  resendButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonText: {
    fontFamily: 'PlusJakartaSans-Regular',
    fontSize: 14,
    lineHeight: 20,
    color: nucleus.light.global.blue["70"],
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
  continueButton: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  continueButtonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  continueButtonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
  },
}); 