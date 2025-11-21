import React from 'react';
import { View, Text } from 'react-native';

export default function BoardMembersBar({ members, backgroundColor }) {
  return (
    <View className="px-4 py-3">
      <View className="flex-row items-center gap-2">
        <View className="flex-row">
          {members.slice(0, 4).map((member, index) => (
            <View
              key={member.id}
              className="w-8 h-8 rounded-full bg-white items-center justify-center border-2"
              style={{ 
                borderColor: backgroundColor,
                marginLeft: index > 0 ? -8 : 0,
                zIndex: members.length - index
              }}
            >
              <Text className="text-gray-900 text-xs font-semibold">
                {member.initials}
              </Text>
            </View>
          ))}
          {members.length > 4 && (
            <View
              className="w-8 h-8 rounded-full bg-white/30 items-center justify-center border-2"
              style={{ 
                borderColor: backgroundColor,
                marginLeft: -8,
                zIndex: 0
              }}
            >
              <Text className="text-white text-xs font-semibold">
                +{members.length - 4}
              </Text>
            </View>
          )}
        </View>
        
        <Text className="text-white/70 text-sm ml-2">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </Text>
      </View>
    </View>
  );
}