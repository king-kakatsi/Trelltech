import { getFromApi, postWithApi } from "./axiosService";
import { fetchFromLocalStorage } from "./localStorageService";

// const token = 'ATTA699410413122bd02f2e3b9be3ab68d9ca1754983909014257aebe51ba366362eD7365349';
// const apiKey = process.env.TRELLO_API_KEY || '86496354512907fde2844f5d95157f33';

const apiKey = process.env.EXPO_PUBLIC_TRELLTECH_API_KEY;

export async function getAllWorkspaces(token) {
    const res = await getFromApi(`/members/me/organizations?key=${apiKey}&token=${token}`);
    return res;
}

export async function getBoard(id,token) {
    const res = await getFromApi(`/boards/${id}?key=${apiKey}&token=${token}`);
    return res;
}

// export async function postBoard(displayName,token) {
//     const res = await getFromApi(`/organizations?displayName=${displayName}&key=${apiKey}&token=${token}`);
//     return res;
// }

// Create a new board
export const postBoard = async (displayName) => {
    try {
      const token = await fetchFromLocalStorage('trello_token');
      if (token) {
        const endpoint = `/organizations?displayName=${displayName}&key=${apiKey}&token=${token}`;
        // const endpoint = `/boards/?key=${TRELLO_CONFIG.API_KEY}&token=${token}&name=${encodeURIComponent(boardName)}&idOrganization=${workspaceId}`;
        console.log('DEBUG endpoint:', endpoint);
        
        // Add optional prefs like background color
        let fullEndpoint = endpoint;
        // if (prefs.backgroundColor) {
        //   fullEndpoint += `&prefs_background=${prefs.backgroundColor}`;
        // }
        // if (prefs.permissionLevel) {
        //   fullEndpoint += `&prefs_permissionLevel=${prefs.permissionLevel}`;
        // }
        
        const [success, data] = await postWithApi(fullEndpoint);
        console.log('DEBUG success:', success);
        
        if (!success) throw data;
        
        return data;
      }
      throw 'No token found';
    } catch (error) {
      console.error('Error creating board:', error);
      throw error;
    }
  };