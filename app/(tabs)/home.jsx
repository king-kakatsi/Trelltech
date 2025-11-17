import { View, Text } from 'react-native';

export default function HomeScreen() {
  return (
    <View className="flex-1 bg-[#1a1a1a]">
      {/* Header */}
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6 border-b border-gray-700">
        <Text className="text-2xl font-bold text-white">
          Workspaces
        </Text>
      </View>

      {/* Content */}
      <View className="flex-1 items-center justify-center">
        <Text className="text-gray-400 text-lg">
          No workspaces yet
        </Text>
      </View>
    </View>
  );
}