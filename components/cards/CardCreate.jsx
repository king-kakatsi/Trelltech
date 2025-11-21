import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { createCard } from '../../services/trello';
import { useAuth } from '../../contexts/AuthContext';

export default function CardCreate({ listId, onSuccess }) {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    setLoading(true);
    try {
      const newCard = await createCard(listId, token, { name: name.trim(), desc: desc.trim() });
      if (newCard) {
        onSuccess?.(newCard);
        setName('');
        setDesc('');
      }
    } catch (error) {
      console.error('Error creating card:', error);
      Alert.alert('Error', 'Failed to create card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="bg-[#1a1a1a] p-4 rounded-lg shadow mb-4">
      <Text className="text-white font-semibold mb-2">Create New Card</Text>

      <Text className="text-gray-300 mb-1">Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Card name"
        placeholderTextColor="#888"
        className="bg-[#2a2a2a] text-white px-3 py-2 rounded mb-3"
      />

      <Text className="text-gray-300 mb-1">Description</Text>
      <TextInput
        value={desc}
        onChangeText={setDesc}
        placeholder="Card description"
        placeholderTextColor="#888"
        className="bg-[#2a2a2a] text-white px-3 py-2 rounded mb-3"
        multiline
      />

      <TouchableOpacity
        onPress={handleCreate}
        className={`bg-blue-500 py-2 rounded ${loading ? 'opacity-50' : ''}`}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-center">
          {loading ? 'Creating...' : 'Create Card'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
