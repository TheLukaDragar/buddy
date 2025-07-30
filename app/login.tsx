import { Image } from "expo-image";
import { router } from "expo-router";
import * as React from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "react-native-paper";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { nucleus } from "../Buddy_variables.js";
import { useAuth } from "../contexts/AuthContext";

// Logo and character images
const CharacterImage = require("../assets/login/logo.png");
const AppleIcon = require("../assets/login/apple.png");
const FacebookIcon = require("../assets/login/fb.png");
const GoogleIcon = require("../assets/login/google.png");

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      console.log('🔄 Starting Google sign in...');
      await signInWithGoogle();
      console.log('✅ Google sign in initiated successfully');
    } catch (error) {
      console.error('❌ Google sign in error:', error);
      Alert.alert(
        'Sign In Error',
        `Failed to sign in with Google: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]} edges={['bottom']}>
      
     
        <View style={styles.logoContainer}>
          <Image
            source={CharacterImage}
            style={styles.characterImage}
            contentFit="contain"
          />
        </View>

        {/* Header Text */}
        <View style={styles.headerContainer}>
          <Text 
            style={[styles.titleText]}
          >
            Train better
          </Text>
          <Text 
            style={[styles.descriptionText]}
          >
            Join over 100 million people who use Nucleus to design better UI.
          </Text>
        </View>

        {/* Login Buttons */}
        <View style={styles.buttonsContainer}>
          {/* Continue with Email */}
          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: nucleus.light.global.blue["70"] }]}
            labelStyle={[styles.buttonLabel, { color: nucleus.light.global.blue["10"] }]}
            contentStyle={styles.buttonContent}
            onPress={() => router.push("/(tabs)")}
            compact={false}
            hitSlop={{ top: 0, bottom: 0, left: 0, right: 0 }}
          >
            Continue with email
          </Button>

          {/* Continue with Apple */}
          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: nucleus.light.semantic.social.apple.primary }]}
            labelStyle={[styles.buttonLabel, { color: nucleus.light.semantic.fg.onContrast }]}
            contentStyle={styles.buttonContent}
            compact={false}
                        icon={() => (
              <Image
                source={AppleIcon}
                style={styles.socialIcon}
                contentFit="contain"
              />
            )}
          >
            Continue with Apple
          </Button>

          {/* Continue with Facebook */}
          <Button
            mode="contained"
            style={[styles.button, { backgroundColor: nucleus.light.semantic.social.facebook.primary }]}
            labelStyle={[styles.buttonLabel, { color: nucleus.light.semantic.accent.onAccent }]}
            contentStyle={styles.buttonContent}
            compact={false}
            icon={() => (
              <Image
                source={FacebookIcon}
                style={styles.socialIcon}
                contentFit="contain"
              />
            )}
          >
            Continue with Facebook
          </Button>

          {/* Continue with Google */}
          <Button
            mode="outlined"
            style={[styles.button, styles.googleButton, { 
              backgroundColor: nucleus.light.semantic.social.google.primary,
              borderColor: nucleus.light.global.blue["50"]
            }]}
            labelStyle={[styles.buttonLabel, { color: nucleus.light.semantic.fg.staticDark }]}
            contentStyle={styles.buttonContent}
            compact={false}
            disabled={loading}
            onPress={handleGoogleSignIn}
            icon={() => (
              <Image
                source={GoogleIcon}
                style={styles.socialIcon}
                contentFit="contain"
              />
            )}
          >
            {loading ? 'Signing in...' : 'Continue with Google'}
          </Button>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text 
            style={[styles.termsText]}
          >
            By continuing you agree to our{" "}
            <Text style={styles.linkText}>Terms of Use</Text>
            {" "}and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 24,
    alignSelf: 'stretch',
  },

  logoContainer: {
    flex: 1,
    width: 173,
    height: 293,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  characterImage: {
    width: '100%', // Set width to 100% of the container
    height: '100%',
    alignSelf: 'center',
  },
  headerContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'stretch',
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4,
    letterSpacing: 0,
    textAlign: 'center',
    color: nucleus.light.global.blue["80"],
    alignSelf: 'stretch',
  },
  descriptionText: {
    width:  327,
    fontFamily: 'PlusJakartaSans',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
    color: nucleus.light.global.blue["100"],
  },
  buttonsContainer: {

    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    alignSelf: 'stretch',
  },
  button: {
    minHeight: 48,
    borderRadius: 48,
    alignSelf: 'stretch',
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 24, // Increased line height for better spacing
    textAlign: 'center',
    color: nucleus.light.global.blue["10"],
  },
  googleButton: {
    borderWidth: 1,
    
  },
  socialIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  termsContainer: {
    justifyContent: 'center',
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 10,
   
    
  },
  termsText: {
    color: nucleus.light.global.blue["100"],
    textAlign: 'center',
    fontFamily: 'PlusJakartaSans',
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
    letterSpacing: 0,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});
