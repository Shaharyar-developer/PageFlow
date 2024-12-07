import { useTheme } from "@/hooks/useTheme";
import { View } from "react-native";
import { Button, Text } from "react-native-paper";
import Icon from "@expo/vector-icons/MaterialIcons";
import { useNavigation, useRouter } from "expo-router";

export default function Index() {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "center",
        backgroundColor: colors.background,
        gap: 16,
        paddingBottom: 20,
      }}
    >
      <Button
        onPress={() => router.navigate("/book-modal")}
        mode="contained"
        icon={({ size, color }) => (
          <Icon name="add" size={size} color={color} />
        )}
      >
        Add New Book
      </Button>
    </View>
  );
}
