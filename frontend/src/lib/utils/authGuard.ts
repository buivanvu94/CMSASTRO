/**
 * Client-side authentication guard
 * Checks if user is authenticated and redirects to login if not
 */
export function checkAuth(): boolean {
  if (typeof window === 'undefined') return false;
  
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    // No token, redirect to login
    window.location.href = '/admin/login';
    return false;
  }
  
  return true;
}

/**
 * Initialize auth check on page load
 */
export function initAuthGuard(): void {
  if (typeof window === 'undefined') return;
  
  // Check auth immediately
  checkAuth();
}

