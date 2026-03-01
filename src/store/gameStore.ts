import { useState, useCallback, useEffect, useRef } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requiredClicks: number;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface Upgrade {
  id: string;
  title: string;
  description: string;
  emoji: string;
  cost: number;
  effect: 'multiplier' | 'autoclicker';
  value: number;
  level: number;
  maxLevel: number;
}

export interface GameState {
  clicks: number;
  totalClicks: number;
  sessionStart: number;
  achievements: Achievement[];
  upgrades: Upgrade[];
  multiplier: number;
  autoClickRate: number;
  totalSpent: number;
}

const ACHIEVEMENTS: Achievement[] = [
  // — клики —
  { id: 'first', title: 'Первый контакт', description: 'Первый клик сделан!', emoji: '🖐️', requiredClicks: 1, unlocked: false },
  { id: 'ten', title: 'Десяточка', description: '10 кликов — неплохо!', emoji: '🔥', requiredClicks: 10, unlocked: false },
  { id: 'fifty', title: 'Полтинник', description: '50 кликов — ты втянулся', emoji: '⚡', requiredClicks: 50, unlocked: false },
  { id: 'hundred', title: 'Сотня', description: '100 кликов — настоящий герой', emoji: '💎', requiredClicks: 100, unlocked: false },
  { id: 'twofifty', title: 'Четверть тысячи', description: '250 кликов — палец не устал?', emoji: '🤙', requiredClicks: 250, unlocked: false },
  { id: 'fivehundred', title: 'Повелитель', description: '500 кликов — ты одержим', emoji: '👑', requiredClicks: 500, unlocked: false },
  { id: 'thousand', title: 'Легенда', description: '1000 кликов — это нереально', emoji: '🌟', requiredClicks: 1000, unlocked: false },
  { id: 'twothousand', title: 'Двойная легенда', description: '2 000 кликов — ты не остановишься', emoji: '🌠', requiredClicks: 2000, unlocked: false },
  { id: 'fivethousand', title: 'Бог какашки', description: '5000 кликов — ты достиг просветления', emoji: '🚀', requiredClicks: 5000, unlocked: false },
  { id: 'tenthousand', title: 'Мастер дзена', description: '10 000 кликов — медитация уровня бог', emoji: '🧘', requiredClicks: 10000, unlocked: false },
  { id: 'twentyfive', title: 'Машина смерти', description: '25 000 кликов — ты не человек', emoji: '🤖', requiredClicks: 25000, unlocked: false },
  { id: 'fifty_k', title: 'Вселенский ужас', description: '50 000 кликов — вселенная дрожит', emoji: '🌌', requiredClicks: 50000, unlocked: false },
  { id: 'hundred_k', title: 'Сто тысяч', description: '100 000 кликов — ты серьёзен', emoji: '💯', requiredClicks: 100000, unlocked: false },
  { id: 'half_mil', title: 'Полмиллиона', description: '500 000 кликов — ты уже не человек', emoji: '🛸', requiredClicks: 500000, unlocked: false },
  { id: 'million', title: 'Миллионер', description: '1 000 000 кликов — добро пожаловать в клуб', emoji: '🎰', requiredClicks: 1000000, unlocked: false },
  { id: 'five_mil', title: 'Галактический владыка', description: '5 000 000 кликов — ты за гранью', emoji: '🌠', requiredClicks: 5000000, unlocked: false },
  { id: 'ten_mil', title: 'Абсолютный ноль', description: '10 000 000 кликов — всё теряет смысл', emoji: '♾️', requiredClicks: 10000000, unlocked: false },
  // — прокачка —
  { id: 'speed1', title: 'Прокачан', description: 'Купи первое улучшение', emoji: '⬆️', requiredClicks: -1, unlocked: false },
  { id: 'auto1', title: 'Лентяй', description: 'Включи автокликер', emoji: '😴', requiredClicks: -2, unlocked: false },
  { id: 'multiplier3', title: 'Утроение', description: 'Множитель x3 и выше', emoji: '✖️', requiredClicks: -3, unlocked: false },
  { id: 'multiplier10', title: 'Десятикратный', description: 'Множитель x10 и выше', emoji: '🔟', requiredClicks: -4, unlocked: false },
  { id: 'multiplier25', title: 'Ядерный удар', description: 'Множитель x25 и выше', emoji: '☢️', requiredClicks: -5, unlocked: false },
  { id: 'multi_max', title: 'Абсолютная сила', description: 'Прокачай Мега-бомбу до максимума', emoji: '💥', requiredClicks: -6, unlocked: false },
  { id: 'auto_max', title: 'Завод работает', description: 'Прокачай Фабрику до максимума', emoji: '🏭', requiredClicks: -7, unlocked: false },
  { id: 'all_upgrades', title: 'Коллекционер', description: 'Купи хотя бы 1 уровень каждого улучшения', emoji: '🎯', requiredClicks: -8, unlocked: false },
  { id: 'auto_rate_10', title: 'Конвейер', description: 'Авто-клики 10/сек и выше', emoji: '⚙️', requiredClicks: -9, unlocked: false },
  { id: 'auto_rate_50', title: 'Ядерный реактор', description: 'Авто-клики 50/сек и выше', emoji: '⚛️', requiredClicks: -10, unlocked: false },
  { id: 'upgrade5', title: 'Пятёрочник', description: 'Суммарно 5 уровней улучшений', emoji: '5️⃣', requiredClicks: -11, unlocked: false },
  { id: 'upgrade20', title: 'Двадцатка', description: 'Суммарно 20 уровней улучшений', emoji: '🏅', requiredClicks: -12, unlocked: false },
  { id: 'big_spender', title: 'Транжира', description: 'Потрать 10 000 кликов на улучшения', emoji: '💸', requiredClicks: -13, unlocked: false },
  { id: 'uber_spender', title: 'Мотовило', description: 'Потрать 100 000 кликов на улучшения', emoji: '🤑', requiredClicks: -14, unlocked: false },
];

