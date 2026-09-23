import React from 'react';
import EmptyState from '../ui/EmptyState';

export default function EmptyListsState({ onCreateList }) {
  return (
    <EmptyState
      icon="list-outline"
      title="No lists yet"
      subtitle="Create your first list to get started"
      actionLabel="Create First List"
      onAction={onCreateList}
      iconColor="white"
      iconContainerClassName="bg-white/10"
    />
  );
}
