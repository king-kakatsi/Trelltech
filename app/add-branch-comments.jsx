/**
 * Screen to add branch comments and resource cards
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { addBranchCommentsToBoard, removeEmojisFromComments } from '../utils/addBranchComments';
import { addResourceCards } from '../utils/addResourceCards';
import { getWorkspaceBoards } from '../services/boardService';
import { getAllWorkspaces } from '../services/workspaces';

// %%%%%%%% ADD BRANCH COMMENTS SCREEN %%%%%%%

export default function AddBranchCommentsScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [boardId, setBoardId] = useState(params.boardId || null);

  const handleAddBranchComments = async () => {
    if (!boardId) {
      Alert.alert('Error', 'Board ID is required. Please provide it in the route params.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await addBranchCommentsToBoard(boardId, false, true); // Don't skip Week 1, update existing
      setResult(result);

      if (result.success) {
        const summary = [
          `✓ Success!`,
          `\nNew comments: ${result.commentedCards || 0} cards`,
          `Updated comments: ${result.updatedCards || 0} cards`,
          `Total processed: ${result.totalCards || 0} cards`,
        ].join('\n');
        Alert.alert('Success!', summary, [{ text: 'OK' }]);
      } else {
        Alert.alert('Error', result.error || 'Failed to add comments');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddResourceCards = async () => {
    if (!boardId) {
      Alert.alert('Error', 'Board ID is required. Please provide it in the route params.');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await addResourceCards(boardId);
      setResult(result);

      if (result.success) {
        Alert.alert(
          'Success!',
          'Resource cards created successfully!',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create cards');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFindBoard = async () => {
    try {
      setLoading(true);
      const [success, workspaces] = await getAllWorkspaces();
      
      if (success && workspaces) {
        const starinx = workspaces.find(ws => 
          ws.displayName?.toLowerCase() === 'starinx' || 
          ws.name?.toLowerCase() === 'starinx'
        );
        
        if (starinx) {
          const boards = await getWorkspaceBoards(starinx.id);
          const rosey = boards.find(b => 
            b.name?.toLowerCase() === 'rosey' && !b.closed
          );
          
          if (rosey) {
            setBoardId(rosey.id);
            Alert.alert('Success', `Found board: ${rosey.name} (${rosey.id})`);
          } else {
            Alert.alert('Error', 'Rosey board not found');
          }
        } else {
          Alert.alert('Error', 'Starinx organization not found');
        }
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      <View className="bg-gray-800 rounded-lg p-6 mb-4">
        <Text className="text-white text-2xl font-bold mb-2">
          Add Branch Comments & Resources
        </Text>
        <Text className="text-gray-400 text-sm mb-4">
          This will:
          {'\n'}• Add branch name comments to all cards (except Week 1)
          {'\n'}• Create two resource cards in Ressources list
        </Text>

        {!boardId && (
          <TouchableOpacity
            onPress={handleFindBoard}
            disabled={loading}
            className="bg-green-600 rounded-lg p-3 mb-4 items-center"
          >
            <Text className="text-white font-semibold">Find Rosey Board</Text>
          </TouchableOpacity>
        )}

        {boardId && (
          <View className="bg-gray-700 rounded-lg p-3 mb-4">
            <Text className="text-gray-300 text-sm">Board ID: {boardId}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={handleAddBranchComments}
          disabled={loading || !boardId}
          className={`bg-blue-600 rounded-lg p-4 items-center mb-3 ${
            loading || !boardId ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-semibold">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Add Branch Comments
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleAddResourceCards}
          disabled={loading || !boardId}
          className={`bg-purple-600 rounded-lg p-4 items-center mb-3 ${
            loading || !boardId ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-semibold">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Add Resource Cards
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={async () => {
            if (!boardId) {
              Alert.alert('Error', 'Board ID is required.');
              return;
            }
            setLoading(true);
            setResult(null);
            try {
              const result = await removeEmojisFromComments(boardId);
              setResult(result);
              if (result.success) {
                Alert.alert('Success', `Removed emojis from ${result.updatedCards} comments!`);
              } else {
                Alert.alert('Error', result.error || 'Failed');
              }
            } catch (error) {
              Alert.alert('Error', error.message);
              setResult({ success: false, error: error.message });
            } finally {
              setLoading(false);
            }
          }}
          disabled={loading || !boardId}
          className={`bg-orange-600 rounded-lg p-4 items-center ${
            loading || !boardId ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-semibold">Processing...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Remove Emojis from Comments
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View className="bg-gray-800 rounded-lg p-4">
          <Text className="text-white font-semibold mb-2">Result:</Text>
          {result.success ? (
            <View>
              <Text className="text-green-400 mb-2">✓ Success!</Text>
              {result.commentedCards !== undefined && (
                <Text className="text-gray-300 text-sm">
                  New comments: {result.commentedCards} cards
                </Text>
              )}
              {result.updatedCards !== undefined && (
                <Text className="text-gray-300 text-sm">
                  Updated comments: {result.updatedCards} cards
                </Text>
              )}
              {result.skippedCards !== undefined && (
                <Text className="text-gray-300 text-sm">
                  Skipped: {result.skippedCards} cards
                </Text>
              )}
              {result.cards && (
                <Text className="text-gray-300 text-sm">
                  Created: {result.cards.length} resource cards
                </Text>
              )}
            </View>
          ) : (
            <Text className="text-red-400">✗ {result.error || 'Failed'}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// %%%%%%%% END - ADD BRANCH COMMENTS SCREEN %%%%%%%

