/**
 * Utility functions for managing the "Last Updated" functionality
 * This tracks when login/logout actions occur
 */

// Event system for communicating last updated changes
class LastUpdatedManager {
  private listeners: (() => void)[] = [];
  private lastUpdatedTime: Date = new Date();

  // Subscribe to last updated changes
  subscribe(callback: () => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  // Update the last updated time (call after login/logout)
  updateLastUpdated() {
    this.lastUpdatedTime = new Date();
    this.listeners.forEach(callback => callback());
  }

  // Get the current last updated time
  getLastUpdated() {
    return this.lastUpdatedTime;
  }

  // Format the last updated time
  formatLastUpdated(date: Date = this.lastUpdatedTime): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 60000);
    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
}

// Export singleton instance
export const lastUpdatedManager = new LastUpdatedManager();

// Convenience functions
export const updateLastUpdated = () => lastUpdatedManager.updateLastUpdated();
export const getLastUpdated = () => lastUpdatedManager.getLastUpdated();
export const formatLastUpdated = (date?: Date) => lastUpdatedManager.formatLastUpdated(date);

// Utility function to extract error messages from API response
export const extractErrorMessage = (error: any): string => {
  // Default fallback message
  const defaultMessage = "An unexpected error occurred. Please try again.";

  try {
    // Check if error exists and has response data
    if (!error?.response?.data) {
      return defaultMessage;
    }

    const { data } = error.response;

    // Handle different message formats
    if (data.message) {
      // If message is a string, return it directly
      if (typeof data.message === "string") {
        return data.message;
      }

      // If message is an array, join the messages
      if (Array.isArray(data.message)) {
        return data.message.join(", ");
      }

      // If message is an object, try to extract meaningful text
      if (typeof data.message === "object") {
        // Handle nested validation errors (e.g., { field: ['error1', 'error2'] })
        const errorMessages: string[] = [];
        Object.values(data.message).forEach((value: any) => {
          if (typeof value === "string") {
            errorMessages.push(value);
          } else if (Array.isArray(value)) {
            errorMessages.push(...value);
          }
        });
        return errorMessages.length > 0
          ? errorMessages.join(", ")
          : defaultMessage;
      }
    }

    // Check for other common error fields
    if (data.error) {
      if (typeof data.error === "string") {
        return data.error;
      }
      if (Array.isArray(data.error)) {
        return data.error.join(", ");
      }
    }

    // Check for detail field (common in some APIs)
    if (data.detail && typeof data.detail === "string") {
      return data.detail;
    }

    // If we have any string value in the data object, use it
    const firstStringValue = Object.values(data).find(
      (value) => typeof value === "string"
    );
    if (firstStringValue) {
      return firstStringValue as string;
    }
  } catch (extractionError) {
    console.error("Error extracting error message:", extractionError);
  }

  return defaultMessage;
};
