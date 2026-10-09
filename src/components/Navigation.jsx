import { Pressable, Text, View } from "react-native";
import { router, usePathname } from "expo-router";
import { styles } from "../styles/common";
import { useVeterinaria } from "../context/VeterinariaContext";

export default function Navigation() {
  const pathname = usePathname();
  const { setError } = useVeterinaria();
  const links = [
    { path: "/clientes", label: "Clientes" },
    { path: "/mascotas", label: "Mascotas" },
    { path: "/config", label: "Ajustes" },
  ];
  return (
    <View style={styles.tabs}>
      {links.map((link) => (
        <Pressable
          key={link.path}
          accessibilityRole="button"
          onPress={() => {
            setError("");
            router.navigate(link.path);
          }}
          style={[styles.tab, pathname === link.path && styles.selected]}
        >
          <Text>{link.label}</Text>
        </Pressable>
      ))}
    </View>
  );
}
