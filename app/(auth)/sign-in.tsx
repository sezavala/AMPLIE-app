import {
  Platform,
  View,
  Text,
  Pressable,
  StyleSheet,
  Image,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { useOAuth } from "@clerk/clerk-expo";
import React, { useCallback } from "react";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });

  const doOAuth = useCallback(
    async (strategy: "google" | "apple") => {
      try {
        const flow = strategy === "google" ? googleAuth : appleAuth;
        const { createdSessionId, setActive } = await flow();

        if (createdSessionId && setActive) {
          await setActive({ session: createdSessionId });
        }
      } catch (err) {
        console.error("OAuth error:", err);
      }
    },
    [googleAuth, appleAuth]
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎵</Text>
        <Text style={styles.title}>AMPLIE</Text>
        <Text style={styles.subtitle}>Your AI Music Companion</Text>

        <View style={styles.buttons}>
          <Pressable
            style={[styles.button, styles.googleButton]}
            onPress={() => doOAuth("google")}
          >
            <Text style={styles.buttonText}>Continue with Google</Text>
          </Pressable>

          {Platform.OS === "ios" && (
            <Pressable
              style={[styles.button, styles.appleButton]}
              onPress={() => doOAuth("apple")}
            >
              <Text style={[styles.buttonText, { color: "#fff" }]}>
                Continue with Apple
              </Text>
            </Pressable>
          )}
        </View>

        <Text style={styles.privacy}>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 40,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#999",
    marginBottom: 48,
  },
  buttons: {
    width: "100%",
    maxWidth: 320,
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  googleButton: {
    backgroundColor: "#fff",
  },
  appleButton: {
    backgroundColor: "#000",
    borderWidth: 1,
    borderColor: "#333",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  privacy: {
    marginTop: 32,
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    maxWidth: 280,
  },
});
