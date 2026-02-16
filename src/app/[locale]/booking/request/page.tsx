'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Check, AlertCircle, MapPin, User } from 'lucide-react';
import { getClinic, createBookingRequest, type Clinic } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getLocalizedText, type Locale } from '@/lib/utils';

const procedures = [
  'Double Eyelid Surgery',
  'Rhinoplasty (Nose)',
  'Facial Contouring',
  'Liposuction',
  'Breast Augmentation',
  'Skin Laser Treatment',
  'Botox / Filler',
  'Hair Transplant',
  'Acne Treatment',
  'Anti-Aging Treatment',
  'Other',
];

const timeSlots = [
  'Morning (9:00 - 12:00)',
  'Afternoon (12:00 - 17:00)',
  'Evening (17:00 - 20:00)',
  'Flexible',
];

export default function BookingRequestPage() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as Locale;
  const clinicId = searchParams.get('clinicId');
  const { user, isAuthenticated } = useAuth();

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ id: string; accessCode: string } | null>(null);

  // Form state
  const [procedure, setProcedure] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [budgetMin, setBudgetMin] = useState('');
  const [budgetMax, setBudgetMax] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  // Use user email if authenticated, otherwise use guest input
  const email = isAuthenticated && user?.email ? user.email : guestEmail;

  useEffect(() => {
    async function fetchClinic() {
      if (clinicId) {
        const res = await getClinic(clinicId);
        if (res.success && res.data) {
          setClinic(res.data);
        }
      }
    }
    fetchClinic();
  }, [clinicId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clinicId) {
      setError('Please select a clinic first');
      return;
    }

    if (!procedure || !preferredDate || !email) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const res = await createBookingRequest({
      clinicId,
      procedure,
      preferredDate,
      preferredTimeSlot: timeSlot || undefined,
      budget: {
        min: budgetMin ? parseInt(budgetMin) : undefined,
        max: budgetMax ? parseInt(budgetMax) : undefined,
        currency: 'KRW',
      },
      guestEmail: email,
      guestPhone: phone || undefined,
      locale,
      notes: notes || undefined,
    });

    setLoading(false);

    if (res.success && res.data) {
      setResult({ id: res.data.id, accessCode: res.data.accessCode });
      setSubmitted(true);
    } else {
      setError(res.error || 'Failed to submit booking request');
    }
  };

  if (submitted && result) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">{t('Booking.submittedTitle')}</h1>
          <p className="mb-6 text-muted-foreground">{t('Booking.submittedDesc')}</p>

          <div className="mb-6 rounded-xl bg-secondary p-4">
            <p className="mb-2 text-sm text-muted-foreground">Your booking reference:</p>
            <p className="font-mono text-2xl font-bold text-foreground">{result.accessCode}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Save this code to check your booking status
            </p>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/search">
              <Button variant="outline" className="rounded-full">
                Back to Search
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get tomorrow's date as minimum
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('Booking.title')}</h1>

      {/* Selected Clinic */}
      {clinic && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-muted">
              {clinic.images[0] ? (
                <Image src={clinic.images[0]} alt="" fill className="object-cover" unoptimized />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                  <span className="text-xl font-bold text-primary/40">
                    {getLocalizedText(clinic.name, locale)[0]}
                  </span>
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {getLocalizedText(clinic.name, locale)}
              </p>
              <p className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {getLocalizedText(clinic.address, locale)}
              </p>
            </div>
          </div>
        </div>
      )}

      {!clinicId && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-yellow-200 bg-yellow-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <p className="text-yellow-800">
            Please select a clinic from the{' '}
            <Link href="/search" className="font-medium underline">
              search page
            </Link>{' '}
            first.
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6">
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-red-700">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Procedure */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('Booking.procedure')} *
          </label>
          <Select
            value={procedure}
            onChange={(e) => setProcedure(e.target.value)}
            required
            className="h-12 w-full rounded-xl"
          >
            <option value="">Select procedure</option>
            {procedures.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </Select>
        </div>

        {/* Preferred Date */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('Booking.preferredDate')} *
          </label>
          <Input
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            min={minDate}
            required
            className="h-12 rounded-xl"
          />
        </div>

        {/* Time Window */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('Booking.timeWindow')}
          </label>
          <Select
            value={timeSlot}
            onChange={(e) => setTimeSlot(e.target.value)}
            className="h-12 w-full rounded-xl"
          >
            <option value="">Select time slot</option>
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </Select>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('Booking.budget')} (KRW)
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              placeholder="Min"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="h-12 rounded-xl"
            />
            <Input
              type="number"
              placeholder="Max"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* Contact Info */}
        {isAuthenticated && user ? (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">{user.name}</p>
                <p className="text-sm text-green-600">{user.email}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Email *
              </label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="h-12 rounded-xl"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Phone
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 8900"
                className="h-12 rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Notes */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {t('Booking.notes')}
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Any special requests or questions..."
            className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        {/* Submit */}
        <Button
          type="submit"
          disabled={loading || !clinicId}
          className="h-12 w-full rounded-xl text-base font-semibold"
        >
          {loading ? 'Submitting...' : t('Booking.submit')}
        </Button>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Our concierge team will contact the clinic and respond within 8 business hours.
        </p>
      </form>
    </div>
  );
}
