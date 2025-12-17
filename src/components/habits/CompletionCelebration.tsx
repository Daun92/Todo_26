import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CompletionCelebrationProps {
  show: boolean;
  type: 'habit' | 'all';
  onComplete?: () => void;
}

export function CompletionCelebration({ show, type, onComplete }: CompletionCelebrationProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; color: string }>>([]);

  useEffect(() => {
    if (show && type === 'all') {
      // Generate confetti particles
      const newParticles = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'][Math.floor(Math.random() * 5)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
        onComplete?.();
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [show, type, onComplete]);

  if (!show) return null;

  if (type === 'all') {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
        {/* Confetti */}
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute w-3 h-3 rounded-full animate-confetti"
            style={{
              left: `${particle.x}%`,
              top: '-10px',
              backgroundColor: particle.color,
              animationDelay: `${Math.random() * 0.5}s`,
            }}
          />
        ))}

        {/* Center celebration */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-in zoom-in-50 duration-300 text-center">
            <div className="text-6xl mb-2 animate-bounce">🎉</div>
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl">
              <p className="text-lg font-bold">완벽한 하루!</p>
              <p className="text-sm opacity-90">모든 습관을 달성했어요</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Single habit completion - subtle effect
  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 animate-out fade-out duration-500">
        <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
          <span className="text-lg">✓</span>
          <span className="text-sm font-medium">잘했어요!</span>
        </div>
      </div>
    </div>
  );
}
