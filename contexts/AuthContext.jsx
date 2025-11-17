import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as trelloService from '../services/trello';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem('trello_token');
      if (savedToken) {
        setToken(savedToken);
        // Temporarily skip user fetch until real token is available
        // const userData = await trelloService.getCurrentUser(savedToken);
        // setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    const newToken = await trelloService.authenticate();
    await AsyncStorage.setItem('trello_token', newToken);
    setToken(newToken);
    // Temporarily skip user fetch
    // const userData = await trelloService.getCurrentUser(newToken);
    // setUser(userData);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('trello_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token, 
        isAuthenticated: !!token, 
        isLoading, 
        login, 
        logout 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);