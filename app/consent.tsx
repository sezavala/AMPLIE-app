import { useState, useEffect } from "react";
import { View, Text, Switch, Pressable, Linking, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useConsent } from "@/lib/consent";
import { useColors } from "@/lib/useColors";

export default function ConsentScreen() {
  const c = useColors();
  const router = useRouter();
  const { loaded, consent, setConsent, denyAll } = useConsent();

  // Local UI state (start as false; we'll hydrate from store below)
  const [voice, setVoice] = useState(false);
  const [text, setText] = useState(false);
  const [history, setHistory] = useState(false);

  // 🔁 Hydrate toggles from persisted consent whenever it changes
  useEffect(() => {
    if (!loaded) return;
    setVoice(!!consent?.voice);
    setText(!!consent?.text);
    setHistory(!!consent?.history);
  }, [loaded, consent?.voice, consent?.text, consent?.history]);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: c.bg }}>
        <ActivityIndicator />
      </View>
    );
  }

  async function onAllow() {
    await setConsent({ voice, text, history, ts: Date.now() });
    router.replace("/");
  }

  async function onDeny() {
    await denyAll();
    router.replace("/");
  }

  function onMoreInfo() {
    Linking.openURL("https://example.com/privacy"); // your real policy
  }

  const Row = ({ label, value, onValueChange }:{label:string; value:boolean; onValueChange:(v:boolean)=>void}) => (
    <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginVertical:8 }}>
      <Text style={{ color:c.text, fontSize:16 }}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} />
    </View>
  );

  const Btn = ({ title, onPress, ghost=false }:{title:string; onPress:()=>void; ghost?:boolean}) => (
    <Pressable
      onPress={onPress}
      style={{
        backgroundColor: ghost ? "transparent" : c.text,
        borderWidth: ghost ? 1 : 0, borderColor: c.border,
        paddingVertical: 12, borderRadius: 16, alignItems: "center", marginTop: 12
      }}
    >
      <Text style={{ color: ghost ? c.text : c.bg, fontWeight:"700" }}>{title}</Text>
    </Pressable>
  );

  return (
    <View style={{ flex:1, backgroundColor:c.bg, padding:24 }}>
      <Text style={{ color:c.text, fontSize:22, fontWeight:"800", marginBottom:12 }}>
        Privacy & Consent
      </Text>

      <View style={{ backgroundColor:c.card, borderColor:c.border, borderWidth:1, borderRadius:16, padding:16 }}>
        <Row label="Voice snippets" value={voice} onValueChange={setVoice} />
        <Row label="Text analysis"  value={text}  onValueChange={setText} />
        <Row label="Mood history"   value={history} onValueChange={setHistory} />
      </View>

      <Btn title="Allow" onPress={onAllow} />
      <Btn title="Deny" onPress={onDeny} ghost />
      <Pressable onPress={onMoreInfo} style={{ marginTop:10, alignItems:"center" }}>
        <Text style={{ color:c.sub, textDecorationLine:"underline" }}>More info</Text>
      </Pressable>
    </View>
  );
}
