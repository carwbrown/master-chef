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

/** The logged-in user's family id — stamp this on every per-family record. */
export const familyId = () => pb.authStore.record?.family || null;
/** The logged-in user's own id (e.g. recipe owner). */
export const userId = () => pb.authStore.record?.id || null;
/** Whether the logged-in user is the super-admin (gates the family console). */
export const isSuperadmin = () => !!pb.authStore.record?.is_superadmin;

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
  pb.authStore.clear();                               // clears the PocketBase auth key
  try { localStorage.clear(); sessionStorage.clear(); } catch {}  // wipe any other app state (shared devices)
  window.location.href = '/login.html';
}
