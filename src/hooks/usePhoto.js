import { useState } from "react";
import { Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { File } from "expo-file-system";
// La selección es independiente de la pantalla que la utiliza.
export function usePhoto(setBusy, setError) {
  const [photo, setPhoto] = useState(null);
  // Una misma función atiende galería y cámara para clientes y mascotas.
  async function choosePhoto(source = "gallery") {
    setBusy(true);
    setError("");
    try {
      const options = { mediaTypes: ["images"], quality: 0.8 };
      let result;
      if (source === "camera") {
        const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permiso de cámara",
            "Permití el acceso a la cámara desde los ajustes del teléfono para tomar una foto.",
          );
          return;
        }
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        // El selector del sistema permite elegir una imagen sin pedir acceso a toda la galería.
        result = await ImagePicker.launchImageLibraryAsync(options);
      }
      if (!result.canceled && result.assets?.[0]) {
        const selected = result.assets[0];
        if (selected.fileSize > 10 * 1024 * 1024) {
          Alert.alert(
            "Foto demasiado grande",
            "Elegí una imagen de hasta 10 MB.",
          );
          return;
        }
        setPhoto({ ...selected, file: new File(selected.uri) });
      }
    } catch (e) {
      setError("No se pudo obtener la foto: " + e.message);
    } finally {
      setBusy(false);
    }
  }
  return { photo, setPhoto, choosePhoto };
}
