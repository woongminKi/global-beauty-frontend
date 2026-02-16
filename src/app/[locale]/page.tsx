'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { ClinicCard } from '@/components/ClinicCard';
import { searchClinics, type Clinic } from '@/lib/api';
import type { Locale } from '@/lib/utils';

const cities = [
  { id: 'all', label: 'All Cities' },
  { id: 'seoul', labelKey: 'seoul' },
  { id: 'busan', labelKey: 'busan' },
  { id: 'jeju', labelKey: 'jeju' },
];

const categories = [
  { id: 'all', label: 'All Categories' },
  { id: 'dermatology', label: 'Dermatology' },
  { id: 'plastic-surgery', label: 'Plastic Surgery' },
];

const popularTags = ['Skin Booster', 'Botox', 'Rhinoplasty', 'Glass Skin'];

export default function HomePage() {
  const t = useTranslations();
  const params = useParams();
  const locale = params.locale as Locale;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [compareList, setCompareList] = useState<Clinic[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClinics() {
      setLoading(true);
      const res = await searchClinics({
        city: selectedCity !== 'all' ? selectedCity : undefined,
        tags: selectedCategory !== 'all' ? selectedCategory : undefined,
        q: searchQuery || undefined,
        sort: sortBy,
      });
      if (res.success && res.data) {
        setClinics(res.data.items);
      }
      setLoading(false);
    }
    fetchClinics();
  }, [selectedCity, selectedCategory, searchQuery, sortBy]);

  const handleCompare = (clinic: Clinic) => {
    if (compareList.some((c) => c._id === clinic._id)) {
      setCompareList(compareList.filter((c) => c._id !== clinic._id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, clinic]);
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-secondary/50 to-background pb-12 pt-8 sm:pb-16 sm:pt-12">
        {/* Decorative elements */}
        <div className="absolute -left-20 top-20 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-accent/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Trusted by 50,000+ international visitors</span>
            </div>

            {/* Headline */}
            <h1 className="mx-auto max-w-4xl text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Your Beauty Journey in{' '}
              <span className="text-primary">Korea</span> Starts Here
            </h1>

            {/* Subheadline */}
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              {t('App.tagline')}
            </p>
          </div>

          {/* Search Box */}
          <div className="mx-auto mt-10 max-w-4xl">
            <div className="rounded-2xl border border-border bg-card p-4 shadow-lg sm:p-6">
              <div className="grid gap-4 sm:grid-cols-4">
                {/* City Select */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    City
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
                    <Select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="h-12 w-full rounded-xl border-input bg-background pl-10"
                    >
                      {cities.map((city) => (
                        <option key={city.id} value={city.id}>
                          {city.labelKey ? t(`City.${city.labelKey}`) : city.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

                {/* Category Select */}
                <div className="relative">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Category
                  </label>
                  <Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-12 w-full rounded-xl border-input bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label}
                      </option>
                    ))}
                  </Select>
                </div>

                {/* Search Input */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-muted-foreground">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Search clinics, treatments..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-12 rounded-xl border-input bg-background pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Quick Tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="text-sm text-muted-foreground">Popular:</span>
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSearchQuery(tag)}
                    className="rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mx-auto mt-12 grid max-w-3xl grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">500+</div>
              <div className="mt-1 text-sm text-muted-foreground">Verified Clinics</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">50K+</div>
              <div className="mt-1 text-sm text-muted-foreground">Happy Visitors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground sm:text-4xl">4.8</div>
              <div className="mt-1 text-sm text-muted-foreground">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {clinics.length} Clinics Found
              </h2>
              <p className="mt-1 text-muted-foreground">
                {selectedCity !== 'all'
                  ? `in ${selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1)}`
                  : 'across all cities'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-9 rounded-lg bg-transparent"
              >
                <option value="rating">Sort by: Rating</option>
                <option value="reviewCount">Sort by: Reviews</option>
                <option value="name">Sort by: Name</option>
              </Select>
            </div>
          </div>

          {/* Clinic Grid */}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card animate-pulse">
                  <div className="aspect-[4/3] bg-muted" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-8 bg-muted rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : clinics.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No clinics found. Try adjusting your filters.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {clinics.map((clinic) => (
                <ClinicCard
                  key={clinic._id}
                  clinic={clinic}
                  locale={locale}
                  onCompareAdd={handleCompare}
                  isInCompare={compareList.some((c) => c._id === clinic._id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Compare Bar */}
      {compareList.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-foreground">
                Compare ({compareList.length}/3):
              </span>
              <div className="flex gap-2">
                {compareList.map((clinic) => (
                  <span
                    key={clinic._id}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
                  >
                    {clinic.name[locale]}
                    <button
                      type="button"
                      onClick={() => setCompareList(compareList.filter((c) => c._id !== clinic._id))}
                      className="text-primary/60 hover:text-primary"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCompareList([])}
              >
                Clear
              </Button>
              {compareList.length >= 2 && (
                <Link href={`/compare?ids=${compareList.map((c) => c._id).join(',')}`}>
                  <Button size="sm" className="rounded-full">
                    Compare Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
