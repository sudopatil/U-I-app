// src/api.js

export const API_BASE_URL = "http://localhost:3001/api";

/**
 * Sends a login request to the backend.
 * @param {Object} credentials - The user credentials.
 * @param {string} credentials.email - The user's email.
 * @param {string} credentials.password - The user's password.
 * @returns {Promise<Object>} - Returns a promise resolving to the login response.
 */
export async function login(credentials) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to login.");
  }
  return await response.json();
}

/**
 * Sends a registration request to the backend.
 * This function handles both first partner registration and second partner registration (with invitation token).
 * @param {Object} payload - The registration payload.
 * @param {string} payload.email - User's email.
 * @param {string} payload.password - User's password.
 * @param {string} payload.firstName - User's first name.
 * @param {string} payload.dateOfBirth - Date of birth (YYYY-MM-DD).
 * @param {string} payload.gender - User's gender.
 * @param {string} payload.role - Role (either "girlfriend" or "boyfriend").
 * @param {boolean} payload.isFirstPartner - True if first partner registration.
 * @param {string} [payload.invitationToken] - Invitation code (required when isFirstPartner is false).
 * @returns {Promise<Object>} - Returns a promise resolving to the registration response.
 */
export async function register(payload) {
  const response = await fetch(`${API_BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to register.");
  }
  return await response.json();
}
