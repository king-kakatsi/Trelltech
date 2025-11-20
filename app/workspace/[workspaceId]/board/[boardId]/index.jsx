import BottomDrawer from '../../../../../components/ui/BottomDrawer';

import { View, Text, Pressable, ActivityIndicator, Alert, Dimensions, TextInput, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useState, useEffect } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Carousel from 'react-native-reanimated-carousel';
import { 
  getBoardDetails, 
  getBoardLists,
  getBoardMembers,
  createList, 
  updateList, 
  archiveList,
  updateBoardName,
  updateBoardDescription,
  archiveBoard 
} from '../../../../../services/boardService';
import KanbanView from '../../../../../components/Kanban';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BoardDetailScreen() {
  const { workspaceId, boardId } = useLocalSearchParams();
  
  const [board, setBoard] = useState(null);
  const [lists, setLists] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [isBoardMenuVisible, setBoardMenuVisible] = useState(false);
  const [isEditBoardVisible, setEditBoardVisible] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [editedBoardName, setEditedBoardName] = useState('');
  const [editedBoardDesc, setEditedBoardDesc] = useState('');
  const [creating, setCreating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListMenuVisible, setListMenuVisible] = useState(false);
  const [isEditListVisible, setEditListVisible] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [editedListName, setEditedListName] = useState('');

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
      // Error already handled
    }
  };


  const handleArchiveSelectedList = () => {
    setListMenuVisible(false);
    if (selectedList) {
      handleArchiveList(selectedList.id);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-[#1a1a1a] items-center justify-center">
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  const backgroundColor = board?.prefs?.backgroundColor || '#0079BF';

  return (
    <View className="flex-1" style={{ backgroundColor }}>
      <Stack.Screen 
        options={{
          headerShown: true,
          headerTransparent: true,
          headerStyle: { backgroundColor: 'transparent' },
          headerTintColor: '#fff',
          headerTitle: '',
          headerRight: () => (
            <View className="flex-row gap-2 mr-4">
              <Pressable
                onPress={() => setBoardMenuVisible(true)}
                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
              >
                <Ionicons name="ellipsis-horizontal" size={20} color="#fff" />
              </Pressable>
              <Pressable
                onPress={() => setCreateDrawerVisible(true)}
                className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
              >
                <Ionicons name="add" size={24} color="#fff" />
              </Pressable>
            </View>
          ),
        }}
      />

      <SafeAreaView 
        className="flex-1" 
        edges={['top', 'left', 'right']}
        style={{ backgroundColor: 'transparent' }}
      >
        <View className="flex-1">
          {/* Board Header */}
          <View className="px-4 py-3">
            <Text className="text-white text-2xl font-bold mb-2">
              {board?.name}
            </Text>
            
            {/* Members Row */}
            <View className="flex-row items-center gap-2">
              <View className="flex-row">
                {members.slice(0, 4).map((member, index) => (
                  <View
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-white items-center justify-center border-2"
                    style={{ 
                      borderColor: backgroundColor,
                      marginLeft: index > 0 ? -8 : 0,
                      zIndex: members.length - index
                    }}
                  >
                    <Text className="text-gray-900 text-xs font-semibold">
                      {member.initials}
                    </Text>
                  </View>
                ))}
                {members.length > 4 && (
                  <View
                    className="w-8 h-8 rounded-full bg-white/30 items-center justify-center border-2"
                    style={{ 
                      borderColor: backgroundColor,
                      marginLeft: -8,
                      zIndex: 0
                    }}
                  >
                    <Text className="text-white text-xs font-semibold">
                      +{members.length - 4}
                    </Text>
                  </View>
                )}
              </View>
              
              <Text className="text-white/70 text-sm ml-2">
                {members.length} {members.length === 1 ? 'member' : 'members'}
              </Text>
            </View>
          </View>

          {/* Pagination Indicator */}
          {lists.length > 0 && (
            <View className="flex-row justify-center items-center py-3 gap-2">
              {lists.map((_, index) => (
                <View
                  key={index}
                  style={{
                    height: 8,
                    borderRadius: 4,
                    width: index === currentIndex ? 32 : 8,
                    backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)'
                  }}
                />
              ))}
            </View>
          )}

          {/* Carousel */}
          {lists.length > 0 ? (
            <View className="flex-1 py-2">
              <Carousel
                width={SCREEN_WIDTH}
                height={SCREEN_HEIGHT - 260}
                data={lists}
                onSnapToItem={setCurrentIndex}
                renderItem={({ item }) => (
                  <View className="flex-1 px-4">
                    <KanbanView
                      listId={item?.id}
                      onOpenMenu={handleOpenListMenu}
                    />
                  </View>
                )}
              />
            </View>
          ) : (
            <View className="flex-1 items-center justify-center px-8">
              <View className="bg-white/10 rounded-full p-6 mb-4">
                <Ionicons name="list-outline" size={64} color="white" />
              </View>
              <Text className="text-white text-center text-lg font-semibold mb-2">
                No lists yet
              </Text>
              <Text className="text-white/70 text-center mb-6">
                Create your first list to get started
              </Text>
              <Pressable
                onPress={() => setCreateDrawerVisible(true)}
                className="bg-white px-6 py-3 rounded-xl"
              >
                <Text className="text-gray-900 font-semibold">
                  Create First List
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>

      {/* Board Menu Drawer */}
      <BottomDrawer visible={isBoardMenuVisible} onClose={() => setBoardMenuVisible(false)}>
        <Text className="text-xl font-bold text-white mb-4">
          Board Actions
        </Text>

        <Pressable
          onPress={() => {
            setEditedBoardName(board?.name || '');
            setEditedBoardDesc(board?.desc || '');
            setBoardMenuVisible(false);
            setEditBoardVisible(true);
          }}
          className="flex-row items-center py-4 border-b border-gray-700"
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
          <Text className="text-white text-base ml-3">Edit Board Details</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            setBoardMenuVisible(false);
            handleArchiveBoard();
          }}
          className="flex-row items-center py-4"
        >
          <Ionicons name="archive-outline" size={24} color="#EB5A46" />
          <Text className="text-[#EB5A46] text-base ml-3">Archive Board</Text>
        </Pressable>
      </BottomDrawer>

      {/* Edit Board Drawer */}
      <BottomDrawer visible={isEditBoardVisible} onClose={() => setEditBoardVisible(false)}>
        <Text className="text-2xl font-bold text-white mb-6">
          Edit Board Details
        </Text>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Board Name
            </Text>
            <TextInput
              value={editedBoardName}
              onChangeText={setEditedBoardName}
              placeholder="Board name"
              placeholderTextColor="#6B778C"
              className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
            />
          </View>

          <View className="mb-6">
            <Text className="text-sm font-semibold text-gray-400 mb-2">
              Description
            </Text>
            <TextInput
              value={editedBoardDesc}
              onChangeText={setEditedBoardDesc}
              placeholder="Add board description"
              placeholderTextColor="#6B778C"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base min-h-[100px]"
            />
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={() => setEditBoardVisible(false)}
              className="flex-1 bg-[#1a1a1a] py-4 rounded-xl"
            >
              <Text className="text-white text-center font-semibold text-base">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleUpdateBoard}
              className="flex-1 bg-white py-4 rounded-xl"
            >
              <Text className="text-gray-900 text-center font-semibold text-base">
                Save
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </BottomDrawer>

      {/* Create List Drawer - same as before */}
      <BottomDrawer 
        visible={isCreateDrawerVisible} 
        onClose={() => {
          setCreateDrawerVisible(false);
          setNewListName('');
        }}
      >
        <Text className="text-2xl font-bold text-white mb-6">
          Create New List
        </Text>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            List Name
          </Text>
          <TextInput
            value={newListName}
            onChangeText={setNewListName}
            placeholder="Enter list name"
            placeholderTextColor="#6B778C"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
            autoFocus
          />
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => {
              setCreateDrawerVisible(false);
              setNewListName('');
            }}
            disabled={creating}
            className="flex-1 bg-[#1a1a1a] py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-base">
              Cancel
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCreateList}
            disabled={creating}
            className="flex-1 bg-white py-4 rounded-xl"
          >
            <Text className="text-gray-900 text-center font-semibold text-base">
              {creating ? 'Creating...' : 'Create'}
            </Text>
          </Pressable>
        </View>
      </BottomDrawer>

      {/* List Menu Drawer */}
      <BottomDrawer visible={isListMenuVisible} onClose={() => setListMenuVisible(false)}>
        <Text className="text-xl font-bold text-white mb-4">
          List Actions
        </Text>

        <Pressable
          onPress={handleOpenEditList}
          className="flex-row items-center py-4 border-b border-gray-700"
        >
          <Ionicons name="create-outline" size={24} color="#fff" />
          <Text className="text-white text-base ml-3">Edit Name</Text>
        </Pressable>

        <Pressable
          onPress={handleArchiveSelectedList}
          className="flex-row items-center py-4"
        >
          <Ionicons name="archive-outline" size={24} color="#EB5A46" />
          <Text className="text-[#EB5A46] text-base ml-3">Archive List</Text>
        </Pressable>
      </BottomDrawer>

      {/* Edit List Name Drawer */}
      <BottomDrawer visible={isEditListVisible} onClose={() => setEditListVisible(false)}>
        <Text className="text-2xl font-bold text-white mb-6">
          Edit List Name
        </Text>

        <View className="mb-6">
          <TextInput
            value={editedListName}
            onChangeText={setEditedListName}
            placeholder="List name"
            placeholderTextColor="#6B778C"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
            autoFocus
          />
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => setEditListVisible(false)}
            className="flex-1 bg-[#1a1a1a] py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-base">
              Cancel
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSaveListEdit}
            className="flex-1 bg-white py-4 rounded-xl"
          >
            <Text className="text-gray-900 text-center font-semibold text-base">
              Save
            </Text>
          </Pressable>
        </View>
      </BottomDrawer>
    </View>
  );
}