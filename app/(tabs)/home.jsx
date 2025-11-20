import { Stack, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { useEffect, useState } from 'react';
import WorkspaceList from '../../components/home/WorkspaceList';
import { useAuth } from '../../contexts/AuthContext';

import OptionsModal from '../../components/home/OptionsModal';
import BottomDrawer from '../../components/ui/BottomDrawer';
import { fetchFromLocalStorage } from "../../services/localStorageService";
import { getAllWorkspaces } from '../../services/workspaces';

export default function HomeScreen() {
  const { token, user } = useAuth();
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [isListMenuVisible, setListMenuVisible] = useState(false);

  const toggleListMenuVisible = () => {
    setListMenuVisible(!isListMenuVisible)
  };

  const router = useRouter();

  const fetchWorkspaces = async (currentToken) => {
      try {
        setLoading(true);
        const data = await getAllWorkspaces(currentToken);
  
        // adapter selon la forme renvoyée par l'API
        if (Array.isArray(data)) {
          if (data[0] === true) {
            setWorkspaces(data[1]);
          }
        } else {
          console.warn('Format inattendu des workspaces:', data);
          setWorkspaces([]);
        }
      } catch (err) {
        setWorkspaces([]);
      } finally {
        setLoading(false);
      }
    };

    const onRefresh = async () => {
      if (!token) {
        console.log("Pas de token disponible pour rafraîchir.");
        return;
      }
      setRefreshing(true);
      try {
        setListMenuVisible(false)
        await fetchWorkspaces(token);
      } catch (err) {
        console.warn("Erreur pendant le rafraîchissement :", err);
      } finally {
        setRefreshing(false);
      }
    };

  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = await fetchFromLocalStorage('trello_token');
      if (!savedToken) router.push('/login');
    }
    checkAuth();
  }, []);

  useEffect(() => {
    if (!token) {
      console.log('Token pas encore disponible, attente...');
      return;
    }
    fetchWorkspaces(token);
  }, [token]);


  return (
    <View className="flex-1 bg-[#1a1a1a]">
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerTitle: '',
          headerRight: () => (
            <Pressable
              onPress={toggleListMenuVisible}
              className="w-10 h-10 rounded-full bg-[#3a3a3a] items-center justify-center mr-4"
              accessibilityLabel="Workspaces options"
            >
              <Text className="text-white text-lg">⋯</Text>
            </Pressable>
          ),
        }}
      />

      <View className="px-4 pt-12 pb-6">
        <Text className="text-2xl font-bold text-white">Workspaces</Text>
      </View>

      <ScrollView className="p-4">
        <WorkspaceList workspaces={workspaces} loading={loading} refreshing={refreshing} />
      </ScrollView>
      {/* List Menu Drawer */}
            <BottomDrawer visible={isListMenuVisible} onClose={() => setListMenuVisible(false)}>
              <OptionsModal options={options} setOptions={setOptions} refreshWorkspaces={onRefresh}/>
            </BottomDrawer>
    </View>
  );
}
