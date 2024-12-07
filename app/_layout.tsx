import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { useMaterial3Theme } from "@pchmn/expo-material3-theme";
import { useMemo } from "react";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { Reader, ReaderProvider } from "@epubjs-react-native/core";

import { useColorScheme } from "@/hooks/useColorScheme";
import { PaperProvider, MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import { View } from "react-native";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const baseTheme = useMaterial3Theme();
  const theme = useMemo(
    () =>
      colorScheme === "dark"
        ? {
            ...MD3DarkTheme,
            colors: {
              ...baseTheme.theme.dark,
              background: "#000000",
              tertiaryContainer: "#3f3f46",
              onTertiaryContainer: "#ffffff",
            },
          }
        : { ...MD3LightTheme, colors: baseTheme.theme.light },
    [colorScheme, baseTheme.theme]
  );

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <PaperProvider theme={theme}>
      <ReaderProvider>
        <Stack>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
              contentStyle: {
                backgroundColor: theme.colors.background,
                borderLeftWidth: 0,
              },
            }}
          />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ReaderProvider>
    </PaperProvider>
  );
}
