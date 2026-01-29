/**
 * Authentication helpers for master-chef
 * Uses PocketBase SDK directly
 */

import PocketBase from 'https://cdn.jsdelivr.net/npm/pocketbase@0.21.1/dist/pocketbase.es.mjs';
import config from './config.js';

// Create PocketBase instance
export const pb = new PocketBase(config.pocketbaseUrl);
pb.autoCancellation(false);

// Check if user is authenticated
export function isAuthenticated() {
    return pb.authStore.isValid;
}

// Get current user
export function getCurrentUser() {
    return pb.authStore.model;
}

// Redirect to login if not authenticated
export function requireAuth() {
    if (!isAuthenticated()) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Login with email/username and password
export async function login(identity, password) {
    try {
        const authData = await pb.collection('users').authWithPassword(identity, password);
        return { success: true, user: authData.record };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Register new user
export async function register(email, username, password, passwordConfirm) {
    try {
        const user = await pb.collection('users').create({
            email,
            username,
            password,
            passwordConfirm
        });
        // Auto-login after registration
        await login(email, password);
        return { success: true, user };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout
export function logout() {
    pb.authStore.clear();
    window.location.href = '/login.html';
}
