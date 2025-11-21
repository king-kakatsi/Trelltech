import { deleteAllWithApi, getFromApi, postWithApi } from "./axiosService";
import { fetchFromLocalStorage } from "./localStorageService";

// const token = 'ATTA699410413122bd02f2e3b9be3ab68d9ca1754983909014257aebe51ba366362eD7365349';
// const apiKey = process.env.TRELLO_API_KEY || '86496354512907fde2844f5d95157f33';

const apiKey = process.env.EXPO_PUBLIC_TRELLTECH_API_KEY;

export async function getAllWorkspaces() {
    try {
        const token = await fetchFromLocalStorage('trello_token');
        if (!token) throw 'No token found';
        const endpoint = `/members/me/organizations?key=${apiKey}&token=${encodeURIComponent(token)}`;
        const res = await getFromApi(endpoint);
        return res;
    } catch (error) {
        console.error('Error fetching workspaces:', error);
        throw error;
    }
}

export async function getBoard(id) {
    try {
        const token = await fetchFromLocalStorage('trello_token');
        if (!token) throw 'No token found';
        const endpoint = `/boards/${id}?key=${apiKey}&token=${encodeURIComponent(token)}`;
        const res = await getFromApi(endpoint);
        return res;
    } catch (error) {
        console.error('Error fetching board:', error);
        throw error;
    }
}

// Create a new board
export const postBoard = async (displayName, options = {}) => {
    // options may contain: { desc, name, website }
    try {
        const token = await fetchFromLocalStorage('trello_token');
        if (!token) throw 'No token found';

        // build query params with displayName and any provided options
        const params = [];
        params.push(`displayName=${encodeURIComponent(displayName)}`);
        if (options.desc !== undefined && options.desc !== null) {
            params.push(`desc=${encodeURIComponent(options.desc)}`);
        }
        if (options.name !== undefined && options.name !== null) {
            params.push(`name=${encodeURIComponent(options.name)}`);
        }
        if (options.website !== undefined && options.website !== null) {
            params.push(`website=${encodeURIComponent(options.website)}`);
        }
        params.push(`key=${apiKey}`);
        params.push(`token=${encodeURIComponent(token)}`);

        const endpoint = `/organizations?${params.join('&')}`;
        console.log('DEBUG endpoint:', endpoint);

        // call API with endpoint only — no body
        const [success, data] = await postWithApi(endpoint);
        console.log('DEBUG success:', success);

        if (!success) throw data;
        return data;
    } catch (error) {
        console.error('Error creating board:', error);
        throw error;
    }
};

export async function deleteWorkspace(id) {
    try {
        const token = await fetchFromLocalStorage('trello_token');
        if (!token) throw 'No token found';
        const res = await deleteAllWithApi(`/organizations/${id}?key=${apiKey}&token=${token}`);
        console.log("deleteWorkspace", res);
        return res;
    } catch (error) {
        console.error('Error creating board:', error);
        throw error;
    }
}