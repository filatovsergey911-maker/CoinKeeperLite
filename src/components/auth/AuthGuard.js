import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import { useAuth } from '../../auth/AuthContext';

const AuthGuard = ({ authenticatedComponent, unauthenticatedComponent }) => {
  const { user, loading, usePin, userPin, verifyPin } = useAuth();
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState('');
  const [authChecked, setAuthChecked] = useState(false);
  const [pinError, setPinError] = useState('');

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Пользователь не авторизован
        setAuthChecked(true);
      } else if (usePin && userPin) {
        // Нужно ввести пин-код
        setShowPinModal(true);
      } else {
        // Авторизован без пин-кода
        setAuthChecked(true);
      }
    }
  }, [loading, user, usePin, userPin]);

  const handlePinSubmit = async () => {
    if (pin.length !== 4) {
      setPinError('Введите 4 цифры');
      return;
    }

    const isValid = await verifyPin(pin);
    
    if (isValid) {
      setShowPinModal(false);
      setAuthChecked(true);
      setPin('');
      setPinError('');
    } else {
      setPinError('Неверный пин-код');
      setPin('');
    }
  };

  const handleNumberPress = (number) => {
    if (pin.length < 4) {
      setPin(pin + number);
      setPinError('');
    }
  };

  const handleDelete = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const renderPinModal = () => (
    <Modal
      visible={showPinModal}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Введите пин-код</Text>
          
          {/* Точки пин-кода */}
          <View style={styles.pinDots}>
            {[0, 1, 2, 3].map((index) => (
              <View
                key={index}
                style={[
                  styles.pinDot,
                  index < pin.length && styles.pinDotFilled
                ]}
              />
            ))}
          </View>
          
          {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
          
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
          
          {pin.length === 4 && (
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handlePinSubmit}
            >
              <Text style={styles.submitButtonText}>Подтвердить</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            onPress={() => {
              // Пропустить пин-код (только для тестирования)
              setShowPinModal(false);
              setAuthChecked(true);
            }}
          >
            <Text style={styles.skipText}>Пропустить (тест)</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <>
      {authChecked ? (
        user ? authenticatedComponent : unauthenticatedComponent
      ) : null}
      
      {renderPinModal()}
    </>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  pinDots: {
    flexDirection: 'row',
    marginBottom: 20,
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
  errorText: {
    color: '#f44336',
    marginBottom: 15,
    fontSize: 14,
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
  submitButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  skipText: {
    color: '#666',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});

export default AuthGuard;