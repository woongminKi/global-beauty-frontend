'use client';

import { Link } from '@/i18n/navigation';
import { Card } from '@/components/ui/card';
import { StatusBadge } from '@/components/StatusBadge';
import { getLocalizedText, formatDate, formatCurrency, type Locale } from '@/lib/utils';
import type { BookingListItem } from '@/lib/api';
import { Calendar, Clock, ChevronRight, Building2 } from 'lucide-react';

interface BookingCardProps {
  booking: BookingListItem;
  locale: Locale;
}

export function BookingCard({ booking, locale }: BookingCardProps) {
  const clinicName = getLocalizedText(booking.clinic.name, locale);
  const formattedDate = formatDate(booking.preferredDate, locale);

  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link
        href={`/booking/${booking._id}?accessCode=${booking.accessCode}`}
        className="block p-4 sm:p-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {/* Clinic Name */}
            <div className="mb-2 flex items-center gap-2">
              <Building2 className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <h3 className="truncate font-semibold text-foreground">{clinicName}</h3>
            </div>

            {/* Procedure */}
            <p className="mb-3 text-sm text-muted-foreground">{booking.procedure}</p>

            {/* Date and Time */}
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </span>
              {booking.preferredTimeSlot && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {booking.preferredTimeSlot}
                </span>
              )}
            </div>

            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <StatusBadge status={booking.status} locale={locale} />

              {/* Confirmed Option Display */}
              {booking.status === 'confirmed' && booking.confirmedOption && (
                <span className="text-sm text-green-600">
                  {formatDate(booking.confirmedOption.date, locale)},{' '}
                  {booking.confirmedOption.timeSlot}
                  {booking.confirmedOption.price && (
                    <> - {formatCurrency(booking.confirmedOption.price, 'KRW', locale)}</>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Arrow */}
          <div className="flex flex-shrink-0 items-center">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </Link>
    </Card>
  );
}
