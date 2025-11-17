import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
      router.replace('/(tabs)/home');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white items-center justify-center p-6">
      <Text className="text-4xl font-bold text-[#0079BF] mb-4">
        TrellTech
      </Text>
      <Text className="text-gray-600 text-center mb-8 text-base">
        Manage your projects with Trello
      </Text>
      
      <Pressable
        onPress={handleLogin}
        disabled={isLoading}
        className="bg-[#0079BF] px-8 py-4 rounded-lg active:opacity-80 w-full"
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg text-center">
            Connect with Trello
          </Text>
        )}
      </Pressable>
    </View>
  );
}