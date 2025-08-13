export interface User {
  id: string;
  name: string;
  avatar?: string;
  displayName?: string;
}

export interface ChatMessage {
  _id: string;
  text: string;
  createdAt: Date;
  user: User;
  image?: string;
  video?: string;
  audio?: string;
  system?: boolean;
  sent?: boolean;
  received?: boolean;
  pending?: boolean;
}

export interface Room {
  roomId: string;
  name: string;
  topic?: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount?: number;
  isDirect?: boolean;
  members?: User[];
}

export interface MatrixConfig {
  homeserverUrl: string;
  accessToken?: string;
  userId?: string;
  deviceId?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
  homeserver?: string;
}

export interface SignupCredentials extends LoginCredentials {
  confirmPassword: string;
}

export interface RecoveryData {
  seedPhrase: string[];
  userId: string;
}

export interface AppSettings {
  isDarkMode: boolean;
  notificationsEnabled: boolean;
  biometricLockEnabled: boolean;
  autoLockTimeout: number;
}

// Navigation Types
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Login: undefined;
  Signup: undefined;
  Recovery: undefined;
  SeedPhrase: { seedPhrase: string[] };
  PinSetup: undefined;
  PinEntry: { isSetup?: boolean };
  Main: undefined;
  Chat: { roomId: string; roomName: string };
  Profile: undefined;
  Settings: undefined;
  Search: undefined;
  About: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
  Recovery: undefined;
  SeedPhrase: { seedPhrase: string[] };
};

export type MainTabParamList = {
  Rooms: undefined;
  Search: undefined;
  Profile: undefined;
  Settings: undefined;
};
