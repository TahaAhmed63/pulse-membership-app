
import React, { createContext, useContext, useState, useEffect } from 'react';

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

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getCurrencySymbol = () => {
    if (user?.country && currencyMap[user.country]) {
      return currencyMap[user.country];
    }
    return '$'; // Default to USD
  };

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
      const userData = data.user;

      setToken(userToken);
      setUser(userData);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
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
      const userData = data.user;

      setToken(userToken);
      setUser(userData);
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
      getCurrencySymbol
    }}>
      {children}
    </AuthContext.Provider>
  );
};
