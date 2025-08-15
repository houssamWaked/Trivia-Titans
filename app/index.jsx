import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';
import WelcomeView from '../src/components/Welcome';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        // User is authenticated, go to main app
        router.replace('/(tabs)');
      } else {
        // No session, user can proceed with welcome screen
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoading(false);
    }
  };

  const handleContinue = async () => {
    try {
      router.push('/(auth)/login');
    } catch (error) {
      console.error('Error navigating to login:', error);
      router.push('/(auth)/login');
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <WelcomeView onContinue={handleContinue} />;
}