import { useState } from "react";
import { View, Text, Image } from "react-native";
import { styles } from "../styles/common";

export default function RecordPhoto({ uri, label }) {
  const [failed, setFailed] = useState(false);
  if (!uri || failed)
    return (
      <View style={[styles.photo, styles.photoPlaceholder]}>
        <Text>Sin foto disponible</Text>
      </View>
    );
  return (
    <Image
      accessibilityLabel={label}
      source={{ uri }}
      style={styles.photo}
      onError={() => setFailed(true)}
    />
  );
}
