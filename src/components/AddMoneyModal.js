import React, { useState, useEffect } from 'react';
import { Modal, View, StyleSheet, Alert, Text } from 'react-native';
import { TextInput, Button, Portal } from 'react-native-paper';
import Goal from '../data/goalModel';

const AddMoneyModal = ({ visible, goal, onClose, onAdd }) => {
  const [amount, setAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState(0);
  const [dailyNeeded, setDailyNeeded] = useState('');

  useEffect(() => {
    if (goal) {
      const remaining = goal.targetAmount - goal.currentAmount;
      setMaxAmount(remaining);
      
      // Рассчитываем ежедневную сумму
      if (goal.targetDate && goal.daysLeft > 0) {
        const daily = remaining / goal.daysLeft;
        setDailyNeeded(Goal.formatAmount(Math.ceil(daily)));
      } else {
        setDailyNeeded('');
      }
    }
  }, [goal]);

  // Форматируем вводимое значение
  const handleAmountChange = (text) => {
    // Удаляем все символы кроме цифр
    const numbers = text.replace(/\D/g, '');
    
    if (numbers === '') {
      setAmount('');
      return;
    }
    
    // Форматируем с разделителями
    const num = parseInt(numbers, 10);
    const formatted = Goal.formatAmount(num);
    setAmount(formatted);
  };

  const handleAdd = () => {
    const amountNum = Goal.parseFormattedAmount(amount);
    
    if (amountNum <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    if (amountNum > maxAmount) {
      Alert.alert(
        'Превышение лимита',
        `Максимальная сумма: ${Goal.formatAmount(maxAmount)} ₽\nВы пытаетесь внести: ${Goal.formatAmount(amountNum)} ₽`,
        [{ text: 'Понятно' }]
      );
      return;
    }

    onAdd(goal.id, amountNum);
    setAmount('');
    onClose();
  };

  if (!goal) return null;

  const formattedMaxAmount = Goal.formatAmount(maxAmount);
  const progress = (goal.currentAmount / goal.targetAmount) * 100;
  const progressColor = progress < 30 ? '#F44336' : progress < 70 ? '#FF9800' : '#4CAF50';

  return (
    <Portal>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.header}>
              <Text style={styles.modalTitle}>
                Добавить деньги
              </Text>
              <Text style={styles.goalName}>{goal.icon} {goal.name}</Text>
            </View>
            
            {/* Прогресс */}
            <View style={styles.progressInfo}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Прогресс:</Text>
                <Text style={[styles.progressValue, { color: progressColor }]}>
                  {progress.toFixed(2).replace('.', ',')}%
                </Text>
              </View>
              <View style={styles.amountRow}>
                <Text style={styles.amountLabel}>Накоплено:</Text>
                <Text style={styles.amountValue}>
                  {Goal.formatAmount(goal.currentAmount)} ₽
                </Text>
              </View>
            </View>
            
            {/* Лимит */}
            <View style={styles.limitContainer}>
              <Text style={styles.limitText}>
                Можно внести до: <Text style={styles.limitAmount}>{formattedMaxAmount} ₽</Text>
              </Text>
            </View>
            
            {/* Ежедневный расчет */}
            {dailyNeeded && goal.daysLeft > 0 && (
              <View style={styles.dailyContainer}>
                <Text style={styles.dailyTitle}>📅 Чтобы успеть к цели:</Text>
                <View style={styles.dailyDetails}>
                  <Text style={styles.dailyAmount}>{dailyNeeded} ₽</Text>
                  <Text style={styles.dailyText}>в день</Text>
                  <Text style={styles.dailyDays}>(осталось {goal.daysLeft} дней)</Text>
                </View>
              </View>
            )}
            
            {/* Поле ввода */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Сумма пополнения:</Text>
              <TextInput
                value={amount}
                onChangeText={handleAmountChange}
                keyboardType="numeric"
                mode="outlined"
                style={styles.input}
                right={<TextInput.Affix text="₽" />}
                placeholder="0"
                autoFocus={true}
                theme={{ colors: { primary: '#2196F3' } }}
              />
            </View>

            {/* Кнопки действий */}
            <View style={styles.buttonContainer}>
              <Button
                mode="outlined"
                onPress={onClose}
                style={styles.button}
                labelStyle={styles.buttonLabel}
              >
                Отмена
              </Button>
              <Button
                mode="contained"
                onPress={handleAdd}
                style={[styles.button, styles.addButton]}
                labelStyle={styles.addButtonLabel}
                disabled={!amount || Goal.parseFormattedAmount(amount) <= 0}
                icon="check"
              >
                Добавить
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
    textAlign: 'center',
  },
  goalName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  progressInfo: {
    backgroundColor: '#F5F5F5',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 16,
    color: '#666',
  },
  progressValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
  },
  amountValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
  },
  limitContainer: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9800',
  },
  limitText: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  limitAmount: {
    fontWeight: 'bold',
    color: '#FF9800',
  },
  dailyContainer: {
    backgroundColor: '#E8F5E9',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  dailyTitle: {
    fontSize: 15,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 8,
  },
  dailyDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  dailyAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginRight: 8,
  },
  dailyText: {
    fontSize: 16,
    color: '#2E7D32',
    marginRight: 12,
  },
  dailyDays: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  input: {
    marginBottom: 16,
    fontSize: 20,
    height: 56,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
  },
  addButton: {
    backgroundColor: '#2196F3',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

export default AddMoneyModal;