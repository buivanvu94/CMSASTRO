import { useState, useEffect } from 'react';
import { reservationsApi } from '@/lib/api';
import Pagination from '@/components/ui/Pagination';

export default function ReservationTable() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadReservations();
  }, [page, statusFilter]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const params: any = { page, limit: 20 };
      if (statusFilter) params.status = statusFilter;

      const response = await reservationsApi.getAll(params);
      setReservations(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to load reservations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await reservationsApi.updateStatus(id, status);
      await loadReservations();
    } catch (error: any) {
      console.error('Failed to update status:', error);
      alert(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete reservation for "${name}"?`)) {
      return;
    }

    try {
      await reservationsApi.delete(id);
      await loadReservations();
    } catch (error: any) {
      console.error('Failed to delete reservation:', error);
      alert(error.response?.data?.message || 'Failed to delete reservation');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: 'bg-amber-500/20 text-amber-200 border border-amber-400/30',
      confirmed: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30',
      completed: 'bg-zinc-500/30 text-zinc-100 border border-zinc-400/30',
      cancelled: 'bg-rose-500/20 text-rose-200 border border-rose-400/30',
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
      <div className="flex gap-4 items-center">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 text-base rounded-lg bg-black/60 border border-amber-400/20 text-amber-100 focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500/60 outline-none"
        >
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
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
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Contact</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Date & Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Party Size</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-amber-200 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-amber-200 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-400/10">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="px-6 py-4 text-base font-semibold text-amber-100">{reservation.customer_name}</td>
                      <td className="px-6 py-4 text-base text-zinc-200">
                        <div>{reservation.customer_email}</div>
                        <div className="text-sm text-amber-200/70">{reservation.customer_phone}</div>
                      </td>
                      <td className="px-6 py-4 text-base text-zinc-200">{formatDate(reservation.reservation_date)}</td>
                      <td className="px-6 py-4 text-base text-zinc-200">{reservation.party_size} people</td>
                      <td className="px-6 py-4">
                        <select
                          value={reservation.status}
                          onChange={(e) => handleStatusUpdate(reservation.id, e.target.value)}
                          className={`text-sm font-semibold rounded-full px-3 py-2 outline-none ${getStatusBadge(reservation.status)}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(reservation.id, reservation.customer_name)}
                          className="text-rose-300 hover:text-rose-200 text-base"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {reservations.length === 0 && (
              <div className="text-center py-12 text-base text-amber-200/70">No reservations found</div>
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
