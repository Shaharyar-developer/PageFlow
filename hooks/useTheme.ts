import { Material3Scheme } from "@pchmn/expo-material3-theme";
import { MD3Theme, useTheme as Theme } from "react-native-paper";

export const useTheme = Theme<MD3Theme & { colors: Material3Scheme }>;
