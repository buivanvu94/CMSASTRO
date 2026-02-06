import { useEffect } from 'react';

export default function AuthGuard() {
  useEffect(() => {
    console.log('ðŸ”’ [AUTH GUARD] Checking authentication...');
    
    // Check if we're in the middle of logging in
    const loggingIn = sessionStorage.getItem('logging_in');
    if (loggingIn === 'true') {
      console.log('â³ [AUTH GUARD] Login in progress, skipping check...');
      return;
    }
    
    const accessToken = localStorage.getItem('access_token');
    console.log('ðŸ”‘ [AUTH GUARD] Access token found:', accessToken ? 'Yes' : 'No');
    
    if (!accessToken) {
      console.log('âŒ [AUTH GUARD] No token found, redirecting to login...');
      window.location.replace('/admin/login');
    } else {
      console.log('âœ… [AUTH GUARD] Token found, access granted');
    }
  }, []);

  return null;
}

