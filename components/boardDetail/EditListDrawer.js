import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import BottomDrawer from '../ui/BottomDrawer';

export default function EditListDrawer({
  visible,
  listName,
  onListNameChange,
  onClose,
  onSave
}) {
  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      <Text className="text-2xl font-bold text-white mb-6">
        Edit List Name
      </Text>

      <View className="mb-6">
        <TextInput
          value={listName}
          onChangeText={onListNameChange}
          placeholder="List name"
          placeholderTextColor="#6B778C"
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
          autoFocus
        />
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onClose}
          className="flex-1 bg-[#1a1a1a] py-4 rounded-xl"
        >
          <Text className="text-white text-center font-semibold text-base">
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={onSave}
          className="flex-1 bg-white py-4 rounded-xl"
        >
          <Text className="text-gray-900 text-center font-semibold text-base">
            Save
          </Text>
        </Pressable>
      </View>
    </BottomDrawer>
  );
}