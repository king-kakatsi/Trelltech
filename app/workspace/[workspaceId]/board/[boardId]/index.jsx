import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BoardDetailHeader from '../../../../../components/boardDetail/BoardDetailHeader';
import BoardMembersBar from '../../../../../components/boardDetail/BoardMembersBar';
import BoardMenuDrawer from '../../../../../components/boardDetail/BoardMenuDrawer';
import CreateListDrawer from '../../../../../components/boardDetail/CreateListDrawer';
import EditBoardDrawer from '../../../../../components/boardDetail/EditBoardDrawer';
import EditListDrawer from '../../../../../components/boardDetail/EditListDrawer';
import EmptyListsState from '../../../../../components/boardDetail/EmptyListsState';
import ListCarousel from '../../../../../components/boardDetail/ListCarousel';
import ListMenuDrawer from '../../../../../components/boardDetail/ListMenuDrawer';
import AddMembersDrawer from '../../../../../components/ui/AddMembersDrawer';
import { required } from '../../../../../lib/validation';
import {
  archiveBoard,
  getBoard,
  getBoardMembers,
  updateBoardDescription,
  updateBoardName,
} from '../../../../../services/boardService';
import {
  archiveList,
  createList,
  getBoardLists,
  updateList,
} from '../../../../../services/list';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function BoardDetailScreen() {
  const { workspaceId, boardId } = useLocalSearchParams();

  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isCreateDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [isBoardMenuVisible, setBoardMenuVisible] = useState(false);
  const [isEditBoardVisible, setEditBoardVisible] = useState(false);
  const [isListMenuVisible, setListMenuVisible] = useState(false);
  const [isEditListVisible, setEditListVisible] = useState(false);
  const [isMembersDrawerVisible, setMembersDrawerVisible] = useState(false);

  const [newListName, setNewListName] = useState('');
  const [editedBoardName, setEditedBoardName] = useState('');
  const [editedBoardDesc, setEditedBoardDesc] = useState('');
  const [editedListName, setEditedListName] = useState('');
  const [selectedList, setSelectedList] = useState(null);
  const [creating, setCreating] = useState(false);

  const loadBoardData = useCallback(async () => {
    if (!boardId) return;

    setLoading(true);
    const [boardResponse, listsResponse, membersResponse] = await Promise.all([
      getBoard(boardId),
      getBoardLists(boardId),
      getBoardMembers(boardId),
    ]);

    if (boardResponse.success) setBoard(boardResponse.data);
    if (listsResponse.success) setLists(listsResponse.data);
    if (membersResponse.success) setMembers(membersResponse.data);

    if (!boardResponse.success || !listsResponse.success || !membersResponse.success) {
      Alert.alert('Error', 'Failed to load board data');
    }

    setLoading(false);
  }, [boardId]);

  useEffect(() => {
    loadBoardData();
  }, [loadBoardData]);

  const handleCreateList = async () => {
    const nameCheck = required(newListName, 'List name');
    if (!nameCheck.valid) {
      Alert.alert('Error', nameCheck.error);
      return;
    }

    setCreating(true);
    const response = await createList(boardId, newListName.trim());

    if (response.success) {
      setNewListName('');
      setCreateDrawerVisible(false);
      await loadBoardData();
    } else {
      Alert.alert('Error', response.error || 'Failed to create list');
    }

    setCreating(false);
  };

  const handleUpdateBoard = async () => {
    const nameCheck = required(editedBoardName, 'Board name');
    if (!nameCheck.valid) {
      Alert.alert('Error', nameCheck.error);
      return;
    }

    const nameResponse = await updateBoardName(boardId, editedBoardName.trim());
    const descResponse =
      editedBoardDesc.trim() !== (board?.desc || '')
        ? await updateBoardDescription(boardId, editedBoardDesc.trim())
        : { success: true };

    if (nameResponse.success && descResponse.success) {
      setEditBoardVisible(false);
      await loadBoardData();
    } else {
      Alert.alert('Error', nameResponse.error || descResponse.error || 'Failed to update board');
    }
  };

  const handleArchiveBoard = () => {
    Alert.alert(
      'Archive Board',
      'Are you sure you want to archive this board? This will archive all lists and cards.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            const response = await archiveBoard(boardId);
            if (response.success) {
              router.back();
            } else {
              Alert.alert('Error', response.error || 'Failed to archive board');
            }
          },
        },
      ]
    );
  };

  const handleUpdateList = async (listId, newName) => {
    const nameCheck = required(newName, 'List name');
    if (!nameCheck.valid) {
      Alert.alert('Error', nameCheck.error);
      return;
    }

    const response = await updateList(listId, { name: newName.trim() });
    if (response.success) {
      await loadBoardData();
    } else {
      Alert.alert('Error', response.error || 'Failed to update list');
    }
  };

  const handleArchiveList = (listId) => {
    Alert.alert(
      'Archive List',
      'Are you sure you want to archive this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            const response = await archiveList(listId);
            if (response.success) {
              await loadBoardData();
            } else {
              Alert.alert('Error', response.error || 'Failed to archive list');
            }
          },
        },
      ]
    );
  };

  const handleOpenListMenu = (list) => {
    setSelectedList(list);
    setListMenuVisible(true);
  };

  const handleOpenEditList = () => {
    setEditedListName(selectedList?.name || '');
    setListMenuVisible(false);
    setEditListVisible(true);
  };

  const handleSaveListEdit = async () => {
    if (!selectedList) return;
    await handleUpdateList(selectedList.id, editedListName.trim());
    setEditListVisible(false);
    setSelectedList(null);
  };

  const handleArchiveSelectedList = () => {
    setListMenuVisible(false);
    if (selectedList) {
      handleArchiveList(selectedList.id);
    }
  };

  const handleOpenEditBoard = () => {
    setEditedBoardName(board?.name || '');
    setEditedBoardDesc(board?.desc || '');
    setBoardMenuVisible(false);
    setEditBoardVisible(true);
  };

  const handleOpenManageMembers = () => {
    setBoardMenuVisible(false);
    setMembersDrawerVisible(true);
  };

  const handleMembersUpdated = async () => {
    const response = await getBoardMembers(boardId);
    if (response.success) {
      setMembers(response.data);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#1a1a1a] items-center justify-center">
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  const backgroundColor = board?.prefs?.backgroundColor || '#0079BF';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor }} edges={['top']}>
      <Stack.Screen options={{ headerShown: false }} />

      <BoardDetailHeader
        boardName={board?.name}
        onBack={() => router.back()}
        onOpenMenu={() => setBoardMenuVisible(true)}
        onCreateList={() => setCreateDrawerVisible(true)}
      />

      <View className="flex-1">
        <BoardMembersBar
          members={members}
          backgroundColor={backgroundColor}
        />

        {lists.length > 0 ? (
          <ListCarousel
            lists={lists}
            currentIndex={currentIndex}
            onIndexChange={setCurrentIndex}
            onOpenListMenu={handleOpenListMenu}
            screenWidth={SCREEN_WIDTH}
            workspaceId={workspaceId}
            boardId={board?.id}
          />
        ) : (
          <EmptyListsState
            onCreateList={() => setCreateDrawerVisible(true)}
          />
        )}
      </View>

      <BoardMenuDrawer
        visible={isBoardMenuVisible}
        onClose={() => setBoardMenuVisible(false)}
        onEditBoard={handleOpenEditBoard}
        onManageMembers={handleOpenManageMembers}
        onArchiveBoard={() => {
          setBoardMenuVisible(false);
          handleArchiveBoard();
        }}
      />

      <EditBoardDrawer
        visible={isEditBoardVisible}
        boardName={editedBoardName}
        boardDescription={editedBoardDesc}
        onBoardNameChange={setEditedBoardName}
        onBoardDescriptionChange={setEditedBoardDesc}
        onClose={() => setEditBoardVisible(false)}
        onSave={handleUpdateBoard}
      />

      <CreateListDrawer
        visible={isCreateDrawerVisible}
        listName={newListName}
        creating={creating}
        onListNameChange={setNewListName}
        onClose={() => {
          setCreateDrawerVisible(false);
          setNewListName('');
        }}
        onCreate={handleCreateList}
      />

      <ListMenuDrawer
        visible={isListMenuVisible}
        onClose={() => setListMenuVisible(false)}
        onEditList={handleOpenEditList}
        onArchiveList={handleArchiveSelectedList}
      />

      <EditListDrawer
        visible={isEditListVisible}
        listName={editedListName}
        onListNameChange={setEditedListName}
        onClose={() => setEditListVisible(false)}
        onSave={handleSaveListEdit}
      />

      <AddMembersDrawer
        visible={isMembersDrawerVisible}
        onClose={() => setMembersDrawerVisible(false)}
        instanceType="board"
        instanceId={boardId}
        onMembersUpdated={handleMembersUpdated}
      />
    </SafeAreaView>
  );
}
