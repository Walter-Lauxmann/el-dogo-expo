import { View, Text, TextInput } from "react-native";
import { labels } from "../constants/fields";
import { styles } from "../styles/common";

export default function Field({ name, value, onChange, secret }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{labels[name] || name}</Text>
      <TextInput
        accessibilityLabel={labels[name] || name}
        value={String(value ?? "")}
        onChangeText={onChange}
        secureTextEntry={secret}
        autoCapitalize={name === "email" || secret ? "none" : "sentences"}
        autoCorrect={!secret && name !== "email"}
        keyboardType={
          name === "email"
            ? "email-address"
            : ["telefono", "documento"].includes(name)
              ? "phone-pad"
              : "default"
        }
        multiline={name === "historia_clinica"}
        style={styles.input}
      />
    </View>
  );
}
