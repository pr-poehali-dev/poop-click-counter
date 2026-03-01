import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '@/store/gameStore';
import Icon from '@/components/ui/icon';
import func2url from '../../backend/func2url.json';

interface Player {
  name: string;
  total_clicks: number;
  multiplier: number;
  achievements_count: number;
  created_at: string | null;
}

const MEDALS = ['🥇', '🥈', '🥉'];
const NAME_KEY = 'poop_clicker_username';

export default function Leaderboard() {
  const navigate = useNavigate();
  const { state } = useGameStore();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY) || '');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const url = func2url.leaderboard;

  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(d => setPlayers(d.players || []))
      .catch(() => setError('Не удалось загрузить таблицу'))
      .finally(() => setLoading(false));
  }, [url]);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setSubmitting(true);
    setError('');
    try {
      localStorage.setItem(NAME_KEY, trimmed);
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmed,
          total_clicks: Math.floor(state.totalClicks),
          multiplier: state.multiplier,
          achievements_count: state.achievements.filter(a => a.unlocked).length,
        }),
      });
      if (!res.ok) throw new Error();
      const updated = await fetch(url).then(r => r.json());
      setPlayers(updated.players || []);
      setSubmitted(true);
      setShowForm(false);
    } catch {
      setError('Ошибка при сохранении. Попробуй снова.');
    } finally {
      setSubmitting(false);
    }
  };

  const myRank = submitted || localStorage.getItem(NAME_KEY)
    ? players.findIndex(p => p.name === (name.trim() || localStorage.getItem(NAME_KEY))) + 1
    : -1;

  return (
    <div className="min-h-screen gradient-bg flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 card-glass border-b border-border/30">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={18} />
          <span className="font-medium">Назад</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-2xl">🏆</span>
          <span className="font-bold" style={{ color: 'hsl(35 100% 65%)' }}>Топ игроков</span>
        </div>

        <button
          onClick={() => navigate('/game')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <span className="text-xl">💩</span>
          <span className="font-medium">Играть</span>
        </button>
      </nav>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="card-glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black" style={{ color: 'hsl(35 100% 65%)' }}>
              {Math.floor(state.totalClicks).toLocaleString('ru')}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">твои клики</div>
          </div>
          <div className="card-glass rounded-2xl p-4 text-center">
            <div className="text-2xl font-black" style={{ color: 'hsl(300 60% 65%)' }}>
              {myRank > 0 ? `#${myRank}` : '—'}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">твоя позиция</div>
          </div>
        </div>

        {!submitted && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full py-3 rounded-2xl font-bold text-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
            style={{
              background: 'linear-gradient(135deg, hsl(35 100% 55%), hsl(300 60% 50%))',
              color: 'hsl(240 15% 8%)',
              boxShadow: '0 4px 20px hsl(35 100% 50% / 0.3)',
            }}
          >
            Внести свой результат в топ
          </button>
        )}

        {submitted && (
          <div className="card-glass rounded-2xl p-4 text-center"
            style={{ border: '1px solid hsl(120 60% 40% / 0.4)' }}>
            <span className="text-2xl">✅</span>
            <div className="font-bold mt-1" style={{ color: 'hsl(120 60% 60%)' }}>
              Результат сохранён!
            </div>
            {myRank > 0 && (
              <div className="text-sm text-muted-foreground">
                Ты на {myRank}-м месте
              </div>
            )}
          </div>
        )}

        {showForm && (
          <div className="card-glass rounded-2xl p-4 space-y-3"
            style={{ border: '1px solid hsl(35 100% 50% / 0.3)' }}>
            <div className="text-sm font-semibold">Твоё имя в таблице</div>
            <input
              type="text"
              maxLength={30}
              placeholder="Введи никнейм..."
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{
                background: 'hsl(240 10% 14%)',
                border: '1px solid hsl(240 10% 25%)',
                color: 'hsl(45 30% 92%)',
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2 rounded-xl text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                style={{ background: 'hsl(240 10% 14%)', border: '1px solid hsl(240 10% 22%)' }}
              >
                Отмена
              </button>
              <button
                onClick={handleSubmit}
                disabled={!name.trim() || submitting}
                className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, hsl(35 100% 55%), hsl(300 60% 50%))',
                  color: 'hsl(240 15% 8%)',
                }}
              >
                {submitting ? 'Сохраняю...' : 'Отправить'}
              </button>
            </div>
            {error && <div className="text-xs text-red-400 text-center">{error}</div>}
          </div>
        )}

        <div className="card-glass rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
            <span className="font-semibold text-sm">Таблица рекордов</span>
            <span className="text-xs text-muted-foreground">{players.length} игроков</span>
          </div>

          {loading && (
            <div className="py-12 text-center text-muted-foreground">
              <div className="text-3xl mb-2 animate-spin inline-block">⏳</div>
              <div className="text-sm">Загружаю...</div>
            </div>
          )}

          {!loading && players.length === 0 && !error && (
            <div className="py-12 text-center">
              <div className="text-4xl mb-3">💩</div>
              <div className="font-semibold">Пока никого нет</div>
              <div className="text-sm text-muted-foreground mt-1">Будь первым!</div>
            </div>
          )}

          {!loading && error && (
            <div className="py-8 text-center text-red-400 text-sm">{error}</div>
          )}

          {!loading && players.length > 0 && (
            <div className="divide-y divide-border/20">
              {players.map((p, i) => {
                const isMe = p.name === (name.trim() || localStorage.getItem(NAME_KEY));
                return (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 px-4 py-3 transition-colors"
                    style={{
                      background: isMe ? 'hsl(35 100% 50% / 0.08)' : undefined,
                      borderLeft: isMe ? '3px solid hsl(35 100% 55%)' : '3px solid transparent',
                    }}
                  >
                    <div className="w-7 text-center text-lg shrink-0">
                      {i < 3 ? MEDALS[i] : <span className="text-sm text-muted-foreground font-mono">#{i + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-1.5">
                        {p.name}
                        {isMe && <span className="text-xs px-1.5 py-0.5 rounded-md"
                          style={{ background: 'hsl(35 100% 50% / 0.2)', color: 'hsl(35 100% 70%)' }}>ты</span>}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                        <span>x{p.multiplier} множитель</span>
                        <span>·</span>
                        <span>{p.achievements_count} 🏆</span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-bold text-sm" style={{ color: 'hsl(35 100% 65%)' }}>
                        {p.total_clicks.toLocaleString('ru')}
                      </div>
                      <div className="text-xs text-muted-foreground">кликов</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
