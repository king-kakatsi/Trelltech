import React from 'react';
import { View } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import KanbanView from '../Kanban';

export default function ListCarousel({
  lists,
  currentIndex,
  onIndexChange,
  onOpenListMenu,
  screenWidth,
  screenHeight
}) {
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

      <View className="flex-1 py-2">
        <Carousel
          width={screenWidth}
          height={screenHeight - 260}
          data={lists}
          onSnapToItem={onIndexChange}
          renderItem={({ item }) => (
            <View className="flex-1 px-4">
              <KanbanView
                listId={item?.id}
                onOpenMenu={onOpenListMenu}
              />
            </View>
          )}
        />
      </View>
    </>
  );
}