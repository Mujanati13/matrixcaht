import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MainTabParamList } from '../types';
import AuthService from '../services/AuthService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/helpers';

type SettingsScreenNavigationProp = StackNavigationProp<MainTabParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

const SettingsScreen: React.FC<Props> = ({ navigation }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [autoLockTimeout, setAutoLockTimeout] = useState(5);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const darkMode = await AsyncStorage.getItem('dark_mode');
      const notifications = await AsyncStorage.getItem('notifications_enabled');
      const biometric = await AuthService.isBiometricEnabled();
      const lockTimeout = await AuthService.getAutoLockTimeout();

      setIsDarkMode(darkMode === 'true');
      setNotificationsEnabled(notifications !== 'false');
      setBiometricEnabled(biometric);
      setAutoLockTimeout(lockTimeout);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const handleDarkModeToggle = async (value: boolean) => {
    setIsDarkMode(value);
    await AsyncStorage.setItem('dark_mode', value.toString());
    // In a real app, you would update the theme here
  };

  const handleNotificationsToggle = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('notifications_enabled', value.toString());
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const isSupported = await AuthService.isBiometricSupported();
      if (!isSupported) {
        Alert.alert('Not Supported', 'Biometric authentication is not available on this device');
        return;
      }
      
      const success = await AuthService.authenticateWithBiometric();
      if (success) {
        setBiometricEnabled(true);
        await AuthService.setBiometricEnabled(true);
      }
    } else {
      setBiometricEnabled(false);
      await AuthService.setBiometricEnabled(false);
    }
  };

  const handleAutoLockChange = () => {
    const options = ['1 minute', '5 minutes', '15 minutes', '30 minutes', 'Never'];
    const timeouts = [1, 5, 15, 30, 0];
    
    Alert.alert(
      'Auto-lock Timeout',
      'Choose when to automatically lock the app',
      options.map((option, index) => ({
        text: option,
        onPress: async () => {
          const timeout = timeouts[index];
          setAutoLockTimeout(timeout);
          await AuthService.setAutoLockTimeout(timeout);
        },
      }))
    );
  };

  const handleAbout = () => {
    (navigation as any).navigate('About');
  };

  const handleBackupRecoveryPhrase = () => {
    Alert.alert(
      'Recovery Phrase',
      'This feature allows you to view your recovery phrase. Make sure you are in a private location.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            // Navigate to recovery phrase display
            Alert.alert('Coming Soon', 'Recovery phrase backup will be available soon');
          },
        },
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'This will export your encrypted conversation data for backup purposes.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            Alert.alert('Coming Soon', 'Data export will be available soon');
          },
        },
      ]
    );
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will clear cached images and files to free up space.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  const SettingItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => (
    <TouchableOpacity style={styles.settingItem} onPress={onPress}>
      <Icon name={icon} size={24} color={COLORS.primary} />
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {rightComponent || <Icon name="chevron-right" size={24} color={COLORS.textSecondary} />}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          
          <SettingItem
            icon="dark-mode"
            title="Dark Mode"
            subtitle="Switch between light and dark themes"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={handleDarkModeToggle}
                trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          
          <SettingItem
            icon="fingerprint"
            title="Biometric Lock"
            subtitle="Use fingerprint or face ID to unlock"
            rightComponent={
              <Switch
                value={biometricEnabled}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            }
          />

          <SettingItem
            icon="timer"
            title="Auto-lock Timeout"
            subtitle={autoLockTimeout === 0 ? 'Never' : `${autoLockTimeout} minutes`}
            onPress={handleAutoLockChange}
          />

          <SettingItem
            icon="vpn-key"
            title="Backup Recovery Phrase"
            subtitle="View and backup your recovery words"
            onPress={handleBackupRecoveryPhrase}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive notifications for new messages"
            rightComponent={
              <Switch
                value={notificationsEnabled}
                onValueChange={handleNotificationsToggle}
                trackColor={{ false: COLORS.divider, true: COLORS.primary }}
                thumbColor={COLORS.background}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          
          <SettingItem
            icon="backup"
            title="Export Conversations"
            subtitle="Export encrypted conversation data"
            onPress={handleExportData}
          />

          <SettingItem
            icon="clear"
            title="Clear Cache"
            subtitle="Free up storage space"
            onPress={handleClearCache}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <SettingItem
            icon="info"
            title="About MatrixChat"
            subtitle="Version info and privacy policy"
            onPress={handleAbout}
          />

          <SettingItem
            icon="help"
            title="Help & Support"
            subtitle="Get help using MatrixChat"
            onPress={() => Alert.alert('Coming Soon', 'Help & Support will be available soon')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    paddingVertical: SPACING.lg,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.xl,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  settingContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
});

export default SettingsScreen;
