import { createContext, useContext, useEffect, useState } from 'react';
import { fetchFromLocalStorage, removeFromLocalStorage, saveInLocalStorage } from '../services/localStorageService';
import { authenticate, getCurrentUser } from '../services/auth';

const AuthContext = createContext({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  logout: async () => {},
  refetchUser: async () => {},
});

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
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        await removeFromLocalStorage('trello_token');
        setToken(null);
        setUser(null);
      }
    }

    setIsLoading(false);
  };

  const login = async () => {
    try {
      const newToken = await authenticate();
      await saveInLocalStorage('trello_token', newToken);
      setToken(newToken);

      const userData = await getCurrentUser();
      setUser(userData);

      return true;
    } catch (error) {
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
