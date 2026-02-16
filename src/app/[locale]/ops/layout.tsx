'use client';

import { OpsAuthProvider } from '@/contexts/OpsAuthContext';

export default function OpsLayout({ children }: { children: React.ReactNode }) {
  return <OpsAuthProvider>{children}</OpsAuthProvider>;
}
