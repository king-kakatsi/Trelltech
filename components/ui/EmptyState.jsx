import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

/**
 * Shared empty state illustration with icon, title, subtitle and optional CTA.
 */
export default function EmptyState({
  icon,
  title,
  subtitle,
  actionLabel,
  onAction,
  iconColor = '#6B778C',
  iconContainerClassName = '',
}) {
  return (
    <View className="flex-1 items-center justify-center px-8 py-12">
      <View className={`rounded-full p-6 mb-4 ${iconContainerClassName}`}>
        <Ionicons name={icon} size={64} color={iconColor} />
      </View>
      <Text className="text-white text-xl font-semibold mt-4 text-center">
        {title}
      </Text>
      {subtitle ? (
        <Text className="text-gray-400 text-sm mt-2 text-center">
          {subtitle}
        </Text>
      ) : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          className="mt-6 bg-white px-6 py-3 rounded-xl active:opacity-80"
        >
          <Text className="text-gray-900 font-semibold text-base">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
