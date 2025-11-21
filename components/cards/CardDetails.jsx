import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { getCard, getCardComments, archiveCard } from '../../services/trello';
import CardComments from './CardComments';

export default function CardDetail({ cardId, onUpdate, onArchive }) {
  const { token } = useAuth();
  const [card, setCard] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleUpdate = () => {
    onUpdate?.();
  };

  const handleArchive = async () => {
    Alert.alert(
      'Archive Card',
      'Are you sure you want to archive this card?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            try {
              await archiveCard(cardId, token);
              Alert.alert('Success', 'Card archived successfully');
              onArchive?.();
            } catch (error) {
              console.error('Error archiving card:', error);
              Alert.alert('Error', 'Failed to archive card');
            }
          }
        }
      ]
    );
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
    <SafeAreaView className="flex-1 bg-[#1a1a1a] w-full" edges={['top']}>
    <ScrollView className="flex-1 bg-[#0a0a0a]">
      <View className="p-4">
        {/* Header */}
        <View className="mb-4">
          <Text className="text-2xl font-bold text-white mb-3">{card.name}</Text>
          {card.desc && (
            <View className="bg-[#1a1a1a] p-4 rounded-lg">
              <Text className="text-gray-300 leading-6">{card.desc}</Text>
            </View>
          )}
        </View>

        {/* Members */}
        {card.members && card.members.length > 0 && (
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-2">Members</Text>
            <View className="flex-row flex-wrap">
              {card.members.map(member => (
                <View key={member.id} className="mr-2 mb-2">
                  <View className="w-10 h-10 rounded-full bg-blue-600 items-center justify-center">
                    <Text className="text-white font-bold text-lg">
                      {member.fullName?.charAt(0)?.toUpperCase()}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Due Date */}
        {card.due && (
          <View className="mb-4 bg-[#1a1a1a] p-3 rounded-lg">
            <Text className="text-gray-400 text-sm mb-1">Due Date</Text>
            <Text className="text-white font-medium">
              {new Date(card.due).toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </Text>
          </View>
        )}

        {/* Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={handleUpdate}
            className="flex-1 bg-blue-600 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Edit Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleArchive}
            className="flex-1 bg-red-600 py-3 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Archive</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View className="mb-4">
          <Text className="text-white text-lg font-semibold mb-3">Activity</Text>
          <CardComments
            cardId={cardId}
            initialComments={comments}
            onCommentsChange={setComments}
          />
        </View>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}