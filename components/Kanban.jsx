// import { View, Text, TouchableOpacity,ScrollView } from 'react-native';
// import TaskCard from './TaskCard';

// export default function KanbanView() {
//     return(
       
//     <View >

//       <ScrollView>

//         {/* LIST HEADER */}
//         <View className="w-full flex-row items-center justify-between bg-gray-200 px-4 mt-4 py-3 rounded-lg">
//           <Text className="text-base font-semibold">List name</Text>

//           <TouchableOpacity className="w-7 h-7 rounded-full bg-gray-200 items-center justify-center">
//             <Text className="text-lg">⋯</Text>
//           </TouchableOpacity>
//         </View>

//         {/* CARD LIST */}
//         <View className="bg-gray-200 rounded-lg mt-3 p-4">

//           {/* CARD ITEM */}
//           <TaskCard/>
//             <TaskCard/>
//             <TaskCard/>
//             <TaskCard/>
//         </View>
//       </ScrollView>
//     </View>
//   );
// }
    

import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import TaskCard from './TaskCard';
import { useState, useEffect } from 'react';
import { getList } from '../services/boardService';

export default function KanbanView({ listId, onUpdate, onArchive, onOpenMenu }) {

  const [list, setList] = useState();

  useEffect(() => {
    const loadListData = async () => {
      const listData = await getList(listId);
      setList(listData);
    };
    loadListData();
  }, [])

  return (
    <View className="flex-1">
      {/* LIST HEADER */}
      <View className="flex-row items-center justify-between bg-[#2a2a2a] px-4 py-3 rounded-lg mb-3">
        <Text className="text-lg font-semibold text-white flex-1" numberOfLines={1}>
          {list?.name}
        </Text>

        <TouchableOpacity 
          onPress={() => onOpenMenu(list)}
          className="w-8 h-8 rounded-full bg-[#1a1a1a] items-center justify-center ml-2"
        >
          <Ionicons name="ellipsis-horizontal" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* CARD LIST - Scrollable */}
      <ScrollView 
        className="flex-1 bg-[#2a2a2a] rounded-lg p-4"
        showsVerticalScrollIndicator={false}
      >
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
        <TaskCard />
      </ScrollView>
    </View>
  );
}