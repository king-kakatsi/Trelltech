import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View, ImageBackground } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
// import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    const success = await login();
    setIsLoading(false);
    
    if (success) {
      router.replace('/(tabs)/home');
    }
  };

  return (
    <ImageBackground
      source={{ uri: 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200' }}
      className="flex-1"
      resizeMode="cover"
    >
      <View className="flex-1 bg-black/70">
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 bg-[#0079BF] rounded-3xl items-center justify-center mb-4 shadow-2xl">
            <Text className="text-white text-5xl font-bold">T</Text>
          </View>
          
          <Text className="text-4xl font-bold text-white mb-2 text-center">
            {process.env.EXPO_PUBLIC_APP_NAME || 'TrellTech'}
          </Text>
          
          <Text className="text-gray-300 text-center mb-16 text-base">
            Organize your projects efficiently
          </Text>
          
          <Pressable
            onPress={handleLogin}
            disabled={isLoading}
            className="bg-[#0079BF] px-12 py-5 rounded-2xl active:opacity-80 w-full max-w-sm shadow-xl"
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text className="text-white font-bold text-lg text-center">
                Connect with Trello
              </Text>
            )}
          </Pressable>
          
          <Text className="text-gray-400 text-xs mt-8 text-center">
            Powered by Trello API
          </Text>
        </View>
      </View>
    </ImageBackground>
  );
}