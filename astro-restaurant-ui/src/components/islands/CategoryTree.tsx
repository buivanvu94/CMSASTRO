import { useState, useEffect } from 'react';
import { categoriesApi } from '@/lib/api';

interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  sort_order: number;
  children?: Category[];
}

export default function CategoryTree() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const shellClass =
    'bg-gradient-to-b from-black/80 to-zinc-950/85 border border-amber-400/20 rounded-xl p-4 md:p-5 shadow-[0_12px_36px_-22px_rgba(251,191,36,0.45)] backdrop-blur';
  const rowClass =
    'flex items-center gap-2 py-3 px-3 rounded-lg group border border-transparent hover:border-amber-400/20 hover:bg-zinc-900/70 transition-colors';
  const inputClass =
    'flex-1 px-3 py-2 text-base rounded-lg bg-black/75 border border-amber-400/25 text-amber-50 placeholder:text-amber-200/45 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-400/80 outline-none transition-colors';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.getTree('post');
      setCategories(response);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: number) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditName('');
  };

  const saveEdit = async (id: number) => {
    try {
      await categoriesApi.update(id, { name: editName });
      await loadCategories();
      setEditingId(null);
      setEditName('');
    } catch (error) {
      console.error('Failed to update category:', error);
      alert('Could not update category');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete "${name}"? Child categories will be moved to the parent category.`)) {
      return;
    }

    try {
      await categoriesApi.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('Could not delete category');
    }
  };

  const renderCategory = (category: Category, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isExpanded = expandedIds.has(category.id);
    const isEditing = editingId === category.id;

    return (
      <div key={category.id} className="select-none">
        <div
          className={rowClass}
          style={{ paddingLeft: `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => toggleExpand(category.id)}
            className={`w-5 h-5 flex items-center justify-center text-amber-200/50 hover:text-amber-200 ${
              !hasChildren ? 'invisible' : ''
            }`}
          >
            {hasChildren && (
              <svg
                className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Category Name */}
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit(category.id);
                  if (e.key === 'Escape') cancelEdit();
                }}
                className={inputClass}
                autoFocus
              />
              <button
                onClick={() => saveEdit(category.id)}
                className="p-1.5 text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={cancelEdit}
                className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <>
              <span className="flex-1 text-base font-medium text-amber-100">{category.name}</span>
              <span className="text-sm text-amber-200/60">{category.slug}</span>
              
              {/* Actions */}
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <a
                  href={`/admin/categories/${category.id}`}
                  className="p-1.5 text-amber-300 hover:bg-amber-400/10 rounded transition-colors"
                  title="Edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </a>
                <button
                  onClick={() => startEdit(category)}
                  className="p-1.5 text-zinc-300 hover:bg-zinc-800 rounded transition-colors"
                  title="Quick edit"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="p-1.5 text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                  title="Delete"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {category.children!.map((child) => renderCategory(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-base">
      <div className="flex justify-end items-center">
        <a
          href="/admin/categories/new"
          className="px-5 py-3 text-base font-medium bg-gradient-to-r from-amber-500 to-yellow-600 text-black rounded-xl hover:from-amber-400 hover:to-yellow-500 transition-colors"
        >
          Add Category
        </a>
      </div>

      <div className={shellClass}>
        {categories.length === 0 ? (
          <div className="text-center py-12 text-base text-amber-200/60">
            No categories found. Create your first category to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {categories.map((category) => renderCategory(category))}
          </div>
        )}
      </div>
    </div>
  );
}


