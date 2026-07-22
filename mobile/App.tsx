/**
 * App.tsx — Root navigation controller
 *
 * Architecture:
 *   null role     → Onboarding → Login / Register
 *   'homeowner'   → HO screens with HOBottomNavBar
 *   'provider'    → SP screens with SPBottomNavBar
 *
 * DEMO MODE: Login navigates to the appropriate role screens without
 * real auth. Supabase session listener is preserved for future use.
 */

import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as ExpoSplashScreen from 'expo-splash-screen';

// ── Auth screens ──────────────────────────────────────────────────────────────
import SplashScreenComponent from './app/SplashScreen';
import OnboardingScreen from './app/(auth)/screens/OnboardingScreen';
import LoginScreen from './app/(auth)/screens/LoginScreen';
import ForgotPasswordScreen from './app/(auth)/screens/ForgotPasswordScreen';
import RegisterScreen from './app/(auth)/screens/RegisterScreen';

// ── Homeowner screens ─────────────────────────────────────────────────────────
import HOHomeScreen from './app/(homeowner)/screens/HOHomeScreen';
import MyJobs from './app/(homeowner)/screens/HOMyJobs';
import Profile from './app/(homeowner)/screens/HOProfile';
import HOWalletScreen from './app/(homeowner)/screens/HOWalletScreen';
import HOCreateJobScreen from './app/(homeowner)/screens/HOCreateJobScreen';
import HOJobDetailScreen from './app/(homeowner)/screens/HOJobDetailScreen';
import HOChatScreen from './app/(homeowner)/screens/HOChatScreen';
import HONotificationsScreen from './app/(homeowner)/screens/HONotificationsScreen';
import HOEditProfileScreen from './app/(homeowner)/screens/HOEditProfileScreen';
import HOSettingsScreen from './app/(homeowner)/screens/HOSettingsScreen';

// ── Provider screens ──────────────────────────────────────────────────────────
import SPHomeScreen from './app/(provider)/screens/SPHomeScreen';
import SPMyJobsScreen from './app/(provider)/screens/SPMyJobsScreen';
import SPProfileScreen from './app/(provider)/screens/SPProfileScreen';
import SPWalletScreen from './app/(provider)/screens/SPWalletScreen';
import SPCalendarScreen from './app/(provider)/screens/SPCalendarScreen';
import SPJobDetailScreen from './app/(provider)/screens/SPJobDetailScreen';
import SPChatScreen from './app/(provider)/screens/SPChatScreen';
import SPNotificationsScreen from './app/(provider)/screens/SPNotificationsScreen';
import SPEditProfileScreen from './app/(provider)/screens/SPEditProfileScreen';

// ── Shared navigation components ──────────────────────────────────────────────
import HOBottomNavBar from './src/components/HOBottomNavBar';
import SPBottomNavBar from './src/components/SPBottomNavBar';

// ── Types ─────────────────────────────────────────────────────────────────────
import { Role, HOScreen, SPScreen, DEFAULT_ROLE } from './src/types/navigation';

// ── Supabase (kept for future real-auth) ──────────────────────────────────────
import supabase from './src/lib/supabase';

// ─────────────────────────────────────────────────────────────────────────────
// Root app state
// ─────────────────────────────────────────────────────────────────────────────

ExpoSplashScreen.preventAutoHideAsync().catch(() => {});

