import { Text } from "react-native";
import Button from "./Button";
import RecordPhoto from "./RecordPhoto";
import { photoUrl } from "../api";
import { styles } from "../styles/common";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function PhotoPicker() {
  const { form, photo, setPhoto, busy, choosePhoto } = useVeterinaria();
  return (
    <>
      <Text style={styles.label}>Foto (opcional)</Text>
      <RecordPhoto
        key={photo?.uri || form.values.foto || "sin-foto"}
        uri={photo?.uri || photoUrl(form.values.foto, form.kind)}
        label="Vista previa de la foto"
      />
      <Button
        title="Elegir de la galería"
        onPress={() => choosePhoto("gallery")}
        disabled={busy}
      />
      <Button
        title="Tomar foto"
        onPress={() => choosePhoto("camera")}
        disabled={busy}
      />
      {photo && (
        <>
          <Text>La nueva foto se subirá al guardar.</Text>
          <Button
            title="Descartar nueva foto"
            onPress={() => setPhoto(null)}
            disabled={busy}
          />
        </>
      )}
    </>
  );
}
