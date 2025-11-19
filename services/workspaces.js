import { getFromApi } from "./axiosService";

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

