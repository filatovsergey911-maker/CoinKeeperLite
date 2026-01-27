// Модель цели накопления
class Goal {
  constructor(id, name, targetAmount, icon = '💰', targetDate = null, currentAmount = 0, history = []) {
    this.id = id || Date.now().toString();
    this.name = name;
    this.targetAmount = parseFloat(targetAmount) || 0;
    this.currentAmount = parseFloat(currentAmount) || 0;
    this.icon = icon;
    this.targetDate = targetDate;
    this.createdAt = new Date().toISOString();
    this.isCompleted = this.currentAmount >= this.targetAmount;
    this.history = Array.isArray(history) ? history : [];
  }

  get progress() {
    return this.targetAmount > 0 ? this.currentAmount / this.targetAmount : 0;
  }

  get remainingAmount() {
    return this.targetAmount - this.currentAmount;
  }

  get daysLeft() {
    if (!this.targetDate) return null;
    const target = new Date(this.targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = target - today;
    return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  addAmount(amount, date = new Date().toISOString().split('T')[0]) {
    const amountToAdd = parseFloat(amount) || 0;
    if (amountToAdd <= 0) return this;
    
    // Проверяем, чтобы не превысить цель
    const remaining = this.targetAmount - this.currentAmount;
    const actualAmount = Math.min(amountToAdd, remaining);
    
    if (actualAmount <= 0) return this;
    
    this.currentAmount += actualAmount;
    
    // Добавляем в историю
    this.history.unshift({
      id: Date.now().toString(), // Уникальный ID для редактирования
      date: date,
      amount: actualAmount
    });
    
    // Проверяем достижение цели
    this.isCompleted = this.currentAmount >= this.targetAmount;
    
    return this;
  }

  updateHistoryItem(itemId, newAmount) {
    const itemIndex = this.history.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return this;
    
    const oldAmount = this.history[itemIndex].amount;
    const amountDiff = parseFloat(newAmount) - oldAmount;
    
    // Проверяем лимит
    if (this.currentAmount + amountDiff > this.targetAmount) {
      // Нельзя превысить цель
      return this;
    }
    
    this.currentAmount += amountDiff;
    this.history[itemIndex].amount = parseFloat(newAmount);
    this.isCompleted = this.currentAmount >= this.targetAmount;
    
    return this;
  }

  deleteHistoryItem(itemId) {
    const itemIndex = this.history.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return this;
    
    const amountToRemove = this.history[itemIndex].amount;
    this.currentAmount -= amountToRemove;
    this.history.splice(itemIndex, 1);
    this.isCompleted = this.currentAmount >= this.targetAmount;
    
    return this;
  }

  updateGoal(name, targetAmount, icon, targetDate) {
    this.name = name;
    this.targetAmount = parseFloat(targetAmount) || 0;
    this.icon = icon;
    this.targetDate = targetDate;
    
    // Если текущая сумма превышает новую цель, ограничиваем её
    if (this.currentAmount > this.targetAmount) {
      this.currentAmount = this.targetAmount;
    }
    
    this.isCompleted = this.currentAmount >= this.targetAmount;
    
    return this;
  }

// Метод для форматирования суммы с разделителями
static formatAmount(amount) {
  const num = parseFloat(amount);
  if (isNaN(num)) return '0';
  
  return num.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
}

// Метод для парсинга отформатированной суммы
static parseFormattedAmount(formatted) {
  if (!formatted) return 0;
  
  // Удаляем пробелы, знак рубля и заменяем запятую на точку
  const cleanString = formatted
    .replace(/\s/g, '')
    .replace('₽', '')
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');
  
  const num = parseFloat(cleanString);
  return isNaN(num) ? 0 : num;
}

// Метод для парсинга отформатированной суммы
static parseFormattedAmount(formatted) {
  const numbers = formatted.replace(/\s/g, '').replace('₽', '').replace(',', '.');
  return parseFloat(numbers) || 0;
}

  // Метод для сериализации в JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      targetAmount: this.targetAmount,
      currentAmount: this.currentAmount,
      icon: this.icon,
      targetDate: this.targetDate,
      createdAt: this.createdAt,
      isCompleted: this.isCompleted,
      history: this.history
    };
  }

  // Форматирование суммы с разделителями
  static formatAmount(amount) {
    return parseFloat(amount).toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }
}

// Иконки для выбора
export const GOAL_ICONS = ['💰', '🏠', '🚗', '✈️', '🎮', '📱', '💻', '👕', '🍔', '🎁'];

export default Goal;