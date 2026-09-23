import React from 'react';
import { Pressable, Text, View } from 'react-native';

/**
 * Standard Cancel / Save button pair used inside drawers.
 */
export default function FormActions({
  onCancel,
  onSubmit,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  loading = false,
  disabled = false,
}) {
  return (
    <View className="flex-row gap-3 pb-4">
      <Pressable
        onPress={onCancel}
        disabled={loading}
        className="flex-1 bg-[#1a1a1a] py-4 rounded-xl active:opacity-70"
      >
        <Text className="text-white text-center font-semibold text-base">
          {cancelLabel}
        </Text>
      </Pressable>

      <Pressable
        onPress={onSubmit}
        disabled={loading || disabled}
        className={`flex-1 py-4 rounded-xl ${
          loading || disabled ? 'bg-gray-700' : 'bg-white'
        }`}
      >
        <Text
          className={`text-center font-semibold text-base ${
            loading || disabled ? 'text-gray-500' : 'text-gray-900'
          }`}
        >
          {loading ? 'Saving...' : submitLabel}
        </Text>
      </Pressable>
    </View>
  );
}
