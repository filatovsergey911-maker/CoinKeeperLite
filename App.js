import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/auth/AuthContext';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import PinSetupScreen from './src/screens/auth/PinSetupScreen';
import MainTabs from './src/navigation/MainTabs';

const Stack = createNativeStackNavigator();

function AppContent() {
  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
        />
        <Stack.Screen 
          name="PinSetup" 
          component={PinSetupScreen} 
          options={{
            gestureEnabled: false, // Запрещаем свайп назад
          }}
        />
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}