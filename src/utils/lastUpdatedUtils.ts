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
