import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Clock, Brain, Star, Zap } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function HomeScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      setUserData(profileData);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateXpProgress = () => {
    if (!userData) {
      return { xp: 0, xpToNext: 100, progress: 0 };
    }

    const currentLevel = userData.level || 1;
    const currentXp = userData.xp || 0;
    
    // Calculate XP required for current level and next level
    // Using a standard progression: level 1 = 0 XP, level 2 = 100 XP, level 3 = 250 XP, etc.
    const currentLevelXp = currentLevel === 1 ? 0 : Math.floor(Math.pow(currentLevel - 1, 2) * 100);
    const nextLevelXp = Math.floor(Math.pow(currentLevel, 2) * 100);
    
    const xpForCurrentLevel = currentXp - currentLevelXp;
    const xpNeededForNext = nextLevelXp - currentLevelXp;
    
    const progress = Math.min(100, Math.max(0, (xpForCurrentLevel / xpNeededForNext) * 100));

    return {
      xp: xpForCurrentLevel,
      xpToNext: xpNeededForNext,
      progress: progress
    };
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => {
              setError(null);
              fetchUserData();
            }}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const xpData = calculateXpProgress();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back!</Text>
            <Text style={styles.nameText}>{userData?.username || 'Genius Player'}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <LinearGradient
          colors={['#8B5CF6', '#A855F7']}
          style={styles.levelCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.levelHeader}>
            <Text style={styles.levelText}>Level {userData?.level || 1}</Text>
            {/* Streak Display */}
            <View style={styles.streakContainer}>
              <Zap size={16} color="#FFF" strokeWidth={2} />
              <Text style={styles.streakText}>{userData?.current_streak || 0} streak</Text>
            </View>
          </View>
          <View style={styles.xpContainer}>
            <View style={styles.xpBar}>
              <View style={[styles.xpFill, { width: `${xpData.progress}%` }]} />
            </View>
            <Text style={styles.xpText}>{xpData.xp} / {xpData.xpToNext} XP</Text>
          </View>
        </LinearGradient>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData?.total_games || 0}</Text>
            <Text style={styles.statLabel}>Games Played</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData?.total_correct_answers || 0}</Text>
            <Text style={styles.statLabel}>Correct Answers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userData?.best_streak || 0}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>

        {/* Quick Play Modes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Play</Text>
          <View style={styles.gameModeGrid}>
            <TouchableOpacity 
              style={styles.gameModeCard}
              onPress={() => router.push('/game/sixty-second')}
            >
              <LinearGradient
                colors={['#EF4444', '#F87171']}
                style={styles.gameModeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Clock size={32} color="#FFF" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.gameModeTitle}>60-Second</Text>
              <Text style={styles.gameModeDesc}>Fast & Furious</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gameModeCard}
              onPress={() => router.push('/game/classic')}
            >
              <LinearGradient
                colors={['#3B82F6', '#60A5FA']}
                style={styles.gameModeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Brain size={32} color="#FFF" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.gameModeTitle}>Classic Quiz</Text>
              <Text style={styles.gameModeDesc}>Think It Through</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.gameModeCard}
              onPress={() => router.push('/game/story')}
            >
              <LinearGradient
                colors={['#10B981', '#34D399']}
                style={styles.gameModeGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Star size={32} color="#FFF" strokeWidth={2} />
              </LinearGradient>
              <Text style={styles.gameModeTitle}>Story Mode</Text>
              <Text style={styles.gameModeDesc}>Progressive Journey</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16 },
  welcomeText: { fontSize: 16, color: '#6B7280', fontWeight: '500' },
  nameText: { fontSize: 24, fontWeight: '700', color: '#111827', marginTop: 2 },
  levelCard: { marginHorizontal: 20, marginBottom: 24, borderRadius: 16, padding: 20 },
  levelHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  levelText: { fontSize: 20, fontWeight: '700', color: '#FFF' },
  streakContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.2)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  streakText: { fontSize: 12, fontWeight: '600', color: '#FFF', marginLeft: 4 },
  xpContainer: { marginTop: 8 },
  xpBar: { height: 8, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 4, overflow: 'hidden' },
  xpFill: { height: '100%', backgroundColor: '#FFF', borderRadius: 4 },
  xpText: { fontSize: 14, fontWeight: '500', color: '#FFF', textAlign: 'center', marginTop: 8 },
  statsCard: { marginHorizontal: 20, backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 24, flexDirection: 'row', justifyContent: 'space-around', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700', color: '#8B5CF6' },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '500', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', paddingHorizontal: 20, marginBottom: 16 },
  gameModeGrid: { paddingHorizontal: 20 },
  gameModeCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  gameModeGradient: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  gameModeTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  gameModeDesc: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { fontSize: 16, color: '#EF4444', marginBottom: 20, textAlign: 'center' },
  retryButton: { backgroundColor: '#8B5CF6', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#FFF', fontWeight: '600' }
});