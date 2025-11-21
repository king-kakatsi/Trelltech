import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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

  const handleBack = () => {
    router.back();
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
    <SafeAreaView className="flex-1 bg-[#1a1a1a]" edges={['top']}>
      {/* Header */}
      <View className="px-4 py-4 flex-row items-center">
        <Pressable
          onPress={handleBack}
          className="w-10 h-10 rounded-full bg-black/30 items-center justify-center mr-3"
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        
        <Text className="text-white text-xl font-bold">
          Card Detail
        </Text>
      </View>

      <ScrollView className="flex-1 bg-[#0a0a0a]">
        <View className="p-4">
          {/* Card Title */}
          <Text className="text-lg font-semibold text-white mb-1">
            {card.name}
          </Text>

          {/* Description */}
          {card.desc && (
            <View className="mb-4 bg-[#1a1a1a] p-4 rounded-lg mt-3">
              <Text className="text-gray-400 text-sm mb-1">Description</Text>
              <Text className="text-gray-300 leading-6">{card.desc}</Text>
            </View>
          )}

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