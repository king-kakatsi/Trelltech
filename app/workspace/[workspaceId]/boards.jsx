import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BoardsHeader from '../../../components/boards/BoardsHeader';
import BoardsList from '../../../components/boards/BoardsList';
import CreateBoardDrawer from '../../../components/boards/CreateBoardDrawer';
import { createBoard, getWorkspaceBoards } from '../../../services/boardService';

export default function WorkspaceBoardsScreen() {
  const { workspaceId, workspaceName } = useLocalSearchParams();
  const router = useRouter();
  
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const [isCreateDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, [])
  );

  useEffect(() => {
    filterBoards();
  }, [searchQuery, boards, isAscending]);

  const getMembersSearchHelper = (members) => {
    let searchHelper = '';
    for (const member of members) {
      searchHelper += (member.username + member.fullName);
    }
    return searchHelper;
  };

  const filterBoards = () => {
    let filtered = [...boards];
    if (searchQuery.trim()) {
      filtered = filtered.filter(board =>
        `${board.name.toLowerCase()}${(board.desc || '').toLowerCase()}${getMembersSearchHelper(board.members)}`.includes(searchQuery.toLowerCase())
      );
    }
    if (!isAscending) filtered = filtered.reverse();
    setFilteredBoards(filtered);
  };

  const fetchBoards = async () => {
    try {
      setLoading(true);
      const data = await getWorkspaceBoards(workspaceId);
      
      const openBoards = data.filter(board => !board.closed);
      setBoards(openBoards);
      setFilteredBoards(openBoards);
    } catch (error) {
      console.error('Error fetching boards:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBoards();
    setRefreshing(false);
  };

  const handleCreateBoard = async (template) => {
    if (!newBoardName.trim()) {
      Alert.alert('Error', 'Board name cannot be empty');
      return;
    }

    try {
      setCreating(true);
      await createBoard(workspaceId, {
        name: newBoardName.trim(),
        desc: newBoardDescription.trim(),
        template: template
      });
      setNewBoardName('');
      setNewBoardDescription('');
      setCreateDrawerVisible(false);
      await fetchBoards();
    } catch (error) {
      Alert.alert('Error', 'Failed to create board');
    } finally {
      setCreating(false);
    }
  };

  const toggleSortOrder = () => {
    setIsAscending(prev => !prev);
  };

  const handleBoardPress = (boardId, boardName) => {
    router.push({
      pathname: '/workspace/[workspaceId]/board/[boardId]',
      params: {
        workspaceId,
        boardId,
        boardName
      }
    });
  };

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-900 justify-center items-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0079BF" />
        <Text className="text-neutral-400 mt-4">Loading boards...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-neutral-900" edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <BoardsHeader
        workspaceName={workspaceName}
        onBack={() => router.back()}
        onCreateBoard={() => setCreateDrawerVisible(true)}
      />

      <BoardsList
        boards={filteredBoards}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAscending={isAscending}
        onToggleSort={toggleSortOrder}
        onBoardPress={handleBoardPress}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onCreateBoard={() => setCreateDrawerVisible(true)}
      />

      <CreateBoardDrawer
        visible={isCreateDrawerVisible}
        boardName={newBoardName}
        boardDescription={newBoardDescription}
        creating={creating}
        onBoardNameChange={setNewBoardName}
        onBoardDescriptionChange={setNewBoardDescription}
        onClose={() => {
          setCreateDrawerVisible(false);
          setNewBoardName('');
          setNewBoardDescription('');
        }}
        onCreate={handleCreateBoard}
      />
    </SafeAreaView>
  );
}