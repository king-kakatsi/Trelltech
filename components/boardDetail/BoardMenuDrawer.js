import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import BottomDrawer from '../ui/BottomDrawer';

export default function BoardMenuDrawer({
  visible,
  onClose,
  onEditBoard,
  onArchiveBoard
}) {
  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      <Text className="text-xl font-bold text-white mb-4">
        Board Actions
      </Text>

      <Pressable
        onPress={onEditBoard}
        className="flex-row items-center py-4 border-b border-gray-700"
      >
        <Ionicons name="create-outline" size={24} color="#fff" />
        <Text className="text-white text-base ml-3">Edit Board Details</Text>
      </Pressable>

      <Pressable
        onPress={onArchiveBoard}
        className="flex-row items-center py-4"
      >
        <Ionicons name="archive-outline" size={24} color="#EB5A46" />
        <Text className="text-[#EB5A46] text-base ml-3">Archive Board</Text>
      </Pressable>
    </BottomDrawer>
  );
}