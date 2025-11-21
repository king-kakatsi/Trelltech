import React, { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { updateWorkspace } from '../../services/workspaces';

const UpdateWorkspace = ({ open, workspace = null, onUpdate = () => {}, onClose = () => {} }) => {
  
  const [workspaceData, setWorkspaceData] = useState({
    displayName: '',
    name: '',
    description: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setInformation = (field, value) => {
    setWorkspaceData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Populate form when opened or when workspace changes
  useEffect(() => {
    if (open && workspace) {
      setWorkspaceData({
        displayName: workspace.displayName ?? '',
        name: workspace.name ?? '',
        description: workspace.desc ?? '',
        website: workspace.website ?? ''
      });
    } else if (!open) {
      setWorkspaceData({
        displayName: '',
        name: '',
        description: '',
        website: ''
      });
    }
  }, [open, workspace]);

  const handleClose = () => {
    if (isSubmitting) return;
    setWorkspaceData({
      displayName: '',
      name: '',
      description: '',
      website: ''
    });
    onClose();
  };

  const handleUpdate = async () => {
    // validation: displayName requis (harmonisé avec NewWorkspace)
    if (!workspaceData.displayName.trim()) {
      Alert.alert('Erreur', 'Th field display name is required');
      return;
    }
    if (!workspace || !workspace.id) {
      Alert.alert('Erreur', 'Workspace invalide');
      return;
    }

    setIsSubmitting(true);
    try {
      // Valider website uniquement s'il est renseigné
      const websiteTrim = workspaceData.website.trim();
      if (websiteTrim) {
        try {
          const parsed = new URL(websiteTrim);
          if (!['http:', 'https:'].includes(parsed.protocol)) {
            throw new Error('The website must start with http:// or https://');
          }
        } catch (e) {
          Alert.alert('Erreur', 'The website URL is not valid');
          setIsSubmitting(false);
          return;
        }
      }

      // construire le payload similaire à la création
      const payload = {
        displayName: workspaceData.displayName.trim(),
        name: workspaceData.name.trim().toLowerCase(),
        desc: workspaceData.description.trim(),
      };
      if (websiteTrim) payload.website = websiteTrim;

      const res = await updateWorkspace(workspace.id, payload);
     
      setWorkspaceData({
        displayName: '',
        name: '',
        description: '',
        website: ''
      });
      // fermer d'abord le modal
      onClose();
      // appeler le callback parent avec la réponse (et attendre s'il renvoie une Promise)
      try {
        await Promise.resolve(onUpdate(res));
      } catch (cbErr) {
        console.error('onUpdate callback error:', cbErr);
      }
    } catch (err) {
      console.error('UpdateWorkspace error:', err);
      Alert.alert('Erreur', 'Something went wrong while updating the workspace');
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
                  value={workspaceData.displayName}
                  onChangeText={(text) => setInformation('displayName', text)}
                  placeholder="Display name"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              {/* Name */}
              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Name</Text>
                <TextInput
                  value={workspaceData.name}
                  onChangeText={(text) => setInformation('name', text)}
                  placeholder="Workspace name (unique)"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              {/* Description (textarea-like) */}
              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Description</Text>
                <TextInput
                  value={workspaceData.description}
                  onChangeText={(text) => setInformation('description', text)}
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
                  value={workspaceData.website}
                  onChangeText={(text) => setInformation('website', text)}
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