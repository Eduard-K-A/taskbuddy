/**
 * Login screen styles
 * Figma Source: "Log In / Sign In Screen" (id: 36:431)
 * Frame: 360x800
 */

import { Dimensions, StyleSheet } from 'react-native';
import { Colors, Radii, Shadows, Sizes } from '../../../../src/constants/designTokens';

const { width: W } = Dimensions.get('window');
const BLOB = Math.round(W * 1.1);

// Figma-exact color for subtitle / placeholder / divider text
// r:0.5647 g:0.6314 b:0.7255 => #90A1B9
const SUBTITLE_COLOR = '#90A1B9';

// Figma-exact Google button stroke color
// r:0.9176 g:0.9333 b:0.9569 => #EAEEF4
const GOOGLE_BORDER = '#EAEEF4';

// Figma-exact "Forgot Password?" / "Sign Up" clickable link color
// r:0.0353 g:0.4353 b:0.5451 => #096F8B
const LINK_COLOR = '#096F8B';

// Figma Google button label color
// r:0.4588 g:0.4588 b:0.4588 => #757575
const GOOGLE_TEXT = '#757575';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flex: 1, backgroundColor: Colors.white },

  /* ── Background blobs (blurred teal/cyan ellipses) ─────────────────── */
  blobTopLeft: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
    borderRadius: BLOB / 2,
    backgroundColor: 'rgba(10,162,203,0.18)',
    top: -BLOB * 0.6,
    left: -BLOB * 0.55,
  },
  blobTopRight: {
    position: 'absolute',
    width: BLOB * 0.7,
    height: BLOB * 0.7,
    borderRadius: BLOB * 0.35,
    backgroundColor: 'rgba(9,110,139,0.14)',
    top: -BLOB * 0.3,
    right: -BLOB * 0.3,
  },
  blobBottomLeft: {
    position: 'absolute',
    width: BLOB * 0.7,
    height: BLOB * 0.7,
    borderRadius: BLOB * 0.35,
    backgroundColor: 'rgba(9,110,139,0.10)',
    bottom: -BLOB * 0.3,
    left: -BLOB * 0.35,
  },
  blobBottomRight: {
    position: 'absolute',
    width: BLOB,
    height: BLOB,
    borderRadius: BLOB / 2,
    backgroundColor: 'rgba(10,162,203,0.12)',
    bottom: -BLOB * 0.62,
    right: -BLOB * 0.5,
  },

  /* ── Scroll ─────────────────────────────────────────────────────────── */
  scrollContent: {
    paddingHorizontal: 30,    // Figma: 30px horizontal padding
    paddingTop: 72,
    paddingBottom: 40,
  },

  /* ── Logo section ───────────────────────────────────────────────────── */
  logoSection: {
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  logoMark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    marginBottom: 12,
  },
  logoRect: {
    width: 58,
    height: 70,
    backgroundColor: Colors.brandCyan,   // #0AA2CB
    borderRadius: 8,
    padding: 10,
    justifyContent: 'space-around',
  },
  logoLine: {
    height: 4,
    width: 26,
    backgroundColor: Colors.white,
    borderRadius: 50,
  },
  logoFigure: { alignItems: 'center', gap: 4 },
  logoHead: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#FFEECF',          // Figma logoSkin
  },
  logoBody: {
    width: 26,
    height: 18,
    backgroundColor: Colors.brandTeal,   // #096E8B
  },

  /* TaskBuddy wordmark — Figma: League Spartan Bold 32px #063D4D */
  logoText: {
    fontFamily: 'League Spartan',
    fontSize: 32,
    fontWeight: '700',
    color: Colors.brandDark,
    letterSpacing: 0.32,
    lineHeight: 32,            // Figma lineHeightPx: 20 but visually needs room
    marginBottom: 4,
  },

  /* Tagline — Figma: "Hire with confidence, pay with ease."
   * Darker Grotesque ExtraBold 18px #063E4D */
  tagline: {
    fontFamily: 'Inter',                  // fallback (Darker Grotesque not bundled)
    fontSize: 13,
    fontWeight: '600',
    color: Colors.brandDark,
    opacity: 0.7,
  },

  /* ── Heading ─────────────────────────────────────────────────────────── */
  headingSection: { marginBottom: 16 },

  /* "Welcome!" — Figma: Inter Bold 20px, color #063D4D, letterSpacing 0.2 */
  welcomeText: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700',
    color: Colors.brandDark,
    letterSpacing: 0.2,
    lineHeight: 20,
    marginBottom: 4,
  },

  /* "Sign in to your account" — Figma: Inter Medium 14px, color #90A1B9, ls 0.14 */
  subtitleText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: SUBTITLE_COLOR,
    letterSpacing: 0.14,
    lineHeight: 20,
  },

  /* ── Role selector (DEMO only) ──────────────────────────────────────── */
  roleRow: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  roleChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(144,153,184,0.4)',
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  roleChipActive: {
    backgroundColor: Colors.brandDark,
    borderColor: Colors.brandDark,
  },
  roleChipText: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600',
    color: Colors.muted,
  },
  roleChipTextActive: { color: Colors.white },

  /* ── Inputs ──────────────────────────────────────────────────────────── */
  inputGroup: { marginBottom: 18 },

  /* Label — Figma: Inter SemiBold 15px #063D4D, lineHeight 21 */
  inputLabel: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.brandDark,
    lineHeight: 21,
    marginBottom: 8,
  },

  /* Input box — Figma: white bg, radius 8, padding 16h 12v, height 40,
   * no border in default state (strokes array empty), center-aligned stroke */
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 40,
    borderWidth: 1,
    borderColor: 'rgba(144,153,184,0.25)',
    shadowColor: '#063D4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  inputBoxFocused: { borderColor: Colors.brandTeal },
  inputBoxError: { borderColor: Colors.error },

  /* Value text — Figma: Inter Regular 16px, color #063D4D */
  inputText: {
    flex: 1,
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400',
    color: Colors.brandDark,
    padding: 0,
    margin: 0,
  },
  inputError: {
    fontFamily: 'Inter',
    fontSize: 13,
    color: Colors.error,
    marginTop: 4,
    lineHeight: 18,
  },

  /* ── Password row ────────────────────────────────────────────────────── */
  passwordSection: { marginBottom: 18 },
  passwordLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  /* "Forgot Password?" — Figma: Inter Bold 14px, color #096F8B */
  forgotText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '700',
    color: LINK_COLOR,
  },
  eyeBtn: { paddingLeft: 8 },
  eyeIcon: { fontSize: 16 },

  /* ── Sign In button ──────────────────────────────────────────────────── */
  /* Figma: 300w x 48h, bg #096E8B, radius 24 */
  primaryBtn: {
    backgroundColor: Colors.brandTeal,
    borderRadius: Radii.button,          // 24
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
    minHeight: 48,
    ...Shadows.primaryButton,
  },
  /* Figma: Inter SemiBold 15px, white, ls 0.3 */
  primaryBtnText: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600',
    color: Colors.white,
    letterSpacing: 0.3,
  },

  /* ── Divider ("or") ──────────────────────────────────────────────────── */
  /* Figma: lines and "or" text both use #90A1B9, Roboto Regular 13px */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: SUBTITLE_COLOR,
    opacity: 0.4,
  },
  dividerText: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '400',
    color: SUBTITLE_COLOR,
  },

  /* ── Google button ───────────────────────────────────────────────────── */
  /* Figma: 260w, 40h inner content, radius 50, white bg,
   * stroke 1px #EAEEF4, icon 20x20, gap 8 */
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: GOOGLE_BORDER,
    borderRadius: 50,                    // Figma: cornerRadius 50 (round)
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 32,
    gap: 8,                              // Figma: itemSpacing 8
    minHeight: 40,
    backgroundColor: Colors.white,
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  /* Figma: Inter Medium 14px, color #757575, ls 0.1 */
  googleBtnText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: GOOGLE_TEXT,
    letterSpacing: 0.1,
  },

  /* ── Sign Up prompt ──────────────────────────────────────────────────── */
  /* Figma: Inter Medium 14px #90A1B9, ls 0.14 */
  signUpRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpPrompt: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500',
    color: SUBTITLE_COLOR,
    letterSpacing: 0.14,
  },
  /* Figma: Roboto Bold 14px, color #096F8B */
  signUpLink: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '700',
    color: LINK_COLOR,
  },

  /* ── Gesture bar ─────────────────────────────────────────────────────── */
  gestureBarWrap: {
    alignItems: 'center',
    paddingBottom: 8,
    paddingTop: 4,
  },
  gestureBar: {
    width: Sizes.gestureBarWidth,         // 108
    height: Sizes.gestureBarHeight,       // 4
    borderRadius: 12,
    backgroundColor: 'rgba(17,27,32,0.25)',
  },
});
