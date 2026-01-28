import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';

const { width: screenWidth } = Dimensions.get('window');

const GradientProgressBar = ({ progress, height = 32, showAnimation = false }) => {
  const progressPercentage = Math.min(Math.max(progress, 0), 1);
  const barWidth = (screenWidth - 84) * progressPercentage;
  
  // Более точная цветовая схема с желтым в середине
  const getGradientColors = () => {
    if (progressPercentage < 0.2) return ['#FF5252', '#FF8A80']; // Красный
    if (progressPercentage < 0.4) return ['#FF7043', '#FFAB91']; // Красно-оранжевый
    if (progressPercentage < 0.6) return ['#FFB300', '#FFD740']; // Желтый (40-60%)
    if (progressPercentage < 0.8) return ['#9CCC65', '#C5E1A5']; // Желто-зеленый
    return ['#4CAF50', '#81C784']; // Зеленый
  };

  const gradientColors = getGradientColors();

  return (
    <View style={[styles.container, { height }]}>
      {/* Фон с текстурой */}
      <View style={[styles.backgroundBar, { height }]}>
        <LinearGradient
          colors={['#E0E0E0', '#F5F5F5']}
          style={styles.backgroundGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        />
        {/* Текстура диагональных линий */}
        <View style={styles.texture}>
          <View style={styles.diagonalLine} />
          <View style={[styles.diagonalLine, { marginLeft: 10 }]} />
          <View style={[styles.diagonalLine, { marginLeft: 20 }]} />
        </View>
      </View>
      
      {/* Прогресс */}
      {progressPercentage > 0 && (
        <Animatable.View 
          animation={showAnimation ? "bounceIn" : null}
          duration={800}
          style={[styles.progressBar, { width: barWidth, height }]}
        >
          <LinearGradient
            colors={gradientColors}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          
          {/* Блик с градиентом */}
          <LinearGradient
            colors={['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.2)', 'transparent']}
            style={styles.highlight}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
          
          {/* Тень для объема */}
          <View style={styles.innerShadow} />
          
          {/* Сияние при 100% */}
          {progressPercentage >= 1 && (
            <Animatable.View 
              animation="pulse"
              iterationCount="infinite"
              duration={1200}
              style={styles.glowEffect}
            />
          )}
        </Animatable.View>
      )}
      
      {/* Внутренняя обводка */}
      <View style={[styles.innerBorder, { height }]} />
      
      {/* Маркеры прогресса */}
      <View style={styles.markers}>
        <View style={[styles.marker, { left: '20%' }]} />
        <View style={[styles.marker, { left: '40%' }]} />
        <View style={[styles.marker, { left: '60%' }]} />
        <View style={[styles.marker, { left: '80%' }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#F5F5F5',
  },
  backgroundBar: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  backgroundGradient: {
    width: '100%',
    height: '100%',
  },
  texture: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  diagonalLine: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: '#000',
    transform: [{ rotate: '45deg' }],
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  progressGradient: {
    width: '100%',
    height: '100%',
  },
  highlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
  },
  innerShadow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '20%',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  glowEffect: {
    position: 'absolute',
    top: -4,
    left: -4,
    right: -4,
    bottom: -4,
    backgroundColor: 'rgba(76, 175, 80, 0.25)',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(76, 175, 80, 0.3)',
  },
  innerBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
    borderRadius: 16,
    pointerEvents: 'none',
  },
  markers: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  marker: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
});

export default GradientProgressBar;