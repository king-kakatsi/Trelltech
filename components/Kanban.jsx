import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import TaskCard from './TaskCard';
import { getCardsInList, createCard } from "../services/card";
import { getList } from "../services/list";
import BottomDrawer from "./ui/BottomDrawer";

export default function KanbanView({ workspaceId, boardId, listId, onOpenMenu }) {
  const [list, setList] = useState(null);
  const [cards, setCards] = useState([]);
  const [newCardName, setNewCardName] = useState('');
  const [newCardDesc, setNewCardDesc] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      const response = await getList(listId);
      if (response.success) {
        setList(response.data);
      }
    };

    const fetchCards = async () => {
      const response = await getCardsInList(listId);
      if (response.success) {
        setCards(Array.isArray(response.data) ? response.data : []);
      } else {
        setCards([]);
      }
    };

    fetchList();
    fetchCards();
  }, [listId]);

  const handleAddCard = async () => {
    if (newCardName && newCardDesc) {
      const response = await createCard(listId, {
        name: newCardName,
        description: newCardDesc,
      });
      if (response.success) {
        setCards((prevCards) => [...prevCards, response.data]);
      }
      setShowForm(false);
      setNewCardName('');
      setNewCardDesc('');
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setNewCardName('');
    setNewCardDesc('');
  };

  return (
    <View className="flex-1 bg-gray-800 p-4 rounded-lg shadow-lg">
      {/* HEADER */}
      <View className="flex-row items-center justify-between bg-slate-600 px-4 py-3 rounded-lg mb-4">
        <Text className="text-lg font-semibold text-gray-200">{list?.name}</Text>
        <TouchableOpacity
          onPress={() => onOpenMenu(list)}
          className="w-8 h-8 rounded-full bg-slate-800 items-center justify-center"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CARDS SECTION - Now with max height and flexible scrolling */}
      <View className="bg-gray-700 rounded-lg p-4" style={{ maxHeight: '75%' }}>
        <ScrollView
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {Array.isArray(cards) ? cards.map((card) => (
            <TaskCard key={card.id} card={card} listId={listId} workspaceId={workspaceId} boardId={boardId} />
          )) : null}
        </ScrollView>
      </View>

      {/* ADD CARD BUTTON - Now always visible below the list */}
      <TouchableOpacity
        onPress={() => setShowForm(true)}
        className="mt-4 p-2 rounded-lg"
      >
        <Text className="text-gray-200 text-lg">+Add card</Text>
      </TouchableOpacity>

      {/* ADD CARD DRAWER */}
      <BottomDrawer visible={showForm} onClose={handleCloseForm}>
        <Text className="text-xl font-semibold text-gray-200 mb-4">Create a new card</Text>

        <TextInput
          value={newCardName}
          onChangeText={setNewCardName}
          placeholder="Card name"
          placeholderTextColor="#9ca3af"
          className="mb-3 p-3 border text-gray-200 border-gray-500 rounded-lg bg-gray-700"
        />
        <TextInput
          value={newCardDesc}
          onChangeText={setNewCardDesc}
          placeholder="Description"
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={3}
          className="mb-4 p-3 border text-gray-200 border-gray-500 rounded-lg bg-gray-700"
          style={{ minHeight: 80 }}
        />

        <View className="flex-row justify-between items-center">
          <TouchableOpacity 
            onPress={handleAddCard}
            className="bg-blue-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-white font-semibold">Add Card</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={handleCloseForm}
            className="bg-gray-600 px-6 py-3 rounded-lg"
          >
            <Text className="text-red-400 font-semibold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </BottomDrawer>
    </View>
  );
}