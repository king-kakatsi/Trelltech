/**
 * Screen to create Trello board from markdown
 * 
 * Navigate to this screen to run the board creation script
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, TextInput } from 'react-native';
import { createBoardFromMarkdown } from '../utils/boardFromMarkdown';

// %%%%%%%% CREATE BOARD SCREEN %%%%%%%

export default function CreateBoardScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');

  const handleCreateBoard = async () => {
    if (!markdownContent.trim()) {
      Alert.alert(
        'Markdown Content Required',
        'Please paste the content of TRELLO_BOARD_ORGANIZATION.md in the text area above, or provide it programmatically.',
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
          `Cards created successfully in board "${result.board.name}"!\n\nBoard URL: ${result.boardUrl}`,
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to create cards');
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
          Create Cards from Markdown
        </Text>
        <Text className="text-gray-400 text-sm mb-4">
          This will add all cards from TRELLO_BOARD_ORGANIZATION.md to your existing Trello board.
          {'\n\n'}The script will:
          {'\n'}• Find your existing organization and board
          {'\n'}• Use existing lists
          {'\n'}• Create missing labels if needed
          {'\n'}• Create all cards with checklists, labels, and assignments
        </Text>

        <Text className="text-gray-300 text-sm mb-2 font-semibold">
          Paste TRELLO_BOARD_ORGANIZATION.md content:
        </Text>
        <TextInput
          value={markdownContent}
          onChangeText={setMarkdownContent}
          placeholder="Paste markdown content here..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={10}
          className="bg-gray-700 text-white p-3 rounded-lg mb-4"
          style={{ minHeight: 200, textAlignVertical: 'top' }}
        />

        <TouchableOpacity
          onPress={handleCreateBoard}
          disabled={loading || !markdownContent.trim()}
          className={`bg-blue-600 rounded-lg p-4 items-center ${
            loading || !markdownContent.trim() ? 'opacity-50' : ''
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <ActivityIndicator color="white" className="mr-2" />
              <Text className="text-white font-semibold">Creating Cards...</Text>
            </View>
          ) : (
            <Text className="text-white font-semibold text-lg">
              Create Cards in Board
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {result && (
        <View className="bg-gray-800 rounded-lg p-4">
          <Text className="text-white font-semibold mb-2">Result:</Text>
          {result.success ? (
            <View>
              <Text className="text-green-400 mb-2">✓ Cards created successfully!</Text>
              <Text className="text-gray-300 text-sm">
                Board: {result.board?.name}
              </Text>
              <Text className="text-gray-300 text-sm">
                URL: {result.boardUrl}
              </Text>
            </View>
          ) : (
            <Text className="text-red-400">✗ {result.error || 'Failed to create cards'}</Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// %%%%%%%% END - CREATE BOARD SCREEN %%%%%%%


