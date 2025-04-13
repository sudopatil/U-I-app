// src/redux/slices/authSlice.js

import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: null,
  user: null,
  partner: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Set credentials using the full login response shape
    setCredentials: (state, action) => {
      const { token, user, partner } = action.payload;
      state.token = token;
      state.user = user;
      state.partner = partner;
      state.isAuthenticated = true;
    },
    // Clear credentials for logout
    clearCredentials: (state) => {
      state.token = null;
      state.user = null;
      state.partner = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
