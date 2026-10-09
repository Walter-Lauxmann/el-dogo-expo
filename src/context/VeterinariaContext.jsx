import { createContext, useContext, useState, useEffect, useMemo, useCallback, } from "react";
import { Alert } from "react-native";
import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";
import { createApi, petBody, clientBody } from "../api";
import { CLIENT_FIELDS, PET_FIELDS } from "../constants/fields";
import { usePhoto } from "../hooks/usePhoto";

// Comparte sesión y datos entre rutas, como un Provider en React web.
const VeterinariaContext = createContext(null);

export function VeterinariaProvider({ children }) {
  const [session, setSession] = useState(null);
  const [restoring, setRestoring] = useState(true);
  const [form, setForm] = useState(null);
  const [clientes, setClientes] = useState([]);
  const [mascotas, setMascotas] = useState([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);
  const { photo, setPhoto, choosePhoto } = usePhoto(setBusy, setError);
  // SecureStore reemplaza localStorage en Android/iOS.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await SecureStore.getItemAsync("session");
        const saved = raw && JSON.parse(raw);
        if (active && saved?.token && saved?.user) setSession(saved);
      } catch {
        if (active)
          setError("No se pudo recuperar la sesión. Ingresá nuevamente.");
      } finally {
        if (active) setRestoring(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);
  const logout = useCallback(async () => {
    setSession(null);
    setClientes([]);
    setMascotas([]);
    setForm(null);
    setPhoto(null);
    try {
      await SecureStore.deleteItemAsync("session");
    } catch {
      setError("No se pudo borrar la sesión guardada.");
    }
  }, [setPhoto]);
  const api = useMemo(
    () =>
      createApi(session?.token, () => {
        void logout();
      }),
    [session?.token, logout],
  );
  // El efecto descarta respuestas antiguas si cerramos sesión durante la carga.
  useEffect(() => {
    if (!session) return;
    let active = true;
    Promise.all([api("/clientes"), api("/mascotas")])
      .then(([c, m]) => {
        if (!Array.isArray(c) || !Array.isArray(m))
          throw new Error("Respuesta inesperada del servidor.");
        if (active) {
          setClientes(c);
          setMascotas(m);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [session, revision, api]);
  function refresh() {
    setLoading(true);
    setError("");
    setRevision((v) => v + 1);
  }
  async function login(email, password) {
    if (!email.trim() || !password) {
      setError("Completá correo y contraseña.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api("/auth/login", "POST", {
        email: email.trim(),
        passwordPlain: password,
      });
      if (!result?.token || !result?.user)
        throw new Error("El servidor no devolvió una sesión válida.");
      await SecureStore.setItemAsync("session", JSON.stringify(result));
      setLoading(true);
      setSession(result);
      router.replace("/clientes");
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function openForm(kind, item = {}) {
    setError("");
    setPhoto(null);
    const fields =
      kind === "clientes"
        ? CLIENT_FIELDS
        : [...PET_FIELDS, "clientesId", "foto"];
    setForm({
      kind,
      id: item.id,
      values: Object.fromEntries(fields.map((k) => [k, String(item[k] ?? "")])),
    });
    router.push("/formulario");
  }
  async function save() {
    const { kind, id, values } = form;
    const required =
      kind === "clientes"
        ? CLIENT_FIELDS.filter((k) => k !== "foto")
        : ["nombre", "especie", "clientesId"];
    if (required.some((k) => !values[k]?.trim())) {
      setError("Completá todos los campos obligatorios.");
      return;
    }
    if (
      values.nombre.trim().length < 2 ||
      (kind === "clientes" &&
        (values.apellido.trim().length < 2 ||
          !/^\d{7,10}$/.test(values.documento)))
    ) {
      setError(
        "Nombre y apellido: mínimo 2 caracteres. Documento: 7 a 10 dígitos.",
      );
      return;
    }
    setBusy(true);
    setError("");
    try {
      const body =
        kind === "mascotas"
          ? petBody(values, photo)
          : clientBody(values, photo);
      await api("/" + kind + (id ? "/" + id : ""), id ? "PATCH" : "POST", body);
      setForm(null);
      setPhoto(null);
      refresh();
      router.back();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  function remove(kind, item) {
    Alert.alert(
      "Eliminar " + item.nombre,
      "Esta acción eliminará el registro del servidor.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setBusy(true);
            setError("");
            try {
              await api("/" + kind + "/" + item.id, "DELETE");
              refresh();
              if (kind === "clientes") router.replace("/clientes");
            } catch (e) {
              setError(e.message);
            } finally {
              setBusy(false);
            }
          },
        },
      ],
    );
  }
  return (
    <VeterinariaContext.Provider
      value={{ session, restoring, form, setForm, photo, setPhoto, clientes, mascotas, busy, loading, error, setError, refresh, login, logout, openForm, choosePhoto, save, remove, }}
    >
      {children}
    </VeterinariaContext.Provider>
  );
}
export function useVeterinaria() {
  const context = useContext(VeterinariaContext);
  if (!context) throw new Error("useVeterinaria requiere VeterinariaProvider");
  return context;
}
