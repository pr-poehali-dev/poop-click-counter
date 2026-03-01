import { useState, useCallback, useEffect } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requiredClicks: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface GameState {
  clicks: number;
  totalClicks: number;
  sessionStart: number;
  achievements: Achievement[];
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', title: 'Первый контакт', description: 'Первый клик сделан!', emoji: '🖐️', requiredClicks: 1, unlocked: false },
  { id: 'ten', title: 'Десяточка', description: '10 кликов — неплохо!', emoji: '🔥', requiredClicks: 10, unlocked: false },
  { id: 'fifty', title: 'Полтинник', description: '50 кликов — ты втянулся', emoji: '⚡', requiredClicks: 50, unlocked: false },
  { id: 'hundred', title: 'Сотня', description: '100 кликов — настоящий герой', emoji: '💎', requiredClicks: 100, unlocked: false },
  { id: 'fivehundred', title: 'Повелитель', description: '500 кликов — ты одержим', emoji: '👑', requiredClicks: 500, unlocked: false },
  { id: 'thousand', title: 'Легенда', description: '1000 кликов — это нереально', emoji: '🌟', requiredClicks: 1000, unlocked: false },
  { id: 'fivethousand', title: 'Бог какашки', description: '5000 кликов — ты достиг просветления', emoji: '🚀', requiredClicks: 5000, unlocked: false },
];

const STORAGE_KEY = 'poop_clicker_state';

function loadState(): GameState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      achievements: ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: parsed.achievements?.find((pa: Achievement) => pa.id === a.id)?.unlocked ?? false,
        unlockedAt: parsed.achievements?.find((pa: Achievement) => pa.id === a.id)?.unlockedAt,
      })),
    };
  }
  return {
    clicks: 0,
    totalClicks: 0,
    sessionStart: Date.now(),
    achievements: ACHIEVEMENTS,
  };
}

function saveState(state: GameState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let globalState: GameState = loadState();
const listeners: Set<() => void> = new Set();

function notify() {
  listeners.forEach(l => l());
}

export function useGameStore() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const click = useCallback((): Achievement | null => {
    const newClicks = globalState.clicks + 1;
    const newTotal = globalState.totalClicks + 1;

    let newlyUnlocked: Achievement | null = null;
    const newAchievements = globalState.achievements.map(a => {
      if (!a.unlocked && newTotal >= a.requiredClicks) {
        const unlocked = { ...a, unlocked: true, unlockedAt: Date.now() };
        newlyUnlocked = unlocked;
        return unlocked;
      }
      return a;
    });

    globalState = {
      ...globalState,
      clicks: newClicks,
      totalClicks: newTotal,
      achievements: newAchievements,
    };
    saveState(globalState);
    notify();
    return newlyUnlocked;
  }, []);

  const resetSession = useCallback(() => {
    globalState = {
      ...globalState,
      clicks: 0,
      sessionStart: Date.now(),
    };
    saveState(globalState);
    notify();
  }, []);

  const resetAll = useCallback(() => {
    globalState = {
      clicks: 0,
      totalClicks: 0,
      sessionStart: Date.now(),
      achievements: ACHIEVEMENTS,
    };
    saveState(globalState);
    notify();
  }, []);

  return {
    state: globalState,
    click,
    resetSession,
    resetAll,
  };
}
