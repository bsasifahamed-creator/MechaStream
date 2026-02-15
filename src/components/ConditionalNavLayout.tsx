'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

const HIDE_NAV_PATHS = [
  '/',
  '/ide',
  '/export',
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/dashboard',
  '/profile',
]

export default function ConditionalNavLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav = !HIDE_NAV_PATHS.some((p) => pathname === p || (p !== '/' && pathname.startsWith(p + '/')));

  return (
    <div className={`app-wrapper no-overflow min-h-screen ${!showNav ? 'app-wrapper-fullbleed' : ''}`}>
      {showNav && <Navigation />}
      <main className={showNav ? '' : 'min-h-screen w-full'}>{children}</main>
    </div>
  );
}
