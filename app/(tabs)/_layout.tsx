// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.6)",
        tabBarStyle: {
          backgroundColor: "#000",
          borderTopColor: "rgba(255,255,255,0.1)",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="voice"
        options={{
          title: "Voice",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="mic" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="text"
        options={{
          title: "Text",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-ellipses" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="group"
        options={{
          title: "Group",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
