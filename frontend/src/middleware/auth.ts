import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, redirect, cookies } = context;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/posts', '/products', '/categories', '/media', '/reservations', '/contacts', '/users', '/settings', '/menus'];
  
  // Check if current path is protected
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));
  
  if (isProtectedRoute) {
    // In static mode, we can't check server-side auth
    // We'll handle this client-side with a script
    // Just pass through for now
    return next();
  }
  
  return next();
});
