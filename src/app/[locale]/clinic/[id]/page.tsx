'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Star, MapPin, Phone, Clock, Globe, ExternalLink, Calendar } from 'lucide-react';
import { getClinic, type Clinic } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { getLocalizedText, getTagLabel, type Locale } from '@/lib/utils';

export default function ClinicDetailPage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as Locale;
  const clinicId = params.id as string;

  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinic() {
      setLoading(true);
      const res = await getClinic(clinicId);
      if (res.success && res.data) {
        setClinic(res.data);
      }
      setLoading(false);
    }
    fetchClinic();
  }, [clinicId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 animate-pulse">
        <div className="mb-6 h-64 rounded-2xl bg-muted" />
        <div className="mb-4 h-8 w-1/2 rounded bg-muted" />
        <div className="mb-8 h-4 w-1/3 rounded bg-muted" />
        <div className="space-y-4">
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 rounded bg-muted" />
          <div className="h-4 w-2/3 rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!clinic) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 text-center">
        <p className="text-muted-foreground">Clinic not found</p>
        <Link href="/search" className="mt-4 inline-block text-primary hover:underline">
          Back to search
        </Link>
      </div>
    );
  }

  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Image Gallery */}
      <div className="relative mb-6 aspect-video overflow-hidden rounded-2xl bg-muted">
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
            <span className="text-6xl font-bold text-primary/30">
              {getLocalizedText(clinic.name, locale)[0]}
            </span>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="mb-2 text-3xl font-bold text-foreground">
            {getLocalizedText(clinic.name, locale)}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-foreground">{clinic.rating.toFixed(1)}</span>
              <span>({clinic.reviewCount} {t('Clinic.reviews')})</span>
            </span>
            <span className="flex items-center gap-1 capitalize">
              <MapPin className="h-4 w-4" />
              {t(`City.${clinic.city}`)}
            </span>
          </div>
        </div>
        <Link href={`/booking/request?clinicId=${clinic._id}`}>
          <Button size="lg" className="rounded-xl">
            <Calendar className="mr-2 h-4 w-4" />
            {t('Clinic.requestBooking')}
          </Button>
        </Link>
      </div>

      {/* Tags */}
      <div className="mb-8 flex flex-wrap gap-2">
        {clinic.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          >
            {getTagLabel(tag, locale)}
          </span>
        ))}
      </div>

      {/* Info Grid */}
      <div className="mb-8 grid gap-6 md:grid-cols-2">
        {/* Left Column */}
        <Card>
          <CardContent className="space-y-6 p-6">
            {/* Address */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {t('Clinic.address')}
              </h3>
              <p className="text-foreground">{getLocalizedText(clinic.address, locale)}</p>
            </div>

            {/* Phone */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Phone className="h-4 w-4" />
                {t('Clinic.phone')}
              </h3>
              <a href={`tel:${clinic.phone}`} className="text-primary hover:underline">
                {clinic.phone}
              </a>
            </div>

            {/* Languages */}
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Globe className="h-4 w-4" />
                {t('Clinic.languages')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {clinic.languages.map((lang) => (
                  <Badge key={lang} variant="secondary" className="rounded-full">
                    {lang}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column - Hours */}
        <Card>
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Clock className="h-4 w-4" />
              {t('Clinic.hours')}
            </h3>
            <dl className="space-y-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="flex justify-between text-sm">
                  <dt className="capitalize text-muted-foreground">{day}</dt>
                  <dd className="font-medium text-foreground">
                    {clinic.hours[day] || 'Closed'}
                  </dd>
                </div>
              ))}
            </dl>
            {clinic.hours.note && (
              <p className="mt-4 border-t border-border pt-4 text-sm text-muted-foreground">
                {clinic.hours.note}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* About */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-foreground">{t('Clinic.about')}</h3>
        <p className="leading-relaxed text-muted-foreground">
          {getLocalizedText(clinic.description, locale)}
        </p>
      </div>

      {/* External Reviews */}
      {clinic.externalReviewLinks.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-3 text-lg font-semibold text-foreground">{t('Clinic.reviews')}</h3>
          <div className="flex flex-wrap gap-3">
            {clinic.externalReviewLinks.map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted"
              >
                View on {link.source}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-6 text-center">
          <h3 className="mb-2 text-lg font-semibold text-foreground">
            Ready to book?
          </h3>
          <p className="mb-4 text-muted-foreground">
            Our concierge will contact the clinic and confirm your appointment.
          </p>
          <Link href={`/booking/request?clinicId=${clinic._id}`}>
            <Button size="lg" className="rounded-xl">
              <Calendar className="mr-2 h-4 w-4" />
              {t('Clinic.requestBooking')}
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
