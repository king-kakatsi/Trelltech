import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();

  const handleLogout = () => {
    router.replace('/login');
  };

  return (
    <View className="flex-1 bg-[#1a1a1b] p-4">
      <View className="items-center py-8 border-b border-[#343536] mb-5">
        <View className="w-20 h-20 rounded-full bg-[#33977D] justify-center items-center mb-4">
          <Text className="text-3xl font-bold text-white">
            U
          </Text>
        </View>
        <Text className="text-2xl font-bold text-white mb-1">
          u/YourUsername
        </Text>
        <Text className="text-base text-[#818384]">
          1 karma
        </Text>
      </View>

      <View className="mb-8">
        <Text className="text-lg font-bold text-white mb-4">
          Account Settings
        </Text>
        
        <TouchableOpacity className="flex-row justify-between items-center bg-[#272729] p-4 rounded-xl mb-2.5 border border-[#343536]">
          <Text className="text-base text-white">
            Nightmode
          </Text>
          <Text className="text-base text-[#33977D] font-bold">
            ON
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity className="flex-row justify-between items-center bg-[#272729] p-4 rounded-xl mb-2.5 border border-[#343536]">
          <Text className="text-base text-white">
            Show NSFW content
          </Text>
          <Text className="text-base text-[#33977D] font-bold">
            OFF
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        className="bg-[#33977D] p-4 rounded-xl items-center mt-auto active:opacity-80"
        onPress={handleLogout}
      >
        <Text className="text-white text-base font-bold">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}