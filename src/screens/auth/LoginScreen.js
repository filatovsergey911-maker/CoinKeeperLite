import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../auth/AuthContext';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Ошибка', 'Заполните все поля');
      return;
    }

    setLoading(true);
    const result = await login(email, password, rememberMe);
    setLoading(false);

    if (result.success) {
      // Успешный вход - переходим на главный экран
      navigation.replace('MainTabs');
    } else {
      Alert.alert('Ошибка', result.error || 'Неверный email или пароль');
    }
  };

  const handleQuickTestLogin = () => {
    // Быстрый тестовый вход (для разработки)
    setEmail('test@example.com');
    setPassword('123456');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Заголовок */}
          <View style={styles.header}>
            <Text style={styles.title}>CoinKeeper Lite</Text>
            <Text style={styles.subtitle}>Учёт личных финансов</Text>
          </View>

          {/* Поля ввода */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ваш@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Пароль</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry
              editable={!loading}
            />
          </View>

          {/* Запомнить меня и забыли пароль */}
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberContainer}
              onPress={() => setRememberMe(!rememberMe)}
              disabled={loading}
            >
              <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberText}>Запомнить меня</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => Alert.alert('Восстановление', 'Функция в разработке')}
              disabled={loading}
            >
              <Text style={styles.forgotPassword}>Забыли пароль?</Text>
            </TouchableOpacity>
          </View>

          {/* Кнопка входа */}
          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Вход...' : 'Войти'}
            </Text>
          </TouchableOpacity>

          {/* Разделитель */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>или</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Кнопка регистрации */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>Создать аккаунт</Text>
          </TouchableOpacity>

          {/* Быстрый тестовый вход (только для разработки) */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.testButton}
              onPress={handleQuickTestLogin}
              disabled={loading}
            >
              <Text style={styles.testButtonText}>Тест: заполнить данные</Text>
            </TouchableOpacity>
          )}

          {/* Информация о безопасности */}
          <View style={styles.securityNote}>
            <Text style={styles.securityIcon}>🔒</Text>
            <Text style={styles.securityText}>
              Данные хранятся только на вашем устройстве
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 28,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  input: {
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    color: '#333',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 28,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberText: {
    fontSize: 14,
    color: '#555',
  },
  forgotPassword: {
    fontSize: 14,
    color: '#2196F3',
    textDecorationLine: 'underline',
  },
  loginButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 3,
  },
  loginButtonDisabled: {
    backgroundColor: '#90CAF9',
    opacity: 0.7,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    borderWidth: 2,
    borderColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  registerButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    padding: 12,
    alignItems: 'center',
    opacity: 0.7,
  },
  testButtonText: {
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  securityIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});

export default LoginScreen;