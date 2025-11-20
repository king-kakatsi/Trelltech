import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, ActivityIndicator } from 'react-native';
import { getCard, getCardComments } from '../../services/trello';
import { useAuth } from '../../contexts/AuthContext';
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
      <Text className="text-xl font-bold text-white mb-2">{card.name}</Text>
      <Text className="text-gray-300 mb-4">{card.desc || "Aucune description"}</Text>

      {/* Members */}
      {card.idMembers?.length > 0 && (
        <View className="flex-row mb-4">
          {card.members?.map(member => (
            <Image
              key={member.id}
              source={{ uri: member.avatarUrl }}
              className="w-8 h-8 rounded-full mr-2"
            />
          ))}
        </View>
      )}

      {/* Due Date */}
      {card.due && (
        <Text className="text-gray-400 mb-4">
          Due: {new Date(card.due).toLocaleString()}
        </Text>
      )}

      {/* Comments */}
      <CardComments
        cardId={cardId}
        initialComments={comments}
        onCommentsChange={setComments}
      />
    </ScrollView>
  );
}
