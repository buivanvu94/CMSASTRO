import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url } = context;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/admin/dashboard', '/admin/posts', '/admin/products', '/admin/categories', '/admin/media', '/admin/reservations', '/admin/contacts', '/admin/users', '/admin/settings', '/admin/menus'];
  
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

