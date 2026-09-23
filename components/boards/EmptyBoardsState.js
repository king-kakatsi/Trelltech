import React from 'react';
import EmptyState from '../ui/EmptyState';

export default function EmptyBoardsState({ searchQuery, onCreateBoard }) {
  const hasSearch = searchQuery && searchQuery.trim().length > 0;

  return (
    <EmptyState
      icon="folder-open-outline"
      title={hasSearch ? 'No boards found' : 'No boards yet'}
      subtitle={
        hasSearch
          ? 'Try a different search term'
          : 'Create your first board to get started'
      }
      actionLabel={hasSearch ? undefined : 'Create First Board'}
      onAction={hasSearch ? undefined : onCreateBoard}
      iconColor="#9ca3af"
      iconContainerClassName="bg-neutral-800"
    />
  );
}
