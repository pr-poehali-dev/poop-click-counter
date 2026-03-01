import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import type { Achievement } from '@/store/gameStore';
import Icon from '@/components/ui/icon';

interface FloatText {
  id: number;
  x: number;
  y: number;
}

interface Ring {
  id: number;
  x: number;
  y: number;
}

interface ToastNotif {
  achievement: Achievement;
  hiding: boolean;
}

export default function Game() {
  const navigate = useNavigate();
  const { state, click } = useGameStore();
  const [floats, setFloats] = useState<FloatText[]>([]);
  const [rings, setRings] = useState<Ring[]>([]);
  const [isPressed, setIsPressed] = useState(false);
  const [toast, setToast] = useState<ToastNotif | null>(null);
  const floatId = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = ++floatId.current;

    setFloats(prev => [...prev, { id, x, y }]);
    setRings(prev => [...prev, { id, x, y }]);
    setIsPressed(true);

    setTimeout(() => setIsPressed(false), 150);
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== id)), 1000);
    setTimeout(() => setRings(prev => prev.filter(r => r.id !== id)), 600);

    const unlocked = click();
    if (unlocked) {
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast({ achievement: unlocked, hiding: false });
      toastTimer.current = setTimeout(() => {
        setToast(prev => prev ? { ...prev, hiding: true } : null);
        setTimeout(() => setToast(null), 300);
      }, 3000);
    }
  }, [click]);

  const unlocked = state.achievements.filter(a => a.unlocked).length;
  const nextAchievement = state.achievements.find(a => !a.unlocked);
  const progress = nextAchievement
    ? Math.min((state.totalClicks / nextAchievement.requiredClicks) * 100, 100)
    : 100;

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 card-glass border-b border-border/30">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="font-medium">Главная</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">💩</span>
          <span className="font-bold" style={{ color: 'hsl(35 100% 65%)' }}>Кликер</span>
        </div>

        <button
          onClick={() => navigate('/stats')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="BarChart3" size={18} />
          <span className="font-medium">Статс</span>
        </button>
      </nav>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-6">
        <div className="flex gap-6 text-center">
          <div className="card-glass rounded-2xl px-6 py-3">
            <div className="text-3xl font-black" style={{ color: 'hsl(35 100% 65%)' }}>
              {state.clicks.toLocaleString('ru')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">кликов</div>
          </div>
          <div className="card-glass rounded-2xl px-6 py-3">
            <div className="text-3xl font-black" style={{ color: 'hsl(300 60% 65%)' }}>
              {state.totalClicks.toLocaleString('ru')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">всего</div>
          </div>
          <div className="card-glass rounded-2xl px-6 py-3">
            <div className="text-3xl font-black" style={{ color: 'hsl(120 60% 55%)' }}>
              {unlocked}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">бейджей</div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={handleClick}
            className="relative w-48 h-48 rounded-full flex items-center justify-center transition-transform duration-100 select-none focus:outline-none"
            style={{
              background: 'radial-gradient(circle at 35% 35%, hsl(35 60% 25%), hsl(25 70% 15%))',
              boxShadow: isPressed
                ? '0 4px 20px hsl(35 100% 40% / 0.3), inset 0 2px 8px rgba(0,0,0,0.5)'
                : '0 12px 40px hsl(35 100% 40% / 0.4), 0 4px 12px rgba(0,0,0,0.4)',
              transform: isPressed ? 'scale(0.91)' : 'scale(1)',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            }}
          >
            <span className="text-8xl select-none" style={{
              filter: isPressed
                ? 'drop-shadow(0 0 30px hsl(35 100% 70% / 0.8))'
                : 'drop-shadow(0 0 16px hsl(35 100% 50% / 0.5))',
              transition: 'filter 0.1s ease',
            }}>
              💩
            </span>

            {rings.map(ring => (
              <span
                key={ring.id}
                className="click-ring"
                style={{ left: ring.x, top: ring.y }}
              />
            ))}
          </button>

          {floats.map(f => (
            <span
              key={f.id}
              className="float-text"
              style={{ left: f.x, top: f.y - 20 }}
            >
              +1
            </span>
          ))}
        </div>

        {nextAchievement && (
          <div className="w-full max-w-sm card-glass rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{nextAchievement.emoji}</span>
                <div>
                  <div className="font-semibold text-sm">{nextAchievement.title}</div>
                  <div className="text-xs text-muted-foreground">{nextAchievement.description}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground text-right">
                {state.totalClicks} / {nextAchievement.requiredClicks}
              </div>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: 'hsl(240 10% 18%)' }}>
              <div className="stat-bar h-2" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {!nextAchievement && (
          <div className="card-glass rounded-2xl px-6 py-4 text-center"
            style={{ border: '1px solid hsl(35 100% 60% / 0.3)' }}>
            <span className="text-2xl">🏆</span>
            <div className="font-bold mt-1" style={{ color: 'hsl(35 100% 65%)' }}>
              Все достижения разблокированы!
            </div>
          </div>
        )}
      </div>

      {toast && (
        <div
          className={`fixed bottom-6 right-6 card-glass rounded-2xl p-4 flex items-center gap-3 z-50 badge-glow ${toast.hiding ? 'achievement-hide' : 'achievement-popup'}`}
          style={{ border: '1px solid hsl(35 100% 60% / 0.4)', maxWidth: '280px' }}
        >
          <span className="text-3xl">{toast.achievement.emoji}</span>
          <div>
            <div className="text-xs text-muted-foreground font-medium">Достижение!</div>
            <div className="font-bold" style={{ color: 'hsl(35 100% 70%)' }}>
              {toast.achievement.title}
            </div>
            <div className="text-xs text-muted-foreground">{toast.achievement.description}</div>
          </div>
        </div>
      )}
    </div>
  );
}
