import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../types';
import MatrixService from '../services/MatrixService';
import AuthService from '../services/AuthService';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../utils/helpers';

type SplashScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Splash'>;

interface Props {
  navigation: SplashScreenNavigationProp;
}

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Simulate loading time
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user is logged in
      const isLoggedIn = MatrixService.isLoggedIn();
      
      if (isLoggedIn) {
        // Check if PIN is set up
        const hasPIN = await AuthService.hasPIN();
        
        if (hasPIN) {
          // Check if app is locked
          const isLocked = await AuthService.isAppLocked();
          
          if (isLocked) {
            navigation.replace('PinEntry', { isSetup: false });
          } else {
            navigation.replace('PinEntry', { isSetup: false });
          }
        } else {
          navigation.replace('PinSetup');
        }
      } else {
        navigation.replace('Auth');
      }
    } catch (error) {
      console.error('Initialization error:', error);
      navigation.replace('Auth');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>M</Text>
            </View>
            <Text style={styles.appName}>MatrixChat</Text>
            <Text style={styles.tagline}>Secure • Private • Encrypted</Text>
          </View>
          
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.background} />
            <Text style={styles.loadingText}>Initializing secure connection...</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xxl * 2,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: FONT_SIZES.header,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  appName: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.background,
    marginBottom: SPACING.sm,
  },
  tagline: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.background,
    opacity: 0.8,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.background,
    marginTop: SPACING.md,
    opacity: 0.8,
  },
});

export default SplashScreen;
