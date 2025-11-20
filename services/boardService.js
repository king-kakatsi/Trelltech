import { fetchFromLocalStorage } from './localStorageService';
import { TRELLO_CONFIG } from '../utils/constants';
import { getFromApi, postWithApi, updateWithApi } from './axiosService';

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


export const getBoardLists = async (boardId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const fields = 'id,name,closed,pos';
      const endpoint = `/boards/${boardId}/lists?key=${TRELLO_CONFIG.API_KEY}&token=${token}&fields=${fields}&filter=open`;
      console.log('DEBUG getBoardLists endpoint:', endpoint);
      
      const [success, data] = await getFromApi(endpoint);
      console.log('DEBUG getBoardLists success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error fetching board lists:', error);
    throw error;
  }
};


export const getList = async (listId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const fields = 'id,name,closed,pos';
      const endpoint = `/lists/${listId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
      console.log('DEBUG list details endpoint:', endpoint);
      
      const [success, data] = await getFromApi(endpoint);
      console.log('DEBUG get list details success:', success);
      
      if (!success) throw data; 
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error fetching board lists:', error);
    throw error;
  }
};


export const getBoardDetails = async (boardId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const fields = 'id,name,desc,closed,url,prefs,dateLastActivity';
      const endpoint = `/boards/${boardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&fields=${fields}`;
      console.log('DEBUG getBoardDetails endpoint:', endpoint);
      
      const [success, data] = await getFromApi(endpoint);
      console.log('DEBUG getBoardDetails success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error fetching board details:', error);
    throw error;
  }
};


// Create a new board
export const createBoard = async (workspaceId, boardName, prefs = {}) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/boards/?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(boardName)}&idOrganization=${workspaceId}`;
      console.log('DEBUG createBoard endpoint:', endpoint);
      
      // Add optional prefs like background color
      let fullEndpoint = endpoint;
      if (prefs.backgroundColor) {
        fullEndpoint += `&prefs_background=${prefs.backgroundColor}`;
      }
      if (prefs.permissionLevel) {
        fullEndpoint += `&prefs_permissionLevel=${prefs.permissionLevel}`;
      }
      
      const [success, data] = await postWithApi(fullEndpoint);
      console.log('DEBUG createBoard success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error creating board:', error);
    throw error;
  }
};


// Update board name
export const updateBoardName = async (boardId, newName) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/boards/${boardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(newName)}`;
      console.log('DEBUG updateBoardName endpoint:', endpoint);
      
      const [success, data] = await updateWithApi(
        endpoint,
        {},
        { autoJoin: false }
      );
      console.log('DEBUG updateBoardName success:', success); 
      if (!success) throw data; 
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error updating board name:', error);
    throw error;
  }
};


// Update board description
export const updateBoardDescription = async (boardId, newDesc) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/boards/${boardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
      console.log('DEBUG updateBoardDescription endpoint:', endpoint);
      
      const [success, data] = await updateWithApi(
        endpoint, 
        { desc: newDesc },
        { autoJoin: false }
      );
      console.log('DEBUG updateBoardDescription success:', success);
      if (!success) throw data;
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error updating board description:', error);
    throw error;
  }
};

// Update board background color
export const updateBoardBackground = async (boardId, prefs) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/boards/${boardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
      console.log('DEBUG updateBoardBackground endpoint:', endpoint);
      
      const [success, data] = await updateWithApi(
        endpoint, 
        { prefs },
        { autoJoin: false }
      );
      console.log('DEBUG updateBoardBackground success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error updating board background:', error);
    throw error;
  }
};

// Close (archive) board
export const archiveBoard = async (boardId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/boards/${boardId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&closed=true`;
      console.log('DEBUG archiveBoard endpoint:', endpoint);
      
      const [success, data] = await updateWithApi(endpoint, {}, { autoJoin: false });
      console.log('DEBUG archiveBoard success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error archiving board:', error);
    throw error;
  }
};

// Create a new list
export const createList = async (boardId, listName, pos = 'bottom') => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/lists?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(listName)}&idBoard=${boardId}&pos=${pos}`;
      console.log('DEBUG createList endpoint:', endpoint);
      
      const [success, data] = await postWithApi(endpoint);
      console.log('DEBUG createList success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error creating list:', error);
    throw error;
  }
};

// Update list name
export const updateList = async (listId, newName) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/lists/${listId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(newName)}`;
      console.log('DEBUG updateList endpoint:', endpoint);
      
      const [success, data] = await updateWithApi(endpoint, {}, { autoJoin: false });
      console.log('DEBUG updateList success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error updating list:', error);
    throw error;
  }
};

// Archive (close) a list
export const archiveList = async (listId) => {
  try {
    const token = await fetchFromLocalStorage('trello_token');
    if (token) {
      const endpoint = `/lists/${listId}/closed?key=${TRELLO_CONFIG.API_KEY}&token=${token}&value=true`;
      console.log('DEBUG archiveList endpoint:', endpoint);
      
      const [success, data] = await updateWithApi(endpoint, {}, { autoJoin: false });
      console.log('DEBUG archiveList success:', success);
      
      if (!success) throw data;
      
      return data;
    }
    throw 'No token found';
  } catch (error) {
    console.error('Error archiving list:', error);
    throw error;
  }

  
};