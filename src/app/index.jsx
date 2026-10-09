import { useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Redirect } from "expo-router";
import Button from "../components/Button";
import Field from "../components/Field";
import { styles } from "../styles/common";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function Login() {
  const { session, restoring, busy, login } = useVeterinaria();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  if (restoring) return <ActivityIndicator size="large" />;
  if (session) return <Redirect href="/clientes" />;
  return (
    <View style={styles.card}>
      <Field name="email" value={email} onChange={setEmail} />
      <Field name="Contraseña" secret value={password} onChange={setPassword} />
      <Button
        title={busy ? "Ingresando…" : "Iniciar sesión"}
        onPress={() => login(email, password)}
        disabled={busy}
      />
    </View>
  );
}
