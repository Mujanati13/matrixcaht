import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
  ScrollView,
  Clipboard,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { AuthStackParamList } from '../types';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/helpers';

type SeedPhraseScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'SeedPhrase'>;
type SeedPhraseScreenRouteProp = RouteProp<AuthStackParamList, 'SeedPhrase'>;

interface Props {
  navigation: SeedPhraseScreenNavigationProp;
  route: SeedPhraseScreenRouteProp;
}

const SeedPhraseScreen: React.FC<Props> = ({ navigation, route }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const { seedPhrase } = route.params;

  const handleCopy = () => {
    Clipboard.setString(seedPhrase.join(' '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleConfirm = () => {
    if (!isConfirmed) {
      Alert.alert(
        'Important',
        'Please confirm that you have written down your recovery phrase securely before continuing.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'I have written it down', onPress: () => setIsConfirmed(true) },
        ]
      );
      return;
    }
    
    // Navigate back to main flow
    navigation.navigate('Login');
  };

  const renderSeedWord = (word: string, index: number) => (
    <View key={index} style={styles.seedWordContainer}>
      <Text style={styles.seedWordNumber}>{index + 1}</Text>
      <Text style={styles.seedWord}>{word}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <LinearGradient
        colors={[COLORS.primary, COLORS.primaryDark]}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <View style={styles.securityIcon}>
              <Icon name="security" size={32} color={COLORS.primary} />
            </View>
            <Text style={styles.title}>Recovery Phrase</Text>
            <Text style={styles.subtitle}>
              Write down these 12 words in order. This is your only way to recover your account.
            </Text>
          </View>

          <View style={styles.seedContainer}>
            <View style={styles.seedGrid}>
              {seedPhrase.map((word, index) => renderSeedWord(word, index))}
            </View>

            <TouchableOpacity style={styles.copyButton} onPress={handleCopy}>
              <Icon 
                name={isCopied ? "check" : "content-copy"} 
                size={20} 
                color={COLORS.background} 
              />
              <Text style={styles.copyButtonText}>
                {isCopied ? 'Copied!' : 'Copy to Clipboard'}
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.confirmButton, isConfirmed && styles.confirmButtonActive]}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>
              {isConfirmed ? 'Continue' : 'I have written it down securely'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  securityIcon: {
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
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 22,
  },
  seedContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  seedWordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    width: '48%',
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  seedWordNumber: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  seedWord: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    flex: 1,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  copyButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    color: COLORS.background,
    marginLeft: SPACING.sm,
  },
  confirmButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  confirmButtonActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
});

export default SeedPhraseScreen;
