import { Stack } from "expo-router";
import { Appbar } from "react-native-paper";

export default function TabLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          contentStyle: {
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            boxShadow: "none",
          },
        }}
      />
      <Stack.Screen
        name="book-modal"
        options={{
          presentation: "transparentModal",
          animation: "fade_from_bottom",
          contentStyle: {
            borderLeftWidth: 0,
            borderRightWidth: 0,
            borderTopWidth: 0,
            borderBottomWidth: 0,
            boxShadow: "none",
          },

          fullScreenGestureShadowEnabled: false,
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
