import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function EmptyBoardsState({ searchQuery, onCreateBoard }) {
  return (
    <View className="flex-1 justify-center items-center px-6">
      <View className="bg-neutral-800 rounded-full p-6 mb-4">
        <Ionicons name="folder-open-outline" size={64} color="#9ca3af" />
      </View>
      <Text className="text-white text-center text-lg font-semibold mb-2">
        {searchQuery.trim() ? 'No boards found' : 'No boards yet'}
      </Text>
      <Text className="text-neutral-400 text-center mb-6">
        {searchQuery.trim()
          ? 'Try a different search term'
          : 'Create your first board to get started'}
      </Text>
      {!searchQuery.trim() && (
        <Pressable
          onPress={onCreateBoard}
          className="bg-white px-6 py-3 rounded-xl"
        >
          <Text className="text-gray-900 font-semibold">
            Create First Board
          </Text>
        </Pressable>
      )}
    </View>
  );
}