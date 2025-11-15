'use client';

// This component is no longer needed as authentication has been removed for the demo.
// It now simply renders its children.
export function AuthGuard({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
