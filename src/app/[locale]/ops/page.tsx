'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { getOpsQueue, getOpsStats, updateBookingStatus, type BookingRequest } from '@/lib/api';
import { getLocalizedText, getStatusLabel, statusColors, cn, type Locale } from '@/lib/utils';

type BookingWithSla = BookingRequest & {
  clinicId: { _id: string; name: { en: string; ja: string; zh: string }; city: string };
  sla: { hoursElapsed: number; hoursRemaining: number; isOverdue: boolean };
  guestEmail?: string;
  guestPhone?: string;
  accessCode: string;
};

const statuses = [
  'received',
  'contactingHospital',
  'proposedOptions',
  'confirmed',
  'cancelled',
  'needsMoreInfo',
  'noAvailability',
] as const;

export default function OpsPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as Locale;

  const [bookings, setBookings] = useState<BookingWithSla[]>([]);
  const [stats, setStats] = useState<{
    statusCounts: Record<string, number>;
    totalRequests: number;
    conversionRate: number;
    pending: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingWithSla | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [queueRes, statsRes] = await Promise.all([
      getOpsQueue({ status: filter || undefined }),
      getOpsStats(),
    ]);
    if (queueRes.success && queueRes.data) {
      setBookings(queueRes.data.items as BookingWithSla[]);
    }
    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdating(true);
    const res = await updateBookingStatus(bookingId, { status: newStatus });
    if (res.success) {
      await fetchData();
      setSelectedBooking(null);
    }
    setUpdating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('Ops.title')}</h1>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Requests</p>
            <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Confirmed</p>
            <p className="text-2xl font-bold text-green-600">{stats.statusCounts.confirmed || 0}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Conversion Rate</p>
            <p className="text-2xl font-bold text-blue-600">{stats.conversionRate}%</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('')}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              filter === '' ? 'bg-gray-900 text-white border-gray-900' : 'border-gray-300 hover:bg-gray-50'
            )}
          >
            All
          </button>
          {statuses.map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={cn(
                'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                filter === status
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-300 hover:bg-gray-50'
              )}
            >
              {getStatusLabel(status, locale)}
              {stats?.statusCounts[status] ? ` (${stats.statusCounts[status]})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No booking requests found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    ID / Code
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Clinic
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Procedure
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('Ops.status')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('Ops.sla')}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    {t('Ops.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((booking) => (
                  <tr key={booking._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-mono text-sm text-gray-900">{booking.accessCode}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {getLocalizedText(booking.clinicId.name, locale)}
                      </p>
                      <p className="text-xs text-gray-500 capitalize">{booking.clinicId.city}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{booking.procedure}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(booking.preferredDate).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-900">{booking.guestEmail}</p>
                      {booking.guestPhone && (
                        <p className="text-xs text-gray-500">{booking.guestPhone}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2 py-1 text-xs font-medium rounded-full',
                          statusColors[booking.status] || 'bg-gray-100 text-gray-800'
                        )}
                      >
                        {getStatusLabel(booking.status, locale)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {booking.sla.isOverdue ? (
                        <span className="text-red-600 font-medium text-sm">
                          Overdue ({booking.sla.hoursElapsed}h)
                        </span>
                      ) : booking.status === 'received' ? (
                        <span className="text-sm text-gray-600">
                          {booking.sla.hoursRemaining}h remaining
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        {t('Ops.openRequest')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Booking: {selectedBooking.accessCode}
                </h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Clinic</p>
                  <p className="font-medium">{getLocalizedText(selectedBooking.clinicId.name, locale)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Procedure</p>
                  <p className="font-medium">{selectedBooking.procedure}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Preferred Date</p>
                  <p className="font-medium">
                    {new Date(selectedBooking.preferredDate).toLocaleDateString()}
                    {selectedBooking.preferredTimeSlot && ` - ${selectedBooking.preferredTimeSlot}`}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact</p>
                  <p className="font-medium">{selectedBooking.guestEmail}</p>
                  {selectedBooking.guestPhone && (
                    <p className="text-sm text-gray-500">{selectedBooking.guestPhone}</p>
                  )}
                </div>
              </div>

              {/* Current Status */}
              <div>
                <p className="text-sm text-gray-500 mb-2">Current Status</p>
                <span
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium rounded-full',
                    statusColors[selectedBooking.status]
                  )}
                >
                  {getStatusLabel(selectedBooking.status, locale)}
                </span>
              </div>

              {/* Update Status */}
              <div>
                <p className="text-sm text-gray-500 mb-2">{t('Ops.setStatus')}</p>
                <div className="flex flex-wrap gap-2">
                  {statuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusUpdate(selectedBooking._id, status)}
                      disabled={updating || status === selectedBooking.status}
                      className={cn(
                        'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                        status === selectedBooking.status
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {getStatusLabel(status, locale)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedBooking(null)}
                className="w-full py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
