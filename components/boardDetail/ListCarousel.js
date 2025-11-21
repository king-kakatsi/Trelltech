import React from 'react';
import { View, ScrollView } from 'react-native';
import KanbanView from '../Kanban';

export default function ListCarousel({
  lists,
  currentIndex,
  onIndexChange,
  onOpenListMenu,
  screenWidth,
  screenHeight,
  workspaceId,
  boardId,
}) {
  const handleScroll = (event) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
    if (index !== currentIndex) {
      onIndexChange(index);
    }
  };
  console.log('DEBUG - lalala', workspaceId);
  return (
    <>
      {lists.length > 0 && (
        <View className="flex-row justify-center items-center py-3 gap-2">
          {lists.map((_, index) => (
            <View
              key={index}
              style={{
                height: 8,
                borderRadius: 4,
                width: index === currentIndex ? 32 : 8,
                backgroundColor: index === currentIndex ? 'white' : 'rgba(255, 255, 255, 0.4)'
              }}
            />
          ))}
        </View>
      )}

      <View className="flex-1 pb-6">
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleScroll}
          decelerationRate="fast"
        >
          {lists.map((item) => (
            <View key={item.id} style={{ width: screenWidth, paddingHorizontal: 16 }}>
              <KanbanView
                listId={item?.id}
                onOpenMenu={onOpenListMenu}
                workspaceId={workspaceId}
                boardId={boardId}
              />
            </View>
          ))}
        </ScrollView>
      </View>
    </>
  );
}