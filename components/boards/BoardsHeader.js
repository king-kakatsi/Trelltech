import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

export default function BoardsHeader({ workspaceName, onBack, onCreateBoard }) {
  return (
    <View className="px-4 py-4 flex-row items-center justify-between bg-neutral-900">
      <View className="flex-row items-center flex-1">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        
        <Text className="text-white text-2xl font-bold flex-1">
          {workspaceName || 'Boards'}
        </Text>
      </View>

      <Pressable
        onPress={onCreateBoard}
        className="w-10 h-10 rounded-full bg-neutral-800 items-center justify-center"
      >
        <Ionicons name="add" size={24} color="#fff" />
      </Pressable>
    </View>
  );
}