import { View, Text, Switch } from "react-native";
import { useTheme, getThemeColors } from "@/lib/theme";

export default function SettingsScreen() {
  const { theme, toggle } = useTheme();
  const colors = getThemeColors(theme);
  const isDark = theme === "dark";

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 24 }}>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: "800" }}>
        Appearance
      </Text>

      <View
        style={{
          marginTop: 16,
          backgroundColor: colors.card,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: colors.text, fontSize: 16 }}>Dark mode</Text>
        <Switch value={isDark} onValueChange={toggle} />
      </View>
    </View>
  );
}
