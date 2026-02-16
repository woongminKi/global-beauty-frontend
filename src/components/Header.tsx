'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { Menu, X, Globe, Heart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { useAuth } from '@/contexts/AuthContext';

const locales = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
] as const;

export function Header() {
  const t = useTranslations();
  const pathname = usePathname();
  const params = useParams();
  const currentLocale = params.locale as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  const navItems = [
    { href: '/search', label: t('Nav.search') },
    { href: '/compare', label: t('Nav.compare') },
    { href: '/booking/request', label: t('Nav.booking') },
    { href: '/booking/my-requests', label: t('Nav.myBookings') },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <span className="text-lg font-bold text-primary-foreground">G</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            {t('App.name')}
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-2 md:flex">
          {/* Language Dropdown */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setLangMenuOpen(!langMenuOpen)}
            >
              <Globe className="h-5 w-5" />
            </Button>
            {langMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-32 rounded-lg border border-border bg-card py-1 shadow-lg">
                {locales.map((locale) => (
                  <Link
                    key={locale.code}
                    href={pathname || '/'}
                    locale={locale.code}
                    className={cn(
                      'block px-4 py-2 text-sm transition-colors hover:bg-muted',
                      currentLocale === locale.code ? 'bg-muted font-medium' : ''
                    )}
                    onClick={() => setLangMenuOpen(false)}
                  >
                    {locale.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="text-muted-foreground">
            <Heart className="h-5 w-5" />
          </Button>

          {/* Auth: Login/User Menu */}
          {isLoading ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : isAuthenticated && user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                {user.profileImage ? (
                  <Image
                    src={user.profileImage}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="rounded-full"
                    unoptimized
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </Button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <div className="border-b border-border px-4 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <button
                    className="flex w-full items-center gap-2 px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('Auth.logout')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={login}
            >
              <User className="h-4 w-4" />
              {t('Auth.login')}
            </Button>
          )}

          <Link href="/booking/request">
            <Button className="ml-2 rounded-full">Book Now</Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6 text-foreground" />
          ) : (
            <Menu className="h-6 w-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t border-border bg-background md:hidden">
          <div className="space-y-1 px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'block rounded-lg px-3 py-2 text-base font-medium hover:bg-muted',
                  pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="flex flex-wrap gap-2 pt-4">
              {locales.map((locale) => (
                <Link
                  key={locale.code}
                  href={pathname || '/'}
                  locale={locale.code}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    currentLocale === locale.code
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {locale.label}
                </Link>
              ))}
            </div>

            {/* Mobile Auth */}
            {isAuthenticated && user ? (
              <div className="mt-4 rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  {user.profileImage ? (
                    <Image
                      src={user.profileImage}
                      alt={user.name}
                      width={40}
                      height={40}
                      className="rounded-full"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  {t('Auth.logout')}
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                className="mt-4 w-full gap-2"
                onClick={() => {
                  setMobileMenuOpen(false);
                  login();
                }}
              >
                <User className="h-4 w-4" />
                {t('Auth.loginWithGoogle')}
              </Button>
            )}

            <Link href="/booking/request" onClick={() => setMobileMenuOpen(false)}>
              <Button className="mt-2 w-full rounded-full">Book Now</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
