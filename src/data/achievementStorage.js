import AsyncStorage from '@react-native-async-storage/async-storage';
import { ACHIEVEMENTS } from './achievementModel';

const STORAGE_KEY = '@coin_keeper_achievements';
const USER_STATS_KEY = '@coin_keeper_user_stats';

// Сохранить достижения
export const saveAchievements = async (achievements) => {
  try {
    const jsonValue = JSON.stringify(achievements);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Ошибка сохранения достижений:', e);
  }
};

// Загрузить достижения
export const loadAchievements = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    // Первый запуск - инициализируем достижения
    const initialAchievements = ACHIEVEMENTS.map(ach => ({
      ...ach,
      completed: false,
      completedAt: null,
      progress: 0
    }));
    await saveAchievements(initialAchievements);
    return initialAchievements;
  } catch (e) {
    console.error('Ошибка загрузки достижений:', e);
    return [];
  }
};

// Сохранить статистику пользователя
export const saveUserStats = async (stats) => {
  try {
    const jsonValue = JSON.stringify(stats);
    await AsyncStorage.setItem(USER_STATS_KEY, jsonValue);
  } catch (e) {
    console.error('Ошибка сохранения статистики:', e);
  }
};

// Загрузить статистику пользователя
export const loadUserStats = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(USER_STATS_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    }
    // Первый запуск - инициализируем статистику
    const initialStats = {
      totalSaved: 0,
      completedGoals: 0,
      totalGoals: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      totalPoints: 0,
      notificationsEnabled: true,
      notificationInterval: 60, // минуты
    };
    await saveUserStats(initialStats);
    return initialStats;
  } catch (e) {
    console.error('Ошибка загрузки статистики:', e);
    return null;
  }
};

// Обновить статистику при добавлении денег
export const updateStatsOnDeposit = async (amount) => {
  const stats = await loadUserStats();
  if (!stats) return;
  
  stats.totalSaved += amount;
  
  // Проверяем стрик
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastActivityDate === today) {
    // Уже сегодня пополняли
  } else if (stats.lastActivityDate) {
    const lastDate = new Date(stats.lastActivityDate);
    const currentDate = new Date(today);
    const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      // Последовательные дни
      stats.currentStreak += 1;
    } else if (diffDays > 1) {
      // Пропустили день, сбрасываем стрик
      stats.currentStreak = 1;
    }
  } else {
    // Первое пополнение
    stats.currentStreak = 1;
  }
  
  stats.lastActivityDate = today;
  stats.longestStreak = Math.max(stats.longestStreak, stats.currentStreak);
  
  await saveUserStats(stats);
  return stats;
};

// Обновить статистику при создании цели
export const updateStatsOnGoalCreate = async () => {
  const stats = await loadUserStats();
  if (!stats) return;
  
  stats.totalGoals += 1;
  await saveUserStats(stats);
  return stats;
};

// Обновить статистику при достижении цели
export const updateStatsOnGoalComplete = async () => {
  const stats = await loadUserStats();
  if (!stats) return;
  
  stats.completedGoals += 1;
  await saveUserStats(stats);
  return stats;
};

// Проверить и обновить достижения
export const checkAchievements = async () => {
  const [achievements, stats] = await Promise.all([
    loadAchievements(),
    loadUserStats()
  ]);
  
  if (!stats) return achievements;
  
  const updatedAchievements = achievements.map(ach => {
    const achievement = { ...ach };
    achievement.checkProgress(stats);
    return achievement;
  });
  
  // Сохраняем обновленные достижения
  await saveAchievements(updatedAchievements);
  
  // Возвращаем только новые достижения
  const newAchievements = updatedAchievements.filter(
    (ach, index) => ach.completed && !achievements[index].completed
  );
  
  return {
    all: updatedAchievements,
    new: newAchievements
  };
};