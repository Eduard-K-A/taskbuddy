import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import HOHomeScreen from './app/(homeowner)/screens/HOHomeScreen';
import MyJobs from './app/(homeowner)/screens/MyJobs';
import Profile from './app/(homeowner)/screens/Profile';
import SPHomeScreen from './app/(provider)/screens/SPHomeScreen';
import BottomNavBar from './src/components/BottomNavBar';
import { Role, ScreenKey, bottomTabs, DEFAULT_ROLE } from './src/types/navigation';
import supabase from './src/lib/supabase';

type RoleKey = Role | null;

export default function App() {
  const [role, setRole] = useState<RoleKey>(null);
  const [activeTab, setActiveTab] = useState<ScreenKey>(bottomTabs[0]);

  useEffect(() => {
    let mounted = true;

    const handleUser = async (user: any) => {
      // Prefer role from auth metadata if present
      const metaRole = user?.user_metadata?.role as Role | undefined;
      if (metaRole) {
        if (mounted) setRole(metaRole);
        return;
      }

      // Fallback: try to read from a profiles table (id -> role)
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (error) {
          if (mounted) setRole(DEFAULT_ROLE);
          return;
        }
        if (data?.role) {
          if (mounted) setRole(data.role as Role);
        } else {
          if (mounted) setRole(DEFAULT_ROLE);
        }
      } catch (e) {
        if (mounted) setRole(DEFAULT_ROLE);
      }
    };

    // Check existing session immediately
    (async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) await handleUser(session.user as any);
      } catch (e) {
        // ignore
      }
    })();

    // Listen for auth changes
    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await handleUser(session.user as any);
      } else {
        if (mounted) setRole(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  const renderHomeownerScreen = () => {
    switch (activeTab) {
      case 'Home':
        return <HOHomeScreen />;
      case 'My Jobs':
        return <MyJobs />;
      case 'Profile':
        return <Profile />;
      case 'Wallet':
        return (
          <View style={styles.emptyScreen}>
            <Text style={styles.emptyText}>Wallet screen coming soon.</Text>
          </View>
        );
    }
  };

  const renderHomeowner = () => (
    <>
      <View style={styles.screen}>{renderHomeownerScreen()}</View>
      <BottomNavBar activeTab={activeTab} onTabPress={setActiveTab} />
    </>
  );

  const renderProvider = () => (
    <View style={styles.providerScreenContainer}>
      <View style={styles.providerHeader}>
        <Text style={styles.providerRole}>Provider Portal</Text>
        <TouchableOpacity
          style={styles.switchButton}
          onPress={() => setRole('homeowner')}
          activeOpacity={0.8}
        >
          <Text style={styles.switchButtonText}>Switch to Homeowner</Text>
        </TouchableOpacity>
      </View>
      <SPHomeScreen />
    </View>
  );

  if (!role) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.selectContainer}>
          <Text style={styles.selectTitle}>Choose your role</Text>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('homeowner')}
            activeOpacity={0.8}
          >
            <Text style={styles.roleButtonText}>Homeowner</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.roleButton}
            onPress={() => setRole('provider')}
            activeOpacity={0.8}
          >
            <Text style={styles.roleButtonText}>Provider</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return <SafeAreaView style={styles.safeArea}>{role === 'homeowner' ? renderHomeowner() : renderProvider()}</SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eaf3fb',
  },
  screen: {
    flex: 1,
  },
  emptyScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
  selectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  selectTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 24,
  },
  roleButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    backgroundColor: '#0f172a',
    marginBottom: 16,
    alignItems: 'center',
  },
  roleButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  providerScreenContainer: {
    flex: 1,
  },
  providerHeader: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: '#0f172a',
  },
  providerRole: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  switchButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#38bdf8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
  },
  switchButtonText: {
    color: '#0f172a',
    fontWeight: '700',
  },
});
