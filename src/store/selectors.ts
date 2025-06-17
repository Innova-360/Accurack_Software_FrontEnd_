import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Counter selectors
export const selectCounter = (state: RootState) => state.counter;
export const selectCounterValue = (state: RootState) => state.counter.value;
export const selectCounterLoading = (state: RootState) => state.counter.loading;
export const selectCounterError = (state: RootState) => state.counter.error;

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectToken = (state: RootState) => state.auth.token;

// UI selectors
export const selectUI = (state: RootState) => state.ui;
export const selectTheme = (state: RootState) => state.ui.theme;
export const selectSidebarOpen = (state: RootState) => state.ui.sidebarOpen;
export const selectUILoading = (state: RootState) => state.ui.loading;
export const selectNotifications = (state: RootState) => state.ui.notifications;

// Search selectors
export const selectSearch = (state: RootState) => state.search;
export const selectSearchTerm = (state: RootState) => state.search.searchTerm;
export const selectDebouncedSearchTerm = (state: RootState) => state.search.debouncedSearchTerm;

// Memoized selectors
export const selectUserDisplayName = createSelector(
  [selectUser],
  (user) => user?.name || user?.email || 'Guest'
);

export const selectNotificationCount = createSelector(
  [selectNotifications],
  (notifications) => notifications.length
);
