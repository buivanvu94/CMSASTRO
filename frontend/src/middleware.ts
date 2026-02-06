import { defineMiddleware } from 'astro:middleware';

const publicRoutes = ['/login', '/forgot-password', '/reset-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;
  const pathname = url.pathname;

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Get access token from cookies or localStorage (will be set by client)
  const accessToken = cookies.get('access_token')?.value;

  // If accessing protected route without token, redirect to login
  if (!isPublicRoute && !accessToken && pathname !== '/') {
    return redirect('/login');
  }

  // If accessing login page with valid token, redirect to dashboard
  if (pathname === '/login' && accessToken) {
    return redirect('/dashboard');
  }

  // Continue to the route
  return next();
});
