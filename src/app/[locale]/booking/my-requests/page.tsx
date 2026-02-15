'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingCard } from '@/components/BookingCard';
import { getMyBookingRequests, getMyBookingRequestsAuth, type BookingListItem } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { Locale } from '@/lib/utils';
import { ClipboardList, Search, ArrowLeft, Loader2, User } from 'lucide-react';

type Step = 'loading' | 'form' | 'list';

export default function MyRequestsPage() {
  const t = useTranslations('MyBookings');
  const tAuth = useTranslations('Auth');
  const params = useParams();
  const locale = (params.locale as Locale) || 'en';
  const { user, isLoading: authLoading, isAuthenticated, login } = useAuth();

  const [step, setStep] = useState<Step>('loading');
  const [email, setEmail] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [bookings, setBookings] = useState<BookingListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto-load bookings for logged-in users
  useEffect(() => {
    async function loadAuthBookings() {
      if (authLoading) return;

      if (isAuthenticated && user) {
        setLoading(true);
        setError('');
        try {
          const response = await getMyBookingRequestsAuth();
          if (response.success && response.data) {
            setBookings(response.data.items);
            setTotal(response.data.total);
            setStep('list');
          } else {
            setError(response.error || t('networkError'));
            setStep('form');
          }
        } catch {
          setError(t('networkError'));
          setStep('form');
        } finally {
          setLoading(false);
        }
      } else {
        setStep('form');
      }
    }
    loadAuthBookings();
  }, [authLoading, isAuthenticated, user, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await getMyBookingRequests({
        email: email.trim(),
        accessCode: accessCode.trim(),
      });

      if (response.success && response.data) {
        setBookings(response.data.items);
        setTotal(response.data.total);
        setStep('list');
      } else {
        setError(response.error || t('invalidCredentials'));
      }
    } catch {
      setError(t('networkError'));
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = () => {
    setStep('form');
    setBookings([]);
    setError('');
  };

  // Loading Step
  if (step === 'loading' || authLoading) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-muted-foreground">{t('loading')}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Auth Form Step (for guests)
  if (step === 'form') {
    return (
      <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <ClipboardList className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-foreground">
                  {t('emailLabel')}
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="accessCode" className="text-sm font-medium text-foreground">
                  {t('accessCodeLabel')}
                </label>
                <Input
                  id="accessCode"
                  type="text"
                  placeholder="A3F7B2E1"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  required
                  className="font-mono uppercase"
                />
                <p className="text-xs text-muted-foreground">{t('accessCodeHint')}</p>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('loading')}
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    {t('submit')}
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 text-center text-sm text-muted-foreground">
                {t('orLoginToView')}
              </p>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={login}
              >
                <User className="h-4 w-4" />
                {tAuth('loginWithGoogle')}
              </Button>
            </div>

            <div className="mt-4 border-t border-border pt-4 text-center">
              <p className="mb-3 text-sm text-muted-foreground">{t('noBookingYet')}</p>
              <Link href="/search">
                <Button variant="outline">{t('searchClinics')}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Booking List Step
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <ClipboardList className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">
            {t('title')} ({total})
          </h1>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-muted-foreground">{isAuthenticated ? user?.email : email}</p>
          {!isAuthenticated && (
            <Button variant="ghost" size="sm" onClick={handleChangeEmail}>
              <ArrowLeft className="mr-1 h-4 w-4" />
              {t('changeEmail')}
            </Button>
          )}
        </div>
      </div>

      {/* Booking List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t('noBookings')}</p>
            <Link href="/search" className="mt-4 inline-block">
              <Button>{t('searchClinics')}</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} locale={locale} />
          ))}
        </div>
      )}
    </div>
  );
}
