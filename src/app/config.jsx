import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { View, Text } from "react-native";
import Button from "../components/Button";
import { styles } from "../styles/common";
import { API_URL } from "../api";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function Configuracion() {
  const access = useProtectedRoute();
  const { logout } = useVeterinaria();
  if (access) return access;
  return (
    <View style={styles.card}>
      <Text style={styles.subtitle}>Configuración</Text>
      <Text>Servidor: {API_URL}</Text>
      <Text>
        La gestión de usuarios y permisos continúa en construcción, como en la
        versión web.
      </Text>
      <Button title="Cerrar sesión" onPress={logout} />
    </View>
  );
}
