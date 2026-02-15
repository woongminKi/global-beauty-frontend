'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Search, MapPin, SlidersHorizontal, X } from 'lucide-react';
import { searchClinics, type Clinic } from '@/lib/api';
import { ClinicCard } from '@/components/ClinicCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { getTagLabel, type Locale } from '@/lib/utils';

const cities = ['seoul', 'busan', 'jeju'] as const;
const tags = [
  'plastic-surgery',
  'dermatology',
  'english-speaking',
  'foreigner-friendly',
  'weekend-available',
] as const;
const sortOptions = ['rating', 'reviewCount', 'distance'] as const;

export default function SearchPage() {
  const t = useTranslations();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = params.locale as Locale;

  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [compareList, setCompareList] = useState<Clinic[]>([]);

  // Filters
  const [city, setCity] = useState<string>(searchParams.get('city') || '');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [keyword, setKeyword] = useState('');
  const [sort, setSort] = useState<string>('rating');

  useEffect(() => {
    async function fetchClinics() {
      setLoading(true);
      const res = await searchClinics({
        city: city || undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
        q: keyword || undefined,
        sort,
      });
      if (res.success && res.data) {
        setClinics(res.data.items);
        setTotal(res.data.total);
      }
      setLoading(false);
    }
    fetchClinics();
  }, [city, selectedTags, keyword, sort]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleCompareAdd = (clinic: Clinic) => {
    if (compareList.some((c) => c._id === clinic._id)) {
      setCompareList(compareList.filter((c) => c._id !== clinic._id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, clinic]);
    }
  };

  const handleCompareRemove = (clinicId: string) => {
    setCompareList(compareList.filter((c) => c._id !== clinicId));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-2xl font-bold text-foreground">{t('Search.title')}</h1>

      {/* Filters */}
      <div className="mb-6 rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        {/* Keyword Search */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t('Search.keywordPlaceholder')}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-12 rounded-xl bg-background pl-10"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* City */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              {t('Search.cityLabel')}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
              <Select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 w-full rounded-xl bg-background pl-10"
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {t(`City.${c}`)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-2 block text-sm font-medium text-muted-foreground">
              {t('Search.sortLabel')}
            </label>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-10 w-full rounded-xl bg-background"
            >
              <option value="rating">Rating</option>
              <option value="reviewCount">{t('Search.sortReviews')}</option>
              <option value="distance">{t('Search.sortDistance')}</option>
            </Select>
          </div>
        </div>

        {/* Tags */}
        <div className="mt-4">
          <label className="mb-2 block text-sm font-medium text-muted-foreground">
            {t('Search.tagsLabel')}
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagToggle(tag)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedTags.includes(tag)
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
              >
                {getTagLabel(tag, locale)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-medium text-primary">
                Compare ({compareList.length}/3):
              </span>
              <div className="flex flex-wrap gap-2">
                {compareList.map((clinic) => (
                  <span
                    key={clinic._id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1 text-sm font-medium text-foreground shadow-sm"
                  >
                    {clinic.name[locale]}
                    <button
                      type="button"
                      onClick={() => handleCompareRemove(clinic._id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
            {compareList.length >= 2 && (
              <Link href={`/compare?ids=${compareList.map((c) => c._id).join(',')}`}>
                <Button className="rounded-full">
                  Compare Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          {t('Search.resultCount', { count: total })}
        </p>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
              <div className="aspect-[4/3] bg-muted" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : clinics.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No clinics found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {clinics.map((clinic) => (
            <ClinicCard
              key={clinic._id}
              clinic={clinic}
              locale={locale}
              onCompareAdd={handleCompareAdd}
              isInCompare={compareList.some((c) => c._id === clinic._id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
