/**
 * Component to create Trello board from markdown file
 * 
 * This component provides a UI to trigger the board creation from TRELLO_BOARD_ORGANIZATION.md
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { createBoardFromMarkdown } from '../../utils/boardFromMarkdown';

// %%%%%%%% CREATE BOARD FROM MARKDOWN COMPONENT %%%%%%%

export default function CreateBoardFromMarkdown() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [markdownContent, setMarkdownContent] = useState(null);
  const [loadingFile, setLoadingFile] = useState(true);

  // Try to load markdown file on mount
  useEffect(() => {
    loadMarkdownFile();
  }, []);

  const loadMarkdownFile = async () => {
    try {
      // Note: In React Native, you'll need to either:
      // 1. Bundle the file as an asset and import it
      // 2. Store it in AsyncStorage
      // 3. Fetch it from a server
      // For now, we'll show an error if it can't be loaded
      setLoadingFile(false);
    } catch (error) {
      console.error('Error loading markdown file:', error);
      setLoadingFile(false);
    }
  };

  const handleCreateBoard = async () => {
    if (!markdownContent) {
      Alert.alert(
        'Markdown Content Required',
        'Please provide the content of TRELLO_BOARD_ORGANIZATION.md. You can:\n\n1. Copy the file content and pass it to createBoardFromMarkdown(content)\n2. Or import the file as a text asset in your app.',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const result = await createBoardFromMarkdown(markdownContent);
      setResult(result);

      if (result.success) {
        Alert.alert(
          'Success!',
          `Board "${result.board.name}" created successfully!\n\nBoard URL: ${result.boardUrl}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create board');
      }
    } catch (error) {
      console.error('Error creating board:', error);
      Alert.alert('Error', error.message || 'An unexpected error occurred');
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-900 p-4">
      <View className="bg-gray-800 rounded-lg p-6 mb-4">
        <Text className="text-white text-2xl font-bold mb-2">
          Create Board from Markdown
        </Text>
        <Text className="text-gray-400 text-sm mb-4">
          This will create a Trello board based on the structure defined in TRELLO_BOARD_ORGANIZATION.md
        </Text>

        <TouchableOpacity
          onPress={handleCreateBoard}
          disabled={loading}
          className={`bg-blue-600 rounded-lg p-4 items-center ${
            loading ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-semibold">Creating Board...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Create Board
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View className="bg-gray-800 rounded-lg p-4">
          <Text className="text-white font-semibold mb-2">Result:</Text>
          {result.success ? (
            <View>
              <Text className="text-green-400 mb-2">✓ Board created successfully!</Text>
              <Text className="text-gray-300 text-sm">
                Board: {result.board?.name}
              </Text>
              <Text className="text-gray-300 text-sm">
                URL: {result.boardUrl}
              </Text>
            </View>
          ) : (
            <Text className="text-red-400">✗ {result.error || 'Failed to create board'}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// %%%%%%%% END - CREATE BOARD FROM MARKDOWN COMPONENT %%%%%%%

