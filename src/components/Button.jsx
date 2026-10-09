import { Pressable, Text } from "react-native";
import { styles } from "../styles/common";

export default function Button({ title, onPress, disabled, danger }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        danger && styles.danger,
        disabled && { opacity: 0.45 },
      ]}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );
}
