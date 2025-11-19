import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BoardList from "./BoardList";

export default function WorkspaceAccordion({ name, boards = [] }) {
  const [open, setOpen] = useState(false);

  return (
    <View className="mb-3 bg-white rounded-md shadow-sm">

      {/* HEADER */}
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between px-3 py-2"
      >
        <View className="flex-row items-center gap-3">
          {/* Workspace Icon */}
          <View className="w-8 h-8 rounded-full bg-blue-200 items-center justify-center">
            <Text className="font-bold text-center">
              {name.charAt(0).toUpperCase()}
            </Text>
          </View>

          {/* Workspace Name */}
          <Text className="text-dark font-medium text-base">{name}</Text>
        </View>

        {open ? (
          <ChevronUp size={20} color="#172B4D" />
        ) : (
          <ChevronDown size={20} color="#172B4D" />
        )}
      </TouchableOpacity>

      {/* LISTE DES BOARDS */}
      {open && (
        <BoardList boards={boards} />
      )}
    </View>
  );
}