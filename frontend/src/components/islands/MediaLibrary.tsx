import { useState, useEffect } from 'react';
import mediaApi, { type Media } from '@/lib/api/media';
import Pagination from '@/components/ui/Pagination';

interface MediaLibraryProps {
  mode?: 'library' | 'picker';
  onSelect?: (media: Media[]) => void;
  multiple?: boolean;
}

interface MediaFolder {
  name: string;
  count: number;
}

export default function MediaLibrary({ mode = 'library', onSelect, multiple = false }: MediaLibraryProps) {
  const [media, setMedia] = useState<Media[]>([]);
  const [selectedMedia, setSelectedMedia] = useState<Media[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('');
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  useEffect(() => {
    loadMedia();
    loadFolders();
  }, [currentPage, search, folder]);

  const loadMedia = async () => {
    setIsLoading(true);
    try {
      const response = await mediaApi.getAll({
        page: currentPage,
        limit: 20,
        search: search || undefined,
        folder: folder || undefined,
      });
      setMedia(Array.isArray(response.data) ? response.data : []);
      setTotalPages(response.pagination?.totalPages || 1);
      setFeedback(null);
    } catch (error) {
      console.error('Failed to load media:', error);
      setFeedback({ type: 'error', message: 'Khong tai duoc danh sach media. Vui long thu lai.' });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFolders = async () => {
    try {
      const folderList = await mediaApi.getFolders();
      setFolders(Array.isArray(folderList) ? folderList : []);
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFeedback({ type: 'error', message: 'Khong tai duoc danh sach folder media.' });
    }
  };

  const resolveMediaSrc = (item: Media): string => {
    const rawPath = item.thumbnail_path || item.path || '';
    if (!rawPath) return '';
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) return rawPath;
    const apiBase = import.meta.env.PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const mediaBase = apiBase.replace(/\/api\/v\d+\/?$/, '');
    return `${mediaBase}${rawPath.startsWith('/') ? '' : '/'}${rawPath}`;
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    try {
      if (fileArray.length === 1) {
        await mediaApi.upload(fileArray[0], folder || undefined);
      } else {
        await mediaApi.uploadMultiple(fileArray, folder || undefined);
      }
      setFeedback({ type: 'success', message: 'Upload media thanh cong.' });
      loadMedia();
    } catch (error) {
      console.error('Upload failed:', error);
      setFeedback({ type: 'error', message: 'Upload that bai. Vui long thu lai.' });
    }
  };

  const handleSelect = (item: Media) => {
    if (mode === 'picker') {
      if (multiple) {
        const isSelected = selectedMedia.find((m) => m.id === item.id);
        if (isSelected) {
          setSelectedMedia(selectedMedia.filter((m) => m.id !== item.id));
        } else {
          setSelectedMedia([...selectedMedia, item]);
        }
      } else {
        setSelectedMedia([item]);
      }
    }
  };

  const handleConfirmSelection = () => {
    if (onSelect && selectedMedia.length > 0) {
      onSelect(selectedMedia);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      await mediaApi.delete(id);
      setFeedback({ type: 'success', message: 'Xoa media thanh cong.' });
      loadMedia();
    } catch (error) {
      console.error('Delete failed:', error);
      setFeedback({ type: 'error', message: 'Xoa media that bai. Vui long thu lai.' });
    }
  };

  return (
    <div className="space-y-4">
      {feedback && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            feedback.type === 'error'
              ? 'border-rose-400/40 bg-rose-500/10 text-rose-200'
              : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200'
          }`}
          role="status"
          aria-live="polite"
        >
          {feedback.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search files..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-3 text-base rounded-lg bg-black/60 border border-amber-400/20 text-amber-100 placeholder:text-amber-200/40 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
          />
        </div>
        <select
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          className="px-4 py-3 text-base rounded-lg bg-black/60 border border-amber-400/20 text-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60"
        >
          <option value="">All folders</option>
          {folders.map((f) => (
            <option key={f.name} value={f.name}>
              {f.name} ({f.count})
            </option>
          ))}
        </select>
        {mode === 'library' && (
          <label className="inline-flex items-center px-5 py-3 text-base bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-lg hover:from-amber-400 hover:to-yellow-400 cursor-pointer font-semibold transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload
            <input type="file" multiple className="hidden" onChange={(e) => handleFileUpload(e.target.files)} />
          </label>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
        </div>
      ) : media.length === 0 ? (
        <div className="text-center py-12 text-base text-amber-200/70">No files found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {media.map((item) => {
            const isSelected = selectedMedia.find((m) => m.id === item.id);
            return (
              <div
                key={item.id}
                className={`relative group border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
                  isSelected ? 'border-amber-400 ring-2 ring-amber-500/40' : 'border-amber-400/20 hover:border-amber-400/40'
                }`}
                onClick={() => handleSelect(item)}
              >
                <div className="aspect-square bg-zinc-900/80 flex items-center justify-center">
                  {item.mime_type.startsWith('image/') ? (
                    <img
                      src={resolveMediaSrc(item)}
                      alt={item.alt_text || item.original_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-amber-200/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  )}
                </div>
                <div className="p-3 bg-black/80 border-t border-amber-400/20">
                  <p className="text-sm text-amber-100 truncate">{item.original_name}</p>
                  <p className="text-sm text-amber-200/70">{(item.size / 1024).toFixed(1)} KB</p>
                </div>
                {mode === 'library' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-rose-600/90 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
                {isSelected && (
                  <div className="absolute top-2 left-2 w-6 h-6 bg-amber-400 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {mode === 'picker' && selectedMedia.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/95 border-t border-amber-400/30 p-4 shadow-lg">
          <div className="container mx-auto flex items-center justify-between">
            <p className="text-base text-amber-100">Selected {selectedMedia.length} file(s)</p>
            <div className="flex gap-2">
              <button
                onClick={() => setSelectedMedia([])}
                className="px-5 py-3 text-base border border-amber-400/30 text-amber-100 rounded-lg hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                className="px-5 py-3 text-base bg-gradient-to-r from-amber-500 to-yellow-500 text-black rounded-lg hover:from-amber-400 hover:to-yellow-400 font-semibold transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
