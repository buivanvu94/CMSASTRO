import { useEffect } from 'react';

export default function AuthGuard() {
  useEffect(() => {
    console.log('🔒 [AUTH GUARD] Checking authentication...');
    
    // Check if we're in the middle of logging in
    const loggingIn = sessionStorage.getItem('logging_in');
    if (loggingIn === 'true') {
      console.log('⏳ [AUTH GUARD] Login in progress, skipping check...');
      return;
    }
    
    const accessToken = localStorage.getItem('access_token');
    console.log('🔑 [AUTH GUARD] Access token found:', accessToken ? 'Yes' : 'No');
    
    if (!accessToken) {
      console.log('❌ [AUTH GUARD] No token found, redirecting to login...');
      window.location.replace('/login');
    } else {
      console.log('✅ [AUTH GUARD] Token found, access granted');
    }
  }, []);

  return null;
}
