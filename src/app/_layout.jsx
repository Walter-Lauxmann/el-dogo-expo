import { KeyboardAvoidingView, Platform, ScrollView, Text, View, } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Slot, usePathname } from "expo-router";
import { VeterinariaProvider, useVeterinaria, } from "../context/VeterinariaContext";
import Navigation from "../components/Navigation";
import { styles } from "../styles/common";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <VeterinariaProvider>
        <SafeAreaView style={styles.safe}>
          <StatusBar style="dark" />
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <AppContent />
          </KeyboardAvoidingView>
        </SafeAreaView>
      </VeterinariaProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { session, error } = useVeterinaria();
  const pathname = usePathname();
  return (
    <>
      <View style={styles.header}>
        <Text style={styles.title}>🐾 El Dogo</Text>
        <Text>
          {session
            ? session.user.email + " · " + session.user.rol
            : "Ingresá a tu veterinaria"}
        </Text>
      </View>
      {session && ["/clientes", "/mascotas", "/config"].includes(pathname) && (
        <Navigation />
      )}
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {!!error && (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        )}
        {/* Slot permanece montado; las pantallas protegen el acceso. */}
        <Slot />
      </ScrollView>
    </>
  );
}