type AuthState = 'splash' | 'onboarding' | 'login' | 'forgotPassword' | 'register' | 'authenticated';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>('splash');
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);

  // ── HO navigation state ───────────────────────────────────────────────────
  const [hoTab, setHOTab] = useState<HOScreen>('Home');
  const [hoScreen, setHOScreen] = useState<HOScreen>('Home'); // for non-tab sub-screens

  // ── SP navigation state ───────────────────────────────────────────────────
  const [spTab, setSPTab] = useState<SPScreen>('Dashboard');
  const [spScreen, setSPScreen] = useState<SPScreen>('Dashboard');
  const [spUrgentJob, setSPUrgentJob] = useState(false);

  // ── HO helpers ────────────────────────────────────────────────────────────
  const hoNavigate = (screen: HOScreen) => {
    const TAB_SCREENS: HOScreen[] = ['Home', 'My Jobs', 'Wallet', 'Profile'];
    if (TAB_SCREENS.includes(screen)) {
      setHOTab(screen);
      setHOScreen(screen);
    } else {
      setHOScreen(screen);
    }
  };

  // ── SP helpers ────────────────────────────────────────────────────────────
  const spNavigate = (screen: SPScreen) => {
    const TAB_SCREENS: SPScreen[] = ['Dashboard', 'My Jobs', 'Calendar', 'Wallet', 'Profile'];
    if (TAB_SCREENS.includes(screen)) {
      setSPTab(screen);
      setSPScreen(screen);
    } else {
      if (screen === 'Urgent Job') setSPUrgentJob(true);
      setSPScreen(screen);
    }
  };

  const spBack = () => {
    setSPUrgentJob(false);
    setSPScreen(spTab);
  };

  const hoBack = () => {
    setHOScreen(hoTab);
  };

  useEffect(() => {
    const splashTimer = setTimeout(() => {
      setAuthState('onboarding');
      ExpoSplashScreen.hideAsync().catch(() => {});
    }, 2200);

    return () => clearTimeout(splashTimer);
  }, []);

  // ── Supabase auth listener (preserved, non-blocking) ──────────────────────
  useEffect(() => {
    let mounted = true;

    const handleUser = async (user: any) => {
      const metaRole = user?.user_metadata?.role as Role | undefined;
      if (metaRole && mounted) {
        setRole(metaRole);
        setAuthState('authenticated');
        return;
      }
      try {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        if (mounted) {
          setRole((data?.role as Role) ?? DEFAULT_ROLE);
          setAuthState('authenticated');
        }
      } catch {
        if (mounted) setAuthState('authenticated');
      }
    };

    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) await handleUser(session.user);
      } catch { /* ignore */ }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await handleUser(session.user);
      } else {
        if (mounted) {
          setAuthState('onboarding');
          setRole(DEFAULT_ROLE);
        }
      }
    });

    return () => {
      mounted = false;
      sub.subscription?.unsubscribe?.();
    };
  }, []);

  // ─────────────────────────────────────────────────────────────────────────
  // Auth flow
  // ─────────────────────────────────────────────────────────────────────────

  if (authState === 'splash') {
    return <SplashScreenComponent />;
  }

  if (authState === 'onboarding') {
    return (
      <OnboardingScreen
        onFinish={() => setAuthState('login')}
        onLogin={() => setAuthState('login')}
      />
    );
  }

  if (authState === 'login') {
    return (
      <LoginScreen
        onLoginAsHomeowner={() => {
          setRole('homeowner');
          setAuthState('authenticated');
          setHOTab('Home');
          setHOScreen('Home');
        }}
        onLoginAsProvider={() => {
          setRole('provider');
          setAuthState('authenticated');
          setSPTab('Dashboard');
          setSPScreen('Dashboard');
        }}
        onSignUp={() => setAuthState('register')}
        onForgotPassword={() => setAuthState('forgotPassword')}
      />
    );
  }

  if (authState === 'forgotPassword') {
    return (
      <ForgotPasswordScreen
        onBackToLogin={() => setAuthState('login')}
        onResetPassword={() => setAuthState('login')}
      />
    );
  }

  if (authState === 'register') {
    return (
      <RegisterScreen
        onSignUp={() => {
          setRole('homeowner');
          setAuthState('authenticated');
        }}
        onLogin={() => setAuthState('login')}
      />
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Authenticated — Homeowner
  // ─────────────────────────────────────────────────────────────────────────

  if (role === 'homeowner') {
    // Non-tab sub-screens (no bottom nav)
    if (hoScreen === 'Job Detail') {
      return (
        <View style={styles.screen}>
          <HOJobDetailScreen onBack={hoBack} onNavigate={hoNavigate} />
        </View>
      );
    }
    if (hoScreen === 'Chat') {
      return (
        <View style={styles.screen}>
          <HOChatScreen onBack={hoBack} />
        </View>
      );
    }
    if (hoScreen === 'Notifications') {
      return (
        <View style={styles.screen}>
          <HONotificationsScreen onBack={hoBack} />
        </View>
      );
    }
    if (hoScreen === 'Edit Profile') {
      return (
        <View style={styles.screen}>
          <HOEditProfileScreen onBack={hoBack} onSave={hoBack} />
        </View>
      );
    }
    if (hoScreen === 'Settings') {
      return (
        <View style={styles.screen}>
          <HOSettingsScreen onBack={hoBack} onLogout={() => setAuthState('login')} />
        </View>
      );
    }
    if (hoScreen === 'Create Job') {
      return (
        <View style={styles.screen}>
          <HOCreateJobScreen
            onBack={hoBack}
            onSuccess={() => {
              setHOTab('My Jobs');
              setHOScreen('My Jobs');
            }}
          />
        </View>
      );
    }

    // Tab screens (with bottom nav)
    const renderHOTabContent = () => {
      switch (hoTab) {
        case 'Home':
          return <HOHomeScreen onNavigate={hoNavigate} />;
        case 'My Jobs':
          return <MyJobs onNavigate={hoNavigate} />;
        case 'Wallet':
          return <HOWalletScreen />;
        case 'Profile':
          return <Profile onNavigate={hoNavigate} onLogout={() => setAuthState('login')} />;
        default:
          return <HOHomeScreen onNavigate={hoNavigate} />;
      }
    };

    return (
      <View style={styles.screen}>
        <View style={styles.tabContent}>{renderHOTabContent()}</View>
        <HOBottomNavBar activeTab={hoTab} onTabPress={hoNavigate} />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Authenticated — Service Provider
  // ─────────────────────────────────────────────────────────────────────────

  // Non-tab sub-screens (no bottom nav)
  if (spScreen === 'Job Detail' || spScreen === 'Urgent Job') {
    return (
      <View style={styles.screen}>
        <SPJobDetailScreen
          onBack={spBack}
          onNavigate={spNavigate}
          isUrgent={spUrgentJob}
        />
      </View>
    );
  }
  if (spScreen === 'Chat') {
    return (
      <View style={styles.screen}>
        <SPChatScreen onBack={spBack} />
      </View>
    );
  }
  if (spScreen === 'Notifications') {
    return (
      <View style={styles.screen}>
        <SPNotificationsScreen onBack={spBack} />
      </View>
    );
  }
  if (spScreen === 'Edit Profile') {
    return (
      <View style={styles.screen}>
        <SPEditProfileScreen onBack={spBack} onSave={spBack} />
      </View>
    );
  }

  // Tab screens (with bottom nav)
  const renderSPTabContent = () => {
    switch (spTab) {
      case 'Dashboard':
        return <SPHomeScreen onNavigate={spNavigate} />;
      case 'My Jobs':
        return <SPMyJobsScreen onNavigate={spNavigate} />;
      case 'Calendar':
        return <SPCalendarScreen />;
      case 'Wallet':
        return <SPWalletScreen />;
      case 'Profile':
        return <SPProfileScreen onNavigate={spNavigate} onLogout={() => setAuthState('login')} />;
      default:
        return <SPHomeScreen onNavigate={spNavigate} />;
    }
  };

  return (
    <View style={styles.screen}>
      <View style={styles.tabContent}>{renderSPTabContent()}</View>
      <SPBottomNavBar activeTab={spTab} onTabPress={spNavigate} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F1F5F9',
  },
  tabContent: {
    flex: 1,
  },
});
