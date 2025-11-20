import { Text, View } from 'react-native';

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
import CardDetails from '../../components/cards/CardDetails';
import CardCreate from '../../components/cards/CardCreate';
import CardUpdate from '../../components/cards/CardUpdate';

export default function HomeScreen() {
  const { token, user } = useAuth();

  return (
    <View className="flex-1 bg-[#1a1a1a]">  
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6">
        <Text className="text-2xl font-bold text-white">Workspaces</Text>
      </View>

      <View className="p-4">
        <Text className="text-white">Token: {token ? 'Saved' : 'Not saved'}</Text>
        <Text className="text-white">User: {user?.fullName || 'No user'}</Text>
      </View>
      {/* <CardDetails  cardId="691dfa99d12c0964c80ee984" /> */}
      <CardUpdate  cardId="691dfa99d12c0964c80ee984" />
      {/* <CardCreate  listId="68a720d41119fcab7a2f19f2" /> */}

    </View>
  );
}