const BASE_UPGRADES: Upgrade[] = [
  { id: 'multi1', title: 'Сила пальца', description: '+1 за клик', emoji: '💪', cost: 50, effect: 'multiplier', value: 1, level: 0, maxLevel: 10 },
  { id: 'multi2', title: 'Супер-удар', description: '+5 за клик', emoji: '🥊', cost: 500, effect: 'multiplier', value: 5, level: 0, maxLevel: 5 },
  { id: 'multi3', title: 'Мега-бомба', description: '+20 за клик', emoji: '💣', cost: 5000, effect: 'multiplier', value: 20, level: 0, maxLevel: 5 },
  { id: 'auto1', title: 'Авто-какашка', description: '+1/сек автоматически', emoji: '🤖', cost: 100, effect: 'autoclicker', value: 1, level: 0, maxLevel: 10 },
  { id: 'auto2', title: 'Фабрика', description: '+5/сек автоматически', emoji: '🏭', cost: 1000, effect: 'autoclicker', value: 5, level: 0, maxLevel: 5 },
  { id: 'auto3', title: 'Армия роботов', description: '+25/сек автоматически', emoji: '🦾', cost: 10000, effect: 'autoclicker', value: 25, level: 0, maxLevel: 3 },
];

const STORAGE_KEY = 'poop_clicker_state_v2';

