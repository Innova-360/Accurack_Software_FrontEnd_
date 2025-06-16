import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from './index';

// Counter selectors
export const selectCounter = (state: RootState) => state.counter;
export const selectCounterValue = (state: RootState) => state.counter.value;
export const selectCounterLoading = (state: RootState) => state.counter.loading;

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
export const selectModal = (state: RootState) => state.ui.modal;

// Memoized selectors
export const selectUnreadNotifications = createSelector(
  [selectNotifications],
  (notifications) => notifications.filter((notification) => notification.type === 'error')
);

export const selectUserDisplayName = createSelector(
  [selectUser],
  (user) => user?.name || user?.email || 'Guest'
);

export const selectIsModalOpen = createSelector(
  [selectModal],
  (modal) => modal.isOpen
);
