import React, { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { getBoard } from '../../services/workspaces';

const Board = ({ id }) => {
    const { token, user } = useAuth();
    const [board, setBoard] = useState({})
    const [loading, setLoading] = useState(false);

    // fonction qui récupère les workspaces en utilisant le token fourni
    const fetchBoard = async (currentToken) => {
        try {
            setLoading(true)
            // console.log('Fetching workspaces with token:', currentToken);
            const data = await getBoard(id, currentToken);
            // console.log('Board response:', data);

            // adapter selon la forme renvoyée par l'API
            if (Array.isArray(data)) {
                if (data[0] === true) {
                    setBoard(data[1]);
                }
            } else {
                console.warn('Format inattendu des workspaces:', data);
                setBoard([]);
            }
            setLoading(false);
        } catch (err) {
            console.error('Erreur lors de la récupération des workspaces:', err);
            setBoard([]);
        }
    };

    // n'appeler la requête que lorsque token est disponible
    useEffect(() => {
        if (!token) {
            // console.log('Token pas encore disponible, attente...');
            return;
        }
        fetchBoard(token);
    }, [token]);
    return (
        <View>
            {
                loading ? (
                    <Text>
                        Loading...
                    </Text>
                ) : board ? (
                    <Text>
                        {board.name}
                    </Text>
                ) : (
                    <Text>
                        No Board Found
                    </Text>
                )
            }
        </View>
    );
};

export default Board;