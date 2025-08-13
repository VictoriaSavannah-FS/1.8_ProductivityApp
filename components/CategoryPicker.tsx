// components/CategoryPicker.tsx
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { TaskFilter, Category } from "../types/Tasks";

// The 3 CATS ---
const CATS: Category[] = ["Personal", "Work", "Health"];

type Props = {
  //  category ==> selected
  value: Category;
  // ==> category update
  onChange: (next: Category) => void;
};

export default function CategoryPicker({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {CATS.map((cat) => {
        const isActive = value === cat;
        return (
          <TouchableOpacity
            key={cat}
            onPress={() => onChange(cat)}
            style={[styles.selector, isActive && styles.selectorActive]}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Text
              style={[
                styles.selectorText,
                isActive && styles.selectorTextActive,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row", // cats. == horiz. row
    gap: 8,
  },
  selector: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999, //ciurcle/oval
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "white",
  },
  selectorActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  selectorText: { color: "#111827", fontWeight: "600" },
  selectorTextActive: { color: "white" },
});
