import { TRELLO_CONFIG } from "../utils/constants";
import {
  deleteWithApi,
  getFromApi,
  postWithApi,
  updateWithApi,
} from "./axiosService";
import { fetchFromLocalStorage } from "./localStorageService";

// Get a list

export async function getList(listId) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/lists/${listId}?key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await getFromApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to get list");
}

// Create a list
export async function createList(boardId, listName) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/lists?id=${boardId}&name=${listName}&key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await postWithApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to create new list");
}

// Update a list

export async function updateList(listId, newListName) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/lists/${listId}?name=${newListName}&key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await updateWithApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to update list");
}

// Delete a list

export async function deleteList(listId) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/lists/${listId}?key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await deleteWithApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to delete list");
}
