// Navigation type definitions used across the mobile app
// Keep these simple so the app can import shared route names and role types.

export type Role = 'homeowner' | 'provider';

// Bottom tab keys used by the app's simple tab bar
export type BottomTabParamList = {
	Home: undefined;
	'My Jobs': undefined;
	Wallet: undefined;
	Profile: undefined;
};

// Convenience union type for screen keys (useful in simple switch-based renderers)
export type ScreenKey = keyof BottomTabParamList;

// Root-level routes for a minimal app router
export type RootStackParamList = {
	Splash: undefined;
	Auth: undefined;
	App: { role?: Role } | undefined;
};

export const DEFAULT_ROLE: Role = 'homeowner';

export const bottomTabs: ScreenKey[] = ['Home', 'My Jobs', 'Wallet', 'Profile'];
