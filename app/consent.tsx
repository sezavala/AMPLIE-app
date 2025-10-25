import { useState } from "react";
import { View, Text, Switch, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { useConsent } from "@/lib/consent";
import { useColors } from "@/lib/useColors"; // your dark-mode helper

export default function ConsentScreen() {
  const c = useColors();
  const router = useRouter();
  const { setConsent, denyAll } = useConsent();

  const [voice, setVoice]     = useState(true);
  const [text, setText]       = useState(true);
  const [history, setHistory] = useState(true);

  async function onAllow() {
    await setConsent({ voice, text, history, ts: Date.now() });
    router.replace("/"); // back to Home
  }
  async function onDeny() {
    await denyAll();
    router.replace("/");
  }
  function onMoreInfo() {
    // You can route to /privacy screen instead if you have one
    Linking.openURL("https://example.com/privacy");
  }

  const Card = ({ children }: any) => (
    <View style={{
      backgroundColor: c.card, borderColor: c.border, borderWidth: 1,
      borderRadius: 16, padding: 16, marginBottom: 12
    }}>{children}</View>
  );

  const Row = ({ label, value, onValueChange }:{label:string; value:boolean; onValueChange:(v:boolean)=>void}) => (
    <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginVertical:6 }}>
      <Text style={{ color: c.text, fontSize:16 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );

  const Btn = ({ title, onPress, ghost=false }:{title:string; onPress:()=>void; ghost?:boolean}) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: ghost ? "transparent" : c.text,
        borderWidth: ghost ? 1 : 0, borderColor: c.border,
        paddingVertical: 12, borderRadius: 16, alignItems:"center", marginTop: 10
      }}
    >
      <Text style={{ color: ghost ? c.text : c.bg, fontWeight:"700" }}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex:1, backgroundColor: c.bg, padding: 24 }}>
      <Text style={{ color: c.text, fontSize:22, fontWeight:"800", marginBottom: 12 }}>
        Privacy & Consent
      </Text>

      <Card>
        <Row label="Voice snippets" value={voice} onValueChange={setVoice} />
        <Row label="Text analysis" value={text} onValueChange={setText} />
        <Row label="Mood history"  value={history} onValueChange={setHistory} />
      </Card>

      <Btn title="Allow" onPress={onAllow} />
      <Btn title="Deny" onPress={onDeny} ghost />
      <Pressable onPress={onMoreInfo} style={{ marginTop: 10, alignItems:"center" }}>
        <Text style={{ color: c.sub, textDecorationLine:"underline" }}>More info</Text>
      </Pressable>
    </View>
  );
}
