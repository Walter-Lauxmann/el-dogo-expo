import { View, Text } from "react-native";
import { router } from "expo-router";
import Button from "./Button";
import RecordPhoto from "./RecordPhoto";
import { styles } from "../styles/common";
import { photoUrl } from "../api";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function ClientCard({ cliente: c }) {
  const { session, busy, openForm, remove } = useVeterinaria();
  const role = session.user.rol;
  const canEditClient = ["admin", "veterinario"].includes(role);
  return (
    <View key={c.id} style={styles.card}>
      <RecordPhoto
        key={c.foto || "sin-foto"}
        uri={photoUrl(c.foto, "clientes")}
        label={"Foto de " + c.nombre}
      />
      <Text style={styles.subtitle}>
        {c.nombre} {c.apellido}
      </Text>
      <Text>{c.telefono}</Text>
      <Button
        title="Ver detalle y mascotas"
        onPress={() => router.push("/cliente/" + c.id)}
      />
      {canEditClient && (
        <Button
          title="Editar cliente"
          onPress={() => openForm("clientes", c)}
          disabled={busy}
        />
      )}
      {role === "admin" && (
        <Button
          title="Eliminar cliente"
          danger
          onPress={() => remove("clientes", c)}
          disabled={busy}
        />
      )}
    </View>
  );
}
