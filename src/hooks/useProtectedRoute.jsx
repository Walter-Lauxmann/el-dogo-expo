import { ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { useVeterinaria } from "../context/VeterinariaContext";
// Equivale a RutaProtegida: primero espera la sesión, después permite la pantalla.
export function useProtectedRoute() {
  const { session, restoring } = useVeterinaria();
  if (restoring) return <ActivityIndicator size="large" />;
  if (!session) return <Redirect href="/" />;
  return null;
}
