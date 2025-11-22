import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import AddMembersDrawer from '../ui/AddMembersDrawer';
import BottomDrawer from '../ui/BottomDrawer';

/**
 * CardUpdate Component
 * A controlled form component for editing card details
 * Follows the same pattern as EditBoardDrawer and EditListDrawer
 * 
 */
export default function CardUpdate({
  visible,
  cardName,
  cardDescription,
  cardDueDate,
  onCardNameChange,
  onCardDescriptionChange,
  onCardDueDateChange,
  onClose,
  onSave,
  cardId,
  onMembersUpdated
}) {
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * Handle save button press
   * Validates input and calls onSave callback
   */
  const handleSave = async () => {
    if (!cardName.trim()) {
      Alert.alert('Error', 'Card name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      await onSave();
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BottomDrawer visible={visible} onClose={onClose}>
        <Text className="text-2xl font-bold text-white mb-6">
          Edit Card Details
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Card Name */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Card Name
            </Text>
            <TextInput
              value={cardName}
              onChangeText={onCardNameChange}
              placeholder="Card name"
              placeholderTextColor="#6B778C"
              className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
              autoFocus
            />
          </View>

          {/* Card Description */}
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Description
            </Text>
            <TextInput
              value={cardDescription}
              onChangeText={onCardDescriptionChange}
              placeholder="Add card description"
              placeholderTextColor="#6B778C"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base min-h-[100px]"
            />
          </View>

          {/* Due Date - Display Only */}
          {cardDueDate && (
            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-400 mb-2">
                Due Date
              </Text>
              <Text className="text-white text-base">
                {cardDueDate.toLocaleString()}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">
                Change date from card detail view
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row gap-3 mb-4">
            <Pressable
              onPress={onClose}
              disabled={saving}
              className="flex-1 bg-[#1a1a1a] py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              className="flex-1 bg-white py-4 rounded-xl"
            >
              <Text className="text-gray-900 text-center font-semibold text-base">
                {saving ? 'Saving...' : 'Save'}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomDrawer>

      {/* Members Management Drawer */}
      <AddMembersDrawer
        visible={showMembersDrawer}
        onClose={() => setShowMembersDrawer(false)}
        instanceType="card"
        instanceId={cardId}
        onMembersUpdated={onMembersUpdated}
      />
    </>
  );
}
