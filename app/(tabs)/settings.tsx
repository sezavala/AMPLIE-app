import { View, Text, Switch, Pressable } from "react-native";
import { useTheme } from "@/lib/theme";
import { useColors } from "@/lib/useColors";
import { useConsent } from "@/lib/consent";

export default function SettingsScreen() {
  const { theme, toggle } = useTheme();
  const c = useColors();
  const { reset } = useConsent(); // 👈 import reset from consent store

  return (
    <View style={{ flex: 1, backgroundColor: c.bg, padding: 24 }}>
      <Text
        style={{
          color: c.text,
          fontSize: 22,
          fontWeight: "800",
          marginBottom: 16,
        }}
      >
        Appearance
      </Text>

      <View
        style={{
          backgroundColor: c.card,
          borderColor: c.border,
          borderWidth: 1,
          borderRadius: 16,
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text style={{ color: c.text, fontSize: 16 }}>Dark mode</Text>
        <Switch value={theme === "dark"} onValueChange={toggle} />
      </View>
    </View>
  );
}
