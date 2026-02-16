'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { getBookingRequest, canReviewBooking, createReview, type BookingRequest } from '@/lib/api';
import { getLocalizedText, formatDate, formatCurrency, type Locale } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  Building2,
  Calendar,
  Clock,
  DollarSign,
  FileText,
  MapPin,
  Phone,
  Copy,
  Check,
  Loader2,
  Star,
  X,
} from 'lucide-react';

export default function BookingDetailPage() {
  const t = useTranslations('BookingDetail');
  const tStatus = useTranslations('MyBookings');
  const params = useParams();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const locale = (params.locale as Locale) || 'en';
  const bookingId = params.id as string;
  const accessCode = searchParams.get('accessCode') || '';

  const [booking, setBooking] = useState<BookingRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Review state
  const [canReview, setCanReview] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    async function fetchBooking() {
      setLoading(true);
      try {
        const response = await getBookingRequest(bookingId, accessCode);
        if (response.success && response.data) {
          setBooking(response.data);
        } else {
          setError(response.error || 'Failed to load booking');
        }
      } catch {
        setError('Network error');
      } finally {
        setLoading(false);
      }
    }

    if (bookingId) {
      fetchBooking();
    }
  }, [bookingId, accessCode]);

  // Check if user can write a review
  useEffect(() => {
    async function checkCanReview() {
      if (isAuthenticated && booking?.status === 'confirmed') {
        const res = await canReviewBooking(bookingId);
        if (res.success && res.data?.canReview) {
          setCanReview(true);
        }
      }
    }
    checkCanReview();
  }, [isAuthenticated, booking?.status, bookingId]);

  const handleSubmitReview = async () => {
    if (!reviewTitle || !reviewContent) {
      setReviewError('Please fill in all fields');
      return;
    }

    setReviewSubmitting(true);
    setReviewError('');

    const res = await createReview({
      bookingId,
      rating: reviewRating,
      title: reviewTitle,
      content: reviewContent,
    });

    if (res.success) {
      setShowReviewModal(false);
      setCanReview(false);
      // Show success message or refresh
    } else {
      setReviewError(res.error || 'Failed to submit review');
    }

    setReviewSubmitting(false);
  };

  const copyAccessCode = async () => {
    if (booking?.accessCode) {
      await navigator.clipboard.writeText(booking.accessCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-destructive">{error || 'Booking not found'}</p>
            <Link href="/booking/my-requests">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                {t('backToList')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const clinicName = booking.clinic?.name ? getLocalizedText(booking.clinic.name, locale) : 'N/A';
  const clinicAddress = booking.clinic?.address
    ? getLocalizedText(booking.clinic.address, locale)
    : '';

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Back Link */}
      <Link
        href="/booking/my-requests"
        className="mb-6 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        {t('backToList')}
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-2 text-2xl font-bold text-foreground">{t('title')}</h1>
        <StatusBadge status={booking.status} locale={locale} />
      </div>

      {/* Clinic Info */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {t('clinic')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="font-semibold">{clinicName}</p>
          {clinicAddress && (
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
              {clinicAddress}
            </p>
          )}
          {booking.clinic?.phone && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="h-4 w-4" />
              {booking.clinic.phone}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('procedure')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('procedure')}</p>
            <p className="font-medium">{booking.procedure}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {t('preferredDate')}
              </p>
              <p className="font-medium">{formatDate(booking.preferredDate, locale)}</p>
            </div>

            {booking.preferredTimeSlot && (
              <div>
                <p className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {t('timeSlot')}
                </p>
                <p className="font-medium">{booking.preferredTimeSlot}</p>
              </div>
            )}
          </div>

          {booking.budget && (booking.budget.min || booking.budget.max) && (
            <div>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                {t('budget')}
              </p>
              <p className="font-medium">
                {booking.budget.min
                  ? formatCurrency(booking.budget.min, booking.budget.currency || 'KRW', locale)
                  : ''}
                {booking.budget.min && booking.budget.max ? ' - ' : ''}
                {booking.budget.max
                  ? formatCurrency(booking.budget.max, booking.budget.currency || 'KRW', locale)
                  : ''}
              </p>
            </div>
          )}

          {booking.notes && (
            <div>
              <p className="text-sm text-muted-foreground">{t('notes')}</p>
              <p className="whitespace-pre-wrap text-sm">{booking.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmed Option */}
      {booking.status === 'confirmed' && booking.confirmedOption && (
        <Card className="mb-4 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              {t('confirmedDate')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="font-medium text-green-700">
              {formatDate(booking.confirmedOption.date, locale)} -{' '}
              {booking.confirmedOption.timeSlot}
            </p>
            {booking.confirmedOption.price && (
              <p className="text-sm text-green-600">
                {t('confirmedPrice')}:{' '}
                {formatCurrency(booking.confirmedOption.price, 'KRW', locale)}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Proposed Options */}
      {booking.status === 'proposedOptions' &&
        booking.proposedOptions &&
        booking.proposedOptions.length > 0 && (
          <Card className="mb-4 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-700">{t('proposedOptions')}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {booking.proposedOptions.map((option, idx) => (
                  <li key={idx} className="rounded-lg bg-white p-3 shadow-sm">
                    <p className="font-medium">
                      {formatDate(option.date, locale)} - {option.timeSlot}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(option.price, 'KRW', locale)}
                    </p>
                    {option.note && <p className="mt-1 text-sm">{option.note}</p>}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

      {/* Status Timeline */}
      {booking.statusHistory && booking.statusHistory.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>{t('timeline')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative space-y-4">
              {booking.statusHistory.map((entry, idx) => (
                <div key={idx} className="relative flex gap-4 pl-6">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                  {/* Timeline line */}
                  {idx < booking.statusHistory!.length - 1 && (
                    <div className="absolute bottom-0 left-[5px] top-4 w-0.5 bg-border" />
                  )}
                  <div className="flex-1 pb-4">
                    <p className="font-medium">{tStatus(`status.${entry.status}`)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(entry.changedAt, locale)}
                    </p>
                    {entry.note && <p className="mt-1 text-sm">{entry.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Write Review Button */}
      {canReview && (
        <Card className="mb-4 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-yellow-800">Share your experience!</p>
                <p className="text-sm text-yellow-600">Help others by writing a review</p>
              </div>
              <Button onClick={() => setShowReviewModal(true)}>
                <Star className="mr-2 h-4 w-4" />
                Write Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Access Code */}
      {booking.accessCode && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t('accessCode')}</p>
                <p className="font-mono text-lg font-bold">{booking.accessCode}</p>
              </div>
              <Button variant="outline" size="sm" onClick={copyAccessCode}>
                {copied ? (
                  <Check className="mr-1 h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="mr-1 h-4 w-4" />
                )}
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white">
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-bold">Write a Review</h2>
              <button onClick={() => setShowReviewModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-4 p-6">
              {/* Rating */}
              <div>
                <label className="mb-2 block text-sm font-medium">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-8 w-8 ${
                          star <= reviewRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>
                <Input
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  maxLength={100}
                />
              </div>

              {/* Content */}
              <div>
                <label className="mb-2 block text-sm font-medium">Your Review</label>
                <textarea
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Share details about your experience..."
                  rows={5}
                  maxLength={2000}
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="mt-1 text-xs text-gray-500">{reviewContent.length}/2000</p>
              </div>

              {reviewError && (
                <p className="text-sm text-red-600">{reviewError}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t p-4">
              <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
