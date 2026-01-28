// Модель достижения
class Achievement {
  constructor(id, title, description, icon, type, requirement, rewardPoints = 0) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.icon = icon;
    this.type = type; // 'goal', 'streak', 'amount', 'milestone'
    this.requirement = requirement;
    this.rewardPoints = rewardPoints;
    this.completed = false;
    this.completedAt = null;
    this.progress = 0;
    this.maxProgress = 1;
  }

  checkProgress(userData) {
    switch (this.type) {
      case 'goal':
        this.progress = userData.completedGoals || 0;
        break;
      case 'streak':
        this.progress = userData.currentStreak || 0;
        break;
      case 'amount':
        this.progress = userData.totalSaved || 0;
        break;
      case 'milestone':
        this.progress = userData.totalGoals || 0;
        break;
    }
    
    this.completed = this.progress >= this.requirement;
    if (this.completed && !this.completedAt) {
      this.completedAt = new Date().toISOString();
    }
    
    return this.completed;
  }
}

// Достижения
export const ACHIEVEMENTS = [
  new Achievement(
    'first_goal',
    'Первый шаг',
    'Создайте свою первую цель накопления',
    '🎯',
    'milestone',
    1,
    10
  ),
  new Achievement(
    'goal_master',
    'Мастер целей',
    'Создайте 5 целей накопления',
    '🏆',
    'milestone',
    5,
    50
  ),
  new Achievement(
    'goal_champion',
    'Чемпион целей',
    'Создайте 10 целей накопления',
    '👑',
    'milestone',
    10,
    100
  ),
  new Achievement(
    'first_completion',
    'Первая победа',
    'Достигните своей первой цели',
    '⭐',
    'goal',
    1,
    25
  ),
  new Achievement(
    'perfectionist',
    'Перфекционист',
    'Достигните 5 целей',
    '✨',
    'goal',
    5,
    75
  ),
  new Achievement(
    'streak_3',
    'Стабильность',
    'Откладывайте деньги 3 дня подряд',
    '🔥',
    'streak',
    3,
    15
  ),
  new Achievement(
    'streak_7',
    'Неделя дисциплины',
    'Откладывайте деньги 7 дней подряд',
    '💪',
    'streak',
    7,
    35
  ),
  new Achievement(
    'streak_30',
    'Месяц привычки',
    'Откладывайте деньги 30 дней подряд',
    '🏅',
    'streak',
    30,
    150
  ),
  new Achievement(
    'savings_10000',
    'Новичок в накоплениях',
    'Накопите в сумме 10 000 ₽',
    '💰',
    'amount',
    10000,
    20
  ),
  new Achievement(
    'savings_50000',
    'Опытный копил',
    'Накопите в сумме 50 000 ₽',
    '💎',
    'amount',
    50000,
    60
  ),
  new Achievement(
    'savings_100000',
    'Финансовый гуру',
    'Накопите в сумме 100 000 ₽',
    '👑',
    'amount',
    100000,
    100
  ),
  new Achievement(
    'early_bird',
    'Ранняя пташка',
    'Достигните цели за 3 дня до дедлайна',
    '🐦',
    'goal',
    1,
    30
  ),
  new Achievement(
    'weekly_planner',
    'Еженедельный планировщик',
    'Создайте цели на каждую неделю месяца',
    '📅',
    'milestone',
    4,
    40
  ),
];

export default Achievement;