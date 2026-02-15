'use client';

import { useState } from 'react';
import { Link } from '@/i18n/navigation';
import { Heart, Star, MapPin, Clock, MessageCircle, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Clinic } from '@/lib/api';
import { getLocalizedText, getTagLabel, type Locale } from '@/lib/utils';
import { cn } from '@/lib/cn';

interface ClinicCardProps {
  clinic: Clinic;
  locale: Locale;
  onCompareAdd?: (clinic: Clinic) => void;
  isInCompare?: boolean;
}

export function ClinicCard({ clinic, locale, onCompareAdd, isInCompare }: ClinicCardProps) {
  const [isLiked, setIsLiked] = useState(false);

  const getCategoryStyle = (tags: string[]) => {
    if (tags.includes('plastic-surgery') && tags.includes('dermatology')) {
      return { label: 'Full Service', className: 'bg-purple-100 text-purple-700' };
    }
    if (tags.includes('plastic-surgery')) {
      return { label: 'Plastic Surgery', className: 'bg-pink-100 text-pink-700' };
    }
    if (tags.includes('dermatology')) {
      return { label: 'Dermatology', className: 'bg-blue-100 text-blue-700' };
    }
    return { label: 'Clinic', className: 'bg-secondary text-secondary-foreground' };
  };

  const category = getCategoryStyle(clinic.tags);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-lg">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100 z-10" />

        {/* Placeholder for clinic image */}
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
          <span className="text-4xl font-bold text-primary/40">
            {getLocalizedText(clinic.name, locale)[0]}
          </span>
        </div>

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex gap-2 z-20">
          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', category.className)}>
            {category.label}
          </span>
        </div>

        {/* Like button */}
        <button
          type="button"
          onClick={() => setIsLiked(!isLiked)}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background z-20"
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-colors',
              isLiked ? 'fill-primary text-primary' : 'text-muted-foreground'
            )}
          />
        </button>

        {/* Compare button - visible on hover */}
        {onCompareAdd && (
          <button
            type="button"
            onClick={() => onCompareAdd(clinic)}
            className={cn(
              'absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-all z-20',
              isInCompare
                ? 'bg-primary text-primary-foreground'
                : 'bg-background/80 text-foreground opacity-0 backdrop-blur group-hover:opacity-100'
            )}
          >
            <Plus className={cn('h-4 w-4', isInCompare ? 'rotate-45' : '')} />
            {isInCompare ? 'Added' : 'Compare'}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Header */}
        <div className="mb-2 flex items-start justify-between">
          <div>
            <Link href={`/clinic/${clinic._id}`}>
              <h3 className="font-semibold text-foreground transition-colors hover:text-primary">
                {getLocalizedText(clinic.name, locale)}
              </h3>
            </Link>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5">
            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-foreground">{clinic.rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({clinic.reviewCount})</span>
          </div>
        </div>

        {/* Location */}
        <div className="mb-3 flex items-center gap-1 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" />
          <span>{getLocalizedText(clinic.address, locale)}</span>
        </div>

        {/* Languages */}
        <div className="mb-3 flex flex-wrap gap-1.5">
          {clinic.languages.slice(0, 3).map((lang) => (
            <Badge key={lang} variant="secondary" className="rounded-full text-xs">
              {lang}
            </Badge>
          ))}
          {clinic.languages.length > 3 && (
            <Badge variant="secondary" className="rounded-full text-xs">
              +{clinic.languages.length - 3}
            </Badge>
          )}
        </div>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {clinic.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
            >
              {getTagLabel(tag, locale)}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span>~2h reply</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              <span>{clinic.reviewCount} reviews</span>
            </div>
          </div>
          <Link href={`/clinic/${clinic._id}`}>
            <Button size="sm" className="rounded-full">
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
