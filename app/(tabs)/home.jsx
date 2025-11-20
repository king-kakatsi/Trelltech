import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useEffect, useState } from 'react';
import WorkspaceList from '../../components/home/WorkspaceList';
import { useAuth } from '../../contexts/AuthContext';

import { useRouter } from 'expo-router';
import OptionsModal from '../../components/home/OptionsModal';
import { fetchFromLocalStorage } from "../../services/localStorageService";

export default function HomeScreen() {
  const { token, user } = useAuth();
  // const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = await fetchFromLocalStorage('trello_token');
      if (!savedToken) router.push('/login');
    }
    checkAuth();
  }, []);

  // fonction qui récupère les workspaces en utilisant le token fourni
  // const fetchWorkspaces = async (currentToken) => {
  //   try {
  //     setLoading(true);
  //     const data = await getAllWorkspaces(currentToken);

  //     // adapter selon la forme renvoyée par l'API
  //     if (Array.isArray(data)) {
  //       if (data[0] === true) {
  //         setWorkspaces(data[1]);
  //       }
  //     } else {
  //       console.warn('Format inattendu des workspaces:', data);
  //       setWorkspaces([]);
  //     }
  //     setLoading(false);
  //   } catch (err) {
  //     setWorkspaces([]);
  //   }
  // };

  // // n'appeler la requête que lorsque token est disponible
  // useEffect(() => {
  //   if (!token) {
  //     console.log('Token pas encore disponible, attente...');
  //     return;
  //   }
  //   fetchWorkspaces(token);
  // }, [token]);


  return (
    <View className="flex-1 bg-[#1a1a1a]">
      {/* Header */}
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-white">Workspaces</Text>
        <TouchableOpacity
          onPress={() => setOptions(true)}
          className="px-3 py-2 rounded bg-[#3a3a3a]"
          accessibilityLabel="Options"
        >
          <Text className="text-white text-lg">⋯</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="p-4">
        <WorkspaceList />
      </ScrollView>
      <OptionsModal options={options} setOptions={setOptions} />
    </View>
  );
}