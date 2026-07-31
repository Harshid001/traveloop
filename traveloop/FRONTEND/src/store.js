import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './services/apiSlice';

export const store = configureStore({
  reducer: {
    // Add the RTK Query reducer under its own key
    [apiSlice.reducerPath]: apiSlice.reducer,
    // Add other reducers here if needed
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});
