/**
 * Screen to create Trello board from markdown
 * 
 * Navigate to this screen to run the board creation script
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, TextInput } from 'react-native';
import { Clipboard } from 'react-native';
import { createBoardFromMarkdown } from '../utils/boardFromMarkdown';
import { TRELLO_PLANNING_PROMPT } from '../utils/getPlanningPrompt';

// %%%%%%%% CREATE BOARD SCREEN %%%%%%%

export default function CreateBoardScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [markdownContent, setMarkdownContent] = useState('');

  const handleCreateBoard = async () => {
    if (!markdownContent.trim()) {
      Alert.alert(
      'Markdown Content Required',
      'Please paste your Trello board organization markdown content in the text area above. You can generate this using the AI prompt button above.',
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
          Create and manage your Trello board from a markdown file.
          {'\n\n'}The script will:
          {'\n'}• Find or create your organization and board
          {'\n'}• Use existing lists or create missing ones
          {'\n'}• Create missing labels if needed
          {'\n'}• Create/update all cards with checklists, labels, and assignments
          {'\n'}• Update existing cards without creating duplicates
        </Text>

        <View className="bg-gray-700 rounded-lg p-4 mb-4">
          <Text className="text-white font-semibold mb-2">
            Need to generate markdown from your project spec?
          </Text>
          <Text className="text-gray-300 text-sm mb-3">
            Copy the AI prompt below, paste it into your AI assistant along with your project specification, and get a complete Trello board organization markdown.
          </Text>
          <TouchableOpacity
            onPress={async () => {
              try {
                Clipboard.setString(TRELLO_PLANNING_PROMPT);
                Alert.alert('Copied!', 'The AI prompt has been copied to your clipboard. Paste it into your AI assistant along with your project specification.');
              } catch (error) {
                Alert.alert('Error', 'Failed to copy prompt');
              }
            }}
            className="bg-purple-600 rounded-lg p-3 items-center"
          >
            <Text className="text-white font-semibold">
              📋 Copy AI Prompt for Markdown Generation
            </Text>
          </TouchableOpacity>
        </View>

        <Text className="text-gray-300 text-sm mb-2 font-semibold">
          Paste your Trello board organization markdown content:
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


