import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function CardDetailScreen() {
  const { workspaceId, boardId, cardId } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">
        Card Detail
      </Text>
      <Text className="text-gray-600 mt-2">
        Workspace: {workspaceId}
      </Text>
      <Text className="text-gray-600 mt-1">
        Board: {boardId}
      </Text>
      <Text className="text-gray-600 mt-1">
        Card: {cardId}
      </Text>
    </View>
  );
}