import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import Icon from '@/components/ui/icon';

export default function Home() {
  const navigate = useNavigate();
  const { state } = useGameStore();
  const unlocked = state.achievements.filter(a => a.unlocked).length;

  return (
    <div className="min-h-screen gradient-bg flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(35 100% 40% / 0.08) 0%, transparent 70%)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, hsl(300 60% 40% / 0.08) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 text-center max-w-xl mx-auto animate-fade-in">
        <div className="text-9xl mb-6 pulse-soft select-none" style={{ filter: 'drop-shadow(0 0 30px hsl(35 80% 50% / 0.4))' }}>
          💩
        </div>

        <h1 className="text-5xl font-black mb-3 leading-tight"
          style={{ background: 'linear-gradient(135deg, hsl(35 100% 70%), hsl(300 60% 65%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          Какашка-Кликер
        </h1>

        <p className="text-muted-foreground text-lg mb-10 leading-relaxed">
          Кликай на какашку, зарабатывай очки<br />и открывай достижения!
        </p>

        {state.totalClicks > 0 && (
          <div className="flex gap-4 justify-center mb-8">
            <div className="card-glass rounded-2xl px-5 py-3 text-center">
              <div className="text-2xl font-black" style={{ color: 'hsl(35 100% 65%)' }}>
                {state.totalClicks.toLocaleString('ru')}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">всего кликов</div>
            </div>
            <div className="card-glass rounded-2xl px-5 py-3 text-center">
              <div className="text-2xl font-black" style={{ color: 'hsl(300 60% 65%)' }}>
                {unlocked} / {state.achievements.length}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">достижений</div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/game')}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, hsl(35 100% 60%), hsl(300 60% 55%))',
              color: 'hsl(240 15% 8%)',
              boxShadow: '0 8px 32px hsl(35 100% 50% / 0.35)',
            }}
          >
            <Icon name="Gamepad2" size={20} />
            {state.totalClicks > 0 ? 'Продолжить игру' : 'Начать игру'}
          </button>

          <button
            onClick={() => navigate('/stats')}
            className="flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg card-glass transition-all duration-300 hover:scale-105 active:scale-95"
            style={{ color: 'hsl(45 30% 85%)' }}
          >
            <Icon name="BarChart3" size={20} />
            Статистика
          </button>
        </div>
      </div>

      <div className="absolute bottom-8 text-muted-foreground text-sm flex items-center gap-2">
        <Icon name="Trophy" size={14} />
        {unlocked > 0
          ? `Открыто ${unlocked} из ${state.achievements.length} достижений`
          : 'Открывай достижения за клики!'}
      </div>
    </div>
  );
}
