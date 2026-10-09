import Field from "./Field";
import { CLIENT_FIELDS } from "../constants/fields";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function FormularioCliente() {
  const { form, setForm } = useVeterinaria();
  return (
    <>
      {CLIENT_FIELDS.filter((name) => name !== "foto").map((name) => (
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
    </>
  );
}
