export * from './client';

// Export API modules
export { default as authApi } from './auth';
export { default as usersApi } from './users';
export { default as categoriesApi } from './categories';
export { default as productCategoriesApi } from './product-categories';
export { default as postsApi } from './posts';
export { default as productsApi } from './products';
export { default as reservationsApi } from './reservations';
export { default as contactsApi } from './contacts';
export { default as menusApi } from './menus';
export { default as mediaApi } from './media';
export { default as settingsApi } from './settings';

// Export common shared types only to avoid name collisions between modules.
export type { User, PaginatedResponse } from './users';
