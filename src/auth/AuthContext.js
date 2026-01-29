import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({});
const [rememberMe, setRememberMe] = useState(false);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usePin, setUsePin] = useState(false);
  const [userPin, setUserPin] = useState(null);

  // Эмуляция регистрации
  const register = async (email, password) => {
    try {
      await AsyncStorage.setItem('@user_email', email);
      
      const user = {
        email,
        uid: Date.now().toString(),
        displayName: email.split('@')[0],
      };
      
      setUser(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  // Эмуляция входа
  const login = async (email, password, remember = false) => {
  try {
    const savedEmail = await AsyncStorage.getItem('@user_email');
    
    if (!savedEmail || email !== savedEmail) {
      return { 
        success: false, 
        error: 'Неверный email или пароль' 
      };
    }
    
    const user = {
      email,
      uid: 'demo-user-id',
      displayName: email.split('@')[0],
    };
    
    setUser(user);
    setRememberMe(remember);
    
    // Сохраняем настройку "запомнить меня"
    if (remember) {
      await AsyncStorage.setItem('@remember_me', 'true');
      await AsyncStorage.setItem('@saved_email', email);
    } else {
      await AsyncStorage.removeItem('@remember_me');
    }
  if (remember) {
      await AsyncStorage.setItem('@remember_me', 'true');
      await AsyncStorage.setItem('@saved_email', email);
    } else {
      await AsyncStorage.removeItem('@remember_me');
    }
    
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

  // Выход
  const logout = async () => {
  try {
    // Очищаем данные пользователя (но оставляем пин-код если нужен)
    // await AsyncStorage.removeItem('@user_email');
    setUser(null);
    return { success: true };
  } catch (error) {
    console.error('Ошибка выхода:', error);
    return { success: false, error: error.message };
  }
};

const logoutAndClearData = async () => {
  try {
    // Полный выход - удаляем все данные
    await AsyncStorage.removeItem('@user_email');
    await AsyncStorage.removeItem('@user_pin');
    await AsyncStorage.removeItem('@use_pin');
    setUser(null);
    setUserPin(null);
    setUsePin(false);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

  // Сохранение пин-кода
  const savePin = async (pin) => {
    try {
      await AsyncStorage.setItem('@user_pin', pin);
      setUserPin(pin);
      setUsePin(true);
      return true;
    } catch (error) {
      console.error('Ошибка сохранения пин-кода:', error);
      return false;
    }
  };

  // Проверка пин-кода
  const verifyPin = async (enteredPin) => {
    try {
      const savedPin = await AsyncStorage.getItem('@user_pin');
      return enteredPin === savedPin;
    } catch (error) {
      console.error('Ошибка проверки пин-кода:', error);
      return false;
    }
  };

  // Загрузка при старте
  useEffect(() => {
  const loadUser = async () => {
    try {
      const remember = await AsyncStorage.getItem('@remember_me');
      const savedEmail = await AsyncStorage.getItem('@saved_email');
      const savedPin = await AsyncStorage.getItem('@user_pin');
      
      if (remember === 'true' && savedEmail) {
        // Автоматически входим если "запомнить меня" включено
        const user = {
          email: savedEmail,
          uid: 'demo-user-id',
          displayName: savedEmail.split('@')[0],
        };
        setUser(user);
        setRememberMe(true);
      }
      
      if (savedPin) {
        setUserPin(savedPin);
        setUsePin(true);
      }
    } catch (error) {
      console.error('Ошибка загрузки:', error);
    } finally {
      setLoading(false);
    }
  };
  
  loadUser();
}, []);

  const value = {
    user,
    loading,
    usePin,
    userPin,
    register,
    login,
    logout,
    savePin,
    verifyPin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};