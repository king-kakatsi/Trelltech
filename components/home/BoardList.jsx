import React from 'react';
import { View } from 'react-native';
import Board from './Board';

export default function BoardList({ boards = [], workspaceId }) {
  return (
    <View className="mt-1 pl-12">
      {boards.map((board) => (
        <Board key={board.id} board={board} workspaceId={workspaceId} />
      ))}
    </View>
  );
}
