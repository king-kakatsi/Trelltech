import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { addMember, getAvailableMembers, getCurrentMembers, removeMember } from '../../services/memberService';
import MemberAvatar from './MemberAvatar';
import BottomDrawer from './BottomDrawer';

export default function AddMembersDrawer({ 
  visible, 
  onClose, 
  instanceType,
  instanceId,
  onMembersUpdated
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [availableMembers, setAvailableMembers] = useState([]);
  const [currentMemberIds, setCurrentMemberIds] = useState(new Set());
  const [selectedMemberIds, setSelectedMemberIds] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    try {
      const [availableResponse, currentResponse] = await Promise.all([
        getAvailableMembers(instanceType, instanceId),
        getCurrentMembers(instanceType, instanceId)
      ]);

      const available = availableResponse.success ? availableResponse.data : [];
      const current = currentResponse.success ? currentResponse.data : [];

      setAvailableMembers(available);

      const currentIds = new Set(current.map(m => m.id));
      setCurrentMemberIds(currentIds);
      setSelectedMemberIds(new Set(currentIds));
    } catch (error) {
      console.error('Error fetching members:', error);
      Alert.alert('Error', 'Failed to load members. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [instanceType, instanceId]);

  useEffect(() => {
    if (visible) {
      fetchMembers();
    } else {
      setSearchQuery('');
    }
  }, [visible, fetchMembers]);

  const toggleMember = (memberId) => {
    const newSelected = new Set(selectedMemberIds);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMemberIds(newSelected);
  };

  const handleDone = async () => {
    setSaving(true);
    try {
      const membersToAdd = [...selectedMemberIds].filter(id => !currentMemberIds.has(id));
      const membersToRemove = [...currentMemberIds].filter(id => !selectedMemberIds.has(id));

      const addResults = await Promise.all(
        membersToAdd.map(memberId => addMember(instanceType, instanceId, memberId))
      );
      const removeResults = await Promise.all(
        membersToRemove.map(memberId => removeMember(instanceType, instanceId, memberId))
      );

      const failed = [...addResults, ...removeResults].filter(result => !result.success);
      if (failed.length > 0) {
        Alert.alert('Error', failed[0].error || 'Failed to update some members.');
        return;
      }

      if (onMembersUpdated) {
        onMembersUpdated();
      }

      onClose();
    } catch (error) {
      console.error('Error updating members:', error);
      Alert.alert('Error', 'Failed to update members. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filteredMembers = availableMembers.filter(member => {
    const searchLower = searchQuery.toLowerCase();
    return (
      member.fullName?.toLowerCase().includes(searchLower) ||
      member.username?.toLowerCase().includes(searchLower)
    );
  });

  const getInstanceLabel = () => {
    switch (instanceType) {
      case 'workspace': return 'workspace';
      case 'board': return 'board';
      case 'card': return 'card';
      default: return 'item';
    }
  };

  const hasChanges = () => {
    if (currentMemberIds.size !== selectedMemberIds.size) return true;
    for (const id of currentMemberIds) {
      if (!selectedMemberIds.has(id)) return true;
    }
    return false;
  };

  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      <Text className="text-2xl font-bold text-white mb-2">
        Manage Members
      </Text>
      <Text className="text-gray-400 text-sm mb-6">
        Add or remove members for this {getInstanceLabel()}
      </Text>

      <View className="mb-4">
        <View className="bg-[#1a1a1a] flex-row items-center px-4 py-3 rounded-xl">
          <Ionicons name="search" size={20} color="#6B778C" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search members..."
            placeholderTextColor="#6B778C"
            className="flex-1 text-white ml-2 text-base"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#6B778C" />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View className="py-12 items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-400 mt-4">Loading members...</Text>
        </View>
      ) : filteredMembers.length === 0 ? (
        <View className="py-12 items-center">
          <Ionicons name="people-outline" size={64} color="#6B778C" />
          <Text className="text-gray-400 mt-4 text-center">
            {searchQuery ? 'No members found' : 'No members available'}
          </Text>
          {searchQuery && (
            <Text className="text-gray-500 text-sm mt-2">
              Try a different search term
            </Text>
          )}
        </View>
      ) : (
        <>
          <ScrollView 
            className="max-h-96 mb-4"
            showsVerticalScrollIndicator={false}
          >
            {filteredMembers.map((member) => {
              const isSelected = selectedMemberIds.has(member.id);

              return (
                <Pressable
                  key={member.id}
                  onPress={() => toggleMember(member.id)}
                  className="flex-row items-center py-3 px-2 active:bg-neutral-800 rounded-lg"
                >
                  <View className="mr-3">
                    <MemberAvatar member={member} size={40} textStyle="text-sm" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-white text-base font-medium">
                      {member.fullName}
                    </Text>
                    {member.username && (
                      <Text className="text-gray-500 text-sm">
                        @{member.username}
                      </Text>
                    )}
                  </View>

                  <View 
                    className={`w-6 h-6 rounded items-center justify-center border-2 ${
                      isSelected 
                        ? 'bg-blue-600 border-blue-600' 
                        : 'border-gray-600'
                    }`}
                  >
                    {isSelected && (
                      <Ionicons name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-gray-400 text-sm">
              {selectedMemberIds.size} member{selectedMemberIds.size !== 1 ? 's' : ''} selected
            </Text>
            {hasChanges() && (
              <Text className="text-blue-500 text-sm font-medium">
                Changes pending
              </Text>
            )}
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={onClose}
              disabled={saving}
              className="flex-1 bg-[#1a1a1a] py-4 rounded-xl active:opacity-70"
            >
              <Text className="text-white text-center font-semibold text-base">
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={handleDone}
              disabled={saving || !hasChanges()}
              className={`flex-1 py-4 rounded-xl ${
                saving || !hasChanges() ? 'bg-gray-700' : 'bg-blue-600'
              }`}
            >
              <Text className={`text-center font-semibold text-base ${
                saving || !hasChanges() ? 'text-gray-500' : 'text-white'
              }`}>
                {saving ? 'Saving...' : 'Done'}
              </Text>
            </Pressable>
          </View>
        </>
      )}
    </BottomDrawer>
  );
}