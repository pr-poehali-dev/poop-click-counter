import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import Icon from '@/components/ui/icon';

export default function Stats() {
  const navigate = useNavigate();
  const { state, resetAll } = useGameStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const unlocked = state.achievements.filter(a => a.unlocked);
  const locked = state.achievements.filter(a => !a.unlocked);
  const sessionTime = Math.floor((Date.now() - state.sessionStart) / 1000 / 60);

  function handleReset() {
    if (confirmReset) {
      resetAll();
      setConfirmReset(false);
    } else {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
    }
  }

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
          <Icon name="BarChart3" size={18} style={{ color: 'hsl(35 100% 65%)' }} />
          <span className="font-bold">Статистика</span>
        </div>
        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="font-medium">Игра</span>
          <Icon name="Gamepad2" size={18} />
        </button>
      </nav>

      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Всего кликов', value: Math.floor(state.totalClicks).toLocaleString('ru'), color: 'hsl(35 100% 65%)', icon: '💩' },
            { label: 'Достижений', value: `${unlocked.length} / ${state.achievements.length}`, color: 'hsl(300 60% 65%)', icon: '🏆' },
            { label: 'Минут в игре', value: sessionTime.toString(), color: 'hsl(180 60% 55%)', icon: '⏱️' },
          ].map(stat => (
            <div key={stat.label} className="card-glass rounded-2xl p-4 text-center">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-xl font-black" style={{ color: stat.color }}>{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="card-glass rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
            <span>🏅</span> Достижения
          </h2>

          {unlocked.length > 0 && (
            <div className="space-y-2 mb-4">
              {unlocked.map((a, i) => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl p-3 badge-appear"
                  style={{
                    background: 'linear-gradient(135deg, hsl(35 100% 20% / 0.3), hsl(300 40% 20% / 0.2))',
                    border: '1px solid hsl(35 100% 50% / 0.3)',
                    animationDelay: `${i * 0.05}s`,
                    opacity: 0,
                  }}
                >
                  <span className="text-2xl">{a.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm" style={{ color: 'hsl(35 100% 75%)' }}>{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                  </div>
                  <div className="flex items-center gap-1 text-xs" style={{ color: 'hsl(35 100% 60%)' }}>
                    <Icon name="CheckCircle" size={14} />
                    <span>{a.requiredClicks}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {locked.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground mb-2">Заблокированы</div>
              {locked.map(a => (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-xl p-3 opacity-40"
                  style={{ background: 'hsl(240 10% 15%)', border: '1px solid hsl(240 10% 22%)' }}
                >
                  <span className="text-2xl grayscale">{a.emoji}</span>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">???</div>
                    <div className="text-xs text-muted-foreground">
                      Нужно {a.requiredClicks.toLocaleString('ru')} кликов
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Icon name="Lock" size={14} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {unlocked.length === state.achievements.length && (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <div className="font-bold" style={{ color: 'hsl(35 100% 65%)' }}>
                Все достижения открыты! Ты легенда.
              </div>
            </div>
          )}
        </div>

        <div className="card-glass rounded-2xl p-5">
          <h2 className="font-bold text-lg mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" size={18} />
            Прогресс до следующего
          </h2>
          {state.achievements.filter(a => !a.unlocked).slice(0, 3).map(a => {
            const pct = Math.min((state.totalClicks / a.requiredClicks) * 100, 100);
            return (
              <div key={a.id} className="mb-4 last:mb-0">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <span>{a.emoji}</span>
                    <span className="font-medium">{a.title}</span>
                  </span>
                  <span className="text-muted-foreground">
                    {state.totalClicks} / {a.requiredClicks}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full" style={{ background: 'hsl(240 10% 18%)' }}>
                  <div className="stat-bar h-2" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
          {state.achievements.every(a => a.unlocked) && (
            <div className="text-muted-foreground text-sm">Прогресс завершён на 100%! 🚀</div>
          )}
        </div>

        <button
          onClick={handleReset}
          className="w-full py-3 rounded-2xl font-semibold transition-all duration-300"
          style={{
            background: confirmReset
              ? 'hsl(0 70% 50%)'
              : 'hsl(240 10% 18%)',
            color: confirmReset ? 'white' : 'hsl(0 70% 60%)',
            border: '1px solid hsl(0 70% 50% / 0.3)',
          }}
        >
          {confirmReset ? '⚠️ Нажми ещё раз для сброса' : 'Сбросить весь прогресс'}
        </button>
      </div>
    </div>
  );
}