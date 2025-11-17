import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const { userToken, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (userToken) {
        router.replace('/(tabs)');
      } else {
        router.replace('/login');
      }
    }
  }, [userToken, isLoading]);

  return (
    <View className="flex-1 justify-center items-center bg-[#1a1a1b]">
      <ActivityIndicator size="large" color="#FF4500" />
    </View>
  );
  
}