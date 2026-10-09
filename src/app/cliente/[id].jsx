import { useProtectedRoute } from "../../hooks/useProtectedRoute";
import { ActivityIndicator, Text } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Button from "../../components/Button";
import RecordPhoto from "../../components/RecordPhoto";
import { styles } from "../../styles/common";
import { photoUrl } from "../../api";
import { useVeterinaria } from "../../context/VeterinariaContext";
import PetCard from "../../components/PetCard";

export default function DetalleCliente() {
  const access = useProtectedRoute();
  const { id } = useLocalSearchParams();
  const { clientes, mascotas, loading } = useVeterinaria();
  const detail = clientes.find((c) => String(c.id) === String(id));
  if (access) return access;
  if (!detail)
    return loading ? (
      <ActivityIndicator />
    ) : (
      <>
        <Text>Cliente no encontrado</Text>
        <Button title="Volver" onPress={() => router.replace("/clientes")} />
      </>
    );
  const visiblePets = mascotas.filter(
    (m) => String(m.clientesId) === String(detail.id),
  );
  return (
    <>
      <Button title="Volver a clientes" onPress={() => router.back()} />
      <RecordPhoto
        key={detail.foto || "sin-foto"}
        uri={photoUrl(detail.foto, "clientes")}
        label={"Foto de " + detail.nombre}
      />
      <Text style={styles.subtitle}>
        {detail.nombre} {detail.apellido}
      </Text>
      <Text>
        {detail.telefono} · {detail.email}
      </Text>
      <Text>
        {detail.direccion} · {detail.localidad}
      </Text>
      <Text>Mascotas ({visiblePets.length})</Text>
      {visiblePets.map((m) => (
        <PetCard key={m.id} mascota={m} />
      ))}
      {!visiblePets.length && (
        <Text>Este cliente no tiene mascotas registradas.</Text>
      )}
    </>
  );
}
