import { Ionicons } from '@expo/vector-icons';
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BoardList from './BoardList';

export default function WorkspaceAccordion({ id, name, boards = [], onOpen }) {
  const [open, setOpen] = useState(false);

  // toggle on simple press
  const handlePress = () => {
    setOpen(!open);
  };

  // call onOpen on long press only
  const handleLongPress = () => {
    if (typeof onOpen === "function") onOpen(id);
  };

  return (
    <View className="mb-3 bg-neutral-800 rounded-md shadow-sm border border-neutral-700 overflow-hidden">
      {/* HEADER */}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={500} // optionnel, ajustez la durée si besoin
        className="flex-row items-center justify-between px-3 py-3"
      >
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-blue-200 items-center justify-center mr-3">
              <Text className="font-bold text-center text-neutral-900">
                {(name || '').charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text className="text-white text-base">
              {name}
            </Text>
          </View>
        </View>

        {open ? (
          <ChevronUp size={20} color="#9ca3af" />
        ) : (
          <ChevronDown size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {/* LISTE DES BOARDS (reproduit le même design que la page Boards) */}
      {open && (
        <View className="p-3">
          {boards.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons name="folder-open-outline" size={28} color="#6b7280" />
              <Text className="text-neutral-400 mt-2">No boards in this workspace</Text>
            </View>
          ) : (
            <BoardList boards={boards} />
          )}
        </View>
      )}
    </View>
  );
}