import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { useState } from "react";
import { Text } from "react-native";
import ListToolbar from "../components/ListToolbar";
import ClientCard from "../components/ClientCard";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function Clientes() {
  const access = useProtectedRoute();
  const { session, clientes, loading } = useVeterinaria();
  const [search, setSearch] = useState("");
  if (access) return access;
  const visible = clientes.filter((item) =>
    (item.nombre + " " + (item.apellido || ""))
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  return (
    <>
      <ListToolbar
        kind="clientes"
        search={search}
        setSearch={setSearch}
        canCreate={["admin", "veterinario"].includes(session.user.rol)}
      />
      {visible.map((item) => (
        <ClientCard cliente={item} key={item.id} />
      ))}
      {!loading && !clientes.length && <Text>No hay registros todavía.</Text>}
    </>
  );
}
