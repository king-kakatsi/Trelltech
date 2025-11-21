import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { deleteWorkspace } from '../../services/workspaces';
import BottomDrawer from '../ui/BottomDrawer';
import UpdateWorkspace from '../workspace/UpdateWorkspace';

const WorkspaceOptions = ({selectedAccordionId,setSelectedAccordionId, setListMenuVisible, selectedWorkspace = null, onRefresh = null}) => {
    const router = useRouter();
    const [isEditDrawerVisible, setEditDrawerVisible] = useState(false);

    // actions for drawer options
      const handleAccess = () => {
        if (!selectedAccordionId) return;
        setListMenuVisible(false);
        const id = selectedAccordionId;
        setSelectedAccordionId(null);
        router.push(`workspace/${id}/boards`);
      };
    
      const handleEdit = () => {
        if (!selectedAccordionId) return;
        // fermer le menu principal, ouvrir le drawer d'édition
        // setListMenuVisible(false);
        setEditDrawerVisible(true);
      };
    
      const handleDelete = () => {
        if (!selectedAccordionId) return;
        Alert.alert(
          "Confirmer la suppression",
          "Voulez-vous vraiment supprimer ce workspace ?",
          [
            { text: "Annuler", style: "cancel" },
            { text: "Supprimer", style: "destructive", onPress: async () => {
                try {
                  const id = selectedAccordionId;
                  // appeler la fonction de suppression
                  const [success, data] = await deleteWorkspace(id);
                  console.log('DEBUG deleteWorkspace result:', success, data);

                  if (!success) {
                    // suppression OK : fermer menu, réinitialiser sélection et déclencher refresh si fourni
                    Alert.alert('Supprimé', 'Workspace supprimé avec succès.');
                    setListMenuVisible(false);
                    // setSelectedAccordionId(null);
                    if (typeof onRefresh === 'function') {
                      try { onRefresh(); } catch (e) { console.error('onRefresh callback error', e); }
                    }
                  } else {
                    console.error('Delete failed:', data);
                    Alert.alert('Erreur', data?.message || 'Échec de la suppression.');
                  }
                } catch (error) {
                  console.error('Error deleting workspace:', error);
                  Alert.alert('Erreur', 'Une erreur est survenue lors de la suppression.');
                }
              }
            },
          ]
        );
      };
    
      const handleAddMembers = () => {
        if (!selectedAccordionId) return;
        setListMenuVisible(false);
        const id = selectedAccordionId;
        setSelectedAccordionId(null);
        router.push(`workspace/${id}/members/add`); // adapter la route si nécessaire
      };
    return (
        <View className="p-4">
          <TouchableOpacity onPress={handleAccess} className="py-3 px-4 bg-blue-600 rounded-md mb-2">
            <Text className="text-white">Accéder au workspace</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEdit} className="py-3 px-4 bg-yellow-600 rounded-md mb-2">
            <Text className="text-white">Modifier</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} className="py-3 px-4 bg-red-600 rounded-md mb-2">
            <Text className="text-white">Supprimer</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddMembers} className="py-3 px-4 bg-green-600 rounded-md">
            <Text className="text-white">Ajouter des membres</Text>
          </TouchableOpacity>

          {/* Drawer / modal pour l'édition du workspace */}
          <BottomDrawer
            visible={isEditDrawerVisible}
            onClose={() => {
              setEditDrawerVisible(false);
              // garder l'état du selectedAccordionId intact ici, ou le réinitialiser si nécessaire
            }}
          >
            <UpdateWorkspace
              open={isEditDrawerVisible}
              workspace={selectedWorkspace}
              onClose={() => setEditDrawerVisible(false)}
              onUpdate={() => {
                // fermer drawer d'édition et réinitialiser la sélection
                setEditDrawerVisible(false);
                setListMenuVisible(false);
                setSelectedAccordionId(null);
                // si vous avez un refresh au parent, appelez le callback approprié (non fourni ici)
              }}
            />
          </BottomDrawer>
        </View>
    );
};

export default WorkspaceOptions;