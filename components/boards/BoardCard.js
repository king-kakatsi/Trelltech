import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import MemberAvatar from '../ui/MemberAvatar';
import { getBoardColor } from '../../utils/theme';

export default function BoardCard({ board, onPress }) {
  const bgColor = getBoardColor(board.backgroundColor);
  const hasMembers = board.members && board.members.length > 0;
  const hasDescription = board.desc && board.desc.trim().length > 0;
  const displayMembers = board.members?.slice(0, 5) || [];
  const remainingCount = (board.memberCount || 0) - displayMembers.length;

  return (
    <TouchableOpacity
      onPress={() => onPress(board.id, board.name)}
      className="bg-neutral-800 rounded-lg mb-3 border border-neutral-700 overflow-hidden"
      activeOpacity={0.7}
    >
      <View
        style={{ backgroundColor: bgColor }}
        className="h-2 w-full"
      />

      <View className="p-4">
        <View className="flex-row items-start justify-between mb-2">
          <Text className="text-white text-lg font-semibold flex-1 mr-2">
            {board.name}
          </Text>

          {board.memberCount > 0 && (
            <View className="flex-row items-center bg-neutral-700 rounded-full px-2 py-1">
              <Ionicons name="people" size={14} color="#9ca3af" />
              <Text className="text-neutral-400 text-xs ml-1 font-medium">
                {board.memberCount}
              </Text>
            </View>
          )}
        </View>

        {hasDescription && (
          <Text
            className="text-neutral-400 text-sm mb-3"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {board.desc}
          </Text>
        )}

        {hasMembers && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            <View className="flex-row items-center">
              {displayMembers.map((member) => (
                <View key={member.id} className="mr-2">
                  <MemberAvatar member={member} size={32} />
                </View>
              ))}

              {remainingCount > 0 && (
                <View className="w-8 h-8 rounded-full bg-neutral-700 justify-center items-center">
                  <Text className="text-neutral-400 text-xs font-bold">
                    +{remainingCount}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        )}
      </View>
    </TouchableOpacity>
  );
}
