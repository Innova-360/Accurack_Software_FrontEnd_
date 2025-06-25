

/**
 * Utilities for handling "Remember Me" functionality
 */

export interface SavedCredentials {
  email: string;
  password: string;
  rememberMe: boolean;
}

const STORAGE_KEY = "accurack_remember_me";

/**
 * Saves user credentials to localStorage
 */
export const saveCredentials = (credentials: SavedCredentials): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error("Error saving credentials to localStorage:", error);
  }
};

/**
 * Loads saved credentials from localStorage
 */
export const loadSavedCredentials = (): SavedCredentials | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading saved credentials:", error);
    // Clear corrupted data
    clearSavedCredentials();
  }
  return null;
};

/**
 * Removes saved credentials from localStorage
 */
export const clearSavedCredentials = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing saved credentials:", error);
  }
};

/**
 * Checks if credentials are currently saved
 */
export const hasRememberedCredentials = (): boolean => {
  return localStorage.getItem(STORAGE_KEY) !== null;
};
