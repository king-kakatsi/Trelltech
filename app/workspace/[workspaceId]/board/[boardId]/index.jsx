import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function BoardDetailScreen() {
  const { workspaceId, boardId } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-gray-50 items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">
        Board Detail
      </Text>
      <Text className="text-gray-600 mt-2">
        Workspace: {workspaceId}
      </Text>
      <Text className="text-gray-600 mt-1">
        Board: {boardId}
      </Text>
    </View>
  );
}