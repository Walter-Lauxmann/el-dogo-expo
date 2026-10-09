import { View, Text } from "react-native";
import Button from "./Button";
import RecordPhoto from "./RecordPhoto";
import { photoUrl } from "../api";
import { styles } from "../styles/common";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function PetCard({ mascota: m }) {
  const { clientes, session, busy, openForm, remove } = useVeterinaria();
  const role = session.user.rol;
  return (
    <View key={m.id} style={styles.card}>
      <RecordPhoto
        key={m.foto || "sin-foto"}
        uri={photoUrl(m.foto)}
        label={"Foto de " + m.nombre}
      />
      <Text style={styles.subtitle}>{m.nombre}</Text>
      <Text>
        {m.especie} · {m.raza || "Sin raza registrada"}
      </Text>
      <Text>
        Dueño:{" "}
        {clientes.find((c) => String(c.id) === String(m.clientesId))?.nombre ||
          m.cliente?.nombre ||
          "Sin datos"}
      </Text>
      <Text>{m.historia_clinica || "Sin historia clínica"}</Text>
      <Button
        title="Editar mascota"
        disabled={busy}
        onPress={() => openForm("mascotas", m)}
      />
      {["admin", "veterinario"].includes(role) && (
        <Button
          title="Eliminar mascota"
          danger
          disabled={busy}
          onPress={() => remove("mascotas", m)}
        />
      )}
    </View>
  );
}
