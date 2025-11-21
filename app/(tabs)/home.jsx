import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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

      if (Array.isArray(data)) {
        if (data[0] === true) {
          setWorkspaces(data[1]);
        }
      } else {
        console.warn('Unexpected workspace format:', data);
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
      console.log("No token available for refresh");
      return;
    }
    setRefreshing(true);
    try {
      setListMenuVisible(false)
      await fetchWorkspaces(token);
    } catch (err) {
      console.warn("Error during refresh:", err);
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
      console.log('Token not yet available, waiting...');
      return;
    }
    fetchWorkspaces(token);
  }, [token]);

  return (
    <SafeAreaView className="flex-1 bg-[#1a1a1a]" edges={['top']}>
      <View className="bg-[#2a2a2a] px-4 py-6 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-white">Workspaces</Text>
      </View>

      <WorkspaceList 
        workspaces={workspaces} 
        loading={loading} 
        refreshing={refreshing}
        onRefresh={onRefresh}
      />

      <BottomDrawer visible={isListMenuVisible} onClose={() => setListMenuVisible(false)}>
        <OptionsModal options={options} setOptions={setOptions} refreshWorkspaces={onRefresh}/>
      </BottomDrawer>
    </SafeAreaView>
  );
}