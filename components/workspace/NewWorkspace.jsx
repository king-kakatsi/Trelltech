import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { postWorkspace } from '../../services/workspaces';

const NewWorkspace = ({open, onCreate = () => {}, onClose = () => {} }) => {
  const [newWorkspace,setNewWorkspace] = useState({
    displayName: '',
    description: '',
    name: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setInformation = (field, value) => {
    setNewWorkspace(prevState => ({
      ...prevState,
      [field]: value
    }));
  }

  const handleClose = () => {
    if (isSubmitting) return;
    setNewWorkspace({
      displayName: '',
      description: '',
      name: '',
      website: ''
    });
    onClose();
  };

  const handleCreate = async () => {
    // validation: displayName est nécessaire
    if (!newWorkspace.displayName.trim()) {
      Alert.alert('Erreur', 'Le display name ne peut pas être vide');
      return;
    }

    // Valider website uniquement s'il est renseigné
    const websiteTrim = newWorkspace.website.trim();
    if (websiteTrim) {
      try {
        const parsed = new URL(websiteTrim);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error('Le lien doit utiliser http ou https');
        }
      } catch (e) {
        Alert.alert('Erreur', 'Le champ Website doit contenir une URL valide (ex: https://example.com)');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // convertir name en minuscules au moment de l'envoi
      const options = {
        desc: newWorkspace.description.trim(),
        name: newWorkspace.name.trim().toLowerCase(),
        website: websiteTrim
      };
      const res = await postWorkspace(newWorkspace.displayName.trim(), options);
      console.log("res postBoard",res);
      
      setNewWorkspace({
        displayName: '',
        description: '',
        name: '',
        website: ''
      });
      onClose();
      onCreate();
    } catch (err) {
      console.error('NewWorkspace create error:', err);
      const message = err?.message || String(err) || 'Impossible de créer l\'espace de travail';
      Alert.alert('Erreur', message);
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
      <Pressable
        className="flex-1 bg-black/50"
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
            <View onStartShouldSetResponder={() => true} className="absolute bottom-0 left-0 right-0 bg-[#2a2a2a] p-4 rounded-t-xl">
              <Text className="text-white text-lg font-semibold mb-3">New Workspace</Text>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Displayname</Text>
                <TextInput
                  value={newWorkspace.displayName}
                  onChangeText={(text) => setInformation('displayName', text)}
                  placeholder="Display name"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Name</Text>
                <TextInput
                  value={newWorkspace.name}
                  onChangeText={(text) => setInformation('name', text)}
                  placeholder="Workspace name (unique)"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Description</Text>
                <TextInput
                  value={newWorkspace.description}
                  onChangeText={(text) => setInformation('description', text)}
                  placeholder="Workspace description"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                  multiline
                  numberOfLines={5}
                  style={{ minHeight: 100, textAlignVertical: 'top' }}
                />
              </View>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Website</Text>
                <TextInput
                  value={newWorkspace.website}
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
                  onPress={handleCreate}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0079BF] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-semibold">
                    {isSubmitting ? 'Adding...' : 'Add'}
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

export default NewWorkspace;