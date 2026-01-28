import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { Button, Appbar, Menu, Divider } from 'react-native-paper';
import GoalCard from '../components/GoalCard';
import AddMoneyModal from '../components/AddMoneyModal';
import Goal from '../data/goalModel';
import { loadGoals, saveGoals } from '../data/storage';
import { checkAchievements, updateStatsOnDeposit, updateStatsOnGoalCreate, updateStatsOnGoalComplete } from '../data/achievementStorage';

const HomeScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newlyCompletedGoals, setNewlyCompletedGoals] = useState(new Set());
  const [menuVisible, setMenuVisible] = useState(false);
  const prevGoalsRef = useRef([]);

  // Загрузка целей при старте и при фокусе
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadData();
    });
    
    loadData();
    
    return unsubscribe;
  }, [navigation]);

  // Отслеживаем новые достижения целей
  useEffect(() => {
    const newlyCompleted = new Set();
    
    goals.forEach(goal => {
      const prevGoal = prevGoalsRef.current.find(g => g.id === goal.id);
      if (prevGoal && !prevGoal.isCompleted && goal.isCompleted) {
        newlyCompleted.add(goal.id);
      }
    });
    
    setNewlyCompletedGoals(newlyCompleted);
    prevGoalsRef.current = goals;
  }, [goals]);

  const loadData = async () => {
    const savedGoals = await loadGoals();
    const goalObjects = savedGoals.map(g => new Goal(
      g.id,
      g.name,
      g.targetAmount,
      g.icon,
      g.targetDate,
      g.currentAmount,
      g.history
    ));
    setGoals(goalObjects);
  };

  const handleAddMoney = (goal) => {
    setSelectedGoal(goal);
    setModalVisible(true);
  };

  const handleDeleteGoal = async (id) => {
    const updatedGoals = goals.filter(goal => goal.id !== id);
    setGoals(updatedGoals);
    await saveGoals(updatedGoals.map(g => g.toJSON()));
  };

  const handleEditGoal = (goal) => {
    navigation.navigate('AddGoal', { goal: goal.toJSON() });
  };

  const handleAddAmount = async (goalId, amount) => {
  const date = new Date().toISOString().split('T')[0];
  
  const updatedGoals = goals.map(goal => {
    if (goal.id === goalId) {
      const updatedGoal = new Goal(
        goal.id,
        goal.name,
        goal.targetAmount,
        goal.icon,
        goal.targetDate,
        goal.currentAmount,
        [...goal.history]
      );
      const result = updatedGoal.addAmount(amount, date);
      
      // Проверяем достижение цели
      if (!goal.isCompleted && result.isCompleted) {
        updateStatsOnGoalComplete();
      }
      
      return result;
    }
    return goal;
  });
  
  setGoals(updatedGoals);
  await saveGoals(updatedGoals.map(g => g.toJSON()));
  
  // Обновляем статистику
  await updateStatsOnDeposit(amount);
  
  // Проверяем достижения
  const achievementsResult = await checkAchievements();
  if (achievementsResult.new.length > 0) {
    // Показываем уведомление о новых достижениях
    achievementsResult.new.forEach(ach => {
      Alert.alert(
        '🎉 Новое достижение!',
        `"${ach.title}"\n${ach.description}\n\n+${ach.rewardPoints} очков`,
        [{ text: 'Отлично!' }]
      );
    });
  }
};

  return (
    <View style={styles.container}>
      {/* Хедер с меню */}
      <Appbar.Header>
        <Appbar.Content title="CoinKeeper Lite" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="dots-vertical" 
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Achievements');
            }} 
            title="Достижения" 
            leadingIcon="trophy"
          />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('Settings');
            }} 
            title="Настройки" 
            leadingIcon="cog"
          />
          <Divider />
          <Menu.Item 
            onPress={() => {
              setMenuVisible(false);
              // Здесь можно добавить помощь
            }} 
            title="Помощь" 
            leadingIcon="help-circle"
          />
        </Menu>
      </Appbar.Header>

      {/* Список целей */}
      {goals.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('AddGoal')}
            style={styles.startButton}
            contentStyle={styles.startButtonContent}
            labelStyle={styles.startButtonLabel}
          >
            Начните копить
          </Button>
          
          {/* Кнопки быстрого доступа */}
          <View style={styles.quickAccess}>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Achievements')}
              style={styles.quickButton}
              icon="trophy"
            >
              Достижения
            </Button>
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('Settings')}
              style={styles.quickButton}
              icon="cog"
            >
              Настройки
            </Button>
          </View>
        </View>
      ) : (
        <>
          <FlatList
            data={goals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <GoalCard
                goal={item}
                onAddMoney={handleAddMoney}
                onDelete={handleDeleteGoal}
                onEdit={handleEditGoal}
                isNewlyCompleted={newlyCompletedGoals.has(item.id)}
              />
            )}
            contentContainerStyle={styles.listContent}
          />
          
          {/* Кнопка добавления цели внизу */}
          <View style={styles.fabContainer}>
            <Button
              mode="contained"
              onPress={() => navigation.navigate('AddGoal')}
              style={styles.addButton}
              contentStyle={styles.addButtonContent}
              labelStyle={styles.addButtonLabel}
            >
              + Новая цель
            </Button>
          </View>
        </>
      )}

      {/* Модальное окно для добавления денег */}
      <AddMoneyModal
        visible={modalVisible}
        goal={selectedGoal}
        onClose={() => setModalVisible(false)}
        onAdd={handleAddAmount}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  startButton: {
    borderRadius: 12,
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#2196F3',
    elevation: 4,
  },
  startButtonContent: {
    height: 56,
  },
  startButtonLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickAccess: {
    flexDirection: 'row',
    marginTop: 30,
    gap: 12,
  },
  quickButton: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  addButton: {
    borderRadius: 12,
    paddingHorizontal: 30,
    backgroundColor: '#2196F3',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  addButtonContent: {
    height: 52,
    paddingHorizontal: 24,
  },
  addButtonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;