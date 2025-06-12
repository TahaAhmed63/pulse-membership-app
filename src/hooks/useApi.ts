
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const API_BASE = 'https://gymbackend-eight.vercel.app/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { token, logout } = useAuth();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
      
      console.log('Making API call to:', url);
      console.log('With token:', token ? 'Present' : 'Missing');
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      console.log('API Response status:', response.status);

      if (response.status === 401) {
        console.log('401 Unauthorized - logging out');
        logout();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        return null;
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response data:', data);
      
      return data;
    } catch (error: any) {
      console.error('API Error:', error);
      toast({
        title: "Error",
        description: error.message || "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { apiCall, loading };
};
