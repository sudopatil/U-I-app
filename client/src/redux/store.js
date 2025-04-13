// src/redux/store.js

import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage for web

const persistConfig = {
  key: "root",
  storage,
};

// Combine your reducers
const rootReducer = combineReducers({
  auth: authReducer,
});

// Create a persisted reducer using redux-persist
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // to handle non-serializable redux-persist actions
    }),
});

export const persistor = persistStore(store);
