import React from 'react';
import { View, Text, Pressable, TextInput } from 'react-native';
import BottomDrawer from '../ui/BottomDrawer';

export default function CreateListDrawer({
  visible,
  listName,
  creating,
  onListNameChange,
  onClose,
  onCreate
}) {
  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      <Text className="text-2xl font-bold text-white mb-6">
        Create New List
      </Text>

      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-400 mb-2">
          List Name
        </Text>
        <TextInput
          value={listName}
          onChangeText={onListNameChange}
          placeholder="Enter list name"
          placeholderTextColor="#6B778C"
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
          autoFocus
        />
      </View>

      <View className="flex-row gap-3">
        <Pressable
          onPress={onClose}
          disabled={creating}
          className="flex-1 bg-[#1a1a1a] py-4 rounded-xl"
        >
          <Text className="text-white text-center font-semibold text-base">
            Cancel
          </Text>
        </Pressable>

        <Pressable
          onPress={onCreate}
          disabled={creating}
          className="flex-1 bg-white py-4 rounded-xl"
        >
          <Text className="text-gray-900 text-center font-semibold text-base">
            {creating ? 'Creating...' : 'Create'}
          </Text>
        </Pressable>
      </View>
    </BottomDrawer>
  );
}