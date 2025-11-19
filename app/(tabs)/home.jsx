import { ScrollView, Text, View } from 'react-native';


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


import { useEffect, useState } from 'react';
// import { View } from 'react-native-web';
import WorkspaceList from '../../components/home/WorkspaceList';
import { useAuth } from '../../contexts/AuthContext';
import { getAllWorkspaces } from '../../services/workspaces';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // fonction qui récupère les workspaces en utilisant le token fourni
  const fetchWorkspaces = async (currentToken) => {
    try {
      setLoading(true)
      // console.log('Fetching workspaces with token:', currentToken);
      const data = await getAllWorkspaces(currentToken);
      // console.log('Workspaces response:', data);

      // adapter selon la forme renvoyée par l'API
      if (Array.isArray(data)) {
        if (data[0] === true) {
          setWorkspaces(data[1]);
        }
      } else {
        console.warn('Format inattendu des workspaces:', data);
        setWorkspaces([]);
      }
      setLoading(false);
    } catch (err) {
      // console.error('Erreur lors de la récupération des workspaces:', err);
      setWorkspaces([]);
    }
  };

  // n'appeler la requête que lorsque token est disponible
  useEffect(() => {
    if (!token) {
      console.log('Token pas encore disponible, attente...');
      return;
    }
    fetchWorkspaces(token);
  }, [token]);

  return (
    <View className="flex-1 bg-[#1a1a1a]">
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6">
        <Text className="text-2xl font-bold text-white">Workspaces</Text>
      </View>

      <ScrollView className="p-4">
        <WorkspaceList workspaces={workspaces} />
        {/* <Text className="text-white">Token: {token ? token : 'Not saved'}</Text>
        <Text className="text-white">User: {user?.fullName || 'No user'}</Text> */}
        {/* <Text className="text-white">Workspaces trouvés: {workspaces.length}</Text> */}
        {/* Affiche quelques noms pour vérifier rapidement */}
        {/* {
          loading ? (
            <Text className="text-white" >
              Loading...
            </Text>
          ) : workspaces.map((ws) => (
            <Text key={ws.id} className="text-white">
              {ws.name}
            </Text>
          ))
        } */}
      </ScrollView>
    </View>
  );
}