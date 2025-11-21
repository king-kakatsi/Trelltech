import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
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
import {
  archiveBoard,
  archiveList,
  createList,
  getBoardDetails,
  getBoardLists,
  getBoardMembers,
  updateBoardDescription,
  updateBoardName,
  updateList
} from '../../../../../services/boardService';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

  useEffect(() => {
    loadBoardData();
  }, [boardId]);
  
  const loadBoardData = async () => {
    try {
      setLoading(true);
      const [boardData, listsData, membersData] = await Promise.all([
        getBoardDetails(boardId),
        getBoardLists(boardId),
        getBoardMembers(boardId)
      ]);
      setBoard(boardData);
      setLists(listsData);
      setMembers(membersData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateList = async () => {
    if (!newListName.trim()) {
      Alert.alert('Error', 'List name cannot be empty');
      return;
    }

    try {
      setCreating(true);
      await createList(boardId, newListName.trim());
      setNewListName('');
      setCreateDrawerVisible(false);
      await loadBoardData();
    } catch (error) {
      Alert.alert('Error', 'Failed to create list');
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateBoard = async () => {
    if (!editedBoardName.trim()) {
      Alert.alert('Error', 'Board name cannot be empty');
      return;
    }

    try {
      await Promise.all([
        updateBoardName(boardId, editedBoardName.trim()),
        editedBoardDesc.trim() !== board?.desc 
          ? updateBoardDescription(boardId, editedBoardDesc.trim())
          : Promise.resolve()
      ]);
      setEditBoardVisible(false);
      await loadBoardData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update board');
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
            try {
              await archiveBoard(boardId);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to archive board');
            }
          },
        },
      ]
    );
  };

  const handleUpdateList = async (listId, newName) => {
    try {
      await updateList(listId, newName);
      await loadBoardData();
    } catch (error) {
      Alert.alert('Error', 'Failed to update list');
    }
  };

  const handleArchiveList = async (listId) => {
    Alert.alert(
      'Archive List',
      'Are you sure you want to archive this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveList(listId);
              await loadBoardData();
            } catch (error) {
              Alert.alert('Error', 'Failed to archive list');
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
    if (!editedListName.trim()) {
      Alert.alert('Error', 'List name cannot be empty');
      return;
    }
    
    try {
      await handleUpdateList(selectedList.id, editedListName.trim());
      setEditListVisible(false);
      setSelectedList(null);
    } catch (error) {
      // Error already handled in handleUpdateList
    }
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
    // Refresh members list after changes
    try {
      const membersData = await getBoardMembers(boardId);
      setMembers(membersData);
    } catch (error) {
      console.error('Error refreshing members:', error);
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
        backgroundColor={backgroundColor}
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
            screenHeight={SCREEN_HEIGHT}
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