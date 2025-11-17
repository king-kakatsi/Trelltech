import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const router = useRouter();

  const handleLogin = () => {
    router.replace('/(tabs)');
  };

  return (
    <View className="flex-1 justify-center items-center bg-[#1a1a1b] px-5">
      <Text className="text-5xl font-bold text-[#33977D] mb-2.5">
        Mobimobilo
      </Text>
      <Text className="text-xl text-[#818384] mb-12">
        Trello Client
      </Text>
      
      <TouchableOpacity 
        className="bg-[#33977D] px-10 py-4 rounded-3xl active:opacity-80"
        onPress={handleLogin}
      >
        <Text className="text-white text-base font-bold">
          Sign in with Trello
        </Text>
      </TouchableOpacity>
    </View>
  );
}