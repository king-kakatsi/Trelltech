import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

export default function WorkspaceSettingsScreen() {
  const { workspaceId } = useLocalSearchParams();

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Text className="text-2xl font-bold text-gray-900">
        Workspace Settings
      </Text>
      <Text className="text-gray-600 mt-2">
        Workspace ID: {workspaceId}
      </Text>
    </View>
  );
}