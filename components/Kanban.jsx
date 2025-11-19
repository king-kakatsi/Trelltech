import { View, Text, TouchableOpacity,ScrollView } from 'react-native';
import TaskCard from './TaskCard';

export default function KanbanView() {
    return(
       
    <View >

      <ScrollView>

        {/* LIST HEADER */}
        <View className="w-full flex-row items-center justify-between bg-gray-200 px-4 mt-4 py-3 rounded-lg">
          <Text className="text-base font-semibold">List name</Text>

          <TouchableOpacity className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-lg">⋯</Text>
          </TouchableOpacity>
        </View>

        {/* CARD LIST */}
        <View className="bg-gray-200 rounded-lg mt-3 p-4">

          {/* CARD ITEM */}
          <TaskCard/>
            <TaskCard/>
            <TaskCard/>
            <TaskCard/>
        </View>
      </ScrollView>
    </View>
  );
}
    
