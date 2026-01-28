import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Platform } from 'react-native';

// Импорт экранов
import HomeScreen from './src/screens/HomeScreen';
import AddGoalScreen from './src/screens/AddGoalScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import SettingsScreen from './src/screens/SettingsScreen';

// Импорт новых компонентов
import MotivationTipModal from './src/components/MotivationTipModal';
import { getTipOfTheDay, shouldShowTipToday } from './src/utils/motivationTips';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Главные табы
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Achievements') {
            iconName = focused ? 'trophy' : 'trophy-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        // УВЕЛИЧИВАЕМ ЕЩЁ БОЛЬШЕ
        tabBarStyle: {
          paddingBottom: Platform.OS === 'ios' ? 50 : 45, // Увеличил до 50/45
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 100 : 90,       // Увеличил высоту
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Цели' }}
      />
      <Tab.Screen 
        name="Achievements" 
        component={AchievementsScreen}
        options={{ title: 'Достижения' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Настройки' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [showMotivationTip, setShowMotivationTip] = useState(false);
  const [dailyTip, setDailyTip] = useState('');

  useEffect(() => {
    const checkAndShowTip = async () => {
      try {
        const shouldShow = await shouldShowTipToday();
        
        if (shouldShow) {
          const tip = getTipOfTheDay();
          setDailyTip(tip);
          
          setTimeout(() => {
            setShowMotivationTip(true);
          }, 1000);
        }
      } catch (error) {
        console.error('Ошибка при проверке совета:', error);
      }
    };

    checkAndShowTip();
  }, []);

  return (
    <SafeAreaProvider>
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator
            screenOptions={{
              headerStyle: {
                backgroundColor: '#2196F3',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
          >
            <Stack.Screen 
              name="MainTabs" 
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="AddGoal" 
              component={AddGoalScreen}
              options={{ 
                title: 'Новая цель',
                headerBackTitle: 'Назад'
              }}
            />
            <Stack.Screen 
              name="History" 
              component={HistoryScreen}
              options={{ 
                title: 'История пополнений',
                headerBackTitle: 'Назад'
              }}
            />
          </Stack.Navigator>
        </NavigationContainer>

        <MotivationTipModal
          visible={showMotivationTip}
          tip={dailyTip}
          onClose={() => setShowMotivationTip(false)}
        />
      </PaperProvider>
    </SafeAreaProvider>
  );
}