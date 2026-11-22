import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { BottomTabInset } from "@/constants/theme";
import { SerifFont, useBrand, type BrandColors } from "@/constants/brand";
import { appearanceModes, useAppearance } from "@/lib/appearance";
import { useAuth } from "@/lib/auth";
import { usePreferences } from "@/lib/preferences";

function useStyles() {
  const brand = useBrand();
  return { brand, styles: useMemo(() => makeStyles(brand), [brand]) };
}

export default function ProfileScreen() {
  const { ready, session } = useAuth();
  const { brand: Brand, styles } = useStyles();
  return (
    <SafeAreaView style={styles.page} edges={["top"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.brandRow}>
            <View style={styles.dot} />
            <Text style={styles.brand}>MTL NOW</Text>
          </View>
          {!ready ? <ActivityIndicator color={Brand.accent} style={{ marginTop: 48 }} /> : session ? <SignedIn /> : <SignInForm />}
          {ready && <AppearanceCard />}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SignInForm() {
  const { brand: Brand, styles } = useStyles();
  const { configured, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const isLogin = mode === "login";
  const canSubmit = email.includes("@") && password.length > 0 && !busy;

  async function submit() {
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = isLogin ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) setError(result.error);
    else if (result.needsConfirmation) {
      setNotice("Account created. Check your email to confirm it, then log in.");
      setMode("login");
    }
  }

  return (
    <View style={styles.center}>
      <View style={styles.badge}>
        <Text style={styles.badgeIcon}>→</Text>
      </View>
      <Text style={styles.title}>{isLogin ? "Welcome back" : "Create your account"}</Text>
      <Text style={styles.subtitle}>{isLogin ? "Log in to your account" : "Save favourites across your devices"}</Text>

      <View style={styles.card}>
        {!configured && (
          <Text style={styles.warning}>Sign-in isn&apos;t set up on this device yet. Add the Supabase URL and key to .env.local.</Text>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={Brand.muted}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          textContentType="emailAddress"
          accessibilityLabel="Email"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          placeholder={isLogin ? "Your password" : "At least 6 characters"}
          placeholderTextColor={Brand.muted}
          secureTextEntry
          autoComplete={isLogin ? "current-password" : "new-password"}
          textContentType={isLogin ? "password" : "newPassword"}
          accessibilityLabel="Password"
          onSubmitEditing={() => canSubmit && submit()}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        {notice && <Text style={styles.notice}>{notice}</Text>}

        <Pressable
          accessibilityRole="button"
          disabled={!canSubmit}
          onPress={submit}
          style={({ pressed }) => [styles.primary, { opacity: !canSubmit ? 0.5 : pressed ? 0.85 : 1 }]}
        >
          {busy ? <ActivityIndicator color={Brand.accentText} /> : <Text style={styles.primaryText}>{isLogin ? "Log in" : "Create account"}</Text>}
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => {
            setMode(isLogin ? "signup" : "login");
            setError(null);
            setNotice(null);
          }}
          style={styles.switch}
        >
          <Text style={styles.switchText}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Text style={styles.link}>{isLogin ? "Create one" : "Log in"}</Text>
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function SignedIn() {
  const { styles } = useStyles();
  const { email, signOut } = useAuth();
  const { prefs, reopenOnboarding } = usePreferences();
  const [busy, setBusy] = useState(false);
  const initial = (email?.[0] ?? "?").toUpperCase();
  const summary = [prefs.audience, ...prefs.interests].filter(Boolean).join(" · ") || "Not set";

  return (
    <View>
      <Text style={styles.eyebrow}>ACCOUNT</Text>
      <Text style={styles.pageTitle}>Profile</Text>

      <View style={[styles.card, styles.userRow]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.userEmail} numberOfLines={1}>
            {email}
          </Text>
          <Text style={styles.muted}>Signed in</Text>
        </View>
      </View>

      <View style={[styles.card, { paddingVertical: 4 }]}>
        <Pressable accessibilityRole="button" onPress={reopenOnboarding} style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Outing preferences</Text>
            <Text style={styles.muted} numberOfLines={1}>
              {summary}
            </Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          await signOut();
          setBusy(false);
        }}
        style={({ pressed }) => [styles.secondary, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.secondaryText}>{busy ? "Signing out…" : "Sign out"}</Text>
      </Pressable>
    </View>
  );
}

function AppearanceCard() {
  const { brand: Brand, styles } = useStyles();
  const { mode, setMode } = useAppearance();
  return (
    <View style={styles.card}>
      <Text style={styles.rowTitle}>Appearance</Text>
      <Text style={styles.muted}>Choose how MTL NOW looks on this phone.</Text>
      <View style={styles.segment} accessibilityRole="radiogroup">
        {appearanceModes.map((option) => {
          const selected = mode === option.value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setMode(option.value)}
              style={[styles.segmentItem, selected && { backgroundColor: Brand.accent }]}
            >
              <Text style={[styles.segmentText, { color: selected ? Brand.accentText : Brand.ink }]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const makeStyles = (Brand: BrandColors) => StyleSheet.create({
  page: { flex: 1, backgroundColor: Brand.paper },
  content: { padding: 20, paddingBottom: BottomTabInset + 32, gap: 16 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Brand.accent },
  brand: { fontFamily: SerifFont, fontSize: 18, color: Brand.ink },
  center: { alignItems: "center", marginTop: 24 },
  badge: { width: 56, height: 56, borderRadius: 14, backgroundColor: Brand.accent, alignItems: "center", justifyContent: "center" },
  badgeIcon: { color: Brand.accentText, fontSize: 26, fontWeight: "700" },
  title: { fontFamily: SerifFont, fontSize: 32, color: Brand.ink, marginTop: 16, textAlign: "center" },
  subtitle: { color: Brand.muted, fontSize: 15, marginTop: 4, marginBottom: 20, textAlign: "center" },
  card: { alignSelf: "stretch", backgroundColor: Brand.card, borderRadius: 16, borderWidth: 1, borderColor: Brand.line, padding: 18, marginBottom: 14 },
  label: { color: Brand.ink, fontSize: 14, fontWeight: "600", marginBottom: 6, marginTop: 10 },
  input: { borderWidth: 1, borderColor: Brand.line, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, fontSize: 16, color: Brand.ink, backgroundColor: Brand.paper },
  warning: { color: Brand.muted, backgroundColor: Brand.paper, borderRadius: 10, padding: 10, fontSize: 13, lineHeight: 18 },
  error: { color: Brand.danger, marginTop: 12, fontSize: 14 },
  notice: { color: Brand.success, marginTop: 12, fontSize: 14 },
  primary: { backgroundColor: Brand.accent, borderRadius: 10, paddingVertical: 14, alignItems: "center", marginTop: 18 },
  primaryText: { color: Brand.accentText, fontSize: 16, fontWeight: "700" },
  switch: { alignItems: "center", marginTop: 16 },
  switchText: { color: Brand.muted, fontSize: 14 },
  link: { color: Brand.accent, fontWeight: "600" },
  eyebrow: { color: Brand.muted, fontSize: 12, letterSpacing: 2, marginTop: 8 },
  pageTitle: { fontFamily: SerifFont, fontSize: 36, color: Brand.ink, marginBottom: 16 },
  userRow: { flexDirection: "row", alignItems: "center", gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: Brand.accent, alignItems: "center", justifyContent: "center" },
  avatarText: { color: Brand.accentText, fontSize: 20, fontWeight: "700" },
  userEmail: { color: Brand.ink, fontSize: 16, fontWeight: "600" },
  muted: { color: Brand.muted, fontSize: 13, marginTop: 2 },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 12 },
  rowTitle: { color: Brand.ink, fontSize: 16 },
  chevron: { color: Brand.muted, fontSize: 24, marginLeft: 8 },
  secondary: { borderWidth: 1, borderColor: Brand.line, borderRadius: 10, paddingVertical: 14, alignItems: "center", backgroundColor: Brand.card },
  secondaryText: { color: Brand.accent, fontSize: 16, fontWeight: "600" },
  segment: { flexDirection: "row", marginTop: 12, borderWidth: 1, borderColor: Brand.line, borderRadius: 10, padding: 3, backgroundColor: Brand.paper },
  segmentItem: { flex: 1, alignItems: "center", paddingVertical: 9, borderRadius: 8 },
  segmentText: { fontSize: 14, fontWeight: "600" },
});
