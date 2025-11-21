import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Text, TouchableOpacity, View } from 'react-native';
import { deleteWorkspace } from '../../services/workspaces';
import BottomDrawer from '../ui/BottomDrawer';
import ManageWorkspaceMembers from '../workspace/ManageWorkspaceMembers';
import UpdateWorkspace from '../workspace/UpdateWorkspace';

const WorkspaceOptions = ({selectedAccordionId,setSelectedAccordionId, setListMenuVisible, selectedWorkspace = null, onRefresh = null}) => {
    const router = useRouter();
    const [isEditDrawerVisible, setEditDrawerVisible] = useState(false);
    const [isAddMembersDrawerVisible, setAddMembersDrawerVisible] = useState(false); // new state

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
          "Confirm Deletion",
          "Are you sure you want to delete this workspace? This action cannot be undone.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: async () => {
                try {
                  const id = selectedAccordionId;
                  // appeler la fonction de suppression
                  const [success, data] = await deleteWorkspace(id);
                  console.log('DEBUG deleteWorkspace result:', success, data);

                  if (!success) {
                    // suppression OK : fermer menu, réinitialiser sélection et déclencher refresh si fourni
                    Alert.alert('Supprimé', 'Workspace deleted successfully.');
                    setListMenuVisible(false);
                    // setSelectedAccordionId(null);
                    if (typeof onRefresh === 'function') {
                      try { onRefresh(); } catch (e) { console.error('onRefresh callback error', e); }
                    }
                  } else {
                    console.error('Delete failed:', data);
                    Alert.alert('Erreur', data?.message || 'Deletion failed.');
                  }
                } catch (error) {
                  console.error('Error deleting workspace:', error);
                  Alert.alert('Erreur', 'Something went wrong while deleting the workspace.');
                }
              }
            },
          ]
        );
      };
    
      const handleAddMembers = () => {
        if (!selectedAccordionId) return;
        // setListMenuVisible(false);
        setAddMembersDrawerVisible(true);
        // keep selectedAccordionId intact if parent relies on it; we close it when drawer completes
      };

    return (
        <View className="p-4">
          <TouchableOpacity onPress={handleAccess} className="py-3 px-4 bg-blue-600 rounded-md mb-2">
            <Text className="text-white">Show the workspace</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleEdit} className="py-3 px-4 bg-yellow-600 rounded-md mb-2">
            <Text className="text-white">Modify the workspace</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleDelete} className="py-3 px-4 bg-red-600 rounded-md mb-2">
            <Text className="text-white">Delete the workspace</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleAddMembers} className="py-3 px-4 bg-green-600 rounded-md">
            <Text className="text-white">Manage members</Text>
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
                onRefresh()
                // si vous avez un refresh au parent, appelez le callback approprié (non fourni ici)
              }}
            />
          </BottomDrawer>

          {/* Render ManageWorkspaceMembers directly — it renders its own BottomDrawer */}
          <ManageWorkspaceMembers
            visible={isAddMembersDrawerVisible}
            workspaceId={selectedAccordionId}
            onClose={() => {
              setAddMembersDrawerVisible(false);
              setListMenuVisible(false);
              setSelectedAccordionId(null);
            }}
            onMembersUpdated={() => {
              try { if (typeof onRefresh === 'function') onRefresh(); } catch(e){ console.error(e); }
              setAddMembersDrawerVisible(false);
              setListMenuVisible(false);
              setSelectedAccordionId(null);
            }}
          />
        </View>
    );
};

export default WorkspaceOptions;