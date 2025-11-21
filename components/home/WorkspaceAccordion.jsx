import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import BoardList from './BoardList';

export default function WorkspaceAccordion({ id, name, boards = [] }) {
  const [open, setOpen] = useState(false);

  // color helpers (kept consistent with boards page)


  // const renderMemberChip = (member, index) => (
  //   <View
  //     key={member.id || `${index}`}
  //     style={{ backgroundColor: getInitialsColor(index) }}
  //     className="w-7 h-7 rounded-full justify-center items-center mr-2"
  //   >
  //     <Text className="text-white text-xs font-bold">
  //       {member.initials || (member.fullName || '').substring(0, 2).toUpperCase()}
  //     </Text>
  //   </View>
  // );

  // const renderBoardCard = (item) => {


  //   return (

  //   );
  // };

  return (
    <View className="mb-3 bg-neutral-800 rounded-md shadow-sm border border-neutral-700 overflow-hidden">
      {/* HEADER */}
      <TouchableOpacity
        onPress={() => setOpen(!open)}
        className="flex-row items-center justify-between px-3 py-3"
      >
        <View className="flex-row items-center gap-3">
          <Link href={`workspace/${id}/boards`} className="">
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
          </Link>
          {/* <View className="flex-row items-center">
            <View className="w-8 h-8 rounded-full bg-blue-200 items-center justify-center mr-3">
              <Text className="font-bold text-center text-neutral-900">
                {(name || '').charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
            <Text className="text-white text-base">
              {name}
            </Text>
          </View> */}
        </View>

        {open ? (
          <ChevronUp size={20} color="#9ca3af" />
        ) : (
          <ChevronDown size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>

      {/* LISTE DES BOARDS (reproduit le même design que la page Boards) */}
      {/* {open && (
        <View className="p-3">
          {boards.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons name="folder-open-outline" size={28} color="#6b7280" />
              <Text className="text-neutral-400 mt-2">No boards in this workspace</Text>
            </View>
          ) : (
            boards.map(b => renderBoardCard(b))
          )}
        </View>
      )} */}
      {open && (
        <View className="p-3">
          {boards.length === 0 ? (
            <View className="py-6 items-center">
              <Ionicons name="folder-open-outline" size={28} color="#6b7280" />
              <Text className="text-neutral-400 mt-2">No boards in this workspace</Text>
            </View>
          ) : (
            // boards.map(b => renderBoardCard(b))
            <BoardList boards={boards} />
          )}
        </View>
      )}
    </View>
  );
}