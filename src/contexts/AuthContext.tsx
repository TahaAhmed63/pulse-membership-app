
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  gym_name?: string;
  country?: string;
  gym_id: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  verifyOTP: (email: string, otp: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  getCurrencySymbol: () => string;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Currency mapping based on country
const currencyMap: { [key: string]: string } = {
  'Pakistan': '₨',
  'India': '₹',
  'United States': '$',
  'Canada': 'C$',
  'United Kingdom': '£',
  'Australia': 'A$',
  'Germany': '€',
  'France': '€',
  'Japan': '¥',
  'China': '¥',
  'Brazil': 'R$',
  'South Africa': 'R',
  'UAE': 'AED',
  'Saudi Arabia': 'SAR',
  'Turkey': '₺',
  'Russia': '₽',
  'Mexico': '$',
  'Bangladesh': '৳',
  'Sri Lanka': 'Rs',
  'Nepal': 'Rs',
  'Malaysia': 'RM',
  'Singapore': 'S$',
  'Thailand': '฿',
  'Indonesia': 'Rp',
  'Philippines': '₱',
  'Vietnam': '₫',
  'South Korea': '₩',
  'Egypt': 'E£',
  'Nigeria': '₦',
  'Kenya': 'KSh',
  'Ghana': '₵',
  'Morocco': 'MAD',
  'Algeria': 'DA',
  'Ethiopia': 'Br',
  'Tanzania': 'TSh',
  'Uganda': 'USh',
  'Zimbabwe': '$',
  'Botswana': 'P',
  'Namibia': 'N$',
  'Zambia': 'ZK',
  'Malawi': 'MK',
  'Rwanda': 'RF',
  'Burundi': 'FBu',
  'Madagascar': 'Ar',
  'Mauritius': '₨',
  'Seychelles': '₨',
  'Maldives': 'Rf',
  'Afghanistan': '؋',
  'Iran': '﷼',
  'Iraq': 'IQD',
  'Jordan': 'JD',
  'Kuwait': 'KD',
  'Lebanon': 'LL',
  'Oman': 'OMR',
  'Qatar': 'QR',
  'Syria': 'SP',
  'Yemen': '﷼',
  'Bahrain': 'BD',
  'Israel': '₪',
  'Palestine': 'ILS',
  'Cyprus': '€',
  'Georgia': '₾',
  'Armenia': '֏',
  'Azerbaijan': '₼',
  'Kazakhstan': '₸',
  'Kyrgyzstan': 'som',
  'Tajikistan': 'TJS',
  'Turkmenistan': 'm',
  'Uzbekistan': 'soʻm',
  'Mongolia': '₮',
  'Bhutan': 'Nu',
  'Myanmar': 'K',
  'Laos': '₭',
  'Cambodia': '៛',
  'Brunei': 'B$',
  'East Timor': '$',
  'Fiji': 'FJ$',
  'Papua New Guinea': 'K',
  'Solomon Islands': 'SI$',
  'Vanuatu': 'VT',
  'Samoa': 'WS$',
  'Tonga': 'T$',
  'Cook Islands': '$',
  'Kiribati': '$',
  'Marshall Islands': '$',
  'Micronesia': '$',
  'Nauru': '$',
  'Niue': '$',
  'Palau': '$',
  'Tuvalu': '$'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getCurrencySymbol = () => {
    if (user?.country && currencyMap[user.country]) {
      return currencyMap[user.country];
    }
    return '$'; // Default to USD
  };

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refresh_token');
      if (!storedRefreshToken) {
        console.log('No refresh token available');
        return false;
      }

      console.log('Attempting to refresh token...');
      const response = await fetch('https://gymbackend-eight.vercel.app/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: storedRefreshToken }),
      });

      const result = await response.json();
      
      if (response.ok && result.success && result.data) {
        const { data } = result;
        const newAccessToken = data.session.access_token;
        const newRefreshToken = data.session.refresh_token;
        const expiresAt = data.session.expires_at;

        setToken(newAccessToken);
        localStorage.setItem('token', newAccessToken);
        localStorage.setItem('refresh_token', newRefreshToken);
        localStorage.setItem('token_expires_at', expiresAt.toString());
        
        console.log('Token refreshed successfully');
        return true;
      } else {
        console.log('Token refresh failed:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token_expires_at');
    localStorage.removeItem('user');
    console.log('User logged out');
  }, []);

  const checkTokenExpiration = useCallback(async () => {
    const expiresAt = localStorage.getItem('token_expires_at');
    if (!expiresAt) return;

    const expirationTime = parseInt(expiresAt) * 1000; // Convert to milliseconds
    const now = Date.now();
    const timeUntilExpiry = expirationTime - now;

    // If token expires in less than 5 minutes, try to refresh
    if (timeUntilExpiry < 5 * 60 * 1000) {
      console.log('Token expiring soon, attempting refresh...');
      const refreshed = await refreshToken();
      if (!refreshed) {
        console.log('Failed to refresh token, logging out');
        logout();
      }
    }
  }, [refreshToken, logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      const storedRefreshToken = localStorage.getItem('refresh_token');
      
      if (storedToken && storedUser && storedRefreshToken) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        
        // Check if token needs refresh
        await checkTokenExpiration();
      }
      setLoading(false);
    };

    initializeAuth();

    // Set up periodic token expiration check (every 5 minutes)
    const interval = setInterval(checkTokenExpiration, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [checkTokenExpiration]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://gymbackend-eight.vercel.app/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }

      // Handle the correct API response structure
      const { data } = result;
      const userToken = data.session.access_token;
      const userRefreshToken = data.session.refresh_token;
      const expiresAt = data.session.expires_at;
      const userData = data.user;

      setToken(userToken);
      setUser(userData);
      localStorage.setItem('token', userToken);
      localStorage.setItem('refresh_token', userRefreshToken);
      localStorage.setItem('token_expires_at', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(userData));

      console.log('Login successful, tokens stored');
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const response = await fetch('https://gymbackend-eight.vercel.app/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (email: string, otp: string) => {
    setLoading(true);
    try {
      const response = await fetch('https://gymbackend-eight.vercel.app/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, otp }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'OTP verification failed');
      }

      // Handle the correct API response structure for OTP verification
      const { data } = result;
      const userToken = data.session.access_token;
      const userRefreshToken = data.session.refresh_token;
      const expiresAt = data.session.expires_at;
      const userData = data.user;

      setToken(userToken);
      setUser(userData);
      localStorage.setItem('token', userToken);
      localStorage.setItem('refresh_token', userRefreshToken);
      localStorage.setItem('token_expires_at', expiresAt.toString());
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      verifyOTP,
      logout,
      loading,
      getCurrencySymbol,
      refreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};
