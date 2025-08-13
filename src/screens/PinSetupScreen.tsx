import React, { useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { RootStackParamList } from '../types';
import AuthService from '../services/AuthService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/helpers';

type PinSetupScreenNavigationProp = StackNavigationProp<RootStackParamList, 'PinSetup'>;

interface Props {
  navigation: PinSetupScreenNavigationProp;
}

const PinSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [step, setStep] = useState<'setup' | 'confirm'>('setup');

  const handleNumberPress = (number: string) => {
    if (step === 'setup') {
      if (pin.length < 6) {
        setPin(prev => prev + number);
      }
    } else {
      if (confirmPin.length < 6) {
        setConfirmPin(prev => prev + number);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'setup') {
      setPin(prev => prev.slice(0, -1));
    } else {
      setConfirmPin(prev => prev.slice(0, -1));
    }
  };

  const handleContinue = () => {
    if (step === 'setup') {
      if (pin.length !== 6) {
        Alert.alert('Error', 'PIN must be 6 digits');
        return;
      }
      setStep('confirm');
    } else {
      if (confirmPin !== pin) {
        Alert.alert('Error', 'PINs do not match. Please try again.');
        setConfirmPin('');
        Vibration.vibrate(500);
        return;
      }
      
      savePIN();
    }
  };

  const savePIN = async () => {
    try {
      await AuthService.setupPIN(pin);
      navigation.replace('Main');
    } catch (error) {
      console.error('PIN setup error:', error);
      Alert.alert('Error', 'Failed to setup PIN. Please try again.');
    }
  };

  const renderPinDots = (currentPin: string) => {
    return (
      <View style={styles.pinDotsContainer}>
        {[...Array(6)].map((_, index) => (
          <View
            key={index}
            style={[
              styles.pinDot,
              index < currentPin.length && styles.pinDotFilled,
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
                    style={styles.numberButton}
                    onPress={handleBackspace}
                  >
                    <Icon name="backspace" size={24} color={COLORS.background} />
                  </TouchableOpacity>
                );
              }

              return (
                <TouchableOpacity
                  key={itemIndex}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(item)}
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
              <Icon name="lock" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>
              {step === 'setup' ? 'Setup PIN' : 'Confirm PIN'}
            </Text>
            <Text style={styles.subtitle}>
              {step === 'setup' 
                ? 'Create a 6-digit PIN to secure your account'
                : 'Enter your PIN again to confirm'
              }
            </Text>
          </View>

          <View style={styles.pinSection}>
            {renderPinDots(step === 'setup' ? pin : confirmPin)}
          </View>

          {renderNumberPad()}

          <TouchableOpacity
            style={[
              styles.continueButton,
              (step === 'setup' ? pin.length !== 6 : confirmPin.length !== 6) && 
              styles.continueButtonDisabled
            ]}
            onPress={handleContinue}
            disabled={step === 'setup' ? pin.length !== 6 : confirmPin.length !== 6}
          >
            <Text style={styles.continueButtonText}>
              {step === 'setup' ? 'Continue' : 'Setup PIN'}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityNote}>
            <Icon name="security" size={16} color={COLORS.background} style={styles.securityIcon} />
            <Text style={styles.securityText}>
              After 3 failed attempts, the app will be reset for security
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
  emptyButton: {
    width: 80,
    height: 80,
  },
  numberButtonText: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  continueButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
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
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueButtonText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.background,
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

export default PinSetupScreen;
