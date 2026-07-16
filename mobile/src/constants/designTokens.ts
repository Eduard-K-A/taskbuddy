/**
 * designTokens.ts
 *
 * Shared design tokens extracted from Figma file:
 * https://www.figma.com/design/mmOfuHNXIgRQ4FiAvYVksS/UI-UX-Designs--Copy-
 *
 * These tokens cover the TaskBuddy mobile app's complete design system.
 * Reference these whenever building new screens to stay pixel-faithful to the Figma.
 */

// ─── Color palette ───────────────────────────────────────────────────────────

export const Colors = {
  // Brand
  brandDark: '#063D4D',     // dark teal — headings, hero backgrounds
  brandTeal: '#096E8B',     // primary accent — buttons, links
  brandCyan: '#0AA2CB',     // lighter teal — blob accents, logo bg
  brandCyanLight: '#99DEF1', // very light cyan — logo accent lines

  // Neutrals
  white: '#FFFFFF',
  background: '#F1F5F9',    // screen background (light blue-gray)
  backgroundAlt: '#F8FAFC', // alternate bg (slightly lighter)
  cardBg: '#FFFFFF',
  muted: '#9099B8',         // placeholders, subtitles
  mutedLight: 'rgba(144, 153, 184, 0.25)',
  divider: 'rgba(144, 153, 184, 0.4)',
  slate: '#64748B',         // secondary text
  slateLight: '#94A3B8',    // muted text

  // Semantic
  error: '#E03434',
  errorBorder: '#E03434',
  success: '#22C55E',
  warning: '#F59E0B',
  pending: '#F59E0B',
  active: '#22C55E',
  done: '#71C7FF',

  // Specific UI
  googleText: '#757575',
  gestureBar: 'rgba(17, 27, 32, 0.25)',
  statusBar: '#1D1B20',
  skipText: '#657B8B',

  // Hero gradient approx
  heroStart: '#063D4D',
  heroEnd: '#096E8B',

  // Logo background colors (from figma logo component)
  logoBg: '#0AA2CB',
  logoAccent: '#096F8B',
  logoSkin: '#FFEECF',
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────

export const Typography = {
  logo: {
    fontFamily: 'League Spartan',
    fontSize: 32,
    fontWeight: '700' as const,
    letterSpacing: 0.32,
    color: Colors.brandDark,
  },
  tagline: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '800' as const,
    color: Colors.brandDark,
  },
  heading: {
    fontFamily: 'Inter',
    fontSize: 20,
    fontWeight: '700' as const,
    letterSpacing: 0.2,
    color: Colors.brandDark,
  },
  headingLg: {
    fontFamily: 'Inter',
    fontSize: 24,
    fontWeight: '700' as const,
    color: Colors.white,
  },
  subheading: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.14,
    color: Colors.muted,
  },
  label: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.brandDark,
  },
  labelSm: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.brandDark,
  },
  inputValue: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    color: Colors.brandDark,
  },
  error: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.error,
  },
  buttonPrimary: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
    color: Colors.white,
  },
  divider: {
    fontFamily: 'Roboto',
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.muted,
  },
  googleButton: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.1,
    color: Colors.googleText,
  },
  linkBold: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.brandTeal,
  },
  promptText: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.14,
    color: Colors.muted,
  },
  statusTime: {
    fontFamily: 'Roboto',
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.14,
  },
  navLabel: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '500' as const,
  },
  cardTitle: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.brandDark,
  },
  cardBody: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400' as const,
    color: Colors.slate,
  },
  amount: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700' as const,
    color: Colors.white,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const Spacing = {
  screenH: 20,       // Figma screens use 20px horizontal padding
  screenHLg: 30,     // Login screen uses 30px
  inputH: 16,
  inputV: 12,
  fieldGap: 18,
  sectionGap: 24,
  cardPad: 20,
  headerPad: 20,
} as const;

// ─── Border radii ─────────────────────────────────────────────────────────────

export const Radii = {
  input: 8,
  button: 24,       // primary button
  buttonSm: 16,     // smaller buttons
  card: 24,         // job/wallet cards
  cardLg: 30,       // larger cards
  chip: 999,        // pill / status chips
  gestureBar: 12,
  avatar: 12,
  navBar: 0,        // nav bar is rectangular
  header: 24,       // hero header bottom radius
  logo: 10,         // logo rect radius
} as const;

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const Shadows = {
  card: {
    shadowColor: '#063D4D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  input: {
    shadowColor: '#063D4D',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  primaryButton: {
    shadowColor: '#096E8B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
  },
  navBar: {
    shadowColor: '#063D4D',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
} as const;

// ─── Component sizes ──────────────────────────────────────────────────────────

export const Sizes = {
  frameWidth: 360,
  frameHeight: 800,
  inputHeight: 40,
  primaryButtonHeight: 48,
  googleButtonHeight: 44,
  statusBarHeight: 52,
  navBarHeight: 77,
  heroHeight: 264,
  gestureBarWidth: 108,
  gestureBarHeight: 4,
  avatarSm: 36,
  avatarMd: 48,
  avatarLg: 64,
  iconSm: 20,
  iconMd: 24,
  iconLg: 32,
} as const;
