import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { deleteCard, getCard, getCardComments } from '../../services/trello';
import BottomDrawer from '../ui/BottomDrawer';
import CardComments from './CardComments';
import CardUpdate from './CardUpdate';

export default function CardDetail({ cardId, onArchived }) {
  const { token } = useAuth();
  const { workspaceId, boardId } = useLocalSearchParams();
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);

  useEffect(() => {
    if (!cardId || !token) return;
    fetchData();
  }, [cardId, token]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const cardData = await getCard(cardId, token);
      setCard(cardData);

      const cardComments = await getCardComments(cardId, token);
      setComments(cardComments);
    } catch (error) {
      console.error('Erreur chargement card:', error);
      Alert.alert('Error', 'Failed to load card');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleUpdate = () => {
    setShowUpdateDrawer(true);
  };

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
    <SafeAreaView className="flex-1 bg-[#1a1a1a] w-full" edges={['top']}>
      {/* Header */}
      <View className="flex-row justify-between items-center p-4">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text className="text-white text-xl font-bold">Card Detail</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView className="p-4 bg-[#1a1a1a] rounded-lg w-full">
        {/* Card Title */}
        <Text className="text-xl font-bold text-white mb-2">{card.name}</Text>

        {/* Description */}
        {card.desc && (
          <View className="mb-4 bg-[#1a1a1a] p-4 rounded-lg">
            <Text className="text-gray-400 text-sm mb-1">Description</Text>
            <Text className="text-gray-300">{card.desc}</Text>
          </View>
        )}

        {/* Members */}
        {card.members && card.members.length > 0 && (
          <View className="mb-4 flex-row flex-wrap">
            {card.members.map(member => (
              <View key={member.id} className="mr-2 mb-2">
                <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
                  <Text className="text-white font-bold">
                    {member.fullName?.charAt(0)?.toUpperCase()}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Due Date */}
        {card.due && (
          <Text className="text-gray-400 mb-4">
            Due: {new Date(card.due).toLocaleString()}
          </Text>
        )}

        {/* Actions */}
        <View className="flex-row gap-2 mb-4">
          <TouchableOpacity
            onPress={handleUpdate}
            className="flex-1 bg-green-600 p-2 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Update</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleArchive}
            className="flex-1 bg-red-600 p-2 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Archive</Text>
          </TouchableOpacity>
        </View>

        {/* Comments */}
        <CardComments
          cardId={cardId}
          initialComments={comments}
          onCommentsChange={setComments}
        />
      </ScrollView>

      {/* Drawer pour CardUpdate */}
      <BottomDrawer
        visible={showUpdateDrawer}
        onClose={() => setShowUpdateDrawer(false)}
      >
        <CardUpdate
          cardId={cardId}
          onSuccess={(updatedCard) => {
            setCard(updatedCard);
            setShowUpdateDrawer(false);
          }}
        />
      </BottomDrawer>
    </SafeAreaView>
  );
}