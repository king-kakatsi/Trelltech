import React, { useEffect, useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addComment, deleteComment, updateComment } from '../../services/cards';

export default function CardComments({ cardId, initialComments = [], onCommentsChange }) {
  const [comments, setComments] = useState(Array.isArray(initialComments) ? initialComments : []);

  useEffect(() => {
    setComments(Array.isArray(initialComments) ? initialComments : []);
  }, [initialComments]);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const [newComment, setNewComment] = useState('');
  const [posting, setPosting] = useState(false);

  const refresh = (updated) => {
    setComments(updated);
    onCommentsChange?.(updated);
  };

  // Ajouter un commentaire
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setPosting(true);
    try {
      const response = await addComment(cardId, newComment.trim());
      if (response.success) {
        refresh([...comments, response.data]);
        setNewComment('');
      } else {
        Alert.alert("Erreur", response.error || "Impossible d'ajouter le commentaire");
      }
    } catch (err) {
      console.error("Erreur ajout commentaire:", err);
      Alert.alert("Erreur", "Impossible d'ajouter le commentaire");
    } finally {
      setPosting(false);
    }
  };

  // Activer edit
  const startEditing = (comment) => {
    setEditingId(comment.id);
    setEditText(comment.data?.text || "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditText('');
  };

  // Remplace saveEdit par ceci
  const saveEdit = async (comment) => {
    if (!editText.trim()) return;

    try {
      const response = await updateComment(cardId, comment.id, editText.trim());
      if (!response.success) throw new Error(response.error || "Update failed");

      const newList = comments.map(c =>
        c.id === comment.id ? response.data : c
      );
      refresh(newList);

      cancelEditing();
    } catch (err) {
      console.error("Erreur modification commentaire:", err);
      Alert.alert("Erreur", "Impossible de modifier le commentaire");
    }
  };


  // Delete
  const handleDelete = async (commentId) => {
    try {
      const response = await deleteComment(cardId, commentId);
      if (response.success) refresh(comments.filter(c => c.id !== commentId));
      else Alert.alert("Erreur", response.error || "Impossible de supprimer le commentaire");
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  return (
    <View className="mt-4 mb-[300px]">
      <Text className="text-white font-semibold mb-2">Comments</Text>

      {/* Input field at the top */}
      <View className="mb-4 flex-row items-center">
        <TextInput
          value={newComment}
          onChangeText={setNewComment}
          placeholder="Add a comment..."
          placeholderTextColor="#888"
          className="flex-1 border border-gray-600 rounded-lg px-3 py-2 mr-2 text-white"
        />

        <TouchableOpacity
          onPress={handleAddComment}
          disabled={posting}
          className="bg-blue-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white font-semibold">
            {posting ? "..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Comments list */}
      {Array.isArray(comments) ? comments.map(comment => (
        <View key={comment.id} className="bg-[#333333] rounded-lg p-3 mb-3">

          {/* Header: Auteur + actions */}
          <View className="flex-row justify-between items-center">
            <Text className="text-gray-400 text-sm font-medium">
              {comment.memberCreator?.fullName ?? "Unknown"}
            </Text>

            <View className="flex-row space-x-3">
              {editingId === comment.id ? (
                <>
                  <TouchableOpacity onPress={() => saveEdit(comment)}>
                    <Text className="text-blue-400 text-sm mx-4">Save</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={cancelEditing}>
                    <Text className="text-gray-400 text-sm">Cancel</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity onPress={() => startEditing(comment)}>
                    <Text className="text-blue-400 text-sm mx-4">Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => handleDelete(comment.id)}>
                    <Text className="text-red-400 text-sm">Delete</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>

          {/* Commentaire */}
          {editingId === comment.id ? (
            <TextInput
              value={editText}
              onChangeText={setEditText}
              multiline
              className="bg-gray-600 text-white rounded px-2 py-1 mt-2"
            />
          ) : (
            <Text className="text-gray-100 mt-2">{comment.data?.text}</Text>
          )}

          <Text className="text-gray-400 text-xs mt-1">
            {new Date(comment.date).toLocaleString()}
          </Text>
        </View>
      )) : null}
    </View>
  );
}
