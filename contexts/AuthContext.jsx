import { createContext, useContext, useEffect, useState } from 'react';
import { fetchFromLocalStorage, removeFromLocalStorage, saveInLocalStorage } from '../services/localStorageService';
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
    const savedToken = await fetchFromLocalStorage('trello_token');
    
    if (savedToken) {
      setToken(savedToken);
      
      try {
        const userData = await trelloService.getCurrentUser(savedToken);
        setUser(userData);
      } catch (error) {
        console.log('Failed to get user, clearing token');
        await removeFromLocalStorage('trello_token');
        setToken(null);
      }
    }
    
    setIsLoading(false);
  };

  const login = async () => {
    try {
      const newToken = await trelloService.authenticate();
      console.log("\n\n\nDEBUG", newToken); // TODO: remove
      await saveInLocalStorage('trello_token', newToken);
      setToken(newToken);
      
      const userData = await trelloService.getCurrentUser(newToken);
      setUser(userData);
      
      return true;
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const logout = async () => {
    await removeFromLocalStorage('trello_token');
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
        logout,
        refetchUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);