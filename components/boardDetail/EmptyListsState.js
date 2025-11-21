import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function EmptyListsState({ onCreateList }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      <View className="bg-white/10 rounded-full p-6 mb-4">
        <Ionicons name="list-outline" size={64} color="white" />
      </View>
      <Text className="text-white text-center text-lg font-semibold mb-2">
        No lists yet
      </Text>
      <Text className="text-white/70 text-center mb-6">
        Create your first list to get started
      </Text>
      <Pressable
        onPress={onCreateList}
        className="bg-white px-6 py-3 rounded-xl"
      >
        <Text className="text-gray-900 font-semibold">
          Create First List
        </Text>
      </Pressable>
    </View>
  );
}