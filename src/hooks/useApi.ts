
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const API_BASE = 'https://gymbackend-eight.vercel.app/api';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const { token, logout, refreshToken } = useAuth();

  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    setLoading(true);
    
    try {
      const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
      
      console.log('Making API call to:', url);
      console.log('With token:', token ? 'Present' : 'Missing');
      
      let currentToken = token;
      
      const makeRequest = async (authToken: string | null) => {
        return await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            ...(authToken && { Authorization: `Bearer ${authToken}` }),
            ...options.headers,
          },
        });
      };

      let response = await makeRequest(currentToken);

      console.log('API Response status:', response.status);

      // If we get a 401, try to refresh the token once
      if (response.status === 401 && currentToken) {
        console.log('401 Unauthorized - attempting token refresh');
        const refreshed = await refreshToken();
        
        if (refreshed) {
          // Get the new token from localStorage since refreshToken updates it
          const newToken = localStorage.getItem('token');
          console.log('Token refreshed, retrying request with new token');
          response = await makeRequest(newToken);
          console.log('Retry API Response status:', response.status);
        }
        
        // If still 401 after refresh attempt, logout
        if (response.status === 401) {
          console.log('Still 401 after refresh - logging out');
          logout();
          toast({
            title: "Session Expired",
            description: "Please login again.",
            variant: "destructive",
          });
          return null;
        }
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
