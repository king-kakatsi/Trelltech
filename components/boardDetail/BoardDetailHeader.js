import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View, Text, Pressable } from 'react-native';

export default function BoardDetailHeader({
  boardName,
  onBack,
  onOpenMenu,
  onCreateList
}) {
  return (
    <View className="px-4 py-4 flex-row items-center justify-between">
      <View className="flex-row items-center flex-1">
        <Pressable
          onPress={onBack}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        
        <Text className="text-white text-2xl font-bold flex-1" numberOfLines={1}>
          {boardName}
        </Text>
      </View>

      <View className="flex-row gap-2">
        <Pressable
          onPress={onOpenMenu}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
        </Pressable>
        <Pressable
          onPress={onCreateList}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
        >
          <Ionicons name="add" size={24} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}