import React, { useState } from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';
import NewWorkspace from '../workspace/NewWorkspace';

const OptionsModal = ({options, setOptions, refreshWorkspaces}) => {

  const [showNewWorkspace, setShowNewWorkspace] = useState(false);
  const toShowNewWorkspace = () => {
    setShowNewWorkspace(!showNewWorkspace)
  }
    // Handlers pour les actions du volet d'options
  const handleAdd = () => {
    toShowNewWorkspace()
    // setOptions(false);
  };

  

  const fetchAgain = () => {
    // alert('Fetch again' );
    refreshWorkspaces();
  }
    return (
      
      <>
      <View className='w-full h-full'>
      <Pressable
          className="flex-1 bg-black/50"
          onPress={() => setOptions(false)}
        >
          <View className="absolute bottom-0 left-0 right-0 bg-[#2a2a2a] p-4 rounded-t-xl">
            <Text className="text-white text-lg font-semibold mb-3">Workspaces options</Text>
            <TouchableOpacity
              onPress={handleAdd}
              className="w-full py-3 mb-2 bg-[#3b82f6] rounded"
            >
              <Text className="text-center text-white">Add New Workspace</Text>
            </TouchableOpacity>
            
          </View>
        </Pressable>
        <NewWorkspace onCreate={fetchAgain} onClose={toShowNewWorkspace} open={showNewWorkspace} />
      </View>
      </>
    );
};

export default OptionsModal;