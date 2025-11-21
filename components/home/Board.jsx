import { Link } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getBoard } from '../../services/workspaces';

const Board = ({ id }) => {
    const { token, user } = useAuth();
    const [board, setBoard] = useState({});
    const [loading, setLoading] = useState(false);

    const getBackgroundColor = (color) => {
        const colorMap = {
            'blue': '#0079BF',
            'orange': '#D29034',
            'green': '#519839',
            'red': '#B04632',
            'purple': '#89609E',
            'pink': '#CD5A91',
            'lime': '#4BBF6B',
            'sky': '#00AECC',
            'grey': '#838C91'
        };
        return colorMap[color] || color || '#0079BF';
    };

    const getInitialsColor = (index) => {
        const colors = [
            '#0079BF', '#D29034', '#519839', '#B04632',
            '#89609E', '#CD5A91', '#4BBF6B', '#00AECC'
        ];
        return colors[index % colors.length];
    };

    const bgColor = getBackgroundColor(board.backgroundColor);
    const hasMembers = board.members && board.members.length > 0;
    const displayMembers = board.members?.slice(0, 5) || [];
    const remainingCount = (board.memberCount || 0) - displayMembers.length;

    // fonction qui récupère les workspaces en utilisant le token fourni
    const fetchBoard = async (currentToken) => {
        try {
            setLoading(true);
            const data = await getBoard(id, currentToken);


            // adapter selon la forme renvoyée par l'API
            if (Array.isArray(data)) {
                if (data[0] === true) {
                    setBoard(data[1]);
                } else {
                    setBoard({});
                }
            } else {
                console.warn('Format inattendu des workspaces:', data);
                setBoard({});
            }
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de la récupération des workspaces:', err);
            setBoard({});
            setLoading(false);
        }
    };

    // n'appeler la requête que lorsque token est disponible
    useEffect(() => {
        if (!token) {
            return;
        }
        fetchBoard(token);
    }, [token, id]); // ajout de id dans les dépendances

    return (
        // TODO: remplacer onPress par la navigation réelle de votre app (react-navigation / expo-router / react-router)
        <TouchableOpacity

        activeOpacity={0.8}
        className="bg-neutral-800 rounded-lg mb-3 border border-neutral-700 overflow-hidden w-full"
        onPress={() => {
            // TODO: naviguer vers `workspace/${id}/board/${board.id}`
            // Exemple: navigation.navigate('BoardScreen', { workspaceId: id, boardId: board.id })
        }}
    >
        <Link key={board.id} href={`/workspace/${board.idOrganization}/board/${board.id}`} className="w-full" >
            
        <View className="p-3">
            <View className="flex-row items-start justify-between mb-1">
                <Text className="text-white text-base font-semibold mr-2">
                    {
                        loading ? 'Loading...' : board.name
                    }
                </Text>

                {/* {board.memberCount > 0 && (
                <View className="flex-row items-center bg-neutral-700 rounded-full px-2 py-0.5">
                    <Ionicons name="people" size={14} color="#9ca3af" />
                    <Text className="text-neutral-400 text-xs ml-1 font-medium">
                        {board.memberCount}
                    </Text>
                </View>
            )} */}
            </View>

            {/* {board.desc ? (
            <Text className="text-neutral-400 text-sm mb-2" numberOfLines={2}>
                {board.desc}
            </Text>
        ) : null} */}
        </View>
        </Link>
        {/* <View style={{ backgroundColor: getBackgroundColor(board.backgroundColor) }} className="h-1 w-full" /> */}

    </TouchableOpacity>
    );
};

export default Board;