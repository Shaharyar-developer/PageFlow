import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from "react-native";
import { Text } from "react-native-paper";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View>
        <Text variant="titleMedium">This screen doesn't exist.</Text>
        <Link href="/">
          <Text variant="labelSmall">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

