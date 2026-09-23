import { useRouter } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

export default function Board({ board, workspaceId }) {
  const router = useRouter();

  if (!board) {
    return null;
  }

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      className="bg-neutral-800 rounded-lg mb-3 border border-neutral-700 overflow-hidden w-full p-3"
      onPress={() => router.push(`/workspace/${workspaceId}/board/${board.id}`)}
    >
      <Text className="text-white text-base font-semibold">
        {board.name}
      </Text>
    </TouchableOpacity>
  );
}
