import React, { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

/**
 * DateSelectionDrawer Component
 * Simple date and time selection using text inputs
 * Replaces DateTimePicker to avoid unmount issues
 * 
 * @param {Date|null} currentDate - Current due date if set
 * @param {Function} onDateSelected - Callback when date is selected
 * @param {Function} onRemove - Callback to remove due date
 */
export default function DateSelectionDrawer({ currentDate, onDateSelected, onRemove }) {
  const [date, setDate] = useState(
    currentDate ? currentDate.toISOString().split('T')[0] : ''
  );
  const [time, setTime] = useState(
    currentDate ? currentDate.toTimeString().split(' ')[0].slice(0, 5) : ''
  );

  /**
   * Handle save button press
   * Validates and creates Date object from date and time inputs
   */
  const handleSave = () => {
    if (!date.trim()) {
      Alert.alert('Error', 'Please select a date');
      return;
    }

    // Combine date and time
    const dateTimeString = time.trim() 
      ? `${date}T${time}:00` 
      : `${date}T12:00:00`;
    
    const selectedDate = new Date(dateTimeString);
    
    if (isNaN(selectedDate.getTime())) {
      Alert.alert('Error', 'Invalid date or time');
      return;
    }

    onDateSelected?.(selectedDate);
  };

  return (
    <View>
      <Text className="text-2xl font-bold text-white mb-6">
        Set Due Date
      </Text>

      {/* Date Input */}
      <View className="mb-4">
        <Text className="text-sm font-semibold text-gray-400 mb-2">
          Date
        </Text>
        <TextInput
          value={date}
          onChangeText={setDate}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#6B778C"
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
        />
        <Text className="text-gray-500 text-xs mt-1">
          Format: YYYY-MM-DD (e.g., 2024-12-25)
        </Text>
      </View>

      {/* Time Input */}
      <View className="mb-6">
        <Text className="text-sm font-semibold text-gray-400 mb-2">
          Time (Optional)
        </Text>
        <TextInput
          value={time}
          onChangeText={setTime}
          placeholder="HH:MM"
          placeholderTextColor="#6B778C"
          className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
        />
        <Text className="text-gray-500 text-xs mt-1">
          Format: HH:MM (e.g., 14:30) - Defaults to 12:00 if empty
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-3 mb-4">
        {currentDate && (
          <Pressable
            onPress={onRemove}
            className="flex-1 bg-red-600 py-4 rounded-xl"
          >
            <Text className="text-white text-center font-semibold text-base">
              Remove
            </Text>
          </Pressable>
        )}
        
        <Pressable
          onPress={handleSave}
          className={`flex-1 py-4 rounded-xl ${currentDate ? 'bg-white' : 'bg-white'}`}
        >
          <Text className="text-gray-900 text-center font-semibold text-base">
            Save
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

