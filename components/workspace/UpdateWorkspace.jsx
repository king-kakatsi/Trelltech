import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { updateBoard } from '../../services/workspaces';

const UpdateWorkspace = ({ open, workspace = null, onUpdate = () => {}, onClose = () => {} }) => {
  // harmonisé avec NewWorkspace
  const [displayName, setDisplayName] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form when opened or when workspace changes
  useEffect(() => {
    if (open && workspace) {
      setDisplayName(workspace.displayName ?? '');
      setName(workspace.name ?? '');
      setDescription(workspace.desc ?? '');
      setWebsite(workspace.website ?? '');
    } else if (!open) {
      setDisplayName('');
      setName('');
      setDescription('');
      setWebsite('');
    }
  }, [open, workspace]);

  const handleClose = () => {
    if (isSubmitting) return;
    setDisplayName('');
    setName('');
    setDescription('');
    setWebsite('');
    onClose();
  };

  const handleUpdate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    if (!workspace || !workspace.id) {
      Alert.alert('Erreur', 'Workspace invalide');
      return;
    }

    setIsSubmitting(true);
    try {
      // construire le même dictionnaire que pour la création
      const payload = {
        displayName: displayName.trim(),
        name: name.trim(),
        description: description.trim(),
        website: website.trim(),
      };
      const res = await updateBoard(workspace.id, payload);
      console.log('UpdateWorkspace result:', res);

      setDisplayName('');
      setName('');
      setDescription('');
      setWebsite('');
      onClose();
      onUpdate();
    } catch (err) {
      console.error('UpdateWorkspace error:', err);
      Alert.alert('Erreur', 'Impossible de mettre à jour l\'espace de travail');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable className="flex-1 bg-black/50" onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
            <View onStartShouldSetResponder={() => true} className="absolute bottom-0 left-0 right-0 bg-[#2a2a2a] p-4 rounded-t-xl">
              <Text className="text-white text-lg font-semibold mb-3">Update Workspace</Text>

              {/* Displayname */}
              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Displayname</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Display name"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              {/* Name */}
              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Workspace name (unique)"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              {/* Description (textarea-like) */}
              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Description</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Workspace description"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                  multiline
                  numberOfLines={5}
                  style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
              </View>

              {/* Website */}
              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Website</Text>
                <TextInput
                  value={website}
                  onChangeText={setWebsite}
                  placeholder="https://example.com"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                  autoCapitalize="none"
                  keyboardType="url"
                />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1a1a1a] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white">Cancel</Text>
                </Pressable>

                <Pressable
                  onPress={handleUpdate}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0079BF] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-semibold">
                    {isSubmitting ? 'Updating...' : 'Update'}
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default UpdateWorkspace;