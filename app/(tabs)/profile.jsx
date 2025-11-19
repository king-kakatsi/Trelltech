/* eslint-disable react-hooks/exhaustive-deps */
import { View, Text, Pressable, TextInput, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
// import { Ionicons } from '@expo/vector-icons';
import { updateCurrentUser } from '../../services/trello';
import BottomDrawer from '../../components/ui/BottomDrawer';


export default function ProfileScreen() {
  const router = useRouter();
  const { user, token, logout } = useAuth();
  
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedBio, setEditedBio] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // const handleOpenEdit = () => {
  //   setEditedName(user?.fullName || '');
  //   setEditedBio(user?.bio || '');
  //   setDrawerVisible(true);
  // };

  const handleCloseEdit = () => {
    setDrawerVisible(false);
  };

  const handleSave = async () => {
    if (!editedName.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setIsSaving(true);
    try {
      await updateCurrentUser(token, {
        fullName: editedName,
        bio: editedBio,
      });
      
      handleCloseEdit();
      Alert.alert('Success', 'Profile updated! Restart app to see changes.');
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  if (!user) {
    return (
      <View className="flex-1 bg-[#1a1a1a] items-center justify-center">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-[#1a1a1a]">
      <View className="bg-[#2a2a2a] px-4 pt-12 pb-6 border-b border-gray-700">
        <Text className="text-2xl font-bold text-white">Profile</Text>
        
        {/* <Pressable
          onPress={handleOpenEdit}
          className="absolute right-4 top-12 w-12 h-12 bg-[#0079BF] rounded-full items-center justify-center"
        >
          <Ionicons name="create-outline" size={24} color="white" />
        </Pressable> */}
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-[#2a2a2a] rounded-2xl p-6 items-center mb-6">
          <View className="w-28 h-28 rounded-full bg-[#0079BF] items-center justify-center mb-4">
            <Text className="text-white text-5xl font-bold">
              {user.fullName?.[0]?.toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          
          <Text className="text-2xl font-bold text-white mb-2">
            {user.fullName || user.username || 'User'}
          </Text>
          
          {user.username && (
            <Text className="text-[#0079BF] mb-2 text-base">
              @{user.username}
            </Text>
          )}
          
          {user.bio && user.bio.trim() && (
            <View className="bg-[#1a1a1a] rounded-xl p-4 w-full mt-4">
              <Text className="text-gray-300 text-sm leading-5">
                {user.bio}
              </Text>
            </View>
          )}
          
          {(!user.bio || !user.bio.trim()) && (
            <Text className="text-gray-500 text-sm mt-2">
              No bio yet. Tap edit to add one!
            </Text>
          )}
        </View>

        <Pressable
          onPress={handleLogout}
          className="bg-[#EB5A46] py-4 rounded-xl active:opacity-80"
        >
          <Text className="text-white text-center font-semibold text-lg">
            Logout
          </Text>
        </Pressable>
      </ScrollView>

      <BottomDrawer visible={isDrawerVisible} onClose={() => setDrawerVisible(false)}>
        <Text className="text-2xl font-bold text-white mb-6">
          Edit Profile
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Full Name
          </Text>
          <TextInput
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Your name"
            placeholderTextColor="#6B778C"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-semibold text-gray-400 mb-2">
            Bio
          </Text>
          <TextInput
            value={editedBio}
            onChangeText={setEditedBio}
            placeholder="Tell us about yourself"
            placeholderTextColor="#6B778C"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-[#1a1a1a] text-white px-4 py-3 rounded-xl text-base min-h-[100px]"
          />
        </View>

        <View className="flex-row gap-3">
          <Pressable
            onPress={() => setDrawerVisible(false)}
            disabled={isSaving}
            className="flex-1 bg-[#1a1a1a] py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-center font-semibold text-base">
              Cancel
            </Text>
          </Pressable>

          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className="flex-1 bg-[#0079BF] py-4 rounded-xl active:opacity-80"
          >
            <Text className="text-white text-center font-semibold text-base">
              {isSaving ? 'Saving...' : 'Save'}
            </Text>
          </Pressable>
        </View>
      </BottomDrawer>
    </View>
  );
}