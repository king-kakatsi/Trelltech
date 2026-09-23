import React from 'react';
import { View, Text, TextInput } from 'react-native';
import BottomDrawer from '../ui/BottomDrawer';
import FormActions from '../ui/FormActions';

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

      <FormActions
        onCancel={onClose}
        onSubmit={onCreate}
        submitLabel="Create"
        loading={creating}
        disabled={!listName.trim()}
      />
    </BottomDrawer>
  );
}