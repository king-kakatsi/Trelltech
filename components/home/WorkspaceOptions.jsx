import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

const WorkspaceOptions = () => {
    return (
        <>
            <Modal
                visible={menuVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setMenuVisible(false)}
            >
                <Pressable
                    style={{
                        flex: 1,
                        backgroundColor: 'rgba(0,0,0,0.25)',
                        justifyContent: 'center',
                        alignItems: 'center'
                    }}
                    onPress={() => setMenuVisible(false)}
                >
                    <Pressable
                        style={{
                            width: 220,
                            backgroundColor: '#111827',
                            borderRadius: 8,
                            paddingVertical: 6,
                            elevation: 4
                        }}
                        onPress={() => { }}
                    >
                        <TouchableOpacity onPress={handleEdit} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Modifier</Text>
                        </TouchableOpacity>
                        <View style={{ height: 1, backgroundColor: '#1f2937', marginHorizontal: 8 }} />
                        <TouchableOpacity onPress={handleDelete} style={{ paddingVertical: 12, paddingHorizontal: 16 }}>
                            <Text style={{ color: '#fff', fontSize: 16 }}>Supprimer</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    );
};

export default WorkspaceOptions;