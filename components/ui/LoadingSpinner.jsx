import React from 'react';
import { ActivityIndicator, View } from 'react-native';

/**
 * Shared loading spinner.
 */
export default function LoadingSpinner({ size = 'large', color = '#ffffff' }) {
  return (
    <View className="flex-1 items-center justify-center">
      <ActivityIndicator size={size} color={color} />
    </View>
  );
}
