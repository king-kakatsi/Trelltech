import React, { useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomDrawer from '../ui/BottomDrawer';
import { BOARD_TEMPLATES } from '../../utils/boardTemplates';

export default function CreateBoardDrawer({
  visible,
  boardName,
  boardDescription,
  creating,
  onBoardNameChange,
  onBoardDescriptionChange,
  onClose,
  onCreate
}) {
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);

  const handleCreate = () => {
    onCreate(selectedTemplate);
  };

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
    setShowTemplatePicker(false);
  };

  const selectedTemplateData = BOARD_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <BottomDrawer visible={visible} onClose={onClose}>
      <Text className="text-2xl font-bold text-white mb-6">
        Create New Board
      </Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Board Name *
          </Text>
          <TextInput
            value={boardName}
            onChangeText={onBoardNameChange}
            placeholder="Enter board name"
            placeholderTextColor="#6B778C"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
            autoFocus
          />
        </View>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Description (optional)
          </Text>
          <TextInput
            value={boardDescription}
            onChangeText={onBoardDescriptionChange}
            placeholder="Add a description for this board"
            placeholderTextColor="#6B778C"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base min-h-[100px]"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Template
          </Text>
          
          <Pressable
            onPress={() => setShowTemplatePicker(!showTemplatePicker)}
            className="bg-[#1a1a1a] px-4 py-3 rounded-xl flex-row items-center justify-between"
          >
            <View className="flex-1">
              <Text className="text-white text-base font-medium">
                {selectedTemplateData?.name}
              </Text>
              <Text className="text-gray-500 text-sm mt-1">
                {selectedTemplateData?.description}
              </Text>
            </View>
            <Ionicons 
              name={showTemplatePicker ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#6B778C" 
            />
          </Pressable>

          {showTemplatePicker && (
            <View className="mt-2 bg-[#1a1a1a] rounded-xl overflow-hidden">
              {BOARD_TEMPLATES.map((template, index) => (
                <Pressable
                  key={template.id}
                  onPress={() => handleTemplateSelect(template.id)}
                  className={`px-4 py-3 flex-row items-center justify-between ${
                    index !== BOARD_TEMPLATES.length - 1 ? 'border-b border-gray-800' : ''
                  }`}
                >
                  <View className="flex-1">
                    <Text className={`text-base font-medium ${
                      selectedTemplate === template.id ? 'text-blue-500' : 'text-white'
                    }`}>
                      {template.name}
                    </Text>
                    <Text className="text-gray-500 text-sm mt-1">
                      {template.description}
                    </Text>
                    {template.lists.length > 0 && (
                      <Text className="text-gray-600 text-xs mt-1">
                        Lists: {template.lists.join(', ')}
                      </Text>
                    )}
                  </View>
                  {selectedTemplate === template.id && (
                    <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                  )}
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <View className="flex-row gap-3 pb-4">
          <Pressable
            onPress={onClose}
            disabled={creating}
            className="flex-1 bg-[#1a1a1a] py-4 rounded-xl active:opacity-70"
          >
            <Text className="text-white text-center font-semibold text-base">
              Cancel
            </Text>
          </Pressable>

          <Pressable
            onPress={handleCreate}
            disabled={creating || !boardName.trim()}
            className={`flex-1 py-4 rounded-xl ${
              creating || !boardName.trim() ? 'bg-gray-700' : 'bg-white'
            }`}
          >
            <Text className={`text-center font-semibold text-base ${
              creating || !boardName.trim() ? 'text-gray-500' : 'text-gray-900'
            }`}>
              {creating ? 'Creating...' : 'Create'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </BottomDrawer>
  );
}