import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  Modal, 
  TouchableOpacity,
  Alert 
} from 'react-native';
import { Card, Title, Paragraph, TextInput, Button, IconButton } from 'react-native-paper';
import { loadGoals, saveGoals } from '../data/storage';
import Goal from '../data/goalModel';

const HistoryScreen = ({ route, navigation }) => {
  const [goal, setGoal] = useState(null);
  const [history, setHistory] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editAmount, setEditAmount] = useState('');

  useEffect(() => {
    loadGoalData();
  }, [route.params?.goalId]);

  const loadGoalData = async () => {
    const goals = await loadGoals();
    const foundGoal = goals.find(g => g.id === route.params?.goalId);
    if (foundGoal) {
      const goalObj = new Goal(
        foundGoal.id,
        foundGoal.name,
        foundGoal.targetAmount,
        foundGoal.icon,
        foundGoal.targetDate,
        foundGoal.currentAmount,
        foundGoal.history
      );
      setGoal(goalObj);
      // Сортируем историю по дате (новые сверху)
      const sortedHistory = [...(foundGoal.history || [])].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      setHistory(sortedHistory);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setEditAmount(item.amount.toString());
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !editAmount || parseFloat(editAmount) <= 0) {
      Alert.alert('Ошибка', 'Введите корректную сумму');
      return;
    }

    const newAmount = parseFloat(editAmount);
    const goals = await loadGoals();
    
    const updatedGoals = goals.map(g => {
      if (g.id === goal.id) {
        const goalObj = new Goal(
          g.id,
          g.name,
          g.targetAmount,
          g.icon,
          g.targetDate,
          g.currentAmount,
          g.history
        );
        
        goalObj.updateHistoryItem(editingItem.id, newAmount);
        return goalObj.toJSON();
      }
      return g;
    });

    await saveGoals(updatedGoals);
    setEditModalVisible(false);
    setEditingItem(null);
    setEditAmount('');
    loadGoalData(); // Перезагружаем данные
  };

  const handleDeleteItem = async (item) => {
    Alert.alert(
      'Удаление записи',
      'Вы уверены, что хотите удалить эту запись?',
      [
        { text: 'Отмена', style: 'cancel' },
        { 
          text: 'Удалить', 
          style: 'destructive',
          onPress: async () => {
            const goals = await loadGoals();
            
            const updatedGoals = goals.map(g => {
              if (g.id === goal.id) {
                const goalObj = new Goal(
                  g.id,
                  g.name,
                  g.targetAmount,
                  g.icon,
                  g.targetDate,
                  g.currentAmount,
                  g.history
                );
                
                goalObj.deleteHistoryItem(item.id);
                return goalObj.toJSON();
              }
              return g;
            });

            await saveGoals(updatedGoals);
            loadGoalData();
          }
        }
      ]
    );
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getTotalAdded = () => {
    return history.reduce((sum, item) => sum + (item.amount || 0), 0);
  };

  return (
    <View style={styles.container}>
      {goal && (
        <>
          <Card style={styles.goalHeader}>
            <Card.Content>
              <View style={styles.headerRow}>
                <Text style={styles.icon}>{goal.icon}</Text>
                <Title style={styles.goalTitle}>{goal.name}</Title>
              </View>
              <Paragraph style={styles.goalStats}>
                Накоплено: {Goal.formatAmount(goal.currentAmount)} ₽ из {Goal.formatAmount(goal.targetAmount)} ₽
                {'\n'}
                Всего пополнений: {history.length} на сумму {Goal.formatAmount(getTotalAdded())} ₽
              </Paragraph>
            </Card.Content>
          </Card>

          {history.length > 0 ? (
            <FlatList
              data={history}
              keyExtractor={(item) => `${item.id}-${item.date}`}
              renderItem={({ item }) => (
                <Card style={styles.historyCard}>
                  <Card.Content style={styles.historyContent}>
                    <View style={styles.historyRow}>
                      <Text style={styles.historyDate}>{formatDate(item.date)}</Text>
                      <Text style={styles.historyAmount}>+{Goal.formatAmount(item.amount)} ₽</Text>
                    </View>
                    <View style={styles.historyActions}>
                      <IconButton
                        icon="pencil"
                        size={20}
                        onPress={() => handleEditItem(item)}
                        style={styles.editButton}
                      />
                      <IconButton
                        icon="delete"
                        size={20}
                        onPress={() => handleDeleteItem(item)}
                        style={styles.deleteButton}
                      />
                    </View>
                  </Card.Content>
                </Card>
              )}
              contentContainerStyle={styles.listContent}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Пополнений пока нет</Text>
            </View>
          )}

          {/* Модальное окно редактирования */}
          <Modal
            visible={editModalVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.editModalContainer}>
              <View style={styles.editModalContent}>
                <Text style={styles.editModalTitle}>
                  Редактирование записи
                </Text>
                <Text style={styles.editModalDate}>
                  {editingItem && formatDate(editingItem.date)}
                </Text>
                
                <TextInput
                  label="Сумма"
                  value={editAmount}
                  onChangeText={(text) => {
                    if (/^\d*\.?\d*$/.test(text)) {
                      setEditAmount(text);
                    }
                  }}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={styles.editInput}
                  right={<TextInput.Affix text="₽" />}
                />

                <View style={styles.editButtonContainer}>
                  <Button
                    mode="outlined"
                    onPress={() => {
                      setEditModalVisible(false);
                      setEditingItem(null);
                      setEditAmount('');
                    }}
                    style={styles.editButton}
                  >
                    Отмена
                  </Button>
                  <Button
                    mode="contained"
                    onPress={handleSaveEdit}
                    style={styles.editButton}
                    disabled={!editAmount || parseFloat(editAmount) <= 0}
                  >
                    Сохранить
                  </Button>
                </View>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  goalHeader: {
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  goalTitle: {
    flex: 1,
  },
  goalStats: {
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 20,
  },
  historyCard: {
    marginBottom: 8,
  },
  historyContent: {
    paddingVertical: 12,
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyDate: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  historyAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 10,
  },
  historyActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  editButton: {
    marginHorizontal: 2,
  },
  deleteButton: {
    marginHorizontal: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  editModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  editModalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  editModalDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  editInput: {
    marginBottom: 24,
  },
  editButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  editButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default HistoryScreen;