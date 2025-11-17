import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-[#1a1a1a]">
      {/* Header */}
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6 border-b border-gray-700">
        <Text className="text-2xl font-bold text-white">
          Profile
        </Text>
      </View>

      {/* Content */}
      <View className="p-6">
        {/* Avatar and user info */}
        <View className="bg-[#2a2a2a] rounded-2xl p-6 items-center mb-6">
          <View className="w-24 h-24 rounded-full bg-[#0079BF] items-center justify-center mb-4">
            <Text className="text-white text-4xl font-bold">
              {user?.fullName?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-white mb-1">
            {user?.fullName || 'User'}
          </Text>
          <Text className="text-gray-400">
            {user?.email || 'user@example.com'}
          </Text>
        </View>

        {/* Logout button */}
        <Pressable
          onPress={handleLogout}
          className="bg-[#EB5A46] py-4 rounded-xl active:opacity-80"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}