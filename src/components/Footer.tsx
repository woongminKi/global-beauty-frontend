'use client';

import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
                <span className="text-lg font-bold text-primary-foreground">G</span>
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                {t('App.name')}
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Your trusted companion for beauty treatments in Korea. We connect
              international visitors with top-rated clinics.
            </p>
          </div>

          {/* Discover */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Discover</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/search" className="transition-colors hover:text-primary">
                  All Clinics
                </Link>
              </li>
              <li>
                <Link href="/search?city=seoul" className="transition-colors hover:text-primary">
                  {t('City.seoul')}
                </Link>
              </li>
              <li>
                <Link href="/search?city=busan" className="transition-colors hover:text-primary">
                  {t('City.busan')}
                </Link>
              </li>
              <li>
                <Link href="/search?city=jeju" className="transition-colors hover:text-primary">
                  {t('City.jeju')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Treatments */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Popular Treatments</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/search?q=skin-booster" className="transition-colors hover:text-primary">
                  Skin Booster
                </Link>
              </li>
              <li>
                <Link href="/search?q=botox" className="transition-colors hover:text-primary">
                  Botox & Fillers
                </Link>
              </li>
              <li>
                <Link href="/search?q=rhinoplasty" className="transition-colors hover:text-primary">
                  Rhinoplasty
                </Link>
              </li>
              <li>
                <Link href="/search?q=laser" className="transition-colors hover:text-primary">
                  Laser Treatments
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link href="/booking/request" className="transition-colors hover:text-primary">
                  {t('Nav.booking')}
                </Link>
              </li>
              <li>
                <Link href="/compare" className="transition-colors hover:text-primary">
                  {t('Nav.compare')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {t('App.name')}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-sm text-muted-foreground">
              Terms
            </span>
            <span className="text-sm text-muted-foreground">
              Privacy
            </span>
            <span className="text-sm text-muted-foreground">
              Cookies
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
