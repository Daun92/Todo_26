import { cn } from '@/lib/utils';

export type AIState = 'idle' | 'listening' | 'thinking' | 'speaking';

interface AIOrbProps {
  state: AIState;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function AIOrb({ state, size = 'md', className }: AIOrbProps) {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
  };

  const particleSizes = {
    sm: 'w-1 h-1',
    md: 'w-1.5 h-1.5',
    lg: 'w-2 h-2',
  };

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      {/* Outer Glow Ring */}
      <div
        className={cn(
          'absolute inset-0 rounded-full',
          'border-2 border-[var(--accent-cyan)]',
          'opacity-30',
          state === 'listening' && 'animate-listening',
          state === 'thinking' && 'animate-thinking'
        )}
        style={{
          boxShadow: '0 0 30px rgba(0, 212, 255, 0.2)',
        }}
      />

      {/* Middle Ring */}
      <div
        className={cn(
          'absolute rounded-full',
          size === 'sm' && 'inset-2',
          size === 'md' && 'inset-3',
          size === 'lg' && 'inset-4',
          'border border-[var(--accent-cyan)]',
          'opacity-20'
        )}
      />

      {/* Core Orb */}
      <div
        className={cn(
          'relative rounded-full',
          'bg-gradient-to-br from-[var(--accent-cyan)] via-[#0099cc] to-[#006699]',
          size === 'sm' && 'w-8 h-8',
          size === 'md' && 'w-12 h-12',
          size === 'lg' && 'w-16 h-16',
          state === 'idle' && 'animate-breathe',
          state === 'speaking' && 'animate-speaking',
          state === 'listening' && 'animate-pulse-glow',
          state === 'thinking' && 'animate-pulse-glow'
        )}
        style={{
          boxShadow: '0 0 20px rgba(0, 212, 255, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Inner Highlight */}
        <div
          className={cn(
            'absolute rounded-full bg-white/30',
            size === 'sm' && 'top-1 left-1 w-2 h-2',
            size === 'md' && 'top-1.5 left-1.5 w-3 h-3',
            size === 'lg' && 'top-2 left-2 w-4 h-4'
          )}
        />
      </div>

      {/* Floating Particles */}
      {state !== 'idle' && (
        <>
          {[...Array(6)].map((_, i) => (
            <Particle
              key={i}
              index={i}
              size={particleSizes[size]}
              state={state}
            />
          ))}
        </>
      )}

      {/* State Indicator */}
      {state === 'listening' && (
        <div className="absolute -bottom-6 text-xs text-[var(--accent-cyan)] animate-pulse">
          듣는 중...
        </div>
      )}
      {state === 'thinking' && (
        <div className="absolute -bottom-6 text-xs text-[var(--accent-amber)] animate-pulse">
          생각 중...
        </div>
      )}
    </div>
  );
}

// Floating Particle Component
interface ParticleProps {
  index: number;
  size: string;
  state: AIState;
}

function Particle({ index, size, state }: ParticleProps) {
  const angle = (index * 60) * (Math.PI / 180);
  const radius = state === 'thinking' ? 45 : 35;
  const x = Math.cos(angle) * radius;
  const y = Math.sin(angle) * radius;

  const floatX = Math.cos(angle + Math.PI / 4) * 8;
  const floatY = Math.sin(angle + Math.PI / 4) * 8;

  return (
    <div
      className={cn(
        'absolute rounded-full bg-[var(--accent-cyan)]',
        size,
        state === 'speaking' && 'animate-pulse'
      )}
      style={{
        left: `calc(50% + ${x}px)`,
        top: `calc(50% + ${y}px)`,
        transform: 'translate(-50%, -50%)',
        boxShadow: '0 0 6px rgba(0, 212, 255, 0.8)',
        animation: `particle-float ${1.5 + index * 0.2}s ease-in-out infinite`,
        ['--float-x' as string]: `${floatX}px`,
        ['--float-y' as string]: `${floatY}px`,
        animationDelay: `${index * 0.1}s`,
      }}
    />
  );
}
