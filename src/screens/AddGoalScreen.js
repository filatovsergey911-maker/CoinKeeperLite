import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Text, Chip } from 'react-native-paper';
import Goal, { GOAL_ICONS } from '../data/goalModel';
import { loadGoals, saveGoals } from '../data/storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddGoalScreen = ({ navigation, route }) => {
  const isEdit = route.params?.goal;
  const initialGoal = isEdit ? route.params.goal : null;
  
  const [name, setName] = useState(initialGoal?.name || '');
  const [targetAmount, setTargetAmount] = useState(
    initialGoal?.targetAmount ? Goal.formatAmount(initialGoal.targetAmount) : ''
  );
  const [selectedIcon, setSelectedIcon] = useState(initialGoal?.icon || '💰');
  const [targetDate, setTargetDate] = useState(
    initialGoal?.targetDate ? new Date(initialGoal.targetDate) : null
  );
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Форматируем вводимую сумму
  const handleAmountChange = (text) => {
    // Удаляем все символы кроме цифр
    const numbers = text.replace(/\D/g, '');
    
    if (numbers === '') {
      setTargetAmount('');
      return;
    }
    
    // Форматируем с разделителями
    const num = parseInt(numbers, 10);
    const formatted = Goal.formatAmount(num);
    setTargetAmount(formatted);
  };

  const handleSave = async () => {
    if (name.trim() && targetAmount) {
      const amountNum = Goal.parseFormattedAmount(targetAmount);
      
      let updatedGoals;
      const currentGoals = await loadGoals();

      if (isEdit) {
        // Редактирование существующей цели
        updatedGoals = currentGoals.map(goal => {
          if (goal.id === initialGoal.id) {
            return {
              ...goal,
              name: name.trim(),
              targetAmount: amountNum,
              icon: selectedIcon,
              targetDate: targetDate ? targetDate.toISOString().split('T')[0] : null
            };
          }
          return goal;
        });
      } else {
        // Создание новой цели
        const newGoal = new Goal(
          Date.now().toString(),
          name.trim(),
          amountNum,
          selectedIcon,
          targetDate ? targetDate.toISOString().split('T')[0] : null
        );
        updatedGoals = [...currentGoals, newGoal];
      }
      
      await saveGoals(updatedGoals);
      navigation.goBack();
    }
  };

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  // Быстрое добавление суммы
  const quickAdd = (value) => {
    const formatted = Goal.formatAmount(value);
    setTargetAmount(formatted);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.screenTitle}>
          {isEdit ? 'Редактирование цели' : 'Новая цель'}
        </Text>

        {/* Поле названия */}
        <Text style={styles.label}>На что копите?</Text>
        <TextInput
          placeholder="Например: Новый телефон, Отпуск, Машина"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
          autoFocus={!isEdit}
        />

        {/* Поле суммы */}
        <Text style={styles.label}>Сколько нужно?</Text>
        <TextInput
          placeholder="10 000"
          value={targetAmount}
          onChangeText={handleAmountChange}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          right={<TextInput.Affix text="₽" />}
        />

        {/* Быстрые суммы */}
        <View style={styles.quickAmounts}>
          {[1000, 5000, 10000, 50000, 100000].map((amount) => (
            <Button
              key={amount}
              mode="outlined"
              onPress={() => quickAdd(amount)}
              style={styles.quickAmountButton}
              compact
            >
              {Goal.formatAmount(amount)} ₽
            </Button>
          ))}
        </View>

        {/* Выбор даты */}
        <Text style={styles.label}>Дата цели (необязательно):</Text>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateButton}
          icon="calendar"
        >
          {targetDate ? targetDate.toLocaleDateString('ru-RU') : 'Выберите дату'}
        </Button>
        
        {targetDate && (
          <Button
            mode="text"
            onPress={() => setTargetDate(null)}
            style={styles.clearDateButton}
          >
            Очистить дату
          </Button>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={targetDate || new Date()}
            mode="date"
            display="default"
            onChange={onDateChange}
            minimumDate={new Date()}
          />
        )}

        {/* Выбор иконки */}
        <Text style={styles.label}>Выберите иконку:</Text>
        <View style={styles.iconsContainer}>
          {GOAL_ICONS.map((icon) => (
            <Chip
              key={icon}
              selected={selectedIcon === icon}
              onPress={() => setSelectedIcon(icon)}
              style={styles.iconChip}
            >
              <Text style={styles.iconText}>{icon}</Text>
            </Chip>
          ))}
        </View>

        {/* Кнопки */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
          >
            Отмена
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.button}
            disabled={!name.trim() || !targetAmount}
          >
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    padding: 20,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    marginBottom: 4,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 12,
    gap: 8,
  },
  quickAmountButton: {
    flex: 1,
    minWidth: '30%',
    margin: 2,
  },
  dateButton: {
    marginVertical: 8,
  },
  clearDateButton: {
    marginTop: -8,
  },
  iconsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 10,
  },
  iconChip: {
    margin: 4,
  },
  iconText: {
    fontSize: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 30,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  cancelButton: {
    borderColor: '#F44336',
  },
});

export default AddGoalScreen;