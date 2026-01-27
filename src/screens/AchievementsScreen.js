import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  ScrollView,
  TouchableOpacity 
} from 'react-native';
import { Card, Title, Paragraph, ProgressBar, Button } from 'react-native-paper';
import { loadAchievements, loadUserStats } from '../data/achievementStorage';

const AchievementsScreen = () => {
  const [achievements, setAchievements] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [ach, stats] = await Promise.all([
      loadAchievements(),
      loadUserStats()
    ]);
    setAchievements(ach);
    setUserStats(stats);
  };

  const filteredAchievements = achievements.filter(ach => {
    if (activeTab === 'completed') return ach.completed;
    if (activeTab === 'in_progress') return !ach.completed;
    return true;
  });

  const getCompletionPercentage = () => {
    if (achievements.length === 0) return 0;
    const completed = achievements.filter(a => a.completed).length;
    return (completed / achievements.length) * 100;
  };

  const renderAchievement = ({ item }) => (
    <Card style={[
      styles.achievementCard,
      item.completed && styles.completedCard
    ]}>
      <Card.Content>
        <View style={styles.achievementHeader}>
          <Text style={styles.achievementIcon}>{item.icon}</Text>
          <View style={styles.achievementInfo}>
            <Title style={styles.achievementTitle}>{item.title}</Title>
            <Paragraph style={styles.achievementDescription}>
              {item.description}
            </Paragraph>
          </View>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardPoints}>+{item.rewardPoints}</Text>
            <Text style={styles.rewardLabel}>очков</Text>
          </View>
        </View>
        
        {!item.completed && (
          <View style={styles.progressContainer}>
            <ProgressBar 
              progress={item.progress / item.requirement} 
              style={styles.progressBar}
              color="#4CAF50"
            />
            <Text style={styles.progressText}>
              {item.progress} / {item.requirement}
            </Text>
          </View>
        )}
        
        {item.completed && item.completedAt && (
          <View style={styles.completedInfo}>
            <Text style={styles.completedDate}>
              Получено: {new Date(item.completedAt).toLocaleDateString('ru-RU')}
            </Text>
            <Text style={styles.completedBadge}>✅ Выполнено</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );

  return (
    <ScrollView style={styles.container}>
      {/* Статистика */}
      {userStats && (
        <Card style={styles.statsCard}>
          <Card.Content>
            <Title style={styles.statsTitle}>Ваша статистика</Title>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.totalPoints}</Text>
                <Text style={styles.statLabel}>Очков</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.completedGoals}</Text>
                <Text style={styles.statLabel}>Целей</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                <Text style={styles.statLabel}>Дней подряд</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {getCompletionPercentage().toFixed(1)}%
                </Text>
                <Text style={styles.statLabel}>Достижений</Text>
              </View>
            </View>
            
            <ProgressBar 
              progress={getCompletionPercentage() / 100} 
              style={styles.overallProgress}
              color="#2196F3"
            />
          </Card.Content>
        </Card>
      )}

      {/* Табы */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Все
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'in_progress' && styles.activeTab]}
          onPress={() => setActiveTab('in_progress')}
        >
          <Text style={[styles.tabText, activeTab === 'in_progress' && styles.activeTabText]}>
            В процессе
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Полученные
          </Text>
        </TouchableOpacity>
      </View>

      {/* Список достижений */}
      <FlatList
        data={filteredAchievements}
        keyExtractor={(item) => item.id}
        renderItem={renderAchievement}
        scrollEnabled={false}
        contentContainerStyle={styles.listContent}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  statsCard: {
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 20,
    marginBottom: 16,
    color: '#2196F3',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  overallProgress: {
    height: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2196F3',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: 'white',
  },
  listContent: {
    paddingBottom: 20,
  },
  achievementCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  completedCard: {
    borderWidth: 2,
    borderColor: '#4CAF50',
    backgroundColor: '#F1F8E9',
  },
  achievementHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  achievementIcon: {
    fontSize: 36,
    marginRight: 12,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  rewardBadge: {
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 60,
  },
  rewardPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rewardLabel: {
    fontSize: 10,
    color: '#666',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    minWidth: 60,
  },
  completedInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  completedDate: {
    fontSize: 12,
    color: '#666',
  },
  completedBadge: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default AchievementsScreen;