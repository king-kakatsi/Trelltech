import { View, Text, TouchableOpacity } from 'react-native';


export default function TaskCard() {
    return (
        < View className = "flex-row items-center justify-between bg-white p-4 rounded-xl my-2 shadow" >
            <View>
              <Text className="text-base font-semibold">Card name</Text>
              <Text className="text-xs text-gray-400 mt-1">Expiration date</Text>
            </View>
            <TouchableOpacity className="w-5 h-5 rounded-full border border-gray-400" />
          </View >
    );
}
