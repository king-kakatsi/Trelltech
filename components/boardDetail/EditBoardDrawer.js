import React from 'react';
import { View, Text, TextInput, ScrollView } from 'react-native';
import BottomDrawer from '../ui/BottomDrawer';
import FormActions from '../ui/FormActions';

export default function EditBoardDrawer({
  visible,
  boardName,
  boardDescription,
  onBoardNameChange,
  onBoardDescriptionChange,
  onClose,
  onSave
}) {
  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      <Text className="text-2xl font-bold text-white mb-6">
        Edit Board Details
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Board Name
          </Text>
          <TextInput
            value={boardName}
            onChangeText={onBoardNameChange}
            placeholder="Board name"
            placeholderTextColor="#6B778C"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Description
          </Text>
          <TextInput
            value={boardDescription}
            onChangeText={onBoardDescriptionChange}
            placeholder="Add board description"
            placeholderTextColor="#6B778C"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base min-h-[100px]"
          />
        </View>

        <FormActions
          onCancel={onClose}
          onSubmit={onSave}
          submitLabel="Save"
          disabled={!boardName.trim()}
        />
      </ScrollView>
    </BottomDrawer>
  );
}