import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, Platform, Modal } from 'react-native';
// ❌ remove DateTimePicker import
import { getCard, updateCard, updateCardDates } from '../../services/trello';
import CardComments from './CardComments';
import { useAuth } from '../../contexts/AuthContext';

export default function CardUpdate({ cardId, onSuccess }) {
  const { token } = useAuth();
  const [card, setCard] = useState(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(null);

  // Picker custom
  const [showPicker, setShowPicker] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCard();
  }, []);

  const fetchCard = async () => {
    try {
      const data = await getCard(cardId, token);
      setCard(data);
      setTitle(data.name);
      setDesc(data.desc);
      setDueDate(data.due ? new Date(data.due) : null);
    } catch (err) {
      console.error('Error fetching card:', err);
    }
  };

  const saveChanges = async () => {
    setLoading(true);
    try {
      await updateCard(cardId, token, { name: title, desc });
      if (dueDate) {
        await updateCardDates(cardId, token, null, dueDate.toISOString());
      }
      const updatedCard = await getCard(cardId, token);
      setCard(updatedCard);
      onSuccess?.(updatedCard);
      setEditingTitle(false);
      setEditingDesc(false);
    } catch (err) {
      console.error('Error updating card:', err);
      Alert.alert('Error', 'Failed to update card');
    } finally {
      setLoading(false);
    }
  };

  // Manual date change (for Web)
  const onWebDateChange = (text) => {
    const d = new Date(text);
    if (!isNaN(d)) setDueDate(d);
  };

  if (!card) return <Text className="text-white p-4">Loading card...</Text>;

  return (
    <View className="bg-[#1a1a1a] p-4 rounded-lg shadow">
      
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

        {/* WEB VERSION */}
        {Platform.OS === 'web' ? (
          <TextInput
            type="datetime-local"
            value={
              dueDate
                ? new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16)
                : ''
            }
            onChangeText={onWebDateChange}
            className="bg-[#2a2a2a] text-white px-3 py-2 rounded"
          />
        ) : (
          <>
            {/* MOBILE BUTTON */}
            <TouchableOpacity
              onPress={() => {
                setTempDate(dueDate || new Date());
                setShowPicker(true);
              }}
              className="bg-[#2a2a2a] px-3 py-2 rounded"
            >
              <Text className="text-white">
                {dueDate ? dueDate.toLocaleString() : 'Set a due date'}
              </Text>
            </TouchableOpacity>

            {/* MOBILE MODAL PICKER */}
            <Modal
              visible={showPicker}
              transparent
              animationType="fade"
            >
              <View className="flex-1 justify-center items-center bg-black/50 px-5">
                <View className="bg-[#2a2a2a] p-4 rounded-lg w-full">
                  <Text className="text-white mb-2 text-center">Select Due Date</Text>

                  <TextInput
                    type="datetime-local"
                    value={
                      tempDate
                        ? new Date(
                            tempDate.getTime() - tempDate.getTimezoneOffset() * 60000
                          )
                            .toISOString()
                            .slice(0, 16)
                        : ''
                    }
                    onChangeText={(text) => setTempDate(new Date(text))}
                    className="bg-[#1a1a1a] text-white px-3 py-2 rounded mb-3"
                  />

                  <View className="flex-row justify-between mt-2">
                    <TouchableOpacity
                      onPress={() => setShowPicker(false)}
                      className="bg-red-500 px-3 py-2 rounded"
                    >
                      <Text className="text-white">Cancel</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setDueDate(tempDate);
                        setShowPicker(false);
                      }}
                      className="bg-blue-500 px-3 py-2 rounded"
                    >
                      <Text className="text-white">Confirm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
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
        initialComments={card.actions || []}
        onCommentsChange={() => fetchCard()}
      />
    </View>
  );
}
