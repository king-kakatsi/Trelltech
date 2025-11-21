import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getWorkspaceMembers } from '../../services/workspaces';

const ManageWorkspaceMembers = ({ open = false, workspace = null, onClose = () => {}, onMembersUpdated = () => {} }) => {
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const workspaceId = workspace?.id;

  const fetchMembers = async () => {
    if (!workspaceId) return;
    setLoading(true);
    try {
      const res = await getWorkspaceMembers(workspaceId);

      // normalize response: support [success, payload], direct array, or { members: [...] }
      let data;
      if (Array.isArray(res) && typeof res[0] === 'boolean') {
        const [success, payload] = res;
        if (!success) throw payload;
        data = payload;
      } else {
        data = res;
      }

      const membersArray = Array.isArray(data)
        ? data
        : (Array.isArray(data?.members) ? data.members : []);

      setMembers(membersArray);
    } catch (err) {
      console.error('fetchMembers error', err);
      Alert.alert('Erreur', 'Impossible de charger les membres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open && workspaceId) {
      fetchMembers();
    } else if (!open) {
      // reset local form when closed
      setEmail('');
      setMembers([]);
    }
  }, [open, workspaceId]);

  const handleAddMember = async () => {
    if (!workspaceId) return;
    const mail = (email || '').trim().toLowerCase();
    if (!mail) {
      Alert.alert('Erreur', 'Please enter an email');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/workspaces/${workspaceId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: mail }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Add member failed');
      }
      const json = await res.json();
      // mettre à jour la liste locale
      await fetchMembers();
      setEmail('');
      Alert.alert('Succès', 'Member added.');
      // notifier parent
      try { await Promise.resolve(onMembersUpdated(json)); } catch (_) {}
    } catch (err) {
      console.error('handleAddMember error', err);
      Alert.alert('Erreur', err.message || 'Could not add member.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!workspaceId || !memberId) return;
    Alert.alert(
      'Confirm',
      'Remove this member from the workspace?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: async () => {
          setSubmitting(true);
          try {
            const res = await fetch(`/api/workspaces/${workspaceId}/members/${memberId}`, { method: 'DELETE' });
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.message || 'Remove failed');
            }
            await fetchMembers();
            Alert.alert('Succès', 'Member removed.');
            try { await Promise.resolve(onMembersUpdated()); } catch (_) {}
          } catch (err) {
            console.error('handleRemoveMember error', err);
            Alert.alert('Erreur', 'Could not remove member.');
          } finally {
            setSubmitting(false);
          }
        } },
      ]
    );
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => { if (!submitting) onClose(); }}
    >
      <Pressable className="flex-1 bg-black/50" onPress={() => { if (!submitting) onClose(); }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
            <View onStartShouldSetResponder={() => true} className="absolute bottom-0 left-0 right-0 bg-[#2a2a2a] p-4 rounded-t-xl">
              <Text className="text-white text-lg font-semibold mb-3">Manage Workspace Members</Text>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Add member by email</Text>
                <View className="flex-row">
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="user@example.com"
                    placeholderTextColor="#6B728C"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    className="bg-[#1a1a1a] text-white px-3 py-2 rounded flex-1"
                  />
                  <TouchableOpacity onPress={handleAddMember} disabled={submitting} className="ml-3 bg-green-500 px-4 justify-center rounded">
                    <Text className="text-white font-semibold">{submitting ? '...' : 'Add'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-2">Members</Text>
                {loading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : members.length === 0 ? (
                  <Text className="text-gray-400">No members</Text>
                ) : (
                  members.map((m, idx) => (
                    <View key={`${m.id ?? m.userId ?? m.email ?? m.username ?? idx}`} className="flex-row items-center justify-between py-2">
                      <View>
                        <Text className="text-white font-semibold">{m.name || m.fullName || m.username || m.email}</Text>
                        <Text className="text-gray-400 text-xs">{m.email || m.username || ''}</Text>
                      </View>

                      <TouchableOpacity onPress={() => handleRemoveMember(m.id ?? m.userId)} disabled={submitting} className="bg-red-500 px-3 py-1 rounded">
                        <Text className="text-white">Remove</Text>
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={() => { if (!submitting) onClose(); }}
                  disabled={submitting}
                  className="flex-1 bg-[#1a1a1a] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white">Close</Text>
                </Pressable>

                <Pressable
                  onPress={fetchMembers}
                  disabled={loading}
                  className="flex-1 bg-[#2563EB] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-semibold">Refresh</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default ManageWorkspaceMembers;