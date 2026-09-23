import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BoardsHeader from '../../../components/boards/BoardsHeader';
import BoardsList from '../../../components/boards/BoardsList';
import CreateBoardDrawer from '../../../components/boards/CreateBoardDrawer';
import { createBoard, getWorkspaceBoards } from '../../../services/boardService';
import { createList } from '../../../services/list';
import { getTemplateById } from '../../../utils/boardTemplates';
import { required } from '../../../lib/validation';

function buildSearchIndex(board) {
  const name = (board.name || '').toLowerCase();
  const description = (board.desc || '').toLowerCase();
  const members = Array.isArray(board.members) ? board.members : [];
  const memberTerms = members
    .map((m) => `${m.username || ''} ${m.fullName || ''}`.toLowerCase())
    .join(' ');

  return `${name} ${description} ${memberTerms}`;
}

export default function WorkspaceBoardsScreen() {
  const { workspaceId, workspaceName } = useLocalSearchParams();
  const router = useRouter();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAscending, setIsAscending] = useState(true);
  const [isCreateDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardDescription, setNewBoardDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchBoards = useCallback(async () => {
    if (!workspaceId) return;

    setLoading(true);
    const response = await getWorkspaceBoards(workspaceId);

    if (response.success) {
      const openBoards = (response.data || []).filter((board) => !board.closed);
      setBoards(openBoards);
    } else {
      console.error('Error fetching boards:', response.error);
    }

    setLoading(false);
  }, [workspaceId]);

  useFocusEffect(
    useCallback(() => {
      fetchBoards();
    }, [fetchBoards])
  );

  const filteredBoards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let filtered = [...boards];

    if (query) {
      filtered = filtered.filter((board) =>
        buildSearchIndex(board).includes(query)
      );
    }

    filtered.sort((a, b) => {
      const comparison = (a.name || '').localeCompare(b.name || '');
      return isAscending ? comparison : -comparison;
    });

    return filtered;
  }, [boards, searchQuery, isAscending]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBoards();
    setRefreshing(false);
  }, [fetchBoards]);

  const handleCreateBoard = async (template) => {
    const nameCheck = required(newBoardName, 'Board name');
    if (!nameCheck.valid) {
      Alert.alert('Error', nameCheck.error);
      return;
    }

    setCreating(true);
    const response = await createBoard(workspaceId, {
      name: newBoardName.trim(),
      description: newBoardDescription.trim(),
    });

    if (response.success) {
      const board = response.data;
      const templateConfig = getTemplateById(template);

      if (templateConfig && templateConfig.lists.length > 0) {
        for (const listName of templateConfig.lists) {
          await createList(board.id, listName);
        }
      }

      setNewBoardName('');
      setNewBoardDescription('');
      setCreateDrawerVisible(false);
      await fetchBoards();
    } else {
      Alert.alert('Error', response.error || 'Failed to create board');
    }

    setCreating(false);
  };

  const toggleSortOrder = () => {
    setIsAscending((prev) => !prev);
  };

  const handleBoardPress = (boardId, boardName) => {
    router.push({
      pathname: '/workspace/[workspaceId]/board/[boardId]',
      params: {
        workspaceId,
        boardId,
        boardName,
      },
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
