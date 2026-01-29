import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';

const SettingsScreen = () => {
  const { user, logout, usePin, userPin } = useAuth();
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // Проверка поддержки биометрии
  const checkBiometricsSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  };

  const handleLogout = () => {
  Alert.alert(
    'Выход из аккаунта',
    'Все данные сохранятся на устройстве.',
    [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Выйти',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Дополнительно: можно сбросить навигацию к корню
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        },
      },
    ]
  );
};

  const handleBiometricsToggle = async (value) => {
    const supported = await checkBiometricsSupport();
    
    if (value && !supported) {
      Alert.alert('Биометрия не поддерживается', 'На вашем устройстве не настроены отпечатки пальцев или Face ID.');
      setUseBiometrics(false);
      return;
    }
    
    setUseBiometrics(value);
    
    if (value) {
      try {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Подтвердите для включения биометрии',
          fallbackLabel: 'Использовать пин-код',
        });
        
        if (!result.success) {
          setUseBiometrics(false);
        }
      } catch (error) {
        Alert.alert('Ошибка', 'Не удалось настроить биометрию');
        setUseBiometrics(false);
      }
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>Настройки</Text>
        <Text style={styles.subtitle}>
          {user?.email || 'Пользователь'}
        </Text>
      </View>

      {/* Раздел: Аккаунт */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Аккаунт</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Email</Text>
          <Text style={styles.settingValue}>{user?.email || 'Не указан'}</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Смена пароля', 'Функция в разработке')}
        >
          <Text style={styles.settingLabel}>Сменить пароль</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Раздел: Безопасность */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Безопасность</Text>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Пин-код</Text>
            <Text style={styles.settingDescription}>
              {usePin && userPin ? 'Настроен' : 'Не настроен'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Alert.alert('Пин-код', 'Изменить пин-код можно в настройках безопасности')}
          >
            <Text style={styles.settingAction}>
              {usePin && userPin ? 'Изменить' : 'Настроить'}
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Биометрия</Text>
            <Text style={styles.settingDescription}>
              Отпечаток пальца / Face ID
            </Text>
          </View>
          <Switch
            value={useBiometrics}
            onValueChange={handleBiometricsToggle}
            trackColor={{ false: '#ddd', true: '#2196F3' }}
          />
        </View>
      </View>

      {/* Раздел: Уведомления */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Уведомления</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Напоминания</Text>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#ddd', true: '#4CAF50' }}
          />
        </View>
      </View>

      {/* Раздел: О приложении */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>О приложении</Text>
        
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Версия</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Помощь', 'Документация в разработке')}
        >
          <Text style={styles.settingLabel}>Помощь</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => Alert.alert('Политика', 'Конфиденциальность в разработке')}
        >
          <Text style={styles.settingLabel}>Конфиденциальность</Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Кнопка выхода */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Выйти из аккаунта</Text>
      </TouchableOpacity>

      {/* Удаление аккаунта (опасная зона) */}
      <TouchableOpacity
        style={styles.deleteAccountButton}
        onPress={() => Alert.alert(
          'Удаление аккаунта',
          'Эта операция удалит все ваши данные без возможности восстановления.',
          [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Удалить', style: 'destructive' },
          ]
        )}
      >
        <Text style={styles.deleteAccountText}>Удалить аккаунт</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    padding: 25,
    paddingTop: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    paddingVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    paddingHorizontal: 16,
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingLabel: {
    fontSize: 16,
    color: '#333',
  },
  settingDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 3,
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
  },
  settingAction: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '500',
  },
  arrow: {
    fontSize: 18,
    color: '#999',
  },
  logoutButton: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ff5252',
  },
  logoutButtonText: {
    color: '#ff5252',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteAccountButton: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 40,
    padding: 16,
    alignItems: 'center',
  },
  deleteAccountText: {
    color: '#999',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default SettingsScreen;