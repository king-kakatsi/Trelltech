import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { deleteCard, getCard, getCardComments, updateCardDates } from '../../services/trello';
import { getMemberColor, getMemberInitials } from '../../utils/memberColors';
import AddMembersDrawer from '../ui/AddMembersDrawer';
import BottomDrawer from '../ui/BottomDrawer';
import CardComments from './CardComments';
import CardUpdate from './CardUpdate';
import DateSelectionDrawer from './DateSelectionDrawer';

/**
 * CardDetail Component
 * Displays detailed information about a Trello card including title, description,
 * members, due date, comments, and action buttons for editing and archiving.
 * 
 * @param {string} cardId - The unique identifier of the card to display
 * @param {Function} onArchived - Callback function called when card is archived
 */
export default function CardDetail({ cardId, onArchived }) {
  const { token } = useAuth();
  const { workspaceId, boardId } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Edit form state - following the same pattern as EditBoardDrawer
  const [editedCardName, setEditedCardName] = useState('');
  const [editedCardDesc, setEditedCardDesc] = useState('');
  const [editedCardDueDate, setEditedCardDueDate] = useState(null);

  /**
   * Fetch card details and comments from Trello API
   * Updates local state with fetched data
   */
  const fetchData = useCallback(async () => {
    if (!cardId || !token) return;
    
    setLoading(true);
    try {
      const cardData = await getCard(cardId, token);
      setCard(cardData);

      const cardComments = await getCardComments(cardId, token);
      setComments(cardComments);
    } catch (error) {
      console.error('Error loading card:', error);
      Alert.alert('Error', 'Failed to load card');
    } finally {
      setLoading(false);
    }
  }, [cardId, token]);

  /**
   * Fetch card data and comments from the server
   * Called when component mounts or when cardId/token changes
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * Navigate back to the previous screen
   */
  const handleBack = () => {
    router.back();
  };

  /**
   * Open the card update drawer
   * Initialize edit form values from current card data
   */
  const handleUpdate = () => {
    setEditedCardName(card?.name || '');
    setEditedCardDesc(card?.desc || '');
    setEditedCardDueDate(card?.due ? new Date(card.due) : null);
    setShowUpdateDrawer(true);
  };

  /**
   * Handle saving card updates
   * Updates card name, description, and due date
   */
  const handleSaveCardUpdate = async () => {
    if (!editedCardName.trim()) {
      Alert.alert('Error', 'Card name cannot be empty');
      return;
    }

    try {
      const { updateCard, updateCardDates } = await import('../../services/trello');
      
      // Update card basic information
      await updateCard(cardId, token, { 
        name: editedCardName.trim(), 
        desc: editedCardDesc.trim() 
      });
      
      // Update due date if provided
      if (editedCardDueDate) {
        await updateCardDates(cardId, token, null, editedCardDueDate.toISOString());
      } else if (card?.due) {
        // Remove due date if it was cleared
        await updateCardDates(cardId, token, null, null);
      }
      
      // Refresh card data
      await fetchData();
      setShowUpdateDrawer(false);
    } catch (err) {
      console.error('Error updating card:', err);
      Alert.alert('Error', 'Failed to update card');
    }
  };

  /**
   * Open the members management drawer
   */
  const handleManageMembers = () => {
    setShowMembersDrawer(true);
  };

  /**
   * Handle card archiving with confirmation dialog
   * Archives the card and navigates back to board view on success
   */
  const handleArchive = () => {
    Alert.alert(
      "Confirmer l'archivage",
      'Êtes-vous sûr de vouloir archiver cette carte ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Archiver',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const success = await deleteCard(cardId, token);
              if (success) {
                Alert.alert('Carte archivée', 'La carte a été archivée avec succès.', [
                  {
                    text: 'OK',
                    onPress: () => {
                      router.replace(`/workspace/${workspaceId}/board/${boardId}`);
                    }
                  }
                ]);
              } else {
                Alert.alert('Erreur', "Impossible d'archiver la carte.");
              }
            } catch (err) {
              console.error('Erreur archive card:', err);
              Alert.alert('Erreur', "Une erreur est survenue lors de l'archivage.");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-[#1a1a1a]" edges={['top']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#0079BF" />
        </View>
      </SafeAreaView>
    );
  }

  if (!card) {
    return (
      <SafeAreaView className="flex-1 bg-[#1a1a1a]" edges={['top']}>
        <View className="p-4">
          <Text className="text-white">Card non trouvée.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#0a0a0a]" edges={['top']}>
      {/* Header Section */}
      <View className="flex-row justify-between items-center p-4 bg-[#1a1a1a]">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Card Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Optional colored accent bar for visual consistency */}
      <View className="h-1 bg-blue-600" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Card Title Section */}
        <View className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 m-4 mb-3">
          <Text className="text-white text-2xl font-bold">{card.name}</Text>
        </View>

        {/* Members Section */}
        <View className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mx-4 mb-3">
          <View className="flex-row items-center justify-between mb-3">
            <View className="flex-row items-center">
              <Ionicons name="people" size={18} color="#9ca3af" />
              <Text className="text-gray-400 text-sm font-semibold ml-2">
                MEMBERS
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleManageMembers}
              className="flex-row items-center bg-blue-600 px-3 py-1.5 rounded-full"
              activeOpacity={0.7}
            >
              <Ionicons name="person-add" size={16} color="white" />
              <Text className="text-white text-xs font-semibold ml-1">
                Manage
              </Text>
            </TouchableOpacity>
          </View>

          {card.members && card.members.length > 0 ? (
            <View className="flex-row flex-wrap">
              {card.members.map((member) => {
                const memberColor = getMemberColor(member.id);
                const initials = getMemberInitials(member.fullName || member.username || '');
                return (
                  <View key={member.id} className="mr-2 mb-2">
                    <View
                      style={{ backgroundColor: memberColor }}
                      className="w-10 h-10 rounded-full items-center justify-center"
                    >
                      <Text className="text-white text-xs font-bold">
                        {initials}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <Text className="text-gray-500 text-sm">No members assigned</Text>
          )}
        </View>

        {/* Description Section */}
        {card.desc && (
          <View className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mx-4 mb-3">
            <Text className="text-gray-400 text-sm font-semibold mb-2">
              DESCRIPTION
            </Text>
            <Text className="text-gray-300">{card.desc}</Text>
          </View>
        )}

        {/* Due Date Section */}
        <View className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mx-4 mb-3">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Ionicons name="calendar" size={18} color="#9ca3af" />
              <Text className="text-gray-400 text-sm font-semibold ml-2">
                DUE DATE
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="bg-blue-600 px-3 py-1.5 rounded-full flex-row items-center"
              activeOpacity={0.7}
            >
              <Ionicons name="calendar-outline" size={16} color="white" />
              <Text className="text-white text-xs font-semibold ml-1">
                {card.due ? 'Change' : 'Set'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {card.due ? (
            <Text className="text-gray-300">
              {new Date(card.due).toLocaleString()}
            </Text>
          ) : (
            <Text className="text-gray-500 text-sm">No due date set</Text>
          )}
        </View>

        {/* Action Buttons Section */}
        <View className="flex-row gap-3 mx-4 mb-4">
          <TouchableOpacity
            onPress={handleUpdate}
            className="flex-1 bg-blue-600 p-3 rounded-lg flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={18} color="white" />
            <Text className="text-white text-center font-semibold ml-2">
              Edit
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleArchive}
            className="flex-1 bg-red-600 p-3 rounded-lg flex-row items-center justify-center"
            activeOpacity={0.7}
          >
            <Ionicons name="archive-outline" size={18} color="white" />
            <Text className="text-white text-center font-semibold ml-2">
              Archive
            </Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View className="mx-4 mb-4">
          <CardComments
            cardId={cardId}
            initialComments={comments}
            onCommentsChange={setComments}
          />
        </View>
      </ScrollView>

      {/* Card Update Drawer */}
      <CardUpdate
        visible={showUpdateDrawer}
        cardName={editedCardName}
        cardDescription={editedCardDesc}
        cardDueDate={editedCardDueDate}
        onCardNameChange={setEditedCardName}
        onCardDescriptionChange={setEditedCardDesc}
        onCardDueDateChange={setEditedCardDueDate}
        onClose={() => setShowUpdateDrawer(false)}
        onSave={handleSaveCardUpdate}
        cardId={cardId}
        onMembersUpdated={fetchData}
      />

      {/* Members Management Drawer */}
      <AddMembersDrawer
        visible={showMembersDrawer}
        onClose={() => setShowMembersDrawer(false)}
        instanceType="card"
        instanceId={cardId}
        onMembersUpdated={fetchData}
      />

      {/* Date Selection Drawer - Simple and reliable alternative to DateTimePicker */}
      <BottomDrawer
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      >
        <DateSelectionDrawer
          currentDate={card.due ? new Date(card.due) : null}
          onDateSelected={async (selectedDate) => {
            setShowDatePicker(false);
            try {
              await updateCardDates(cardId, token, null, selectedDate.toISOString());
              await fetchData();
            } catch (err) {
              console.error('Error updating due date:', err);
              Alert.alert('Error', 'Failed to update due date');
            }
          }}
          onRemove={async () => {
            setShowDatePicker(false);
            try {
              await updateCardDates(cardId, token, null, null);
              await fetchData();
            } catch (err) {
              console.error('Error removing due date:', err);
              Alert.alert('Error', 'Failed to remove due date');
            }
          }}
        />
      </BottomDrawer>
    </SafeAreaView>
  );
}