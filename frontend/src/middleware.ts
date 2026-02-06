import { defineMiddleware } from 'astro:middleware';

const adminPublicRoutes = ['/admin/login', '/admin/forgot-password', '/admin/reset-password'];

export const onRequest = defineMiddleware(async (context, next) => {
  if (context.isPrerendered) {
    return next();
  }

  const { url, cookies, redirect } = context;
  const pathname = url.pathname;
  const accessToken = cookies.get('access_token')?.value;

  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
  const isAdminPublicRoute = adminPublicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isAdminRoute && !isAdminPublicRoute && !accessToken) {
    return redirect('/admin/login');
  }

  if ((pathname === '/admin' || pathname === '/admin/login') && accessToken) {
    return redirect('/admin/dashboard');
  }

  return next();
});
