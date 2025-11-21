import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Store data in async storage
 * @param {string} key
 * @param {any} value
 * @returns {Promise<boolean>}
 */
export async function saveInLocalStorage(key, value) {
  try {
    if (key && key.trim() !== "") {
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    }
    return false;
  } catch (error) {
    console.error("Save to storage error:", error);
    return false;
  }
}

/**
 * Get data from async storage
 * @param {string} key
 * @returns {Promise<any|false>}
 */
export async function fetchFromLocalStorage(key) {
  try {
    if (key && key.trim() !== "") {
      const result = await AsyncStorage.getItem(key);
      return result ? JSON.parse(result) : false;
    }
    return false;
  } catch (error) {
    console.error("Fetch from storage error:", error);
    return false;
  }
}

/**
 * Remove data from async storage
 * @param {string} key
 * @returns {Promise<boolean>}
 */
export async function removeFromLocalStorage(key) {
  try {
    if (key && key.trim() !== "") {
      await AsyncStorage.removeItem(key);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Remove from storage error:", error);
    return false;
  }
}

/**
 * Clear all data from async storage
 * @returns {Promise<boolean>}
 */
export async function clearLocalStorage() {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error("Clear storage error:", error);
    return false;
  }
}

/**
 * Get all keys from async storage
 * @returns {Promise<string[]|false>}
 */
export async function getAllKeys() {
  try {
    const keys = await AsyncStorage.getAllKeys();
    return keys;
  } catch (error) {
    console.error("Get all keys error:", error);
    return false;
  }
}