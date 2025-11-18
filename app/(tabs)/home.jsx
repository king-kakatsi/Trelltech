import { View } from "react-native-web";
import KanbanView from "../../components/Kanban";


export default function HomeScreen() {
  return (
    <View className="w-80 max-h-screen">
      <KanbanView />
    </View>
    
   
  );
}