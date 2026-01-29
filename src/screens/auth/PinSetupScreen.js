import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';

const PinSetupScreen = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState(1); // 1: enter, 2: confirm

  const handleNumberPress = (number) => {
    if (step === 1 && pin.length < 4) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === 4) {
        setTimeout(() => {
          setStep(2);
        }, 300);
      }
    } else if (step === 2 && confirmPin.length < 4) {
      const newConfirmPin = confirmPin + number;
      setConfirmPin(newConfirmPin);
      
      if (newConfirmPin.length === 4) {
        if (pin === newConfirmPin) {
          // PIN confirmed
          Alert.alert(
            'Success',
            'PIN code set! You can use it for quick login.',
            [
              {
                text: 'Continue to App',
                onPress: () => navigation.replace('MainTabs'),
              }
            ]
          );
        } else {
          Alert.alert('Error', 'PIN codes do not match');
          setPin('');
          setConfirmPin('');
          setStep(1);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 1 && pin.length > 0) {
      setPin(pin.slice(0, -1));
    } else if (step === 2 && confirmPin.length > 0) {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const renderPinDots = () => {
    const dots = [];
    const currentLength = step === 1 ? pin.length : confirmPin.length;

    for (let i = 0; i < 4; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.pinDot,
            i < currentLength && styles.pinDotFilled,
          ]}
        />
      );
    }

    return (
      <View style={styles.pinDotsContainer}>
        <Text style={styles.stepTitle}>
          {step === 1 ? 'Create PIN Code' : 'Confirm PIN Code'}
        </Text>
        <View style={styles.pinDots}>{dots}</View>
        <Text style={styles.hintText}>Use 4 digits</Text>
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
      [null, 0, 'delete'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((number, colIndex) => (
              <TouchableOpacity
                key={colIndex}
                style={[
                  styles.numberButton,
                  number === null && styles.numberButtonHidden,
                ]}
                onPress={() => {
                  if (number === 'delete') {
                    handleDelete();
                  } else if (number !== null) {
                    handleNumberPress(number.toString());
                  }
                }}
                disabled={number === null}
              >
                {number === 'delete' ? (
                  <Text style={styles.deleteText}>⌫</Text>
                ) : (
                  <Text style={styles.numberText}>{number}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Security Setup</Text>
        <Text style={styles.subtitle}>
          Set a PIN code for quick access to your app
        </Text>
      </View>

      {renderPinDots()}
      {renderNumberPad()}

      <TouchableOpacity
        onPress={() => {
          Alert.alert(
            'Skip',
            'You can set up PIN later in security settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { 
                text: 'Skip', 
                onPress: () => navigation.replace('MainTabs'),
              },
            ]
          );
        }}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 22,
  },
  pinDotsContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 25,
  },
  pinDots: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  pinDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginHorizontal: 12,
  },
  pinDotFilled: {
    backgroundColor: '#2196F3',
  },
  hintText: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
  },
  numberPad: {
    width: '100%',
    maxWidth: 300,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  numberButtonHidden: {
    backgroundColor: 'transparent',
  },
  numberText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteText: {
    fontSize: 28,
    color: '#666',
  },
  skipText: {
    marginTop: 30,
    color: '#2196F3',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
});

export default PinSetupScreen;