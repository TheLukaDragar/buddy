import { Image } from "expo-image";
import { router } from "expo-router";
import * as React from "react";
import { ScrollView, StatusBar, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { nucleus } from "../Buddy_variables.js";

// Logo and character images
const CharacterImage = require("../assets/login/logo.png");
const AppleIcon = require("../assets/login/apple.png");
const FacebookIcon = require("../assets/login/fb.png");
const GoogleIcon = require("../assets/login/google.png");

export default function LoginScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: nucleus.light.global.blue["20"] }]}>
      <StatusBar barStyle="dark-content" backgroundColor={nucleus.light.global.blue["20"]} />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Character Logo */}
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
            variant="displaySmall" 
            style={[styles.titleText, { color: nucleus.light.global.blue["80"] }]}
          >
            Train better
          </Text>
          <Text 
            variant="bodyLarge" 
            style={[styles.descriptionText, { color: nucleus.light.global.blue["100"] }]}
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
            onPress={() => router.push("/explore")}
            compact={false}
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
            icon={() => (
              <Image
                source={GoogleIcon}
                style={styles.socialIcon}
                contentFit="contain"
              />
            )}
          >
            Continue with Google
          </Button>
        </View>

        {/* Terms and Privacy */}
        <View style={styles.termsContainer}>
          <Text 
            variant="bodySmall" 
            style={[styles.termsText, { color: nucleus.light.global.blue["100"] }]}
          >
            By continuing you agree to our{" "}
            <Text style={styles.linkText}>Terms of Use</Text>
            {" "}and{" "}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 32,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    height: 280,
    justifyContent: 'center',
  },
  characterImage: {
    width: 180,
    height: 260,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  titleText: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 32,
    lineHeight: 38.4, // 120% of 32px
    letterSpacing: 0,
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionText: {
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    lineHeight: 24,
    fontSize: 16,
  },
  buttonsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  button: {
    borderRadius: 48,
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonContent: {
    minHeight: 48,
    paddingHorizontal: 24,
    paddingVertical: 0,
  },
  buttonLabel: {
    fontFamily: 'PlusJakartaSans-Bold',
    fontSize: 16,
    lineHeight: 20,
    marginVertical: 0,
    includeFontPadding: false,
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
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  termsText: {
    fontFamily: 'PlusJakartaSans-Regular',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
  },
  linkText: {
    textDecorationLine: 'underline',
  },
});
