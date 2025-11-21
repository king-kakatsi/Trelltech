import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function TaskCard({ workspaceId, listId, boardId, card }) {
  const handlePress = () => {
    console.log(`DEBUG - go to card detail - /workspace/${workspaceId}/board/${boardId}/card/${card.id}`);

    if (workspaceId && boardId && card?.id) {
      router.push(`workspace/${workspaceId}/board/${boardId}/card/${card.id}`);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.7}
      className="bg-gray-200 rounded-lg p-4 mb-4 shadow-md"
    >
      {/* Title - Bold and larger */}
      <Text className="text-base font-bold text-gray-900 mb-2">{card.name}</Text>
      
      {/* Description - Smaller and lighter color */}
      {card.desc ? (
        <Text className="text-sm text-gray-600">{card.desc}</Text>
      ) : null}

      {/* Show members */}
      {card.members && card.members.length > 0 && (
        <View className="flex-row flex-wrap mt-3">
          {card.members.map((member) => (
            <View key={member.id} className="mr-2">
              <Text className="text-xs text-indigo-700">@{member.username}</Text>
            </View>
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}