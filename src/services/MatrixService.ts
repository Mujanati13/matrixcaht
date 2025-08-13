import { MatrixClient, createClient } from 'matrix-js-sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MatrixConfig, LoginCredentials, User, Room } from '../types';

const HOMESERVER_URL = 'http://195.15.212.132';
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'matrix_access_token',
  USER_ID: 'matrix_user_id',
  DEVICE_ID: 'matrix_device_id',
  HOMESERVER: 'matrix_homeserver',
};

class MatrixService {
  private client: MatrixClient | null = null;
  private isInitialized = false;

  constructor() {
    this.initializeFromStorage();
  }

  private async initializeFromStorage() {
    try {
      const accessToken = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      const deviceId = await AsyncStorage.getItem(STORAGE_KEYS.DEVICE_ID);
      const homeserver = await AsyncStorage.getItem(STORAGE_KEYS.HOMESERVER) || HOMESERVER_URL;

      if (accessToken && userId) {
        await this.initializeClient({
          homeserverUrl: homeserver,
          accessToken,
          userId,
          deviceId: deviceId || undefined,
        });
      }
    } catch (error) {
      console.error('Failed to initialize from storage:', error);
    }
  }

  async initializeClient(config: MatrixConfig): Promise<void> {
    try {
      this.client = createClient({
        baseUrl: config.homeserverUrl,
        accessToken: config.accessToken,
        userId: config.userId,
        deviceId: config.deviceId,
      });

      if (config.accessToken) {
        await this.saveCredentials(config);
        await this.client.startClient({ initialSyncLimit: 10 });
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('Failed to initialize Matrix client:', error);
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      const tempClient = createClient({
        baseUrl: credentials.homeserver || HOMESERVER_URL,
      });

      const response = await tempClient.login('m.login.password', {
        user: credentials.username,
        password: credentials.password,
      });

      await this.initializeClient({
        homeserverUrl: credentials.homeserver || HOMESERVER_URL,
        accessToken: response.access_token,
        userId: response.user_id,
        deviceId: response.device_id,
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async signup(credentials: LoginCredentials): Promise<string[]> {
    try {
      const tempClient = createClient({
        baseUrl: credentials.homeserver || HOMESERVER_URL,
      });

      // Register the user
      const response = await tempClient.register(
        credentials.username,
        credentials.password,
        null,
        {}
      );

      // Generate seed phrase (simplified version)
      const seedPhrase = this.generateSeedPhrase();

      await this.initializeClient({
        homeserverUrl: credentials.homeserver || HOMESERVER_URL,
        accessToken: response.access_token,
        userId: response.user_id,
        deviceId: response.device_id,
      });

      return seedPhrase;
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.client) {
        await this.client.logout();
        this.client.stopClient();
        this.client = null;
      }
      await this.clearCredentials();
      this.isInitialized = false;
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  }

  private async saveCredentials(config: MatrixConfig): Promise<void> {
    await AsyncStorage.multiSet([
      [STORAGE_KEYS.ACCESS_TOKEN, config.accessToken || ''],
      [STORAGE_KEYS.USER_ID, config.userId || ''],
      [STORAGE_KEYS.DEVICE_ID, config.deviceId || ''],
      [STORAGE_KEYS.HOMESERVER, config.homeserverUrl],
    ]);
  }

  private async clearCredentials(): Promise<void> {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.USER_ID,
      STORAGE_KEYS.DEVICE_ID,
      STORAGE_KEYS.HOMESERVER,
    ]);
  }

  private generateSeedPhrase(): string[] {
    // Simplified seed phrase generation - in production, use proper BIP39
    const words = [
      'apple', 'banana', 'cherry', 'dragon', 'elephant', 'forest',
      'guitar', 'hammer', 'island', 'jungle', 'keyboard', 'laptop',
    ];
    return words.sort(() => Math.random() - 0.5).slice(0, 12);
  }

  getClient(): MatrixClient | null {
    return this.client;
  }

  isLoggedIn(): boolean {
    return this.isInitialized && this.client !== null;
  }

  getCurrentUserId(): string | null {
    return this.client?.getUserId() || null;
  }

  async getRooms(): Promise<Room[]> {
    if (!this.client) return [];

    try {
      const rooms = this.client.getRooms();
      return rooms.map(room => ({
        roomId: room.roomId,
        name: room.name || 'Unnamed Room',
        topic: room.currentState.getStateEvents('m.room.topic', '')?.getContent()?.topic,
        avatar: room.getAvatarUrl(this.client!.baseUrl, 64, 64, 'crop') || undefined,
        lastMessage: this.getLastMessagePreview(room),
        lastMessageTime: this.getLastMessageTime(room),
        unreadCount: room.getUnreadNotificationCount(),
        isDirect: room.getJoinedMemberCount() === 2,
        members: room.getJoinedMembers().map(member => ({
          id: member.userId,
          name: member.name,
          avatar: member.getAvatarUrl(this.client!.baseUrl, 64, 64, 'crop') || undefined,
        })),
      }));
    } catch (error) {
      console.error('Failed to get rooms:', error);
      return [];
    }
  }

  async createDirectRoom(userId: string): Promise<string> {
    if (!this.client) throw new Error('Not logged in');

    try {
      const response = await this.client.createRoom({
        invite: [userId],
        is_direct: true,
        preset: 'private_chat',
      });
      return response.room_id;
    } catch (error) {
      console.error('Failed to create direct room:', error);
      throw error;
    }
  }

  async sendMessage(roomId: string, text: string): Promise<void> {
    if (!this.client) throw new Error('Not logged in');

    try {
      await this.client.sendTextMessage(roomId, text);
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  }

  async leaveRoom(roomId: string): Promise<void> {
    if (!this.client) throw new Error('Not logged in');

    try {
      await this.client.leave(roomId);
    } catch (error) {
      console.error('Failed to leave room:', error);
      throw error;
    }
  }

  private getLastMessagePreview(room: any): string {
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();
    const lastEvent = events[events.length - 1];
    
    if (lastEvent && lastEvent.getType() === 'm.room.message') {
      return lastEvent.getContent().body || '';
    }
    return '';
  }

  private getLastMessageTime(room: any): Date | undefined {
    const timeline = room.getLiveTimeline();
    const events = timeline.getEvents();
    const lastEvent = events[events.length - 1];
    
    if (lastEvent) {
      return new Date(lastEvent.getTs());
    }
    return undefined;
  }
}

export default new MatrixService();
