// components/cards/CardComments.jsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { addComment, getCardComments, deleteComment } from '../../services/trello';
import { useAuth } from '../../contexts/AuthContext';

export default function CardComments({ cardId, initialComments = [], onCommentsChange }) {
  const { token } = useAuth();
  const [comments, setComments] = useState(initialComments);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const refreshComments = (updated) => {
    setComments(updated);
    onCommentsChange?.(updated);
  };

  // Ajouter un commentaire
  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setPosting(true);
    try {
      const commentData = await addComment(cardId, token, newComment.trim());
      if (commentData) refreshComments([...comments, commentData]);
      setNewComment('');
    } catch (error) {
      console.error('Erreur ajout commentaire:', error);
    } finally {
      setPosting(false);
    }
  };

  // Commencer l'édition inline
  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.data?.text || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  // Sauvegarder édition
  const saveEdit = async (comment) => {
    try {
      // Trello ne permet pas de modifier, on supprime et ajoute un nouveau commentaire
      await deleteComment(cardId, comment.id, token);
      const newC = await addComment(cardId, token, editText);
      const updatedComments = comments.map(c => c.id === comment.id ? newC : c);
      refreshComments(updatedComments);
      cancelEditing();
    } catch (error) {
      console.error('Erreur modification commentaire:', error);
    }
  };

  // Supprimer un commentaire
  const handleDeleteComment = async (commentId) => {
    try {
      const success = await deleteComment(cardId, commentId, token);
      if (success) refreshComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error('Erreur suppression commentaire:', error);
    }
  };

  return (
    <View className="mt-4">
      <Text className="text-white font-semibold mb-2">Commentaires</Text>

      {comments.map(comment => (
        <View key={comment.id} className="bg-[#333333] rounded-lg p-2 mb-2">
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-200 font-medium">{comment.memberCreator?.fullName}</Text>
            <View className="flex-row space-x-2">
              {editingId === comment.id ? (
                <>
                  <TouchableOpacity onPress={() => saveEdit(comment)}>
                    <Text className="text-blue-400 text-sm">Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={cancelEditing}>
                    <Text className="text-gray-400 text-sm">Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => startEditing(comment)}>
                    <Text className="text-blue-400 text-sm">Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteComment(comment.id)}>
                    <Text className="text-red-400 text-sm">Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {editingId === comment.id ? (
            <TextInput
              value={editText}
              onChangeText={setEditText}
              className="bg-gray-600 text-white rounded px-2 py-1 mt-1"
            />
          ) : (
            <Text className="text-gray-100 mt-1">{comment.data?.text}</Text>
          )}

          <Text className="text-gray-400 text-xs">{new Date(comment.date).toLocaleString()}</Text>
        </View>
      ))}

      {/* Ajouter un commentaire */}
      <View className="mt-2 flex-row items-center">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Ajouter un commentaire..."
          placeholderTextColor="#888"
          className="flex-1 border border-gray-600 rounded-lg px-3 py-2 mr-2 text-white"
        />
        <TouchableOpacity
          onPress={handleAddComment}
          className="bg-blue-500 px-4 py-2 rounded-lg"
          disabled={posting}
        >
          <Text className="text-white font-semibold">{posting ? '...' : 'Envoyer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
