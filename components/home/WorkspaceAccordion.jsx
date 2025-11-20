import { Ionicons } from '@expo/vector-icons';
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BottomDrawer from '../ui/BottomDrawer';
import BoardList from './BoardList';

export default function WorkspaceAccordion({ id, name, boards = [], onEdit, onDelete }) {
  const [open, setOpen] = useState(false);

  // color helpers (kept consistent with boards page)

  const [menuVisible, setMenuVisible] = useState(false);
  const [suppressNextPress, setSuppressNextPress] = useState(false);

  const handleLongPress = () => {
    // prevent the immediate onPress toggle after long press
    setSuppressNextPress(true);
    setMenuVisible(true);
    // clear suppression after a short time
    setTimeout(() => setSuppressNextPress(false), 500);
  };

  const handlePress = () => {
    if (suppressNextPress) {
      setSuppressNextPress(false);
      return;
    }
    setOpen(!open);
  };

  const handleEdit = () => {
    setMenuVisible(false);
    if (typeof onEdit === 'function') onEdit(id);
    else console.warn('Edit clicked for workspace', id);
  };

  const handleDelete = () => {
    setMenuVisible(false);
    if (typeof onDelete === 'function') onDelete(id);
    else console.warn('Delete clicked for workspace', id);
  };

  return (
    <View className="mb-3 bg-neutral-800 rounded-md shadow-sm border border-neutral-700 overflow-hidden">
      {/* HEADER */}
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        className="flex-row items-center justify-between px-3 py-3"
      >
        <View className="flex-row items-center gap-3">
        <View className="flex-row items-center">
              {/* Workspace Icon */}
              {/* href={`workspace/${id}/boards`} */}
              <View className="w-8 h-8 rounded-full bg-blue-200 items-center justify-center mr-3">
                <Text className="font-bold text-center text-neutral-900">
                  {(name || '').charAt(0)?.toUpperCase() || '?'}
                </Text>
              </View>

              {/* Workspace Name */}
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

      {/* Context menu shown on long press */}
      <BottomDrawer/>

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