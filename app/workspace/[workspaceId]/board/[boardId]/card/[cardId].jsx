import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import CardDetail from '../../../../../../components/cards/CardDetails';
import { useState } from 'react';
import CardUpdate from '../../../../../../components/cards/CardUpdate';
import BottomDrawer from '../../../../../../components/ui/BottomDrawer';

export default function CardDetailScreen() {
  const router = useRouter();
  const { workspaceId, boardId, cardId } = useLocalSearchParams();
  
  const [showUpdateDrawer, setShowUpdateDrawer] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdateSuccess = () => {
    setShowUpdateDrawer(false);
    setRefreshKey(prev => prev + 1); // Force refresh du CardDetail
  };

  const handleOpenUpdate = () => {
    setShowUpdateDrawer(true);
  };

  const handleArchive = () => {
    // Archive logic puis retour au board
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      {/* Composant principal - CardDetail */}
      <CardDetail 
        key={refreshKey}
        cardId={cardId}
        onUpdate={handleOpenUpdate}
        onArchive={handleArchive}
      />

      {/* Drawer pour Update */}
      <BottomDrawer
        visible={showUpdateDrawer}
        onClose={() => setShowUpdateDrawer(false)}
      >
        <CardUpdate 
          cardId={cardId}
          onSuccess={handleUpdateSuccess}
        />
      </BottomDrawer>
    </View>
  );
}