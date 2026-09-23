import React from 'react';
import { View, Text, TextInput } from 'react-native';
import BottomDrawer from '../ui/BottomDrawer';
import FormActions from '../ui/FormActions';

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

      <FormActions
        onCancel={onClose}
        onSubmit={onSave}
        submitLabel="Save"
        disabled={!listName.trim()}
      />
    </BottomDrawer>
  );
}