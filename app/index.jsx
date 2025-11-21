import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { fetchFromLocalStorage } from '../services/localStorageService';

export default function Index() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    const initializeApp = async () => {
      if (!isLoading) {
        const hasSeenOnboarding = await fetchFromLocalStorage('hasSeenOnboarding');
        setTimeout(() => {
          if (isAuthenticated) {
            router.replace('/(tabs)/home');
          } else if (!hasSeenOnboarding) {
            router.replace('/onboarding');
          } else {
            router.replace('/(auth)/login');
          }
        }, 1500);
      }
    };

    initializeApp();
  }, [isAuthenticated, isLoading]);

  return (
    <View className="flex-1 bg-neutral-900 items-center justify-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        <View className="w-24 h-24 bg-blue-600 rounded-3xl items-center justify-center mb-6 shadow-lg">
          <Ionicons name="file-tray-stacked" size={48} color="white" />
        </View>
        
        <Text className="text-white text-3xl font-bold mb-2">
          TrellTech
        </Text>
        
        <Text className="text-gray-400 text-base">
          Organize your workflow
        </Text>
      </Animated.View>
    </View>
  );
}