function loadState(): GameState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    const upgrades = BASE_UPGRADES.map(u => ({
      ...u,
      level: parsed.upgrades?.find((pu: Upgrade) => pu.id === u.id)?.level ?? 0,
    }));
    const multiplier = 1 + upgrades.filter(u => u.effect === 'multiplier').reduce((s, u) => s + u.value * u.level, 0);
    const autoClickRate = upgrades.filter(u => u.effect === 'autoclicker').reduce((s, u) => s + u.value * u.level, 0);
    return {
      ...parsed,
      achievements: ACHIEVEMENTS.map(a => ({
        ...a,
        unlocked: parsed.achievements?.find((pa: Achievement) => pa.id === a.id)?.unlocked ?? false,
        unlockedAt: parsed.achievements?.find((pa: Achievement) => pa.id === a.id)?.unlockedAt,
      })),
      upgrades,
      multiplier,
      autoClickRate,
    };
  }
  return {
    clicks: 0,
    totalClicks: 0,
    sessionStart: Date.now(),
    achievements: ACHIEVEMENTS,
    upgrades: BASE_UPGRADES,
    multiplier: 1,
    autoClickRate: 0,
    totalSpent: 0,
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

function checkSpecialAchievements(state: GameState): Achievement | null {
  return null;
}

export function useGameStore() {
  const [, forceUpdate] = useState(0);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  useEffect(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (globalState.autoClickRate > 0) {
      autoRef.current = setInterval(() => {
        const add = globalState.autoClickRate;
        globalState = {
          ...globalState,
          clicks: globalState.clicks + add,
          totalClicks: globalState.totalClicks + add,
        };
        saveState(globalState);
        notify();
      }, 1000);
    }
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [globalState.autoClickRate]);

  const click = useCallback((): Achievement | null => {
    const add = globalState.multiplier;
    const newClicks = globalState.clicks + add;
    const newTotal = globalState.totalClicks + add;

    let newlyUnlocked: Achievement | null = null;
    const newAchievements = globalState.achievements.map(a => {
      if (!a.unlocked && a.requiredClicks > 0 && newTotal >= a.requiredClicks) {
        const u = { ...a, unlocked: true, unlockedAt: Date.now() };
        newlyUnlocked = u;
        return u;
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

  const buyUpgrade = useCallback((id: string): Achievement | null => {
    const upgrade = globalState.upgrades.find(u => u.id === id);
    if (!upgrade || upgrade.level >= upgrade.maxLevel) return null;

    const cost = Math.floor(upgrade.cost * Math.pow(1.8, upgrade.level));
    if (globalState.clicks < cost) return null;

    const newUpgrades = globalState.upgrades.map(u =>
      u.id === id ? { ...u, level: u.level + 1 } : u
    );

    const multiplier = 1 + newUpgrades.filter(u => u.effect === 'multiplier').reduce((s, u) => s + u.value * u.level, 0);
    const autoClickRate = newUpgrades.filter(u => u.effect === 'autoclicker').reduce((s, u) => s + u.value * u.level, 0);

    let newlyUnlocked: Achievement | null = null;
    const totalUpgradeLevels = newUpgrades.reduce((s, u) => s + u.level, 0);
    const hasAuto = newUpgrades.some(u => u.effect === 'autoclicker' && u.level > 0);
    const totalSpent = (globalState.totalSpent ?? 0) + cost;
    const mega = newUpgrades.find(u => u.id === 'multi3');
    const factory = newUpgrades.find(u => u.id === 'auto2');
    const allBought = newUpgrades.every(u => u.level > 0);

    const newAchievements = globalState.achievements.map(a => {
      if (a.unlocked) return a;
      let cond = false;
      if (a.id === 'speed1') cond = totalUpgradeLevels >= 1;
      else if (a.id === 'auto1') cond = hasAuto;
      else if (a.id === 'multiplier3') cond = multiplier >= 3;
      else if (a.id === 'multiplier10') cond = multiplier >= 10;
      else if (a.id === 'multiplier25') cond = multiplier >= 25;
      else if (a.id === 'multi_max') cond = !!mega && mega.level >= mega.maxLevel;
      else if (a.id === 'auto_max') cond = !!factory && factory.level >= factory.maxLevel;
      else if (a.id === 'all_upgrades') cond = allBought;
      else if (a.id === 'auto_rate_10') cond = autoClickRate >= 10;
      else if (a.id === 'auto_rate_50') cond = autoClickRate >= 50;
      else if (a.id === 'upgrade5') cond = totalUpgradeLevels >= 5;
      else if (a.id === 'upgrade20') cond = totalUpgradeLevels >= 20;
      else if (a.id === 'big_spender') cond = totalSpent >= 10000;
      else if (a.id === 'uber_spender') cond = totalSpent >= 100000;
      if (cond) {
        const u = { ...a, unlocked: true, unlockedAt: Date.now() };
        newlyUnlocked = u;
        return u;
      }
      return a;
    });

    globalState = {
      ...globalState,
      clicks: globalState.clicks - cost,
      upgrades: newUpgrades,
      multiplier,
      autoClickRate,
      achievements: newAchievements,
      totalSpent,
    };
    saveState(globalState);
    notify();
    return newlyUnlocked;
  }, []);

  const resetSession = useCallback(() => {
    globalState = { ...globalState, clicks: 0, sessionStart: Date.now() };
    saveState(globalState);
    notify();
  }, []);

  const resetAll = useCallback(() => {
    globalState = {
      clicks: 0,
      totalClicks: 0,
      sessionStart: Date.now(),
      achievements: ACHIEVEMENTS,
      upgrades: BASE_UPGRADES,
      multiplier: 1,
      autoClickRate: 0,
      totalSpent: 0,
    };
    saveState(globalState);
    notify();
  }, []);

  return { state: globalState, click, buyUpgrade, resetSession, resetAll };
}