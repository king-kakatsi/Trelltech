import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { createWorkspace } from '../../services/workspaces';
import { required, validateUrl } from '../../lib/validation';
import FormActions from '../ui/FormActions';

const NewWorkspace = ({ open, onCreate = () => { }, onClose = () => { } }) => {
  const [workspaceData, setWorkspaceData] = useState({
    displayName: '',
    description: '',
    name: '',
    website: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setWorkspaceData((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setWorkspaceData({
      displayName: '',
      description: '',
      name: '',
      website: ''
    });
  };

  const handleClose = () => {
    if (isSubmitting) return;
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const displayNameCheck = required(workspaceData.displayName, 'Display name');
    if (!displayNameCheck.valid) {
      Alert.alert('Error', displayNameCheck.error);
      return;
    }

    const websiteCheck = validateUrl(workspaceData.website, 'Website');
    if (!websiteCheck.valid) {
      Alert.alert('Error', websiteCheck.error);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createWorkspace({
        displayName: workspaceData.displayName.trim(),
        name: workspaceData.name.trim(),
        description: workspaceData.description.trim(),
        website: workspaceData.website.trim(),
      });

      if (!response.success) {
        Alert.alert('Error', response.error || 'Failed to create workspace');
        return;
      }

      resetForm();
      onClose();
      onCreate(response.data);
    } catch (error) {
      console.error('NewWorkspace create error:', error);
      Alert.alert('Error', error || 'Unable to create workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent
      visible={open}
      onRequestClose={handleClose}
    >
      <Pressable
        className="flex-1 bg-black/60 justify-end"
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="w-full"
        >
          <ScrollView
            className="bg-[#2a2a2a] rounded-t-3xl p-6 max-h-[90%]"
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-white text-xl font-bold mb-6">
              Create Workspace
            </Text>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-400 mb-2">
                Display Name *
              </Text>
              <TextInput
                value={workspaceData.displayName}
                onChangeText={(value) => updateField('displayName', value)}
                placeholder="Workspace display name"
                placeholderTextColor="#6B778C"
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
                autoFocus
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-400 mb-2">
                Short Name
              </Text>
              <TextInput
                value={workspaceData.name}
                onChangeText={(value) => updateField('name', value)}
                placeholder="short-name (optional)"
                placeholderTextColor="#6B778C"
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
                autoCapitalize="none"
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-400 mb-2">
                Description
              </Text>
              <TextInput
                value={workspaceData.description}
                onChangeText={(value) => updateField('description', value)}
                placeholder="Add a description"
                placeholderTextColor="#6B778C"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base min-h-[80px]"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-semibold text-gray-400 mb-2">
                Website
              </Text>
              <TextInput
                value={workspaceData.website}
                onChangeText={(value) => updateField('website', value)}
                placeholder="https://example.com"
                placeholderTextColor="#6B778C"
                className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
                autoCapitalize="none"
                keyboardType="url"
              />
            </View>

            <FormActions
              onCancel={handleClose}
              onSubmit={handleCreate}
              submitLabel="Create"
              loading={isSubmitting}
              disabled={!workspaceData.displayName.trim()}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

export default NewWorkspace;
