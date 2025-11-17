import { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View className="flex-1 bg-[#1a1a1b] p-4">
      <TextInput
        className="bg-[#272729] p-4 rounded-xl text-white mb-5 border border-[#343536]"
        placeholder="Search subreddits..."
        placeholderTextColor="#818384"
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      
      <ScrollView>
        <Text className="text-2xl font-bold text-white mb-4">
          Popular Subreddits
        </Text>
        
        <View className="bg-[#272729] p-4 rounded-xl mb-2.5 border border-[#343536]">
          <Text className="text-lg font-bold text-[#33977D]">
            r/askreddit
          </Text>
          <Text className="text-sm text-[#818384] mt-1 mb-2.5">
            Ask and answer questions
          </Text>
          <TouchableOpacity>
            <Text className="text-sm text-[#33977D] font-bold">
              + Subscribe
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-[#272729] p-4 rounded-xl mb-2.5 border border-[#343536]">
          <Text className="text-lg font-bold text-[#33977D]">
            r/funny
          </Text>
          <Text className="text-sm text-[#818384] mt-1 mb-2.5">
            Funny posts and memes
          </Text>
          <TouchableOpacity>
            <Text className="text-sm text-[#33977D] font-bold">
              + Subscribe
            </Text>
          </TouchableOpacity>
        </View>
        
        <View className="bg-[#272729] p-4 rounded-xl mb-2.5 border border-[#343536]">
          <Text className="text-lg font-bold text-[#33977D]">
            r/gaming
          </Text>
          <Text className="text-sm text-[#818384] mt-1 mb-2.5">
            Gaming community
          </Text>
          <TouchableOpacity>
            <Text className="text-sm text-[#33977D] font-bold">
              + Subscribe
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}