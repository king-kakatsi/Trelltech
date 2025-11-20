import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

const NewWorkspace = ({open, onCreate = () => {}, onClose = () => {} }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nouvelle fonction pour centraliser la fermeture / réinitialisation
  const handleClose = () => {
    if (isSubmitting) return;
    setName('');
    setDescription('');
    onClose();
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Erreur', 'Le nom ne peut pas être vide');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate({ name: name.trim(), description: description.trim() });
      // réinitialiser puis fermer après création réussie
      setName('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error('NewWorkspace create error:', err);
      Alert.alert('Erreur', 'Impossible de créer l\'espace de travail');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Remplacement du rendu conditionnel par un Modal (comme OptionsModal)
  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* fond sombre cliquable pour fermer */}
      <Pressable
        className="flex-1 bg-black/50"
        onPress={handleClose}
      >
        {/* KeyboardAvoidingView permet au contenu de monter quand le clavier s'ouvre */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          // keyboardVerticalOffset={80} // ajuster si nécessaire
        >
          {/* ScrollView pour permettre le défilement si le clavier est grand */}
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }} keyboardShouldPersistTaps="handled">
            {/* onStartShouldSetResponder empêche la fermeture du Modal quand on tape dans ce View */}
            <View onStartShouldSetResponder={() => true} className="absolute bottom-0 left-0 right-0 bg-[#2a2a2a] p-4 rounded-t-xl">
              <Text className="text-white text-lg font-semibold mb-3">Nouveau workspace</Text>

              <View className="mb-3">
                <Text className="text-sm text-gray-300 mb-1">Nom</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nom de l'espace de travail"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-300 mb-1">Description (optionnel)</Text>
                <TextInput
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Brève description"
                  placeholderTextColor="#6B728C"
                  className="bg-[#1a1a1a] text-white px-3 py-2 rounded"
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View className="flex-row gap-3">
                <Pressable
                  onPress={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#1a1a1a] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white">Annuler</Text>
                </Pressable>

                <Pressable
                  onPress={handleCreate}
                  disabled={isSubmitting}
                  className="flex-1 bg-[#0079BF] py-3 rounded-xl items-center justify-center"
                >
                  <Text className="text-white font-semibold">
                    {isSubmitting ? 'Création...' : 'Créer'}
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