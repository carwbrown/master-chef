/**
 * Authentication helpers for Master Chef (PocketBase SDK).
 */
import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.28.0/dist/pocketbase.es.mjs';
import config from './config.js';

export const pb = new PocketBase(config.pocketbaseUrl);
pb.autoCancellation(false);

export function isAuthenticated() {
  return pb.authStore.isValid;
}

export function getCurrentUser() {
  return pb.authStore.record;   // .model was removed in newer SDKs
}

export function requireAuth() {
  if (!isAuthenticated()) {
    window.location.href = '/login.html';
    return false;
  }
  return true;
}

export async function login(identity, password) {
  try {
    const authData = await pb.collection('users').authWithPassword(identity, password);
    return { success: true, user: authData.record };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export function logout() {
  pb.authStore.clear();
  window.location.href = '/login.html';
}
