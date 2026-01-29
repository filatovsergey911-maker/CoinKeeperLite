import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';

const QuickAuthModal = ({ visible, onSuccess, onClose }) => {
  const { userPin, verifyPin } = useAuth();
  const [pin, setPin] = useState('');
  const [method, setMethod] = useState('pin'); // 'pin' или 'bio'

  // Биометрическая аутентификация
  const handleBiometricAuth = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        Alert.alert('Биометрия не доступна', 'Настройте отпечаток пальца или Face ID');
        setMethod('pin');
        return;
      }
      
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Подтвердите вход в CoinKeeper',
        fallbackLabel: 'Использовать пин-код',
      });
      
      if (result.success) {
        onSuccess();
      } else {
        setMethod('pin');
      }
    } catch (error) {
      Alert.alert('Ошибка', 'Не удалось выполнить биометрическую аутентификацию');
      setMethod('pin');
    }
  };

  // Ввод пин-кода
  const handleNumberPress = (number) => {
    if (pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === 4) {
        verifyPin(newPin).then(isValid => {
          if (isValid) {
            setPin('');
            onSuccess();
          } else {
            Alert.alert('Неверный пин-код');
            setPin('');
          }
        });
      }
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  // При открытии модального окна
  React.useEffect(() => {
    if (visible) {
      // Сначала пробуем биометрию
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    }
  }, [visible]);

  if (method === 'bio') {
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.container}>
          <Text style={styles.title}>Подтвердите вход</Text>
          <Text style={styles.subtitle}>Используйте отпечаток пальца или Face ID</Text>
          <TouchableOpacity
            style={styles.pinButton}
            onPress={() => setMethod('pin')}
          >
            <Text style={styles.pinButtonText}>Использовать пин-код</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.container}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>Введите пин-код</Text>
          
          {/* Точки пин-кода */}
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  index < pin.length && styles.pinDotFilled,
                ]}
              />
            ))}
          </View>
          
          {/* Цифровая клавиатура */}
          <View style={styles.keypad}>
            <View style={styles.keyRow}>
              {[1, 2, 3].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.key}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              {[4, 5, 6].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.key}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              {[7, 8, 9].map(num => (
                <TouchableOpacity
                  key={num}
                  style={styles.key}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <Text style={styles.keyText}>{num}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.keyRow}>
              <View style={styles.key} />
              <TouchableOpacity
                style={styles.key}
                onPress={() => handleNumberPress('0')}
              >
                <Text style={styles.keyText}>0</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.key}
                onPress={handleDelete}
              >
                <Text style={styles.keyText}>⌫</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            <Text style={styles.biometricButtonText}>Использовать биометрию</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeText}>Войти другим способом</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '90%',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  pinDots: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  pinDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 10,
  },
  pinDotFilled: {
    backgroundColor: '#2196F3',
  },
  keypad: {
    width: '100%',
    marginBottom: 20,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  key: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  pinButton: {
    marginTop: 20,
    padding: 15,
  },
  pinButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  biometricButton: {
    marginTop: 20,
    padding: 15,
  },
  biometricButtonText: {
    color: '#2196F3',
    fontSize: 16,
  },
  closeText: {
    marginTop: 15,
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default QuickAuthModal;