import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import BoardCard from './BoardCard';
import EmptyBoardsState from './EmptyBoardsState';

export default function BoardsList({
  boards,
  searchQuery,
  onSearchChange,
  isAscending,
  onToggleSort,
  onBoardPress,
  refreshing,
  onRefresh,
  onCreateBoard
}) {
  return (
    <View className="flex-1">
      <View className="px-4 pb-4 border-b border-neutral-800">
        <View className="flex-row items-center space-x-2">
          <View className="flex-1 bg-neutral-800 rounded-lg flex-row items-center px-3 py-2">
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              className="flex-1 ml-2 text-white text-base"
              placeholder="Search boards..."
              placeholderTextColor="#6b7280"
              value={searchQuery}
              onChangeText={onSearchChange}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => onSearchChange('')}>
                <Ionicons name="close-circle" size={20} color="#6b7280" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            onPress={onToggleSort}
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
          {boards.length} {boards.length === 1 ? 'board' : 'boards'}
        </Text>
      </View>

      {boards.length === 0 ? (
        <EmptyBoardsState
          searchQuery={searchQuery}
          onCreateBoard={onCreateBoard}
        />
      ) : (
        <FlatList
          data={boards}
          renderItem={({ item }) => (
            <BoardCard board={item} onPress={onBoardPress} />
          )}
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