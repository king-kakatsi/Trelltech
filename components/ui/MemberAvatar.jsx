import React from 'react';
import { Text, View } from 'react-native';
import { getMemberColor, getMemberInitials } from '../../utils/memberColors';

/**
 * Member avatar with initials.
 */
export default function MemberAvatar({
  member,
  size = 32,
  textStyle = '',
  className = '',
}) {
  const memberKey = member?.id || member?.fullName || String(member);
  const backgroundColor = getMemberColor(memberKey);
  const initials = member?.initials || getMemberInitials(member?.fullName);

  return (
    <View
      className={`rounded-full items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        backgroundColor,
      }}
    >
      <Text
        className={`font-semibold text-white ${textStyle}`}
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </Text>
    </View>
  );
}
