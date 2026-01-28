import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  Text, 
  Switch,
  Alert 
} from 'react-native';
import { Card, Title, Divider, Button, List } from 'react-native-paper';
import { loadUserStats, saveUserStats } from '../data/achievementStorage';

const SettingsScreen = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [notificationInterval, setNotificationInterval] = useState(60);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    loadData();
    requestPermissions();
  }, []);

  const loadData = async () => {
    const stats = await loadUserStats();
    if (stats) {
      setUserStats(stats);
      setNotificationsEnabled(stats.notificationsEnabled);
      setNotificationInterval(stats.notificationInterval);
    }
  };

  const requestPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Уведомления отключены', 'Разрешите уведомления в настройках устройства');
    }
  };

  const handleNotificationsToggle = async (value) => {
    setNotificationsEnabled(value);
    
    if (userStats) {
      const updatedStats = {
        ...userStats,
        notificationsEnabled: value,
      };
      await saveUserStats(updatedStats);
      setUserStats(updatedStats);
    }
    
    if (value) {
      await scheduleNotifications();
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
    }
  };

  const handleIntervalChange = async (minutes) => {
    setNotificationInterval(minutes);
    
    if (userStats) {
      const updatedStats = {
        ...userStats,
        notificationInterval: minutes,
      };
      await saveUserStats(updatedStats);
      setUserStats(updatedStats);
    }
    
    if (notificationsEnabled) {
      await scheduleNotifications();
    }
  };

  const scheduleNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    
    if (!notificationsEnabled) return;
    
    // Создаем уведомления на день
    const intervals = [10, 14, 18]; // 10:00, 14:00, 18:00
    const now = new Date();
    
    for (const hour of intervals) {
      const trigger = new Date(now);
      trigger.setHours(hour, 0, 0, 0);
      
      if (trigger < now) {
        trigger.setDate(trigger.getDate() + 1);
      }
    }
    
    // Ежедневное уведомление с мотивацией
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎯 Прогресс по целям',
        body: 'Посмотрите, как растут ваши накопления!',
        sound: 'default',
        data: { type: 'daily_progress' },
      },
      trigger: {
        hour: 9,
        minute: 0,
        repeats: true,
      },
    });
  };

  const sendTestNotification = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Тестовое уведомление ✅',
        body: 'Уведомления работают правильно!',
        sound: 'default',
      },
      trigger: {
        seconds: 2,
      },
    });
    
    Alert.alert('Уведомление отправлено', 'Проверьте свой экран');
  };

  const clearAllData = () => {
    Alert.alert(
      'Очистка данных',
      'Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить все', 
          style: 'destructive',
          onPress: async () => {
            // Здесь будет очистка всех данных
            Alert.alert('В разработке', 'Функция будет добавлена в следующем обновлении');
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Настройки уведомлений */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🔔 Уведомления</Title>
          
          <List.Item
            title="Включить уведомления"
            description="Напоминания о пополнении целей"
            left={props => <List.Icon {...props} icon="bell" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                color="#2196F3"
              />
            )}
          />
          
          <Divider style={styles.divider} />
          
          <Text style={styles.subtitle}>Интервал напоминаний:</Text>
          <View style={styles.intervalButtons}>
            {[30, 60, 120, 240].map((minutes) => (
              <Button
                key={minutes}
                mode={notificationInterval === minutes ? "contained" : "outlined"}
                onPress={() => handleIntervalChange(minutes)}
                style={styles.intervalButton}
                compact
              >
                {minutes} мин
              </Button>
            ))}
          </View>
          
          <Button
            mode="outlined"
            onPress={sendTestNotification}
            style={styles.testButton}
            icon="bell-ring"
          >
            Тестовое уведомление
          </Button>
        </Card.Content>
      </Card>

      {/* Статистика приложения */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>📊 Статистика</Title>
          
          {userStats && (
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{userStats.totalGoals || 0}</Text>
                <Text style={styles.statLabel}>Всего целей</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{userStats.completedGoals || 0}</Text>
                <Text style={styles.statLabel}>Выполнено</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{userStats.currentStreak || 0}</Text>
                <Text style={styles.statLabel}>Дней подряд</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {userStats.totalPoints || 0}
                </Text>
                <Text style={styles.statLabel}>Очков</Text>
              </View>
            </View>
          )}
          
          <Button
            mode="contained"
            onPress={() => {/* Навигация к достижениям */}}
            style={styles.achievementsButton}
            icon="trophy"
          >
            Мои достижения
          </Button>
        </Card.Content>
      </Card>

      {/* О приложении */}
      <Card style={styles.sectionCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>ℹ️ О приложении</Title>
          
          <List.Item
            title="Версия"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <List.Item
            title="Разработчик"
            description="Sergey Filatov"
            left={props => <List.Icon {...props} icon="account" />}
          />
          
          <List.Item
            title="Обратная связь"
            description="Напишите нам"
            left={props => <List.Icon {...props} icon="email" />}
            onPress={() => Alert.alert('Обратная связь', 'Email: support@coinkeeper.app')}
          />
          
          <Button
            mode="outlined"
            onPress={() => Alert.alert('Оцените нас', 'Ссылка на магазин приложений')}
            style={styles.rateButton}
            icon="star"
          >
            Оценить приложение
          </Button>
        </Card.Content>
      </Card>

      {/* Опасная зона */}
      <Card style={[styles.sectionCard, styles.dangerZone]}>
        <Card.Content>
          <Title style={[styles.sectionTitle, styles.dangerTitle]}>⚠️ Опасная зона</Title>
          
          <Button
            mode="outlined"
            onPress={clearAllData}
            style={styles.dangerButton}
            textColor="#F44336"
            icon="delete"
          >
            Удалить все данные
          </Button>
          
          <Text style={styles.warningText}>
            Это действие удалит все цели, историю и настройки.
            Восстановление данных невозможно.
          </Text>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 16,
    color: '#2196F3',
  },
  divider: {
    marginVertical: 12,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  intervalButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  intervalButton: {
    flex: 1,
    minWidth: '22%',
  },
  testButton: {
    marginTop: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  achievementsButton: {
    marginTop: 8,
    backgroundColor: '#4CAF50',
  },
  rateButton: {
    marginTop: 16,
    borderColor: '#FFD700',
  },
  dangerZone: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
  dangerTitle: {
    color: '#F44336',
  },
  dangerButton: {
    borderColor: '#F44336',
  },
  warningText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SettingsScreen;