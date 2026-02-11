import { useState, useEffect } from 'react';
import contactsApi, { type Contact } from '@/lib/api/contacts';
import Pagination from '@/components/ui/Pagination';

export default function ContactTable() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    loadContacts();
  }, [page, statusFilter]);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const response = await contactsApi.getAll(params);
      setContacts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: Contact['status']) => {
    try {
      await contactsApi.updateStatus(id, { status });
      await loadContacts();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      alert('Please select contacts to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} contact(s)?`)) {
      return;
    }

    try {
      await contactsApi.bulkDelete({ ids: selectedIds });
      setSelectedIds([]);
      await loadContacts();
    } catch (error: any) {
      console.error('Failed to delete contacts:', error);
      alert(error.response?.data?.message || 'Failed to delete contacts');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === contacts.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(contacts.map(c => c.id));
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      new: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
      read: 'bg-zinc-500/30 text-zinc-100 border border-zinc-400/30',
      replied: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
    };
    return colors[status as keyof typeof colors] || 'bg-zinc-500/30 text-zinc-100 border border-zinc-400/30';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 text-base rounded-lg bg-black/60 border border-amber-400/20 text-amber-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none"
          >
            <option value="">All Status</option>
            <option value="new">New</option>
            <option value="read">Read</option>
            <option value="replied">Replied</option>
          </select>
        </div>
        {selectedIds.length > 0 && (
          <button
            onClick={handleBulkDelete}
            className="px-5 py-3 text-base bg-rose-600/90 text-white rounded-lg hover:bg-rose-500 transition-colors"
          >
            Delete Selected ({selectedIds.length})
          </button>
        )}
      </div>

      <div className="bg-black/70 border border-amber-400/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/60 border-b border-amber-400/20">
                  <tr>
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === contacts.length && contacts.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-zinc-600 accent-amber-400 focus:ring-amber-500/40"
                      />
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Message</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-400/10">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(contact.id)}
                          onChange={() => toggleSelect(contact.id)}
                          className="w-4 h-4 rounded border-zinc-600 accent-amber-400 focus:ring-amber-500/40"
                        />
                      </td>
                      <td className="px-6 py-4 text-base font-semibold text-amber-100">{contact.name}</td>
                      <td className="px-6 py-4 text-base text-zinc-200">
                        <div>{contact.email}</div>
                        <div className="text-sm text-amber-200/70">{contact.phone}</div>
                      </td>
                      <td className="px-6 py-4 text-base text-zinc-300 max-w-xs truncate">{contact.message}</td>
                      <td className="px-6 py-4 text-base text-zinc-300">{formatDate(contact.created_at)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={contact.status}
                          onChange={(e) => handleStatusUpdate(contact.id, e.target.value as Contact['status'])}
                          className={`text-sm font-semibold rounded-full px-3 py-2 outline-none ${getStatusBadge(contact.status)}`}
                        >
                          <option value="new">New</option>
                          <option value="read">Read</option>
                          <option value="replied">Replied</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {contacts.length === 0 && (
              <div className="text-center py-12 text-base text-amber-200/70">No contacts found</div>
            )}

            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-amber-400/20">
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
