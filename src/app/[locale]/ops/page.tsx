'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { LogOut, X } from 'lucide-react';
import { getOpsQueue, getOpsStats, updateBookingStatus, type BookingRequest } from '@/lib/api';
import { getLocalizedText, getStatusLabel, statusColors, cn, type Locale } from '@/lib/utils';
import { useOpsAuth } from '@/contexts/OpsAuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BookingWithSla = BookingRequest & {
  clinicId: { _id: string; name: { en: string; ja: string; zh: string }; city: string };
  sla: { hoursElapsed: number; hoursRemaining: number; isOverdue: boolean };
  guestEmail?: string;
  guestPhone?: string;
  accessCode: string;
  budget?: { min?: number; max?: number; currency?: string };
  notes?: string;
  confirmedOption?: { date: string; timeSlot: string; price: number };
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
  const router = useRouter();
  const locale = params.locale as Locale;
  const { user, isAuthenticated, isLoading: authLoading, logout } = useOpsAuth();

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

  // Form state for status update
  const [statusNote, setStatusNote] = useState('');
  const [confirmedDate, setConfirmedDate] = useState('');
  const [confirmedTime, setConfirmedTime] = useState('');
  const [confirmedPrice, setConfirmedPrice] = useState('');

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
    if (!authLoading && !isAuthenticated) {
      router.push(`/${locale}/ops/login`);
    }
  }, [authLoading, isAuthenticated, router, locale]);

  useEffect(() => {
    if (isAuthenticated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchData();
    }
  }, [isAuthenticated, fetchData]);

  // Reset form when booking is selected
  useEffect(() => {
    if (selectedBooking) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatusNote('');
      setConfirmedDate(
        selectedBooking.confirmedOption?.date
          ? new Date(selectedBooking.confirmedOption.date).toISOString().split('T')[0]
          : ''
      );
      setConfirmedTime(selectedBooking.confirmedOption?.timeSlot || '');
      setConfirmedPrice(selectedBooking.confirmedOption?.price?.toString() || '');
    }
  }, [selectedBooking]);

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    setUpdating(true);

    const updateData: {
      status: string;
      note?: string;
      confirmedOption?: { date: string; timeSlot: string; price: number };
    } = {
      status: newStatus,
    };

    if (statusNote) {
      updateData.note = statusNote;
    }

    // Include confirmed option for 'confirmed' status
    if (newStatus === 'confirmed' && confirmedDate && confirmedTime && confirmedPrice) {
      updateData.confirmedOption = {
        date: confirmedDate,
        timeSlot: confirmedTime,
        price: parseInt(confirmedPrice, 10),
      };
    }

    const res = await updateBookingStatus(bookingId, updateData);
    if (res.success) {
      await fetchData();
      setSelectedBooking(null);
    }
    setUpdating(false);
  };

  const handleLogout = async () => {
    await logout();
    router.push(`/${locale}/ops/login`);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('Ops.title')}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {user?.name} ({user?.role})
          </span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

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
                  <X className="w-6 h-6" />
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
                {selectedBooking.budget && (selectedBooking.budget.min || selectedBooking.budget.max) && (
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <p className="font-medium">
                      {selectedBooking.budget.min?.toLocaleString()} - {selectedBooking.budget.max?.toLocaleString()} {selectedBooking.budget.currency || 'KRW'}
                    </p>
                  </div>
                )}
                {selectedBooking.notes && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-gray-500">Customer Notes</p>
                    <p className="font-medium text-gray-700">{selectedBooking.notes}</p>
                  </div>
                )}
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

              {/* Confirmed Option (if exists) */}
              {selectedBooking.confirmedOption && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-800 mb-2">Confirmed Booking</p>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-600">Date</p>
                      <p className="font-medium text-green-900">
                        {new Date(selectedBooking.confirmedOption.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-green-600">Time</p>
                      <p className="font-medium text-green-900">{selectedBooking.confirmedOption.timeSlot}</p>
                    </div>
                    <div>
                      <p className="text-green-600">Price</p>
                      <p className="font-medium text-green-900">
                        {selectedBooking.confirmedOption.price.toLocaleString()} KRW
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Details Input */}
              <div className="border border-gray-200 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-3">Confirmation Details (for confirmed status)</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Date</label>
                    <Input
                      type="date"
                      value={confirmedDate}
                      onChange={(e) => setConfirmedDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Time Slot</label>
                    <Input
                      type="text"
                      placeholder="e.g., 10:00 AM"
                      value={confirmedTime}
                      onChange={(e) => setConfirmedTime(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Price (KRW)</label>
                    <Input
                      type="number"
                      placeholder="e.g., 500000"
                      value={confirmedPrice}
                      onChange={(e) => setConfirmedPrice(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>
              </div>

              {/* Status Note */}
              <div>
                <label className="text-sm text-gray-500 mb-2 block">Status Note (optional)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="Add a note for this status change..."
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                          : status === 'confirmed'
                          ? 'border-green-500 text-green-700 hover:bg-green-50'
                          : status === 'cancelled'
                          ? 'border-red-500 text-red-700 hover:bg-red-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      )}
                    >
                      {updating ? '...' : getStatusLabel(status, locale)}
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
