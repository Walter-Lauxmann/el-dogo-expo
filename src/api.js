// Una única puerta de entrada a NestJS: mantiene URL, token y errores juntos.
export const API_URL = (
  process.env.EXPO_PUBLIC_API_URL || "http://10.0.2.2:3000"
).replace(/\/$/, "");
export function createApi(token, onExpired = () => {}) {
  return async (route, method = "GET", data) => {
    const multipart = data instanceof FormData;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(API_URL + route, {
        method,
        signal: controller.signal,
        headers: {
          ...(token ? { Authorization: "Bearer " + token } : {}),
          ...(!multipart && data ? { "Content-Type": "application/json" } : {}),
        },
        body:
          data === undefined
            ? undefined
            : multipart
              ? data
              : JSON.stringify(data),
      });
      const text = await response.text();
      let result;
      try {
        result = text ? JSON.parse(text) : null;
      } catch {
        result = null;
      }
      if (!response.ok) {
        if (response.status === 401 && token) onExpired();
        const message =
          result?.message || result?.mensaje || "Error HTTP " + response.status;
        throw new Error(Array.isArray(message) ? message.join("\n") : message);
      }
      return result;
    } catch (error) {
      if (error.name === "AbortError")
        throw new Error("El servidor tardó demasiado. Verificá la conexión.");
      if (error instanceof TypeError)
        throw new Error("No se pudo conectar con NestJS en " + API_URL);
      throw error;
    } finally {
      clearTimeout(timer);
    }
  };
}
// La carpeta cambia según la ficha, pero MySQL sigue guardando solo el nombre.
export function photoUrl(filename, kind = "mascotas") {
  if (!filename) return null;
  if (/^https?:\/\//i.test(filename)) return filename;
  if (filename.startsWith("/uploads/")) return API_URL + filename;
  return API_URL + "/uploads/" + kind + "/" + encodeURIComponent(filename);
}
function withPhoto(clean, photo) {
  if (!photo) return clean;
  const form = new FormData();
  for (const [key, value] of Object.entries(clean)) {
    if (key !== "foto") form.append(key, String(value));
  }
  // Expo SDK 57 lee los bytes de File; un objeto con URI no es compatible.
  form.append("foto", photo.file);
  return form;
}
export function petBody(values, photo) {
  const fields = [
    "nombre",
    "especie",
    "raza",
    "historia_clinica",
    "clientesId",
  ];
  const clean = Object.fromEntries(
    fields.map((key) => [
      key,
      key === "clientesId" ? Number(values[key]) : values[key] || "",
    ]),
  );
  return withPhoto(clean, photo);
}
export function clientBody(values, photo) {
  const fields = [
    "nombre",
    "apellido",
    "documento",
    "direccion",
    "localidad",
    "telefono",
    "email",
    "foto",
  ];
  const clean = Object.fromEntries(
    fields.map((key) => [key, String(values[key] || "").trim()]),
  );
  return withPhoto(clean, photo);
}
