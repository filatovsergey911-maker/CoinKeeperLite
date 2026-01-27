import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@coin_keeper_goals';

// Сохранить цели
export const saveGoals = async (goals) => {
  try {
    const jsonValue = JSON.stringify(goals);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (e) {
    console.error('Ошибка сохранения:', e);
  }
};

// Загрузить цели
export const loadGoals = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue != null) {
      const goals = JSON.parse(jsonValue);
      return goals.map(goal => ({
        ...goal,
        // Убедимся что история всегда есть
        history: goal.history || [],
        // Конвертируем числа обратно (JSON сохраняет их как строки)
        currentAmount: parseFloat(goal.currentAmount) || 0,
        targetAmount: parseFloat(goal.targetAmount) || 0
      }));
    }
    return [];
  } catch (e) {
    console.error('Ошибка загрузки:', e);
    return [];
  }
};

// Обновить конкретную цель
export const updateGoal = async (goalId, updates) => {
  try {
    const goals = await loadGoals();
    const updatedGoals = goals.map(goal => {
      if (goal.id === goalId) {
        return { ...goal, ...updates };
      }
      return goal;
    });
    await saveGoals(updatedGoals);
    return updatedGoals;
  } catch (e) {
    console.error('Ошибка обновления:', e);
    return null;
  }
};

// Удалить все цели
export const clearGoals = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Ошибка удаления:', e);
  }
};