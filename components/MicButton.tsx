import { Pressable, View, Text } from "react-native";

type Props = {
  onPress: () => void;
  disabled?: boolean;
  recording?: boolean;
};

export function MicButton({ onPress, disabled, recording }: Props) {
  return (
    <View style={{ alignItems: "center" }}>
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: disabled ? "#666" : recording ? "#e64040" : "#111",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#000",
          shadowOpacity: 0.3,
          shadowRadius: 6,
          elevation: 3,
        }}
      >
        <View
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: "#fff",
            opacity: recording ? 1 : 0.8,
          }}
        />
      </Pressable>

      {recording && (
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#e64040",
            borderRadius: 12,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>Recording…</Text>
        </View>
      )}
    </View>
  );
}
