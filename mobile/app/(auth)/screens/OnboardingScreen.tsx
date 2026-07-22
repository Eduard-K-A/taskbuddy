/**
 * OnboardingScreen.tsx
 *
 * Figma Source: SP - Onboarding 1-5 (IDs: 318:948, 326:1022, 326:1040, 326:1058, 326:1199)
 *
 * Design:
 * - bg: #F1F5F9 (light blue-gray)
 * - Logo: teal square (~73x89, radius 10) with white line icons + taskbuddy person icon
 * - Tagline: "Hire with confidence, pay with ease." — Darker Grotesque 800 18px #063E4D
 * - Illustrations per slide (using colored placeholder blocks)
 * - Bottom nav: dots progress + "Next" button + "Skip"
 */

import React, { useState, useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { Colors, Radii, Shadows, Spacing } from '../../../src/constants/theme';

const { width: W } = Dimensions.get('window');

interface Slide {
  id: string;
  title: string;
  subtitle: string;
  illustrationBg: string;
  illustrationAccent: string;
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Hire with\nconfidence, pay\nwith ease.',
    subtitle: 'Post your job and let skilled workers come to you.',
    illustrationBg: '#BFE8F5',
    illustrationAccent: Colors.brandTeal,
  },
  {
    id: '2',
    title: 'Browse trusted\nservice providers.',
    subtitle: 'Review profiles, ratings, and past jobs before you hire.',
    illustrationBg: '#C8F5E0',
    illustrationAccent: '#22C55E',
  },
  {
    id: '3',
    title: 'Track every job\nin real time.',
    subtitle: 'Get updates from posting to completion — all in one place.',
    illustrationBg: '#FFF3C4',
    illustrationAccent: '#F59E0B',
  },
  {
    id: '4',
    title: 'Pay safely\nthrough the app.',
    subtitle: 'Funds are held securely and released only when you\'re satisfied.',
    illustrationBg: '#E0D9FF',
    illustrationAccent: '#8B5CF6',
  },
  {
    id: '5',
    title: 'Ready to get\nstarted?',
    subtitle: 'Join thousands of homeowners and skilled providers on TaskBuddy.',
    illustrationBg: '#FFD9D9',
    illustrationAccent: '#EF4444',
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
  onLogin: () => void;
}

export default function OnboardingScreen({ onFinish, onLogin }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  const handleViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onFinish();
    }
  };

  const handleSkip = () => {
    onLogin();
  };

  const renderSlide = ({ item }: { item: Slide }) => (
    <View style={styles.slide}>
      {/* Illustration area */}
      <View style={[styles.illustration, { backgroundColor: item.illustrationBg }]}>
        {/* Logo mark */}
        <View style={styles.logoMark}>
          <View style={styles.logoRect}>
            <View style={styles.logoLineWhite} />
            <View style={[styles.logoLineWhite, { width: 24 }]} />
            <View style={[styles.logoLineWhite, { width: 20 }]} />
          </View>
          <View style={styles.logoFigure}>
            <View style={styles.logoHead} />
            <View style={styles.logoBody} />
          </View>
        </View>
        {/* Decorative dots */}
        <View style={[styles.dot1, { backgroundColor: item.illustrationAccent }]} />
        <View style={[styles.dot2, { backgroundColor: item.illustrationAccent, opacity: 0.4 }]} />
        <View style={[styles.dot3, { backgroundColor: item.illustrationAccent, opacity: 0.2 }]} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* TaskBuddy wordmark */}
        <Text style={styles.wordmark}>TaskBuddy</Text>

        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Skip button */}
      <TouchableOpacity style={styles.skipBtn} onPress={handleSkip} activeOpacity={0.8}>
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={handleViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBar}>
        {/* Dot indicators */}
        <View style={styles.dots}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={[styles.dotIndicator, i === currentIndex && styles.dotIndicatorActive]}
            />
          ))}
        </View>

        {/* Next / Get Started */}
        <TouchableOpacity style={styles.nextBtn} onPress={handleNext} activeOpacity={0.85}>
          <Text style={styles.nextBtnText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  skipBtn: {
    position: 'absolute',
    top: 60,
    right: Spacing.screenH,
    zIndex: 10,
    backgroundColor: 'rgba(144,153,184,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
  },
  skipText: {
    color: Colors.skipText,
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Inter',
  },

  slide: {
    width: W,
    flex: 1,
  },

  illustration: {
    height: 420,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  logoRect: {
    width: 73,
    height: 89,
    backgroundColor: Colors.brandCyan,
    borderRadius: Radii.logo,
    padding: 12,
    justifyContent: 'space-around',
  },
  logoLineWhite: {
    height: 5,
    width: 33,
    backgroundColor: Colors.white,
    borderRadius: 50,
  },
  logoFigure: {
    alignItems: 'center',
    gap: 4,
  },
  logoHead: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFEECF',
  },
  logoBody: {
    width: 33,
    height: 22,
    backgroundColor: Colors.brandTeal,
  },

  dot1: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    top: 40,
    right: 40,
    opacity: 0.6,
  },
  dot2: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    bottom: 60,
    left: 30,
  },
  dot3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    bottom: -30,
    right: -20,
  },

  content: {
    flex: 1,
    paddingHorizontal: Spacing.screenH,
    paddingTop: 28,
  },
  wordmark: {
    fontFamily: 'League Spartan',
    fontSize: 24,
    fontWeight: '700',
    color: Colors.brandDark,
    marginBottom: 16,
  },
  title: {
    fontFamily: 'Inter',
    fontSize: 26,
    fontWeight: '800',
    color: Colors.brandDark,
    lineHeight: 34,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: Colors.muted,
    lineHeight: 22,
  },

  bottomBar: {
    paddingHorizontal: Spacing.screenH,
    paddingBottom: 36,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  dotIndicatorActive: {
    width: 24,
    backgroundColor: Colors.brandDark,
    borderRadius: 4,
  },
  nextBtn: {
    backgroundColor: Colors.brandTeal,
    borderRadius: Radii.button,
    paddingHorizontal: 32,
    paddingVertical: 14,
    ...Shadows.primaryButton,
  },
  nextBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Inter',
    letterSpacing: 0.3,
  },

});
