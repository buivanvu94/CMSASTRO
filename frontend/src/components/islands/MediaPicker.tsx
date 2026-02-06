import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { mediaApi } from '@/lib/api';
import type { Media } from '@/lib/api/media';
import { $selectedMedia, toggleMediaSelection, clearSelectedMedia, setSelectedMedia } from '@/stores/media';
import Modal from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: any | any[]) => void;
  multiple?: boolean;
  accept?: string; // 'image' | 'video' | 'document' | 'all'
}

export default function MediaPicker({ isOpen, onClose, onSelect, multiple = false, accept = 'all' }: MediaPickerProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const selectedMedia = useStore($selectedMedia);

  useEffect(() => {
    if (isOpen) {
      loadMedia();
      clearSelectedMedia();
    }
  }, [isOpen, page, search, folder]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      
      if (search) params.search = search;
      if (folder) params.folder = folder;
      if (accept !== 'all') params.type = accept;

      const response = await mediaApi.getAll(params);
      setMedia(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item: Media) => {
    if (multiple) {
      toggleMediaSelection(item);
    } else {
      setSelectedMedia([item]);
    }
  };

  const handleConfirm = () => {
    if (multiple) {
      onSelect(selectedMedia);
    } else {
      onSelect(selectedMedia[0] || null);
    }
    onClose();
  };

  const isSelected = (id: number) => {
    return selectedMedia.some(m => m.id === id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Select Media" size="xl">
      <div className="space-y-4 text-base">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-3 text-base rounded-lg bg-black/60 border border-amber-400/20 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none transition-colors"
          />
          <input
            type="text"
            placeholder="Filter by folder..."
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="w-56 px-4 py-3 text-base rounded-lg bg-black/60 border border-amber-400/20 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none transition-colors"
          />
        </div>

        {/* Media Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {media.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                    isSelected(item.id)
                      ? 'border-amber-400 ring-2 ring-amber-400/30'
                      : 'border-amber-400/10 hover:border-amber-400/40'
                  }`}
                >
                  {item.mime_type.startsWith('image/') ? (
                    <img
                      src={item.thumbnail_path || item.path}
                      alt={item.alt_text || item.filename}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-black/70 flex items-center justify-center">
                      <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  
                  {isSelected(item.id) && (
                    <div className="absolute top-2 right-2 bg-amber-400 text-slate-950 rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  
                  <div className="p-2 bg-black/80">
                    <p className="text-sm text-slate-300 truncate">{item.filename}</p>
                  </div>
                </div>
              ))}
            </div>

            {media.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                No media found
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-amber-400/10">
          <div className="text-base text-slate-400">
            {selectedMedia.length > 0 && (
              <span>{selectedMedia.length} selected</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-5 py-3 text-base text-slate-200 bg-black/70 border border-amber-400/20 rounded-lg hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={selectedMedia.length === 0}
              className="px-5 py-3 text-base bg-amber-400 text-black rounded-lg hover:bg-amber-300 disabled:bg-zinc-700 disabled:cursor-not-allowed transition-colors cursor-pointer"
            >
              Select
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
