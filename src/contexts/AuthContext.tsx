import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

interface User {
  id: number;
  email: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  role: string;
  createdAt: string;
}

interface RegisterData {
  email: string;
  password: string;
  nom: string;
  prenom?: string;
  telephone?: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        // Vérifier que le token est valide (pas expiré)
        const parsedUser = JSON.parse(savedUser);
        
        // Log pour debug
        console.log('Token stocké:', token);
        
        // Optionnel: vérifier la validité du token côté serveur
        try {
          const response = await authAPI.me(); 
          setUser(response.data);
        } catch (error) {
          console.log('Token invalide ou session expirée, déconnexion...');
          clearAuthData();
        }
      } catch (error) {
        console.error('Erreur lors du parsing de l\'utilisateur sauvegardé:', error);
        clearAuthData();
      }
    }
    
    setLoading(false);
  };

  const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data;
      
      // Vérifier que le token est bien formaté
      if (!token || typeof token !== 'string') {
        throw new Error('Token invalide reçu du serveur');
      }
      
      // Nettoyer le token des éventuels espaces
      const cleanToken = token.trim();
      
      localStorage.setItem('token', cleanToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setLoading(true);
      const response = await authAPI.register(data);
      const { token, user: userData } = response.data;
      
      // Vérifier que le token est bien formaté
      if (!token || typeof token !== 'string') {
        throw new Error('Token invalide reçu du serveur');
      }
      
      // Nettoyer le token des éventuels espaces
      const cleanToken = token.trim();
      
      localStorage.setItem('token', cleanToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error: any) {
      console.error('Erreur d\'inscription:', error);
      clearAuthData();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearAuthData();
    
    // Optionnel: appeler l'API de logout
    authAPI.logout().catch(error => {
      console.warn('Erreur lors de la déconnexion côté serveur:', error);
    });
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};