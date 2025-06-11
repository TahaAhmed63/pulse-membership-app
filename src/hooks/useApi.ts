
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
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      });

      if (response.status === 401) {
        logout();
        toast({
          title: "Session Expired",
          description: "Please login again.",
          variant: "destructive",
        });
        return null;
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

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
