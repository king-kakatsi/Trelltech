import { View, Text } from 'react-native';

export default function TestNativeWind() {
  return (
    <View className="flex-1 bg-blue-500 justify-center items-center">
      <Text className="text-white text-2xl font-bold">
        NativeWind Works!
      </Text>
      <Text className="text-white text-base mt-4">
        If you see white text on blue background, it works.
      </Text>
    </View>
  );
}