// src/components/MotivationTipModal.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Card, Button } from 'react-native-paper';

const { width } = Dimensions.get('window');

const MotivationTipModal = ({ visible, tip, onClose }) => {
  const [showFull, setShowFull] = useState(false);

  if (!tip) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>💰 Совет дня для экономии</Text>
            
            <View style={styles.tipContainer}>
              <Text style={styles.tipText} numberOfLines={showFull ? 0 : 3}>
                {tip}
              </Text>
              
              {tip.length > 100 && (
                <TouchableOpacity onPress={() => setShowFull(!showFull)}>
                  <Text style={styles.readMore}>
                    {showFull ? 'Скрыть' : 'Читать полностью...'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Button
              mode="contained"
              onPress={onClose}
              style={styles.button}
            >
              Отлично, спасибо!
            </Button>
            
            <Text style={styles.hint}>
              Новый совет появится завтра
            </Text>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: width * 0.85,
    borderRadius: 16,
    paddingVertical: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#2196F3',
  },
  tipContainer: {
    marginBottom: 20,
  },
  tipText: {
    fontSize: 16,
    lineHeight: 22,
    color: '#333',
    textAlign: 'center',
  },
  readMore: {
    color: '#2196F3',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  button: {
    marginTop: 10,
    backgroundColor: '#2196F3',
  },
  hint: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginTop: 15,
  },
});

export default MotivationTipModal;