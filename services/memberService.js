import { fetchFromLocalStorage } from "./localStorageService";
import { TRELLO_CONFIG } from "../utils/constants";
import {
  getFromApi,
  postWithApi,
  updateWithApi,
  deleteWithApi,
} from "./axiosService";

/**
 * Get available members based on instance type
 * @param {string} instanceType - 'workspace' | 'board' | 'card'
 * @param {string} instanceId - ID of the instance
 * @returns {Promise<Array>} List of available members
 */
export const getAvailableMembers = async (instanceType, instanceId) => {
  try {
    const token = await fetchFromLocalStorage("trello_token");
    if (!token) {
      throw "No token found";
    }

    let endpoint = "";

    switch (instanceType) {
      case "workspace":
        endpoint = `/organizations/${instanceId}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      case "board":
        const boardEndpoint = `/boards/${instanceId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&fields=idOrganization`;
        const [boardSuccess, boardData] = await getFromApi(boardEndpoint);
        if (!boardSuccess || !boardData.idOrganization) {
          throw "Failed to get board organization";
        }
        endpoint = `/organizations/${boardData.idOrganization}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      case "card":
        const cardEndpoint = `/cards/${instanceId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&fields=idBoard`;
        const [cardSuccess, cardData] = await getFromApi(cardEndpoint);
        if (!cardSuccess || !cardData.idBoard) {
          throw "Failed to get card board";
        }
        endpoint = `/boards/${cardData.idBoard}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      default:
        throw "Invalid instance type";
    }

    const [success, data] = await getFromApi(endpoint);

    if (!success) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching available members:", error);
    throw error;
  }
};

/**
 * Get current members of an instance
 * @param {string} instanceType - 'workspace' | 'board' | 'card'
 * @param {string} instanceId - ID of the instance
 * @returns {Promise<Array>} List of current members
 */
export const getCurrentMembers = async (instanceType, instanceId) => {
  try {
    const token = await fetchFromLocalStorage("trello_token");
    if (!token) {
      throw "No token found";
    }

    let endpoint = "";

    switch (instanceType) {
      case "workspace":
        endpoint = `/organizations/${instanceId}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      case "board":
        endpoint = `/boards/${instanceId}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      case "card":
        endpoint = `/cards/${instanceId}/members?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      default:
        throw "Invalid instance type";
    }

    const [success, data] = await getFromApi(endpoint);

    if (!success) {
      throw data;
    }

    return data;
  } catch (error) {
    console.error("Error fetching current members:", error);
    throw error;
  }
};

/**
 * Add a member to an instance
 * @param {string} instanceType - 'workspace' | 'board' | 'card'
 * @param {string} instanceId - ID of the instance
 * @param {string} memberId - ID of the member to add
 * @returns {Promise<boolean>} Success status
 */
export const addMember = async (instanceType, instanceId, memberId) => {
  try {
    const token = await fetchFromLocalStorage("trello_token");
    if (!token) {
      throw "No token found";
    }

    let endpoint = "";
    let success, data;

    switch (instanceType) {
      case "workspace":
        // Workspace uses PUT request
        endpoint = `/organizations/${instanceId}/members/${memberId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&type=normal`;

        [success, data] = await updateWithApi(
          endpoint,
          {},
          { autoJoin: false }
        );
        break;

      case "board":
        // Board uses PUT request
        endpoint = `/boards/${instanceId}/members/${memberId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}&type=normal`;

        [success, data] = await updateWithApi(
          endpoint,
          {},
          { autoJoin: false }
        );
        break;

      case "card":
      
        endpoint = `/cards/${instanceId}/idMembers?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;

        [success, data] = await postWithApi(endpoint, { value: memberId });
        break;

      default:
        throw "Invalid instance type";
    }

    if (!success) {
      throw data;
    }

    return true;
  } catch (error) {
    console.error("Error adding member:", error);
    throw error;
  }
};

/**
 * Remove a member from an instance
 * @param {string} instanceType - 'workspace' | 'board' | 'card'
 * @param {string} instanceId - ID of the instance
 * @param {string} memberId - ID of the member to remove
 * @returns {Promise<boolean>} Success status
 */
export const removeMember = async (instanceType, instanceId, memberId) => {
  try {
    const token = await fetchFromLocalStorage("trello_token");
    if (!token) {
      throw "No token found";
    }

    let endpoint = "";

    switch (instanceType) {
      case "workspace":
        endpoint = `/organizations/${instanceId}/members/${memberId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      case "board":
        endpoint = `/boards/${instanceId}/members/${memberId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      case "card":
        endpoint = `/cards/${instanceId}/idMembers/${memberId}?key=${TRELLO_CONFIG.API_KEY}&token=${token}`;
        break;

      default:
        throw "Invalid instance type";
    }

    const [success, data] = await deleteWithApi(endpoint, { autoJoin: false });

    if (!success) {
      throw data;
    }

    return true;
  } catch (error) {
    console.error("Error removing member:", error);
    throw error;
  }
};
