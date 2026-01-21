// src/store.js
import { configureStore } from '@reduxjs/toolkit';
import interactionReducer from './interactionSlice';

export const store = configureStore({
  reducer: {
    interaction: interactionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these non-serializable values
        ignoredActions: ['interaction/submitChat/pending', 'interaction/submitForm/pending'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['interaction.chatHistory'],
      },
    }),
});

export default store;