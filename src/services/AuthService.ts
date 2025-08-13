import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain';
import CryptoJS from 'react-native-crypto-js';

const STORAGE_KEYS = {
  PIN_HASH: 'pin_hash',
  FAILED_ATTEMPTS: 'failed_attempts',
  LOCK_UNTIL: 'lock_until',
  SEED_PHRASE: 'seed_phrase_encrypted',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  AUTO_LOCK_TIMEOUT: 'auto_lock_timeout',
};

const MAX_FAILED_ATTEMPTS = 3;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

class AuthService {
  private pinAttempts = 0;
  private isLocked = false;

  // PIN Management
  async setupPIN(pin: string): Promise<void> {
    try {
      const pinHash = CryptoJS.SHA256(pin).toString();
      await AsyncStorage.setItem(STORAGE_KEYS.PIN_HASH, pinHash);
      await AsyncStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
    } catch (error) {
      console.error('Failed to setup PIN:', error);
      throw error;
    }
  }

  async verifyPIN(pin: string): Promise<boolean> {
    try {
      // Check if locked
      const lockUntil = await AsyncStorage.getItem(STORAGE_KEYS.LOCK_UNTIL);
      if (lockUntil && Date.now() < parseInt(lockUntil)) {
        throw new Error('App is locked due to too many failed attempts');
      }

      const storedHash = await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
      const pinHash = CryptoJS.SHA256(pin).toString();
      
      if (storedHash === pinHash) {
        // Reset failed attempts on success
        await AsyncStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, '0');
        await AsyncStorage.removeItem(STORAGE_KEYS.LOCK_UNTIL);
        this.pinAttempts = 0;
        this.isLocked = false;
        return true;
      } else {
        // Increment failed attempts
        const attempts = await this.incrementFailedAttempts();
        if (attempts >= MAX_FAILED_ATTEMPTS) {
          await this.lockApp();
        }
        return false;
      }
    } catch (error) {
      console.error('PIN verification failed:', error);
      return false;
    }
  }

  async hasPIN(): Promise<boolean> {
    try {
      const pinHash = await AsyncStorage.getItem(STORAGE_KEYS.PIN_HASH);
      return pinHash !== null;
    } catch {
      return false;
    }
  }

  async changePIN(oldPin: string, newPin: string): Promise<boolean> {
    const isValid = await this.verifyPIN(oldPin);
    if (isValid) {
      await this.setupPIN(newPin);
      return true;
    }
    return false;
  }

  private async incrementFailedAttempts(): Promise<number> {
    try {
      const currentAttempts = await AsyncStorage.getItem(STORAGE_KEYS.FAILED_ATTEMPTS);
      const attempts = (parseInt(currentAttempts || '0') + 1);
      await AsyncStorage.setItem(STORAGE_KEYS.FAILED_ATTEMPTS, attempts.toString());
      this.pinAttempts = attempts;
      return attempts;
    } catch {
      return 0;
    }
  }

  private async lockApp(): Promise<void> {
    const lockUntil = Date.now() + LOCK_DURATION;
    await AsyncStorage.setItem(STORAGE_KEYS.LOCK_UNTIL, lockUntil.toString());
    this.isLocked = true;
  }

  async isAppLocked(): Promise<boolean> {
    try {
      const lockUntil = await AsyncStorage.getItem(STORAGE_KEYS.LOCK_UNTIL);
      if (lockUntil && Date.now() < parseInt(lockUntil)) {
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  async getRemainingLockTime(): Promise<number> {
    try {
      const lockUntil = await AsyncStorage.getItem(STORAGE_KEYS.LOCK_UNTIL);
      if (lockUntil) {
        const remaining = parseInt(lockUntil) - Date.now();
        return remaining > 0 ? remaining : 0;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  // Seed Phrase Management
  async storeSeedPhrase(seedPhrase: string[], pin: string): Promise<void> {
    try {
      const seedString = seedPhrase.join(' ');
      const encrypted = CryptoJS.AES.encrypt(seedString, pin).toString();
      await AsyncStorage.setItem(STORAGE_KEYS.SEED_PHRASE, encrypted);
    } catch (error) {
      console.error('Failed to store seed phrase:', error);
      throw error;
    }
  }

  async getSeedPhrase(pin: string): Promise<string[] | null> {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.SEED_PHRASE);
      if (!encrypted) return null;

      const decrypted = CryptoJS.AES.decrypt(encrypted, pin).toString(CryptoJS.enc.Utf8);
      return decrypted.split(' ');
    } catch (error) {
      console.error('Failed to retrieve seed phrase:', error);
      return null;
    }
  }

  async hasSeedPhrase(): Promise<boolean> {
    try {
      const encrypted = await AsyncStorage.getItem(STORAGE_KEYS.SEED_PHRASE);
      return encrypted !== null;
    } catch {
      return false;
    }
  }

  // Biometric Authentication
  async isBiometricSupported(): Promise<boolean> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType !== null;
    } catch {
      return false;
    }
  }

  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.BIOMETRIC_ENABLED, enabled.toString());
  }

  async isBiometricEnabled(): Promise<boolean> {
    try {
      const enabled = await AsyncStorage.getItem(STORAGE_KEYS.BIOMETRIC_ENABLED);
      return enabled === 'true';
    } catch {
      return false;
    }
  }

  async authenticateWithBiometric(): Promise<boolean> {
    try {
      const options = {
        title: 'Authenticate',
        subtitle: 'Use your biometric to unlock MatrixChat',
        description: 'Place your finger on the sensor or look at the camera',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
      };

      const result = await Keychain.getInternetCredentials('MatrixChat', options);
      return result !== false;
    } catch {
      return false;
    }
  }

  // Auto-lock functionality
  async setAutoLockTimeout(minutes: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTO_LOCK_TIMEOUT, minutes.toString());
  }

  async getAutoLockTimeout(): Promise<number> {
    try {
      const timeout = await AsyncStorage.getItem(STORAGE_KEYS.AUTO_LOCK_TIMEOUT);
      return parseInt(timeout || '5'); // Default 5 minutes
    } catch {
      return 5;
    }
  }

  // Reset all data (for security breach)
  async resetAllData(): Promise<void> {
    try {
      // Clear all stored data
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.PIN_HASH,
        STORAGE_KEYS.FAILED_ATTEMPTS,
        STORAGE_KEYS.LOCK_UNTIL,
        STORAGE_KEYS.SEED_PHRASE,
        STORAGE_KEYS.BIOMETRIC_ENABLED,
        STORAGE_KEYS.AUTO_LOCK_TIMEOUT,
      ]);
      
      // Clear keychain
      await Keychain.resetInternetCredentials('MatrixChat');
      
      // Reset instance variables
      this.pinAttempts = 0;
      this.isLocked = false;
    } catch (error) {
      console.error('Failed to reset data:', error);
      throw error;
    }
  }

  getFailedAttempts(): number {
    return this.pinAttempts;
  }

  getMaxAttempts(): number {
    return MAX_FAILED_ATTEMPTS;
  }
}

export default new AuthService();
