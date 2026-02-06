import { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { productsApi } from '@/lib/api';
import { $user } from '@/stores/auth';
import Pagination from '@/components/ui/Pagination';

export default function ProductTable() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const user = useStore($user);

  useEffect(() => {
    loadProducts();
  }, [page, search, statusFilter, categoryFilter]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category_id = categoryFilter;

      const response = await productsApi.getAll(params);
      // Backend returns { data: items[], pagination: {} }
      setProducts(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
      return;
    }

    try {
      await productsApi.delete(id);
      await loadProducts();
    } catch (error: any) {
      console.error('Failed to delete product:', error);
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      draft: 'bg-gray-500/20 text-gray-300 border border-gray-500/30',
      published: 'bg-green-500/20 text-green-300 border border-green-500/30',
      archived: 'bg-red-500/20 text-red-300 border border-red-500/30',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border border-gray-500/30';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex gap-4 items-center">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2.5 !bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-xl !text-amber-100 placeholder-gray-500 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 focus:!bg-white/10 transition-all"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 !bg-white/5 backdrop-blur-sm border border-amber-400/20 rounded-xl !text-amber-100 focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/50 focus:!bg-white/10 transition-all appearance-none cursor-pointer"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fbbf24' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
            backgroundPosition: 'right 0.5rem center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: '1.5em 1.5em',
            paddingRight: '2.5rem'
          }}
        >
          <option value="" className="bg-gray-800 text-amber-100">All Status</option>
          <option value="draft" className="bg-gray-800 text-amber-100">Draft</option>
          <option value="published" className="bg-gray-800 text-amber-100">Published</option>
          <option value="archived" className="bg-gray-800 text-amber-100">Archived</option>
        </select>
        <a
          href="/products/new"
          className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-white rounded-xl hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 whitespace-nowrap font-medium shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30"
        >
          New Product
        </a>
      </div>

      {/* Table */}
      <div className="glass-gold border border-amber-400/20 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-amber-400/20">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-400/10">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {product.featuredImage && (
                            <img
                              src={product.featuredImage.thumbnail_url || product.featuredImage.url}
                              alt=""
                              className="w-10 h-10 object-cover rounded-lg border border-amber-400/20"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-amber-100">
                              {product.name}
                              {product.is_featured && (
                                <span className="ml-2 text-xs text-amber-400">★ Featured</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">{product.slug}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {product.category?.name || '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {product.prices && product.prices.length > 0 ? (
                          <div>
                            <div className="font-medium text-amber-100">
                              {formatPrice(product.prices[0].price)}
                            </div>
                            {product.prices[0].sale_price && (
                              <div className="text-xs text-red-400">
                                Sale: {formatPrice(product.prices[0].sale_price)}
                              </div>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(product.status)}`}>
                          {product.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {formatDate(product.created_at)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <a
                            href={`/products/${product.id}`}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                          >
                            Edit
                          </a>
                          <button
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {products.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No products found
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-amber-400/20">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
