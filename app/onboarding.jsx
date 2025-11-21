import { useRouter } from 'expo-router';
import { useState, useRef } from 'react';
import { View, Text, Pressable, FlatList, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveInLocalStorage } from '../services/localStorageService';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    icon: 'grid-outline',
    title: 'Organize Your Boards',
    description: 'Create boards for your projects and manage tasks with ease. Keep everything organized in one place.',
  },
  {
    id: '2',
    icon: 'people-outline',
    title: 'Collaborate Seamlessly',
    description: 'Work together with your team in real-time. Share boards, assign tasks, and track progress.',
  },
  {
    id: '3',
    icon: 'checkmark-done-outline',
    title: 'Get Things Done',
    description: 'Stay productive with lists, cards, and comments. Turn your ideas into achievements.',
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await saveInLocalStorage('hasSeenOnboarding', 'true');
    router.replace('/(auth)/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      <View className="w-32 h-32 bg-blue-600/20 rounded-full items-center justify-center mb-8">
        <Ionicons name={item.icon} size={64} color="#2563eb" />
      </View>
      
      <Text className="text-white text-3xl font-bold text-center mb-4">
        {item.title}
      </Text>
      
      <Text className="text-gray-400 text-base text-center leading-6">
        {item.description}
      </Text>
    </View>
  );

  const renderDots = () => (
    <View className="flex-row mb-12">
      {SLIDES.map((_, index) => {
        const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
        
        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [8, 24, 8],
          extrapolate: 'clamp',
        });
        
        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index}
            style={{
              width: dotWidth,
              opacity,
            }}
            className="h-2 bg-blue-600 rounded-full mx-1"
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-900">
      <View className="flex-1">
        <View className="flex-row justify-end px-6 pt-4">
          {currentIndex < SLIDES.length - 1 && (
            <Pressable onPress={handleSkip} className="active:opacity-70">
              <Text className="text-gray-400 text-base font-semibold">Skip</Text>
            </Pressable>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={SLIDES}
          renderItem={renderSlide}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          scrollEventThrottle={16}
        />

        <View className="pb-8 px-6">
          {renderDots()}
          
          <Pressable
            onPress={handleNext}
            className="bg-blue-600 py-4 rounded-2xl active:opacity-80"
          >
            <Text className="text-white text-center text-lg font-bold">
              {currentIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}