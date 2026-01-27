import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Platform,
  Share,
  Alert
} from 'react-native';
import { Card, Button, IconButton, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as Animatable from 'react-native-animatable';
import GradientProgressBar from './GradientProgressBar';
import Goal from '../data/goalModel';

const { width: screenWidth } = Dimensions.get('window');

const GoalCard = ({ goal, onAddMoney, onDelete, onEdit, isNewlyCompleted = false }) => {
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const progress = goal.currentAmount / goal.targetAmount;
  const progressPercentage = Math.min(Math.round(progress * 100), 100);
  
  // Форматируем суммы
  const currentAmountFormatted = Goal.formatAmount(goal.currentAmount);
  const targetAmountFormatted = Goal.formatAmount(goal.targetAmount);
  const remainingAmountFormatted = Goal.formatAmount(goal.remainingAmount);
  
  // Рассчитываем сколько нужно откладывать в день
  const calculateDailyNeeded = () => {
    if (!goal.targetDate || goal.daysLeft <= 0 || goal.isCompleted) return null;
    const daily = goal.remainingAmount / goal.daysLeft;
    return Goal.formatAmount(Math.ceil(daily));
  };
  
  const dailyNeeded = calculateDailyNeeded();

  // Анимация при достижении цели
  useEffect(() => {
    if (isNewlyCompleted && goal.isCompleted) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isNewlyCompleted, goal.isCompleted]);

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleEdit = () => {
    closeMenu();
    onEdit(goal);
  };

  const handleShare = async () => {
    const message = `🎉 Я достиг цели "${goal.name}"! Накопил ${currentAmountFormatted} ₽ из ${targetAmountFormatted} ₽ в приложении CoinKeeper Lite!\n\n#накопления #цель #успех`;
    const title = 'Мой успех в CoinKeeper Lite';
    
    try {
      const result = await Share.share({
        message,
        title,
        url: 'https://play.google.com/store/apps/details?id=com.yourapp.coinkeeper', // Замените на реальную ссылку
      }, {
        dialogTitle: title,
        subject: title,
        tintColor: '#2196F3',
      });
      
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log('Shared with activity type:', result.activityType);
        } else {
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось открыть меню шаринга');
      console.error('Ошибка при попытке поделиться:', error);
    }
  };

  return (
    <Card style={styles.card}>
      {showCelebration && (
        <Animatable.View 
          animation="bounceIn"
          duration={1000}
          style={styles.celebrationOverlay}
        >
          <Text style={styles.celebrationText}>🎉</Text>
          <Animatable.Text 
            animation="pulse" 
            iterationCount="infinite"
            style={styles.celebrationMessage}
          >
            Цель достигнута!
          </Animatable.Text>
        </Animatable.View>
      )}
      
      <Card.Content style={styles.cardContent}>
        {/* Заголовок с иконкой и меню - уменьшаем отступ снизу */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.icon}>{goal.icon}</Text>
            <Text style={styles.goalName} numberOfLines={1}>{goal.name}</Text>
          </View>
          
          <Menu
            visible={menuVisible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon="dots-vertical"
                size={20}
                onPress={openMenu}
              />
            }
          >
            <Menu.Item onPress={handleEdit} title="Редактировать" />
            <Menu.Item onPress={() => {
              closeMenu();
              navigation.navigate('History', { goalId: goal.id });
            }} title="История" />
            {goal.isCompleted && (
              <Menu.Item onPress={handleShare} title="Поделиться" leadingIcon="share-variant" />
            )}
            <Menu.Item onPress={() => {
              closeMenu();
              onDelete(goal.id);
            }} title="Удалить" leadingIcon="delete" />
          </Menu>
        </View>

        {/* Градиентный прогресс-бар с процентами - уменьшаем отступ сверху */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarWrapper}>
            <GradientProgressBar 
              progress={progress} 
              height={32} // Еще шире
              showAnimation={goal.isCompleted}
            />
          </View>
          <Text style={styles.progressText}>{progressPercentage}%</Text>
        </View>

        {/* Статистика и дата */}
        <View style={styles.infoContainer}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Накоплено</Text>
              <Text style={styles.statValue}>{currentAmountFormatted} ₽</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Цель</Text>
              <Text style={styles.statValue}>{targetAmountFormatted} ₽</Text>
            </View>
            
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Осталось</Text>
              <Text style={[styles.statValue, { 
                color: goal.remainingAmount > 0 
                  ? progress < 0.3 ? '#F44336' : progress < 0.7 ? '#FF9800' : '#4CAF50'
                  : '#4CAF50' 
              }]}>
                {remainingAmountFormatted} ₽
              </Text>
            </View>
          </View>

          {/* Информация о ежедневных накоплениях */}
          {dailyNeeded && goal.daysLeft > 0 && !goal.isCompleted && (
            <View style={styles.dailyInfoContainer}>
              <View style={styles.dailyInfoRow}>
                <Text style={styles.dailyIcon}>📅</Text>
                <View style={styles.dailyTextContainer}>
                  <Text style={styles.dailyInfoText}>
                    Чтобы успеть к цели:
                  </Text>
                  <Text style={styles.dailyAmount}>
                    {dailyNeeded} ₽ в день
                  </Text>
                </View>
                <Text style={styles.daysLeftBadge}>
                  {goal.daysLeft} {goal.daysLeft === 1 ? 'день' : goal.daysLeft < 5 ? 'дня' : 'дней'}
                </Text>
              </View>
            </View>
          )}

          {/* Дата цели */}
          {goal.targetDate && (
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>
                Цель до: {new Date(goal.targetDate).toLocaleDateString('ru-RU')}
                {goal.daysLeft !== null && (
                  <Text style={[styles.daysLeft, { 
                    color: goal.daysLeft <= 7 ? '#F44336' : goal.daysLeft <= 30 ? '#FF9800' : '#666' 
                  }]}>
                    {' '}({goal.daysLeft} {goal.daysLeft === 1 ? 'день' : goal.daysLeft < 5 ? 'дня' : 'дней'})
                  </Text>
                )}
              </Text>
            </View>
          )}
        </View>

        {/* Кнопка добавления денег */}
        {!goal.isCompleted && goal.remainingAmount > 0 && (
          <Button
            mode="contained"
            onPress={() => onAddMoney(goal)}
            style={styles.addButton}
            icon="plus"
          >
            Добавить деньги
          </Button>
        )}

        {/* Сообщение о достижении цели с кнопкой Поделиться */}
        {goal.isCompleted && (
          <Animatable.View 
            animation="bounceIn"
            duration={1000}
            style={styles.completedContainer}
          >
            <Text style={styles.completedText}>🎉 Цель достигнута!</Text>
            <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
              <Text style={styles.shareIcon}>📤</Text>
              <Text style={styles.shareButtonText}>Поделиться</Text>
            </TouchableOpacity>
          </Animatable.View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 10,
    elevation: 3,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
  },
  cardContent: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  celebrationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(76, 175, 80, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  celebrationText: {
    fontSize: 80,
    marginBottom: 10,
  },
  celebrationMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10, // Уменьшили с 14 до 10
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 26,
    marginRight: 10,
  },
  goalName: {
    fontSize: 19,
    fontWeight: 'bold',
    flex: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14, // Уменьшили с 18 до 14
  },
  progressBarWrapper: {
    flex: 1,
    marginRight: 10,
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
    minWidth: 48,
    textAlign: 'right',
  },
  infoContainer: {
    marginVertical: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  dailyInfoContainer: {
    backgroundColor: 'rgba(33, 150, 243, 0.08)',
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(33, 150, 243, 0.2)',
  },
  dailyInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dailyIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dailyTextContainer: {
    flex: 1,
  },
  dailyInfoText: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 3,
  },
  dailyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0D47A1',
  },
  daysLeftBadge: {
    backgroundColor: '#2196F3',
    color: 'white',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: '600',
  },
  dateContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  daysLeft: {
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 14,
    paddingVertical: 9,
  },
  completedContainer: {
    backgroundColor: '#E8F5E9',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  completedText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 19,
    marginBottom: 12,
  },
  shareButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  shareButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default GoalCard;