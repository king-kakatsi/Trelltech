import { TRELLO_CONFIG } from "../utils/constants";
import {
  deleteWithApi,
  getFromApi,
  postWithApi,
  updateWithApi,
} from "./axiosService";
import { fetchFromLocalStorage } from "./localStorageService";

// Get a card in list

export async function getCardsInList(listId) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/lists/${listId}/cards?members=true&key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await getFromApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to get list");
}

// Create a card

export async function createCard(listId, name, description) {
  const trelloToken = await fetchFromLocalStorage("trello_token");

  if (!trelloToken) {
    throw new Error("Trello token is missing.");
  }
  if (!listId || typeof listId !== "string" || listId.trim() === "") {
    throw new Error("Invalid list ID.");
  }
  const endPoint = `/cards?idList=${listId}&name=${encodeURIComponent(
    name
  )}&desc=${encodeURIComponent(description)}&key=${
    TRELLO_CONFIG.API_KEY
  }&token=${trelloToken}`;

  const [success, data] = await postWithApi(endPoint);

  if (success) {
    return data;
  } else {
    throw new Error("Failed to create new card.");
  }
}

// Update a card

export async function updateCard(cardId, newCardName, newDescription) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/cards/${cardId}?name=${newCardName}&desc=${newDescription}&key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await updateWithApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to update list");
}

// Delete a card

export async function deleteCard(cardId) {
  const trelloToken = await fetchFromLocalStorage("trello_token");
  if (trelloToken) {
    const endPoint = `/cards/${cardId}?key=${TRELLO_CONFIG.API_KEY}&token=${trelloToken}`;
    const [success, data] = await deleteWithApi(endPoint);
    if (success) return data;
  }
  throw new Error("Failed to delete list");
}
