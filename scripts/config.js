// PocketBase Configuration
// Automatically detects development vs production environment

// Production PocketBase backend (GCP VM, auto-TLS via PocketBase).
const PROD_POCKETBASE_URL = 'https://mcc-pb.carwbrown.com';

const config = {
  // Local dev -> local PocketBase; anything else -> production backend.
  // Note: this is a no-build static site, so import.meta.env is not available.
  get pocketbaseUrl() {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://127.0.0.1:8090';
    }
    return PROD_POCKETBASE_URL;
  }
};

export default config;
