import { Header } from './Header';
import { BottomNav } from './BottomNav';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative noise-overlay">
      <Header />

      <main className="pb-24 pt-2 relative z-10">
        <div className="max-w-lg mx-auto px-4">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
