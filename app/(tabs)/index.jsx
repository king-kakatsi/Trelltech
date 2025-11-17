import { ScrollView, Text, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView className="flex-1 bg-[#1a1a1b] p-4">
      <Text className="text-2xl font-bold text-white mb-5">
        My Subreddits
      </Text>
      
      <View className="bg-[#272729] p-4 rounded-xl mb-2.5">
        <Text className="text-lg font-bold text-[#33977D]">
          r/reactnative
        </Text>
        <Text className="text-sm text-[#818384] mt-1">
          React Native Community
        </Text>
      </View>
      
      <View className="bg-[#272729] p-4 rounded-xl mb-2.5">
        <Text className="text-lg font-bold text-[#33977D]">
          r/expo
        </Text>
        <Text className="text-sm text-[#818384] mt-1">
          Expo Framework
        </Text>
      </View>
      
      <View className="bg-[#272729] p-4 rounded-xl mb-2.5">
        <Text className="text-lg font-bold text-[#33977D]">
          r/programming
        </Text>
        <Text className="text-sm text-[#818384] mt-1">
          Programming Discussions
        </Text>
      </View>
      
      <View className="bg-[#272729] p-4 rounded-xl mb-2.5">
        <Text className="text-lg font-bold text-[#33977D]">
          r/javascript
        </Text>
        <Text className="text-sm text-[#818384] mt-1">
          JavaScript Developers
        </Text>
      </View>
    </ScrollView>
  );
}