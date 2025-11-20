import { fetchFromLocalStorage } from './localStorageService';
import { TRELLO_CONFIG } from '../utils/constants';
import { getFromApi } from './axiosService';

export const getWorkspaceBoards = async (workspaceId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const fields = 'id,name,desc,closed,url,prefs';
      const endpoint = `/organizations/${workspaceId}/boards?key=${TRELLO_CONFIG.API_KEY}&token=${token}&fields=${fields}`;
      console.log('DEBUG getWorkspaceBoards endpoint:', endpoint);
      
      const [success, data] = await getFromApi(endpoint); 
      console.log('DEBUG getWorkspaceBoards success:', success);
      console.log('DEBUG getWorkspaceBoards data:', data);
      
      if (!success) throw data;
      
      const boardsWithMembers = await Promise.all(
        data.map(async (board) => {
          const members = await getBoardMembers(board.id);
          return {
            ...board,
            members: members,
            memberCount: members.length,
            backgroundColor: board.prefs?.backgroundColor || '#0079BF'
          };
        })
      );
      
      return boardsWithMembers;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error fetching workspace boards:', error);
    throw error;
  }
};

export const getBoardMembers = async (boardId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const fields = 'fullName,initials,username,avatarHash';
      const endpoint = `/boards/${boardId}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}&fields=${fields}`;
      console.log('DEBUG getBoardMembers endpoint:', endpoint);
      
      const [success, data] = await getFromApi(endpoint);
      console.log('DEBUG getBoardMembers success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error fetching board members:', error);
    return [];
  }
};