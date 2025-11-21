import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getCard, getCardComments, updateCard, updateCardDates } from '../../services/trello';
import AddMembersDrawer from '../ui/AddMembersDrawer';
import CardComments from './CardComments';

export default function CardUpdate({ cardId, onSuccess }) {
  const { token } = useAuth();
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  //  NEW
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);

  useEffect(() => {
    if (!cardId || !token) return;
    fetchCard();
  }, [cardId, token]);

  const fetchCard = async () => {
    setLoading(true);
    try {
      const data = await getCard(cardId, token);
      setCard(data);
      setTitle(data.name);
      setDesc(data.desc);
      setDueDate(data.due ? new Date(data.due) : null);

      const cardComments = await getCardComments(cardId, token);
      setComments(cardComments);
    } catch (err) {
      console.error('Error fetching card:', err);
      Alert.alert('Error', 'Failed to load card');
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateCard(cardId, token, { name: title, desc });
      if (dueDate) {
        await updateCardDates(cardId, token, null, dueDate.toISOString());
      }
      await fetchCard();
      onSuccess?.(card);
      setEditingTitle(false);
      setEditingDesc(false);
    } catch (err) {
      console.error('Error updating card:', err);
      Alert.alert('Error', 'Failed to update card');
    } finally {
      setLoading(false);
    }
  };

  if (!card) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  return (
    <View className="bg-[#1a1a1a] p-4 rounded-lg shadow flex-1">

      {loading && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center z-50">
          <ActivityIndicator size="large" color="#0079BF" />
        </View>
      )}

      {/* TITLE */}
      <View className="mb-3">
        {editingTitle ? (
          <TextInput
            value={title}
            onChangeText={setTitle}
            className="bg-[#2a2a2a] text-white px-3 py-2 rounded"
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingTitle(true)}>
            <Text className="text-white text-xl font-bold">{card.name}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* DESCRIPTION */}
      <View className="mb-3">
        {editingDesc ? (
          <TextInput
            value={desc}
            onChangeText={setDesc}
            multiline
            className="bg-[#2a2a2a] text-white px-3 py-2 rounded"
          />
        ) : (
          <TouchableOpacity onPress={() => setEditingDesc(true)}>
            <Text className="text-gray-200">{card.desc || 'No description'}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* DUE DATE */}
      <View className="mb-4">
        <Text className="text-gray-300 mb-1">Due Date</Text>

        {Platform.OS === 'web' ? (
          <TextInput
            type="datetime-local"
            value={dueDate ? new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16) : ''}
            onChangeText={(text) => {
              const d = new Date(text);
              if (!isNaN(d)) setDueDate(d);
            }}
            className="bg-[#2a2a2a] text-white px-3 py-2 rounded"
          />
        ) : (
          <>
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              className="bg-[#2a2a2a] px-3 py-2 rounded"
            >
              <Text className="text-white">
                {dueDate ? dueDate.toLocaleString() : 'Set a due date'}
              </Text>
            </TouchableOpacity>

            {showPicker && (
              <DateTimePicker
                value={dueDate || new Date()}
                mode="datetime"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowPicker(false);
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
            )}
          </>
        )}
      </View>

      {/* BUTTON TO OPEN DRAWER */}
      <View className="mb-4">
        <TouchableOpacity
          onPress={() => setShowMembersDrawer(true)}
          className="bg-[#2a2a2a] px-3 py-2 rounded"
        >
          <Text className="text-white font-semibold">
            Manage Members
          </Text>
        </TouchableOpacity>
      </View>

      {/* SAVE BUTTON */}
      <TouchableOpacity
        onPress={saveChanges}
        className={`bg-blue-500 py-2 rounded mb-4 ${loading ? 'opacity-50' : ''}`}
        disabled={loading}
      >
        <Text className="text-white font-semibold text-center">
          {loading ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>

      {/* COMMENTS */}
      <CardComments
        cardId={cardId}
        initialComments={comments}
        onCommentsChange={fetchCard}
      />

      {/* MEMBERS DRAWER */}
      <AddMembersDrawer
        visible={showMembersDrawer}
        onClose={() => setShowMembersDrawer(false)}
        instanceType="card"
        instanceId={cardId}
        onMembersUpdated={fetchCard}
      />
    </View>
  );
}
