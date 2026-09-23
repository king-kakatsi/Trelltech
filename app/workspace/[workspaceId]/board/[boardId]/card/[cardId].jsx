import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import CardDetail from '../../../../../../components/cards/CardDetails';

/**
 * CardDetailScreen Component
 * Screen component for displaying card details
 * Follows the same pattern as board detail screen
 */
export default function CardDetailScreen() {
  const router = useRouter();
  const { cardId } = useLocalSearchParams();

  const handleArchive = () => {
    // Archive logic handled in CardDetail component
    router.back();
  };

  return (
    <View className="flex-1 bg-[#0a0a0a]">
      <CardDetail 
        cardId={cardId}
        onArchived={handleArchive}
      />
    </View>
  );
}