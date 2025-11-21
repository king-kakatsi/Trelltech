import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getCard, getCardComments } from '../../services/trello';
import CardComments from './CardComments';

export default function CardDetail({ cardId }) {
  const { token } = useAuth();
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cardId || !token) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const cardData = await getCard(cardId, token);
        setCard(cardData);

        const cardComments = await getCardComments(cardId, token);
        setComments(cardComments);
      } catch (error) {
        console.error('Erreur chargement card:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [cardId, token]);

  const handleUpdate = () => {
    console.log('Update card:', cardId);
  };

  const handleArchive = () => {
    console.log('Archive card:', cardId);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0079BF" />
      </View>
    );
  }

  if (!card) {
    return (
      <View className="p-4">
        <Text className="text-white">Card non trouvée.</Text>
      </View>
    );
  }

  return (
    <ScrollView className="p-4 bg-[#1a1a1a] rounded-lg">

      {/* Header */}
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-3">
          <Text className="text-xl font-bold text-white mb-2">{card.name}</Text>
          <Text className="text-gray-300">{card.desc || "Aucune description"}</Text>
        </View>
      </View>

      {/* Members  */}
      {card.members && card.members.length > 0 && (
        <View className="flex-row mb-4">
          {card.members.map(member => (
            <View key={member.id} className="mr-2">
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
          className="bg-green-600 p-2 rounded-lg"
        >
          <Text className="text-white text-md">Update</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleArchive}
          className="bg-red-600 p-2 rounded-lg"
        >
          <Text className="text-white text-md">Archive</Text>
        </TouchableOpacity>
      </View>

      {/* Comments */}
      <CardComments
        cardId={cardId}
        initialComments={comments}
        onCommentsChange={setComments}
      />
    </ScrollView>
  );
}
