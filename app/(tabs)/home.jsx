import { View, Text } from "react-native";


// export default function HomeScreen() {
//   return (
//     <View className="flex-1 bg-[#1a1a1a]">
//       {/* Header */}
//       <View className="bg-[#2a2a2a] px-4 pt-12 pb-6 border-b border-gray-700">
//         <Text className="text-2xl font-bold text-white">
//           Workspaces
//         </Text>
//       </View>

//       {/* Content */}
//       <View className="flex-1 items-center justify-center">
//         <Text className="text-gray-400 text-lg">
//           No workspaces yet
//         </Text>
//       </View>
//     </View>
//   );
// }


import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from "react";
import { fetchFromLocalStorage } from "../../services/localStorageService";
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const router = useRouter();

  useEffect(()=> {
    const checkAuth = async () =>{
      const savedToken = await fetchFromLocalStorage('trello_token');
      if (!savedToken) router.push('/login');
    }
    checkAuth();
  }, [])


  return (
    <View className="flex-1 bg-[#1a1a1a]">
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6">
        <Text className="text-2xl font-bold text-white">Workspaces</Text>
      </View>

      <View className="p-4">
        <Text className="text-white">Token: {token ? 'Saved' : 'Not saved'}</Text>
        <Text className="text-white">User: {user?.fullName || 'No user'}</Text>
      </View>
      </View>
    
   
  );
}