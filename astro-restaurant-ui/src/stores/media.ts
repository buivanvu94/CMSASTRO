import { atom } from 'nanostores';
import type { Media } from '@/lib/api/media';

// Selected media (for media picker)
export const $selectedMedia = atom<Media[]>([]);

export const setSelectedMedia = (media: Media[]) => {
  $selectedMedia.set(media);
};

export const addSelectedMedia = (media: Media) => {
  const current = $selectedMedia.get();
  if (!current.find((m) => m.id === media.id)) {
    $selectedMedia.set([...current, media]);
  }
};

export const removeSelectedMedia = (mediaId: number) => {
  $selectedMedia.set($selectedMedia.get().filter((m) => m.id !== mediaId));
};

export const clearSelectedMedia = () => {
  $selectedMedia.set([]);
};

export const toggleMediaSelection = (media: Media) => {
  const current = $selectedMedia.get();
  const exists = current.find((m) => m.id === media.id);
  
  if (exists) {
    removeSelectedMedia(media.id);
  } else {
    addSelectedMedia(media);
  }
};

// Upload progress tracking
export interface UploadProgress {
  filename: string;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  error?: string;
}

export const $uploadProgress = atom<Record<string, UploadProgress>>({});

export const setUploadProgress = (filename: string, progress: UploadProgress) => {
  $uploadProgress.set({
    ...$uploadProgress.get(),
    [filename]: progress,
  });
};

export const removeUploadProgress = (filename: string) => {
  const current = $uploadProgress.get();
  const { [filename]: removed, ...rest } = current;
  $uploadProgress.set(rest);
};

export const clearUploadProgress = () => {
  $uploadProgress.set({});
};

// Media picker mode
export type MediaPickerMode = 'single' | 'multiple';

export const $mediaPickerMode = atom<MediaPickerMode>('single');

export const setMediaPickerMode = (mode: MediaPickerMode) => {
  $mediaPickerMode.set(mode);
};
