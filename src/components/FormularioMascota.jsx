import Field from "./Field";
import { PET_FIELDS } from "../constants/fields";
import { Text } from "react-native";
import Button from "./Button";
import { styles } from "../styles/common";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function FormularioMascota() {
  const { form, setForm, clientes } = useVeterinaria();
  return (
    <>
      {PET_FIELDS.map((name) => (
        <Field
          key={name}
          name={name}
          value={form.values[name]}
          onChange={(value) =>
            setForm((current) => ({
              ...current,
              values: { ...current.values, [name]: value },
            }))
          }
        />
      ))}{" "}
      {form.kind === "mascotas" && (
        <>
          <Text style={styles.label}>Dueño</Text>
          {clientes.map((c) => (
            <Button
              key={c.id}
              title={
                (String(c.id) === form.values.clientesId ? "✓ " : "") +
                c.nombre +
                " " +
                (c.apellido || "")
              }
              onPress={() =>
                setForm((f) => ({
                  ...f,
                  values: { ...f.values, clientesId: String(c.id) },
                }))
              }
            />
          ))}
          {!clientes.length && <Text>Primero registrá un cliente.</Text>}
        </>
      )}
    </>
  );
}
