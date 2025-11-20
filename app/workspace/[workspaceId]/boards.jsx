import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { getWorkspaceBoards } from '../../../services/boardService';

export default function WorkspaceBoardsScreen() {
  const { workspaceId, workspaceName } = useLocalSearchParams();
  const router = useRouter();
  
  const [boards, setBoards] = useState([]);
  const [filteredBoards, setFilteredBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAscending, setIsAscending] = useState(true);

  useEffect(() => {
    fetchBoards();
  }, []);

  useEffect(() => {
    const filterBoards = () => {
      let filtered = [...boards];
      if (searchQuery.trim()) {
        filtered = filtered.filter(board =>
          board.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      if (!isAscending) filtered = filtered.reverse();
      setFilteredBoards(filtered);
    };

    filterBoards();
  }, [searchQuery, boards, isAscending]);

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

  const getBackgroundColor = (color) => {
    const colorMap = {
      'blue': '#0079BF',
      'orange': '#D29034',
      'green': '#519839',
      'red': '#B04632',
      'purple': '#89609E',
      'pink': '#CD5A91',
      'lime': '#4BBF6B',
      'sky': '#00AECC',
      'grey': '#838C91'
    };
    
    return colorMap[color] || color || '#0079BF';
  };

  const getInitialsColor = (index) => {
    const colors = [
      '#0079BF', '#D29034', '#519839', '#B04632', 
      '#89609E', '#CD5A91', '#4BBF6B', '#00AECC'
    ];
    return colors[index % colors.length];
  };

  const renderMemberChip = (member, index) => (
    <View
      key={member.id}
      style={{ backgroundColor: getInitialsColor(index) }}
      className="w-8 h-8 rounded-full justify-center items-center mr-2"
    >
      <Text className="text-white text-xs font-bold">
        {member.initials || member.fullName.substring(0, 2).toUpperCase()}
      </Text>
    </View>
  );

  const renderBoardCard = ({ item }) => {
    const bgColor = getBackgroundColor(item.backgroundColor);
    const hasMembers = item.members && item.members.length > 0;
    const displayMembers = item.members?.slice(0, 5) || [];
    const remainingCount = item.memberCount - displayMembers.length;
    
    return (
      <TouchableOpacity
        onPress={() => handleBoardPress(item.id, item.name)}
        className="bg-neutral-800 rounded-lg mb-3 border border-neutral-700 overflow-hidden"
        activeOpacity={0.7}
      >
        <View 
          style={{ backgroundColor: bgColor }}
          className="h-2 w-full"
        />
        
        <View className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <Text className="text-white text-lg font-semibold flex-1 mr-2">
              {item.name}
            </Text>
            
            {item.memberCount > 0 && (
              <View className="flex-row items-center bg-neutral-700 rounded-full px-2 py-1">
                <Ionicons name="people" size={14} color="#9ca3af" />
                <Text className="text-neutral-400 text-xs ml-1 font-medium">
                  {item.memberCount}
                </Text>
              </View>
            )}
          </View>
          
          {item.desc && (
            <Text
              className="text-neutral-400 text-sm mb-3"
              numberOfLines={2}
            >
              {item.desc}
            </Text>
          )}

          {hasMembers && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingRight: 16 }}
            >
              <View className="flex-row items-center">
                {displayMembers.map((member, index) => renderMemberChip(member, index))}
                
                {remainingCount > 0 && (
                  <View className="w-8 h-8 rounded-full bg-neutral-700 justify-center items-center">
                    <Text className="text-neutral-400 text-xs font-bold">
                      +{remainingCount}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 bg-neutral-900 justify-center items-center">
        <Stack.Screen
          options={{
            title: workspaceName || 'Boards',
            headerStyle: { backgroundColor: '#171717' },
            headerTintColor: '#fff'
          }}
        />
        <ActivityIndicator size="large" color="#0079BF" />
        <Text className="text-neutral-400 mt-4">Loading boards...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 pt-10 bg-neutral-900">
      <Stack.Screen
        options={{
          title: workspaceName || 'Boards',
          headerStyle: { backgroundColor: '#171717' },
          headerTintColor: '#fff'
        }}
      />

      <View className="p-4 border-b border-neutral-800">
        <View className="flex-row items-center space-x-2">
          <View className="flex-1 bg-neutral-800 rounded-lg flex-row items-center px-3 py-2">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-white text-base"
              placeholder="Search boards..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={toggleSortOrder}
            className="bg-neutral-800 rounded-lg p-3 border border-neutral-700"
            activeOpacity={0.7}
          >
            <Ionicons
              name={isAscending ? 'arrow-down' : 'arrow-up'}
              size={20}
              color="#0079BF"
            />
          </TouchableOpacity>
        </View>

        <Text className="text-neutral-500 text-sm mt-3">
          {filteredBoards.length} {filteredBoards.length === 1 ? 'board' : 'boards'}
        </Text>
      </View>

      {filteredBoards.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <Ionicons name="folder-open-outline" size={64} color="#4b5563" />
          <Text className="text-neutral-400 text-center mt-4 text-base">
            {searchQuery.trim()
              ? 'No boards found matching your search'
              : 'No boards in this workspace'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBoards}
          renderItem={renderBoardCard}
          keyExtractor={item => item.id}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#0079BF"
            />
          }
        />
      )}
    </View>
  );
}