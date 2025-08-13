import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  Vibration,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../types';
import AuthService from '../services/AuthService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/helpers';

type PinEntryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PinEntry'>;
type PinEntryScreenRouteProp = RouteProp<RootStackParamList, 'PinEntry'>;

interface Props {
  navigation: PinEntryScreenNavigationProp;
  route: PinEntryScreenRouteProp;
}

const PinEntryScreen: React.FC<Props> = ({ navigation, route }) => {
  const [pin, setPin] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);

  const { isSetup = false } = route.params || {};

  useEffect(() => {
    checkLockStatus();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockTimeRemaining > 0) {
      interval = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1000) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockTimeRemaining]);

  const checkLockStatus = async () => {
    const locked = await AuthService.isAppLocked();
    if (locked) {
      const remaining = await AuthService.getRemainingLockTime();
      setIsLocked(true);
      setLockTimeRemaining(remaining);
    }
  };

  const handleNumberPress = (number: string) => {
    if (isLocked) return;
    
    if (pin.length < 6) {
      const newPin = pin + number;
      setPin(newPin);
      
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (isLocked) return;
    setPin(prev => prev.slice(0, -1));
  };

  const verifyPin = async (enteredPin: string) => {
    try {
      const isValid = await AuthService.verifyPIN(enteredPin);
      
      if (isValid) {
        navigation.replace('Main');
      } else {
        setPin('');
        setFailedAttempts(prev => prev + 1);
        Vibration.vibrate(500);
        
        const attempts = AuthService.getFailedAttempts();
        const maxAttempts = AuthService.getMaxAttempts();
        
        if (attempts >= maxAttempts) {
          Alert.alert(
            'Security Breach',
            'Too many failed attempts. The app will be reset for security.',
            [
              {
                text: 'OK',
                onPress: () => {
                  AuthService.resetAllData();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'Auth' }],
                  });
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `${maxAttempts - attempts} attempts remaining`
          );
        }
      }
    } catch (error: any) {
      if (error.message.includes('locked')) {
        checkLockStatus();
      } else {
        Alert.alert('Error', 'Failed to verify PIN');
      }
    }
  };

  const renderPinDots = () => {
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < pin.length && styles.pinDotFilled,
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace'],
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, itemIndex) => {
              if (item === '') {
                return <View key={itemIndex} style={styles.emptyButton} />;
              }
              
              if (item === 'backspace') {
                return (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[styles.numberButton, isLocked && styles.numberButtonDisabled]}
                    onPress={handleBackspace}
                    disabled={isLocked}
                  >
                    <Icon name="backspace" size={24} color={COLORS.background} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={[styles.numberButton, isLocked && styles.numberButtonDisabled]}
                  onPress={() => handleNumberPress(item)}
                  disabled={isLocked}
                >
                  <Text style={styles.numberButtonText}>{item}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.lockIcon}>
              <Icon 
                name={isLocked ? "lock" : "lock-open"} 
                size={32} 
                color={isLocked ? COLORS.error : COLORS.primary} 
              />
            </View>
            <Text style={styles.title}>
              {isLocked ? 'App Locked' : 'Enter PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {isLocked 
                ? `Too many failed attempts. Try again in ${formatTime(lockTimeRemaining)}`
                : 'Enter your 6-digit PIN to continue'
              }
            </Text>
          </View>

          <View style={styles.pinSection}>
            {renderPinDots()}
          </View>

          {renderNumberPad()}

          {!isSetup && (
            <TouchableOpacity
              style={styles.forgotPinButton}
              onPress={() => navigation.navigate('Recovery')}
            >
              <Text style={styles.forgotPinText}>Forgot PIN? Use Recovery Phrase</Text>
            </TouchableOpacity>
          )}

          <View style={styles.securityNote}>
            <Icon name="security" size={16} color={COLORS.background} style={styles.securityIcon} />
            <Text style={styles.securityText}>
              {AuthService.getMaxAttempts() - failedAttempts} attempts remaining
            </Text>
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
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl * 2,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
    elevation: 5,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.background,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.background,
    opacity: 0.8,
    textAlign: 'center',
    paddingHorizontal: SPACING.lg,
  },
  pinSection: {
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  pinDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.background,
    marginHorizontal: SPACING.sm,
  },
  pinDotFilled: {
    backgroundColor: COLORS.background,
  },
  numberPad: {
    flex: 1,
    justifyContent: 'center',
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: SPACING.lg,
  },
  numberButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  numberButtonDisabled: {
    opacity: 0.3,
  },
  emptyButton: {
    width: 80,
    height: 80,
  },
  numberButtonText: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  forgotPinButton: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  forgotPinText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.background,
    opacity: 0.8,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  securityIcon: {
    marginRight: SPACING.sm,
    opacity: 0.8,
  },
  securityText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.background,
    opacity: 0.8,
    textAlign: 'center',
    flex: 1,
  },
});

export default PinEntryScreen;
