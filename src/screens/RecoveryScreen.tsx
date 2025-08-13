import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AuthService from '../services/AuthService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../utils/helpers';

interface RecoveryScreenProps {
  navigation: any;
  route: {
    params?: {
      mode?: 'backup' | 'restore';
    };
  };
}

const RecoveryScreen: React.FC<RecoveryScreenProps> = ({ navigation, route }) => {
  const [seedPhrase, setSeedPhrase] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mode] = useState(route.params?.mode || 'backup');
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    loadSeedPhrase();
  }, []);

  const loadSeedPhrase = async () => {
    try {
      setIsLoading(true);
      // For demo purposes, generate a seed phrase
      // In production, you would load from secure storage
      const newPhrase = generateSeedPhrase();
      setSeedPhrase(newPhrase);
    } catch (error) {
      console.error('Error loading seed phrase:', error);
      Alert.alert('Error', 'Failed to load recovery phrase');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSeedPhrase = (): string => {
    // Simple word list for demo - in production, use proper BIP39 wordlist
    const words = [
      'abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract',
      'absurd', 'abuse', 'access', 'accident', 'account', 'accuse', 'achieve', 'acid',
      'acoustic', 'acquire', 'across', 'act', 'action', 'actor', 'actress', 'actual',
      'adapt', 'add', 'addict', 'address', 'adjust', 'admit', 'adult', 'advance',
      'advice', 'aerobic', 'affair', 'afford', 'afraid', 'again', 'agent', 'agree',
      'ahead', 'aim', 'air', 'airport', 'aisle', 'alarm', 'album', 'alcohol',
      'alert', 'alien', 'all', 'alley', 'allow', 'almost', 'alone', 'alpha',
      'already', 'also', 'alter', 'always', 'amateur', 'amazing', 'among', 'amount',
      'amused', 'analyst', 'anchor', 'ancient', 'anger', 'angle', 'angry', 'animal',
      'ankle', 'announce', 'annual', 'another', 'answer', 'antenna', 'antique', 'anxiety',
      'any', 'apart', 'apology', 'appear', 'apple', 'approve', 'april', 'arcade',
      'arch', 'arctic', 'area', 'arena', 'argue', 'arm', 'armed', 'armor',
      'army', 'around', 'arrange', 'arrest', 'arrive', 'arrow', 'art', 'article',
      'artist', 'artwork', 'ask', 'aspect', 'assault', 'asset', 'assist', 'assume',
      'asthma', 'athlete', 'atom', 'attack', 'attend', 'attitude', 'attract', 'auction',
      'audit', 'august', 'aunt', 'author', 'auto', 'autumn', 'average', 'avocado',
      'avoid', 'awake', 'aware', 'away', 'awesome', 'awful', 'awkward', 'axis'
    ];

    const selectedWords: string[] = [];
    for (let i = 0; i < 12; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }
    
    return selectedWords.join(' ');
  };

  const handleCopyToClipboard = async () => {
    try {
      await Clipboard.setString(seedPhrase);
      Alert.alert('Copied', 'Recovery phrase copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `MatrixChat Recovery Phrase:\n\n${seedPhrase}\n\nKeep this safe and secure!`,
        title: 'MatrixChat Recovery Phrase',
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleSaveConfirmation = () => {
    Alert.alert(
      'Recovery Phrase Saved?',
      'Have you safely written down your recovery phrase? You will need it to restore your account if you lose access.',
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: 'Yes, I Saved It',
          style: 'default',
          onPress: () => {
            Alert.alert(
              'Important Reminder',
              'Store your recovery phrase in a safe place. Anyone with access to it can restore your account.',
              [
                {
                  text: 'I Understand',
                  onPress: () => navigation.goBack(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleRegeneratePhrase = () => {
    Alert.alert(
      'Regenerate Recovery Phrase',
      'This will create a new recovery phrase and invalidate the old one. Make sure you have access to your account through other means.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            const newPhrase = generateSeedPhrase();
            setSeedPhrase(newPhrase);
            setIsRevealed(false);
            Alert.alert('Success', 'New recovery phrase generated');
          },
        },
      ]
    );
  };

  const renderSeedPhraseGrid = () => {
    const words = seedPhrase.split(' ');
    
    return (
      <View style={styles.seedGrid}>
        {words.map((word, index) => (
          <View key={index} style={styles.wordContainer}>
            <Text style={styles.wordNumber}>{index + 1}</Text>
            <Text style={styles.wordText}>{isRevealed ? word : '••••••'}</Text>
          </View>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading recovery phrase...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Icon name="vpn-key" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Recovery Phrase</Text>
          <Text style={styles.subtitle}>
            {mode === 'backup' 
              ? 'Your 12-word recovery phrase allows you to restore your account'
              : 'Enter your recovery phrase to restore your account'
            }
          </Text>
        </View>

        {/* Warning Card */}
        <View style={styles.warningCard}>
          <Icon name="warning" size={24} color={COLORS.warning} />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Keep It Safe</Text>
            <Text style={styles.warningText}>
              • Never share your recovery phrase with anyone{'\n'}
              • Store it in a secure location offline{'\n'}
              • Anyone with this phrase can access your account{'\n'}
              • MatrixChat cannot recover lost phrases
            </Text>
          </View>
        </View>

        {/* Seed Phrase Display */}
        <View style={styles.phraseContainer}>
          <View style={styles.phraseHeader}>
            <Text style={styles.phraseTitle}>Your Recovery Phrase</Text>
            <TouchableOpacity 
              style={styles.revealButton}
              onPress={() => setIsRevealed(!isRevealed)}
            >
              <Icon 
                name={isRevealed ? 'visibility-off' : 'visibility'} 
                size={20} 
                color={COLORS.primary} 
              />
              <Text style={styles.revealButtonText}>
                {isRevealed ? 'Hide' : 'Reveal'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {renderSeedPhraseGrid()}
        </View>

        {/* Action Buttons */}
        {isRevealed && (
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleCopyToClipboard}
            >
              <Icon name="content-copy" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Copy to Clipboard</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <Icon name="share" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Share Securely</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionButton, styles.dangerButton]}
              onPress={handleRegeneratePhrase}
            >
              <Icon name="refresh" size={20} color={COLORS.error} />
              <Text style={[styles.actionButtonText, styles.dangerButtonText]}>
                Regenerate Phrase
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to Use Your Recovery Phrase</Text>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>1.</Text>
            <Text style={styles.instructionText}>
              Write down all 12 words in the exact order shown
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>2.</Text>
            <Text style={styles.instructionText}>
              Store the written phrase in a secure, offline location
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>3.</Text>
            <Text style={styles.instructionText}>
              Use this phrase to restore your account on any device
            </Text>
          </View>
          <View style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>4.</Text>
            <Text style={styles.instructionText}>
              Never take screenshots or store digitally
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSaveConfirmation}
        >
          <Text style={styles.saveButtonText}>I've Saved My Recovery Phrase</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.title,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    margin: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },
  warningContent: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  warningTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.warning,
    marginBottom: SPACING.xs,
  },
  warningText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 18,
  },
  phraseContainer: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  phraseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  phraseTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  revealButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
  },
  revealButtonText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  seedGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  wordContainer: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  wordNumber: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
    width: 20,
  },
  wordText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
  },
  actionButtons: {
    margin: SPACING.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
    marginLeft: SPACING.md,
  },
  dangerButton: {
    borderColor: '#FFEBEE',
    backgroundColor: '#FFEBEE',
  },
  dangerButtonText: {
    color: COLORS.error,
  },
  instructionsCard: {
    margin: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
  },
  instructionsTitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.lg,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  instructionNumber: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    width: 24,
  },
  instructionText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    flex: 1,
    lineHeight: 20,
  },
  bottomContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
});

export default RecoveryScreen;
