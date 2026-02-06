import { atom } from 'nanostores';

// Loading state
export const $isLoading = atom<boolean>(false);

export const setLoading = (loading: boolean) => {
  $isLoading.set(loading);
};

// Modal state
export interface ModalState {
  isOpen: boolean;
  type: string | null;
  data: unknown;
}

export const $modal = atom<ModalState>({
  isOpen: false,
  type: null,
  data: null,
});

export const openModal = (type: string, data?: unknown) => {
  $modal.set({
    isOpen: true,
    type,
    data: data || null,
  });
};

export const closeModal = () => {
  $modal.set({
    isOpen: false,
    type: null,
    data: null,
  });
};

// Notification state
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export const $notifications = atom<Notification[]>([]);

let notificationId = 0;

export const addNotification = (
  type: Notification['type'],
  message: string,
  duration: number = 5000
) => {
  const id = `notification-${++notificationId}`;
  const notification: Notification = { id, type, message, duration };
  
  $notifications.set([...$notifications.get(), notification]);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }

  return id;
};

export const removeNotification = (id: string) => {
  $notifications.set($notifications.get().filter((n) => n.id !== id));
};

export const clearNotifications = () => {
  $notifications.set([]);
};

// Sidebar state (for mobile)
export const $isSidebarOpen = atom<boolean>(false);

export const toggleSidebar = () => {
  $isSidebarOpen.set(!$isSidebarOpen.get());
};

export const setSidebarOpen = (open: boolean) => {
  $isSidebarOpen.set(open);
};
