'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Star, BarChart3 } from 'lucide-react';
import { getClinic, type Clinic } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getLocalizedText, getTagLabel, type Locale } from '@/lib/utils';

export default function ComparePage() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as Locale;

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      const idsParam = searchParams.get('ids');
      if (!idsParam) {
        setLoading(false);
        return;
      }

      const ids = idsParam.split(',').slice(0, 3);
      setLoading(true);

      const results = await Promise.all(ids.map((id) => getClinic(id)));
      const validClinics = results
        .filter((res) => res.success && res.data)
        .map((res) => res.data as Clinic);

      setClinics(validClinics);
      setLoading(false);
    }
    fetchClinics();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 animate-pulse">
        <div className="mb-8 h-8 w-48 rounded bg-muted" />
        <div className="grid grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="h-40 rounded-xl bg-muted" />
              <div className="h-6 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (clinics.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-foreground">{t('Compare.title')}</h1>
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <BarChart3 className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mb-4 text-muted-foreground">{t('Compare.empty')}</p>
          <Link href="/search">
            <Button className="rounded-full">
              Go to Search
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('Compare.title')}</h1>

      {/* Comparison Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="w-40 p-4 text-left text-sm font-medium text-muted-foreground">
                  Clinic
                </th>
                {clinics.map((clinic) => (
                  <th key={clinic._id} className="min-w-[250px] p-4 text-left">
                    <div className="relative mb-3 aspect-video overflow-hidden rounded-xl bg-muted">
                      {clinic.images[0] ? (
                        <Image
                          src={clinic.images[0]}
                          alt={getLocalizedText(clinic.name, locale)}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                          <span className="text-4xl font-bold text-primary/40">
                            {getLocalizedText(clinic.name, locale)[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link
                      href={`/clinic/${clinic._id}`}
                      className="text-lg font-semibold text-foreground transition-colors hover:text-primary"
                    >
                      {getLocalizedText(clinic.name, locale)}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Rating */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">Rating</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4">
                    <div className="flex items-center gap-1.5">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-foreground">{clinic.rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({clinic.reviewCount})</span>
                    </div>
                  </td>
                ))}
              </tr>

              {/* City */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">City</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4 capitalize text-foreground">
                    {t(`City.${clinic.city}`)}
                  </td>
                ))}
              </tr>

              {/* Address */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">{t('Clinic.address')}</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4 text-sm text-foreground">
                    {getLocalizedText(clinic.address, locale)}
                  </td>
                ))}
              </tr>

              {/* Phone */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">{t('Clinic.phone')}</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4">
                    <a href={`tel:${clinic.phone}`} className="text-primary hover:underline">
                      {clinic.phone}
                    </a>
                  </td>
                ))}
              </tr>

              {/* Languages */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">{t('Clinic.languages')}</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {clinic.languages.map((lang) => (
                        <Badge key={lang} variant="secondary" className="rounded-full text-xs">
                          {lang}
                        </Badge>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Tags */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">Specialties</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {clinic.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                        >
                          {getTagLabel(tag, locale)}
                        </span>
                      ))}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Hours */}
              <tr className="border-b border-border/50">
                <td className="p-4 text-sm font-medium text-muted-foreground">{t('Clinic.hours')}</td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4">
                    <dl className="space-y-1 text-sm">
                      {daysOfWeek.slice(0, 5).map((day) => (
                        <div key={day} className="flex justify-between gap-2">
                          <dt className="capitalize text-muted-foreground">{day.slice(0, 3)}</dt>
                          <dd className="text-foreground">{clinic.hours[day] || 'Closed'}</dd>
                        </div>
                      ))}
                    </dl>
                  </td>
                ))}
              </tr>

              {/* Action */}
              <tr>
                <td className="p-4"></td>
                {clinics.map((clinic) => (
                  <td key={clinic._id} className="p-4">
                    <Link href={`/booking/request?clinicId=${clinic._id}`}>
                      <Button className="w-full rounded-xl">
                        {t('Clinic.requestBooking')}
                      </Button>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
