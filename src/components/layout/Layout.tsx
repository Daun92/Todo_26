import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { QuickMemoButton } from './QuickMemoButton';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />

      <main className="pb-24 pt-2">
        <div className="max-w-lg mx-auto px-4">
          {children}
        </div>
      </main>

      <QuickMemoButton />
      <BottomNav />
    </div>
  );
}
